package com.detour.api.guides;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuidePayoutRepository extends JpaRepository<GuidePayout, Integer> {

    List<GuidePayout> findByGuideId(Integer guideId);

    List<GuidePayout> findByGuideIdAndPayoutStatus(Integer guideId, PayoutStatus payoutStatus);
}
