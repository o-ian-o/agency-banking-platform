package com.pngbank.agency.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CommissionResponse {
    private BigDecimal totalFee;
    private BigDecimal platformRevenue;
    private BigDecimal agentImmediateCommission;
    private BigDecimal taxFraction;
    private BigDecimal netAmountToCustomer;
}