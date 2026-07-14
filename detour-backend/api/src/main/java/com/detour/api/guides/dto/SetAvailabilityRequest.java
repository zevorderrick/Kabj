package com.detour.api.guides.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class SetAvailabilityRequest {
    public LocalDate date;
    public LocalTime startTime;
    public LocalTime endTime;
}
