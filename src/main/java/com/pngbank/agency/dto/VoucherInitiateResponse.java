package com.pngbank.agency.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
public class VoucherInitiateResponse {
    private UUID voucherId;
    private String rawToken; // returned ONLY here, sent to recipient via SMS, never stored raw
    private BigDecimal amount;
    private BigDecimal feeCharged;
    private OffsetDateTime expiresAt;
}