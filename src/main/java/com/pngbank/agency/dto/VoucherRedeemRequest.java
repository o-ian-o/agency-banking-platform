package com.pngbank.agency.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class VoucherRedeemRequest {

    @NotNull
    private UUID agentId;

    @NotNull
    @Pattern(regexp = "^\\+?[0-9]{7,15}$")
    private String recipientMobileNumber;

    @NotBlank
    private String providedRawToken;

    @NotBlank
    private String recipientClaimedIdentityMetadata;

    @NotNull
    private UUID idempotencyKey;
}