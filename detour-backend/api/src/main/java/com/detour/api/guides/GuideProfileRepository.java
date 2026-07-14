package com.detour.api.guides;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GuideProfileRepository extends JpaRepository<GuideProfile, Integer> {

    Optional<GuideProfile> findByUserId(Integer userId);

    List<GuideProfile> findByVerificationStatus(VerificationStatus verificationStatus);
}
