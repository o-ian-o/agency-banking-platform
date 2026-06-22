package com.pngbank.agency.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EnrolmentBatchRequest {

    @NotBlank
    private String deviceFingerprintHash;

    @Valid
    @NotNull
    private List<OfflineCustomerDto> customers;

    @Valid
    @NotNull
    private List<OfflineTransactionRequest> transactions;

    @Getter
    @Setter
    public static class OfflineCustomerDto {

        @NotNull
        private java.util.UUID localUuid; // client-generated, used for idempotency

        @NotBlank
        @Size(max = 150)
        private String fullName;

        @NotNull
        @Past
        private java.time.LocalDate dateOfBirth;

        @NotBlank
        @Pattern(regexp = "^\\+?[0-9]{7,15}$")
        private String primaryMobile;

        private String photoBase64;

        @NotNull
        @Positive
        private Long localEpochMs;

        private String province;
        private String district;
        private String llg;
        private String village;
    }
}