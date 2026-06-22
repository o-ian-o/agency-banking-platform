package com.pngbank.agency.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class SyncReportResponse {

    private int totalCustomersReceived;
    private int customersProcessed;
    private int customersSkippedDuplicate;
    private List<CustomerResult> customerResults = new ArrayList<>();

    private int totalTransactionsReceived;
    private int transactionsProcessed;
    private int transactionsSkippedDuplicate;
    private List<TransactionResult> transactionResults = new ArrayList<>();

    private List<ErrorDetail> errors = new ArrayList<>();

    @Getter
    @Setter
    public static class CustomerResult {
        private UUID localUuid;
        private UUID serverCustomerId;
        private String status; // CREATED, ALREADY_EXISTS, FAILED
    }

    @Getter
    @Setter
    public static class TransactionResult {
        private UUID idempotencyKey;
        private UUID serverTransactionId;
        private String status; // POSTED, ALREADY_PROCESSED, FAILED
    }

    @Getter
    @Setter
    public static class ErrorDetail {
        private String referenceId;
        private String errorCode;
        private String message;

        public ErrorDetail(String referenceId, String errorCode, String message) {
            this.referenceId = referenceId;
            this.errorCode = errorCode;
            this.message = message;
        }
    }
}