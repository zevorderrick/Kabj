package com.detour.api.guides;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "guide_profiles")
public class GuideProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 100)
    private String specialty;

    @Column(columnDefinition = "TEXT")
    private String languages;

    @Column(name = "gta_license_no", length = 50)
    private String gtaLicenseNo;

    @Column(name = "ghana_card_number", length = 50)
    private String ghanaCardNumber;

    @Column(name = "company_name", length = 150)
    private String companyName;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 20)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "avg_rating", precision = 3, scale = 2)
    private BigDecimal avgRating;

    @Column(name = "base_rate_per_hour", precision = 10, scale = 2)
    private BigDecimal baseRatePerHour;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }

    public String getGtaLicenseNo() { return gtaLicenseNo; }
    public void setGtaLicenseNo(String gtaLicenseNo) { this.gtaLicenseNo = gtaLicenseNo; }

    public String getGhanaCardNumber() { return ghanaCardNumber; }
    public void setGhanaCardNumber(String ghanaCardNumber) { this.ghanaCardNumber = ghanaCardNumber; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public BigDecimal getAvgRating() { return avgRating; }
    public void setAvgRating(BigDecimal avgRating) { this.avgRating = avgRating; }

    public BigDecimal getBaseRatePerHour() { return baseRatePerHour; }
    public void setBaseRatePerHour(BigDecimal baseRatePerHour) { this.baseRatePerHour = baseRatePerHour; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
