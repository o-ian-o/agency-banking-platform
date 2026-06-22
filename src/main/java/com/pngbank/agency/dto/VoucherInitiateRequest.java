package com.pngbank.agency.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class VoucherInitiateRequest {

    @NotNull
    private UUID senderAccountId;

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotNull
    @Pattern(regexp = "^\\+?[0-9]{7,15}$")
    private String recipientMobileNumber;

    @NotNull
    private UUID initiatingAgentId;

    @NotNull
    private UUID idempotencyKey;
}