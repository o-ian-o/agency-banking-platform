package com.pngbank.agency.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;
import java.util.UUID;

@Getter
@Setter
public class ProfileUpdateRequest {

    @NotNull
    private UUID customerId;

    @NotNull
    private UUID agentId;

    @NotBlank
    private String agentPin;

    @NotBlank
    private String customerSmsOtp;

    // Allowed keys: secondaryMobile, email, province, district, llg, village
    @NotNull
    private Map<String, String> updatedFields;
}