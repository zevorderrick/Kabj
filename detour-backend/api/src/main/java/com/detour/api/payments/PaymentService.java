package com.detour.api.payments;

import com.detour.api.bookings.Booking;
import com.detour.api.bookings.BookingRepository;
import com.detour.api.notifications.NotificationService;
import com.detour.api.payments.config.PaymentProperties;
import com.detour.api.payments.dto.InitiatePaymentRequest;
import com.detour.api.payments.dto.PaymentResponse;
import com.detour.api.payments.provider.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final PaymentProperties properties;
    private final SandboxPaymentGateway sandboxGateway;
    private final MtnMomoGateway mtnMomoGateway;
    private final VodafoneCashGateway vodafoneCashGateway;
    private final CardPaymentGateway cardPaymentGateway;

    public PaymentService(
            PaymentRepository paymentRepository,
            BookingRepository bookingRepository,
            NotificationService notificationService,
            PaymentProperties properties,
            SandboxPaymentGateway sandboxGateway,
            MtnMomoGateway mtnMomoGateway,
            VodafoneCashGateway vodafoneCashGateway,
            CardPaymentGateway cardPaymentGateway
    ) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
        this.properties = properties;
        this.sandboxGateway = sandboxGateway;
        this.mtnMomoGateway = mtnMomoGateway;
        this.vodafoneCashGateway = vodafoneCashGateway;
        this.cardPaymentGateway = cardPaymentGateway;
    }

    @Transactional
    public PaymentResponse initiatePayment(InitiatePaymentRequest request) {
        if (request.bookingId == null) {
            throw new RuntimeException("bookingId is required");
        }
        if (request.method == null || !PaymentMethod.isValid(request.method)) {
            throw new RuntimeException("Invalid payment method. Use MTN_MOMO, VODAFONE_CASH, or CARD.");
        }

        Booking booking = bookingRepository.findById(request.bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if ("PAID".equals(booking.getPaymentStatus())) {
            throw new RuntimeException("This booking is already paid");
        }

        if (PaymentMethod.CARD.equals(request.method)) {
            if (request.email == null || request.email.isBlank()) {
                throw new RuntimeException("Email is required for card payments");
            }
        } else if (request.phoneNumber == null || request.phoneNumber.isBlank()) {
            throw new RuntimeException("Phone number is required for mobile money payments");
        }

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setProvider(request.method);
        payment.setAmount(booking.getTotalAmount());
        payment.setCurrency("GHS");
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPhoneNumber(request.phoneNumber);
        payment = paymentRepository.save(payment);

        PaymentGateway gateway = resolveGateway(request.method);
        PaymentInitResult result = gateway.initiate(payment, request.email);

        payment.setStatus(result.status());
        payment.setExternalReference(result.externalReference());
        payment.setAuthorizationUrl(result.authorizationUrl());

        if (PaymentStatus.FAILED.equals(result.status())) {
            payment.setFailureReason(result.message());
        }

        payment = paymentRepository.save(payment);

        return PaymentResponse.from(payment, useSandbox(request.method), result.message());
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPayment(Integer paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return PaymentResponse.from(payment, useSandbox(payment.getProvider()), null);
    }

    @Transactional
    public PaymentResponse refreshPaymentStatus(Integer paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (PaymentStatus.SUCCESS.equals(payment.getStatus())
                || PaymentStatus.FAILED.equals(payment.getStatus())) {
            return PaymentResponse.from(payment, useSandbox(payment.getProvider()), null);
        }

        if (!useSandbox(payment.getProvider())) {
            PaymentGateway gateway = resolveGateway(payment.getProvider());
            String newStatus = gateway.checkStatus(payment);
            applyStatus(payment, newStatus);
            payment = paymentRepository.save(payment);
        }

        return PaymentResponse.from(payment, useSandbox(payment.getProvider()), null);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsForBooking(Integer bookingId) {
        return paymentRepository.findByBookingIdOrderByCreatedAtDesc(bookingId).stream()
                .map(p -> PaymentResponse.from(p, useSandbox(p.getProvider()), null))
                .toList();
    }

    @Transactional
    public PaymentResponse confirmSandboxPayment(Integer paymentId) {
        if (!properties.isSandbox()) {
            throw new RuntimeException("Manual confirmation is only available in sandbox mode");
        }

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        applyStatus(payment, PaymentStatus.SUCCESS);
        payment = paymentRepository.save(payment);

        return PaymentResponse.from(payment, true, "Payment confirmed in sandbox mode.");
    }

    @Transactional
    public void handleWebhook(String provider, Map<String, Object> payload) {
        String reference = extractReference(provider, payload);
        if (reference == null) return;

        paymentRepository.findByExternalReference(reference).ifPresent(payment -> {
            String status = mapWebhookStatus(provider, payload);
            applyStatus(payment, status);
            paymentRepository.save(payment);
        });
    }

    private void applyStatus(Payment payment, String status) {
        String previousStatus = payment.getStatus();
        payment.setStatus(status);
        if (PaymentStatus.SUCCESS.equals(status) && !PaymentStatus.SUCCESS.equals(previousStatus)) {
            Booking booking = payment.getBooking();
            booking.setPaymentStatus("PAID");
            bookingRepository.save(booking);

            String amount = payment.getAmount().setScale(2, RoundingMode.HALF_UP).toPlainString();
            notificationService.create(
                    booking.getTourist().getId(),
                    "PAYMENT_SUCCESS",
                    "Payment received",
                    "Your payment of " + payment.getCurrency() + " " + amount + " has been received."
            );
        } else if (PaymentStatus.FAILED.equals(status) && !PaymentStatus.FAILED.equals(previousStatus)) {
            payment.setFailureReason("Payment was declined or timed out.");

            Booking booking = payment.getBooking();
            notificationService.create(
                    booking.getTourist().getId(),
                    "PAYMENT_FAILED",
                    "Payment failed",
                    "Your payment could not be completed. It was declined or timed out — please try again."
            );
        }
    }

    private PaymentGateway resolveGateway(String method) {
        if (useSandbox(method)) {
            return sandboxGateway;
        }
        return switch (method) {
            case PaymentMethod.MTN_MOMO -> mtnMomoGateway;
            case PaymentMethod.VODAFONE_CASH -> vodafoneCashGateway;
            case PaymentMethod.CARD -> cardPaymentGateway;
            default -> sandboxGateway;
        };
    }

    private boolean useSandbox(String method) {
        if (properties.isSandbox()) return true;
        return switch (method) {
            case PaymentMethod.MTN_MOMO -> !properties.getMtnMomo().isConfigured();
            case PaymentMethod.VODAFONE_CASH -> !properties.getVodafoneCash().isConfigured();
            case PaymentMethod.CARD -> !properties.getPaystack().isConfigured();
            default -> true;
        };
    }

    private static String extractReference(String provider, Map<String, Object> payload) {
        return switch (provider) {
            case "mtn" -> payload.get("externalId") != null
                    ? String.valueOf(payload.get("externalId"))
                    : null;
            case "vodafone" -> String.valueOf(payload.get("clientReference"));
            case "card" -> {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) payload.get("data");
                yield data != null ? String.valueOf(data.get("reference")) : null;
            }
            default -> null;
        };
    }

    private String mapWebhookStatus(String provider, Map<String, Object> payload) {
        return switch (provider) {
            case "mtn" -> {
                String status = String.valueOf(payload.get("status"));
                yield "SUCCESSFUL".equals(status) ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
            }
            case "vodafone" -> vodafoneCashGateway.mapWebhookStatus(String.valueOf(payload.get("status")));
            case "card" -> {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) payload.get("data");
                if (data == null) yield PaymentStatus.FAILED;
                yield "success".equalsIgnoreCase(String.valueOf(data.get("status")))
                        ? PaymentStatus.SUCCESS
                        : PaymentStatus.FAILED;
            }
            default -> PaymentStatus.FAILED;
        };
    }
}
