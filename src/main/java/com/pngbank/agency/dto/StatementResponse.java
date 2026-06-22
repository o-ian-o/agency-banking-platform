package com.pngbank.agency.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
public class StatementResponse {
    private String accountId;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private BigDecimal currentBalance;
    private List<LineItem> entries;

    @Getter
    @Setter
    public static class LineItem {
        private OffsetDateTime date;
        private String type;
        private String direction;
        private BigDecimal amount;
        private BigDecimal balanceAfter;
        private String description;
    }
}