package com.detour.api.guides;

import com.detour.api.guides.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/guides")
public class GuideController {

    private final GuideService guideService;

    @Autowired
    public GuideController(GuideService guideService) {
        this.guideService = guideService;
    }

    @PostMapping("/onboard")
    public ResponseEntity<?> onboard(@RequestBody GuideOnboardingRequest request) {
        try {
            return ResponseEntity.ok(guideService.submitOnboarding(
                    request.userId,
                    request.bio,
                    request.specialty,
                    request.languages,
                    request.gtaLicenseNo,
                    request.ghanaCardNumber,
                    request.companyName
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveGuide(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(guideService.approveGuide(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectGuide(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(guideService.rejectGuide(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<List<GuideProfileResponse>> getPendingGuides() {
        return ResponseEntity.ok(guideService.getPendingGuides());
    }

    @PostMapping("/{id}/availability")
    public ResponseEntity<?> setAvailability(
            @PathVariable Integer id,
            @RequestBody SetAvailabilityRequest request
    ) {
        try {
            return ResponseEntity.ok(guideService.setAvailability(
                    id,
                    request.date,
                    request.startTime,
                    request.endTime
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<?> getAvailability(
            @PathVariable Integer id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        try {
            return ResponseEntity.ok(guideService.getAvailability(id, fromDate, toDate));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/earnings")
    public ResponseEntity<?> getEarnings(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(guideService.getEarningsSummary(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/payout")
    public ResponseEntity<?> requestPayout(
            @PathVariable Integer id,
            @RequestBody PayoutRequest request
    ) {
        try {
            return ResponseEntity.ok(guideService.requestPayout(id, request.amount, request.momoNumber));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
