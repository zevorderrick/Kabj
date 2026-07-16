package com.detour.api.safety;

import com.detour.api.notifications.NotificationService;
import com.detour.api.safety.dto.EmergencyContactRequest;
import com.detour.api.users.User;
import com.detour.api.users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SafetyService {

    private final SafetyAlertRepository alertRepository;
    private final VerifiedGuideRepository guideRepository;
    private final EmergencyContactRepository contactRepository;
    private final SafetyIncidentRepository incidentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Autowired
    public SafetyService(SafetyAlertRepository alertRepository,
                         VerifiedGuideRepository guideRepository,
                         EmergencyContactRepository contactRepository,
                         SafetyIncidentRepository incidentRepository,
                         UserRepository userRepository,
                         NotificationService notificationService) {
        this.alertRepository = alertRepository;
        this.guideRepository = guideRepository;
        this.contactRepository = contactRepository;
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<SafetyAlert> getActiveAlerts() {
        return alertRepository.findActiveAlerts(LocalDateTime.now());
    }

    public List<SafetyAlert> getActiveAlertsByRegion(String region) {
        return alertRepository.findActiveAlertsByRegion(region, LocalDateTime.now());
    }

    public List<VerifiedGuide> getVerifiedGuides(String region) {
        if (region != null && !region.isBlank()) {
            return guideRepository.findByRegionAndVerifiedTrue(region);
        }
        return guideRepository.findByVerifiedTrue();
    }

    public List<EmergencyContact> getEmergencyContacts(Integer userId) {
        return contactRepository.findByUserId(userId);
    }

    public EmergencyContact addEmergencyContact(Integer userId, EmergencyContactRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        if (request.name == null || request.name.isBlank()) {
            throw new RuntimeException("Contact name is required.");
        }
        if (request.phoneNumber == null || request.phoneNumber.isBlank()) {
            throw new RuntimeException("Phone number is required.");
        }

        if (Boolean.TRUE.equals(request.isPrimary)) {
            contactRepository.findByUserId(userId).forEach(c -> {
                c.setIsPrimary(false);
                contactRepository.save(c);
            });
        }

        EmergencyContact contact = new EmergencyContact();
        contact.setUser(user);
        contact.setName(request.name.trim());
        contact.setPhoneNumber(request.phoneNumber.trim());
        contact.setRelationship(request.relationship);
        contact.setIsPrimary(request.isPrimary != null ? request.isPrimary : false);
        return contactRepository.save(contact);
    }

    public void deleteEmergencyContact(Integer userId, Integer contactId) {
        EmergencyContact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Contact not found!"));
        if (!contact.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this contact.");
        }
        contactRepository.delete(contact);
    }

    public SafetyIncident createIncident(Integer userId,
                                         java.math.BigDecimal latitude,
                                         java.math.BigDecimal longitude,
                                         String region,
                                         String audioPath,
                                         int durationSeconds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        SafetyIncident incident = new SafetyIncident();
        incident.setUser(user);
        incident.setLatitude(latitude);
        incident.setLongitude(longitude);
        incident.setRegion(region);
        incident.setAudioPath(audioPath);
        incident.setDurationSeconds(durationSeconds);
        incident.setSubmittedAt(LocalDateTime.now());
        incident.setStatus("FORWARDED");
        incident.setNotes("Location and audio forwarded to local authorities (Ghana Police Service dispatch).");

        SafetyIncident saved = incidentRepository.save(incident);

        notificationService.create(
                userId,
                "INCIDENT_RECEIVED",
                "Incident report received",
                "Your incident report has been received and is being reviewed."
        );

        return saved;
    }

    public List<SafetyIncident> getUserIncidents(Integer userId) {
        return incidentRepository.findByUserIdOrderBySubmittedAtDesc(userId);
    }
}
