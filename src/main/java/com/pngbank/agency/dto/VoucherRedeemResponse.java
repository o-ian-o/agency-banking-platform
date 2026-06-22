package com.pngbank.agency.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
public class VoucherRedeemResponse {
    private UUID voucherId;
    private UUID redeemingTransactionId;
    private BigDecimal amountCredited;
    private String receiptString;
    private OffsetDateTime redeemedAt;
}