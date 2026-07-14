package com.detour.api.guides.dto;

import java.math.BigDecimal;

public class EarningsSummaryResponse {
    public BigDecimal totalCompletedBookingRevenue;
    public BigDecimal commissionAmount;
    public BigDecimal commissionRatePercent;
    public BigDecimal netGuideEarnings;
    public BigDecimal pendingPayoutBalance;

    public static EarningsSummaryResponse of(
            BigDecimal totalCompletedBookingRevenue,
            BigDecimal commissionAmount,
            BigDecimal commissionRatePercent,
            BigDecimal netGuideEarnings,
            BigDecimal pendingPayoutBalance
    ) {
        EarningsSummaryResponse r = new EarningsSummaryResponse();
        r.totalCompletedBookingRevenue = totalCompletedBookingRevenue;
        r.commissionAmount = commissionAmount;
        r.commissionRatePercent = commissionRatePercent;
        r.netGuideEarnings = netGuideEarnings;
        r.pendingPayoutBalance = pendingPayoutBalance;
        return r;
    }
}
