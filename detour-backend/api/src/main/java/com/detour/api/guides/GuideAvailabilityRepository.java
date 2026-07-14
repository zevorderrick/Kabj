package com.detour.api.guides;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GuideAvailabilityRepository extends JpaRepository<GuideAvailability, Integer> {

    List<GuideAvailability> findByGuideId(Integer guideId);

    List<GuideAvailability> findByGuideIdAndAvailableDateBetween(
            Integer guideId, LocalDate fromDate, LocalDate toDate);
}
