package com.pngbank.agency.dto;

import com.pngbank.agency.enums.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class OfflineTransactionRequest {

    @NotNull
    private UUID idempotencyKey;

    @NotNull
    private TransactionType transactionType;

    @NotNull
    @Positive
    private BigDecimal amount;

    private BigDecimal feeAmount = BigDecimal.ZERO;

    // Either reference an existing customer id, or a localUuid from the same batch's customers[]
    private UUID customerId;

    private UUID customerLocalUuid;

    @NotNull
    @Positive
    private Long clientEpochMs;

    private String description;
}