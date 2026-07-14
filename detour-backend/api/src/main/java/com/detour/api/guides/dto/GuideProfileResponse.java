package com.detour.api.guides.dto;

import com.detour.api.guides.GuideProfile;
import com.detour.api.guides.VerificationStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class GuideProfileResponse {
    public Integer id;
    public Integer userId;
    public String bio;
    public String specialty;
    public String languages;
    public String gtaLicenseNo;
    public String ghanaCardNumber;
    public String companyName;
    public VerificationStatus verificationStatus;
    public BigDecimal avgRating;
    public BigDecimal baseRatePerHour;
    public LocalDateTime createdAt;

    public static GuideProfileResponse from(GuideProfile profile) {
        GuideProfileResponse r = new GuideProfileResponse();
        r.id = profile.getId();
        r.userId = profile.getUserId();
        r.bio = profile.getBio();
        r.specialty = profile.getSpecialty();
        r.languages = profile.getLanguages();
        r.gtaLicenseNo = profile.getGtaLicenseNo();
        r.ghanaCardNumber = profile.getGhanaCardNumber();
        r.companyName = profile.getCompanyName();
        r.verificationStatus = profile.getVerificationStatus();
        r.avgRating = profile.getAvgRating();
        r.baseRatePerHour = profile.getBaseRatePerHour();
        r.createdAt = profile.getCreatedAt();
        return r;
    }
}
