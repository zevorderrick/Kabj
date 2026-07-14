package com.detour.api.guides.dto;

import com.detour.api.guides.GuideAvailability;
import java.time.LocalDate;
import java.time.LocalTime;

public class AvailabilityResponse {
    public Integer id;
    public Integer guideId;
    public LocalDate availableDate;
    public LocalTime startTime;
    public LocalTime endTime;
    public boolean isBooked;

    public static AvailabilityResponse from(GuideAvailability availability) {
        AvailabilityResponse r = new AvailabilityResponse();
        r.id = availability.getId();
        r.guideId = availability.getGuideId();
        r.availableDate = availability.getAvailableDate();
        r.startTime = availability.getStartTime();
        r.endTime = availability.getEndTime();
        r.isBooked = availability.isBooked();
        return r;
    }
}
