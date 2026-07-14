package com.detour.api.guides.dto;

import com.detour.api.guides.GuidePayout;
import com.detour.api.guides.PayoutStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PayoutResponse {
    public Integer id;
    public Integer guideId;
    public BigDecimal amount;
    public String transactionReference;
    public String momoNumber;
    public PayoutStatus payoutStatus;
    public LocalDateTime processedAt;
    public String message;

    public static PayoutResponse from(GuidePayout payout, String message) {
        PayoutResponse r = new PayoutResponse();
        r.id = payout.getId();
        r.guideId = payout.getGuideId();
        r.amount = payout.getAmount();
        r.transactionReference = payout.getTransactionReference();
        r.momoNumber = payout.getMomoNumber();
        r.payoutStatus = payout.getPayoutStatus();
        r.processedAt = payout.getProcessedAt();
        r.message = message;
        return r;
    }
}
