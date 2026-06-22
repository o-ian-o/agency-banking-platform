package com.pngbank.agency.dto;

import com.pngbank.agency.enums.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CommissionRequest {

    @NotNull
    private TransactionType transactionType;

    @NotNull
    @Positive
    private BigDecimal totalAmount;

    @NotBlank
    private String agentProvince;
}