package com.pngbank.agency.service;

import com.pngbank.agency.dto.EnrolmentBatchRequest;
import com.pngbank.agency.dto.OfflineTransactionRequest;
import com.pngbank.agency.dto.SyncReportResponse;
import com.pngbank.agency.entity.*;
import com.pngbank.agency.enums.*;
import com.pngbank.agency.exception.DeviceMismatchException;
import com.pngbank.agency.exception.InsufficientFundsException;
import com.pngbank.agency.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class EnrolmentSyncService {

    private final AgentRepository agentRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final TransactionEntityRepository transactionRepository;
    private final TransactionEntryRepository entryRepository;

    public EnrolmentSyncService(AgentRepository agentRepository,
                                 CustomerRepository customerRepository,
                                 AccountRepository accountRepository,
                                 TransactionEntityRepository transactionRepository,
                                 TransactionEntryRepository entryRepository) {
        this.agentRepository = agentRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.entryRepository = entryRepository;
    }

    @Transactional
    public SyncReportResponse processBatch(EnrolmentBatchRequest request) {
        SyncReportResponse report = new SyncReportResponse();

        Agent agent = agentRepository.findByDeviceFingerprintHash(request.getDeviceFingerprintHash())
                .orElseThrow(() -> new DeviceMismatchException(
                        "No agent registered with device fingerprint: " + request.getDeviceFingerprintHash()));

        if (agent.getStatus() != AgentStatus.ACTIVE) {
            throw new DeviceMismatchException("Agent is not ACTIVE. Current status: " + agent.getStatus());
        }

        Map<UUID, UUID> localToServerCustomerId = new HashMap<>();

        // ---- 1. Process customer enrolments ----
        report.setTotalCustomersReceived(request.getCustomers().size());

        for (EnrolmentBatchRequest.OfflineCustomerDto dto : request.getCustomers()) {
            SyncReportResponse.CustomerResult result = new SyncReportResponse.CustomerResult();
            result.setLocalUuid(dto.getLocalUuid());

            try {
                if (customerRepository.existsByPrimaryMobile(dto.getPrimaryMobile())) {
                    Customer existing = customerRepository.findByPrimaryMobile(dto.getPrimaryMobile()).get();
                    result.setServerCustomerId(existing.getId());
                    result.setStatus("ALREADY_EXISTS");
                    localToServerCustomerId.put(dto.getLocalUuid(), existing.getId());
                    report.setCustomersSkippedDuplicate(report.getCustomersSkippedDuplicate() + 1);
                    report.getCustomerResults().add(result);
                    continue;
                }

                Customer customer = new Customer();
                customer.setFullName(dto.getFullName());
                customer.setDateOfBirth(dto.getDateOfBirth());
                customer.setPrimaryMobile(dto.getPrimaryMobile());
                customer.setKycTier(KycTier.TIER_1_BASIC);
                customer.setProvince(dto.getProvince());
                customer.setDistrict(dto.getDistrict());
                customer.setLlg(dto.getLlg());
                customer.setVillage(dto.getVillage());
                customer.setPhotoReference(dto.getPhotoBase64() != null ? "pending-upload" : null);
                customer.setCreatedOffline(true);
                customer.setEnrolledByAgentId(agent.getId());
                customer.setPhoneVerified(false);

                Customer saved = customerRepository.save(customer);

                // Create the customer's primary wallet account with zero balance
                Account wallet = new Account();
                wallet.setAccountType(AccountType.CUSTOMER_WALLET);
                wallet.setOwnerCustomer(saved);
                wallet.setCurrency("PGK");
                wallet.setBalance(BigDecimal.ZERO);
                accountRepository.save(wallet);

                localToServerCustomerId.put(dto.getLocalUuid(), saved.getId());

                result.setServerCustomerId(saved.getId());
                result.setStatus("CREATED");
                report.setCustomersProcessed(report.getCustomersProcessed() + 1);

            } catch (Exception ex) {
                log.error("Failed to process offline customer {}: {}", dto.getLocalUuid(), ex.getMessage());
                result.setStatus("FAILED");
                report.getErrors().add(new SyncReportResponse.ErrorDetail(
                        dto.getLocalUuid().toString(), "CUSTOMER_ENROLMENT_FAILED", ex.getMessage()));
            }

            report.getCustomerResults().add(result);
        }

        // ---- 2. Process offline transactions ----
        report.setTotalTransactionsReceived(request.getTransactions().size());

        for (OfflineTransactionRequest txReq : request.getTransactions()) {
            SyncReportResponse.TransactionResult result = new SyncReportResponse.TransactionResult();
            result.setIdempotencyKey(txReq.getIdempotencyKey());

            try {
                if (transactionRepository.existsByIdempotencyKey(txReq.getIdempotencyKey())) {
                    TransactionEntity existing = transactionRepository
                            .findByIdempotencyKey(txReq.getIdempotencyKey()).get();
                    result.setServerTransactionId(existing.getId());
                    result.setStatus("ALREADY_PROCESSED");
                    report.setTransactionsSkippedDuplicate(report.getTransactionsSkippedDuplicate() + 1);
                    report.getTransactionResults().add(result);
                    continue;
                }

                UUID resolvedCustomerId = txReq.getCustomerId();
                if (resolvedCustomerId == null && txReq.getCustomerLocalUuid() != null) {
                    resolvedCustomerId = localToServerCustomerId.get(txReq.getCustomerLocalUuid());
                    if (resolvedCustomerId == null) {
                        throw new IllegalArgumentException(
                                "customerLocalUuid " + txReq.getCustomerLocalUuid() + " could not be resolved");
                    }
                }

                TransactionEntity tx = postOfflineCashTransaction(agent, resolvedCustomerId, txReq);

                result.setServerTransactionId(tx.getId());
                result.setStatus("POSTED");
                report.setTransactionsProcessed(report.getTransactionsProcessed() + 1);

            } catch (InsufficientFundsException ex) {
                log.warn("Insufficient funds for offline tx {}: {}", txReq.getIdempotencyKey(), ex.getMessage());
                result.setStatus("FAILED");
                report.getErrors().add(new SyncReportResponse.ErrorDetail(
                        txReq.getIdempotencyKey().toString(), "INSUFFICIENT_FUNDS", ex.getMessage()));
            } catch (Exception ex) {
                log.error("Failed to process offline transaction {}: {}", txReq.getIdempotencyKey(), ex.getMessage());
                result.setStatus("FAILED");
                report.getErrors().add(new SyncReportResponse.ErrorDetail(
                        txReq.getIdempotencyKey().toString(), "TRANSACTION_FAILED", ex.getMessage()));
            }

            report.getTransactionResults().add(result);
        }

        return report;
    }

    private TransactionEntity postOfflineCashTransaction(Agent agent, UUID customerId,
                                                           OfflineTransactionRequest txReq) {

        Account customerWallet = accountRepository
                .findByCustomerIdAndTypeForUpdate(customerId, AccountType.CUSTOMER_WALLET)
                .orElseThrow(() -> new IllegalArgumentException("No wallet account for customer " + customerId));

        Account agentFloat = accountRepository
                .findByAgentIdAndTypeForUpdate(agent.getId(), AccountType.AGENT_FLOAT)
                .orElseThrow(() -> new IllegalArgumentException("No float account for agent " + agent.getId()));

        TransactionEntity tx = new TransactionEntity();
        tx.setTransactionType(txReq.getTransactionType());
        tx.setAmount(txReq.getAmount());
        tx.setFeeAmount(txReq.getFeeAmount() != null ? txReq.getFeeAmount() : BigDecimal.ZERO);
        tx.setCurrency("PGK");
        tx.setInitiatingAgent(agent);
        tx.setCustomer(customerWallet.getOwnerCustomer());
        tx.setIdempotencyKey(txReq.getIdempotencyKey());
        tx.setClientEpochMs(txReq.getClientEpochMs());
        tx.setDescription(txReq.getDescription());
        tx.setStatus(TransactionStatus.PENDING);

        switch (txReq.getTransactionType()) {
            case CASH_IN -> {
                // Customer deposits cash with agent: agent float increases, customer wallet increases
                if (agentFloat.getBalance().compareTo(txReq.getAmount()) < 0) {
                    throw new InsufficientFundsException(
                            "Agent float balance insufficient to cover CASH_IN of " + txReq.getAmount());
                }
                debit(tx, agentFloat, txReq.getAmount());
                credit(tx, customerWallet, txReq.getAmount());
            }
            case CASH_OUT -> {
                // Customer withdraws cash from agent: customer wallet decreases, agent float increases
                if (customerWallet.getBalance().compareTo(txReq.getAmount()) < 0) {
                    throw new InsufficientFundsException(
                            "Customer wallet balance insufficient for CASH_OUT of " + txReq.getAmount());
                }
                debit(tx, customerWallet, txReq.getAmount());
                credit(tx, agentFloat, txReq.getAmount());
            }
            default -> throw new IllegalArgumentException(
                    "Offline sync only supports CASH_IN and CASH_OUT, got: " + txReq.getTransactionType());
        }

        tx.setStatus(TransactionStatus.POSTED);
        tx.setPostedAt(java.time.OffsetDateTime.now());

        return transactionRepository.save(tx);
    }

    private void debit(TransactionEntity tx, Account account, BigDecimal amount) {
        applyEntry(tx, account, EntryDirection.DEBIT, amount, account.getBalance().subtract(amount));
    }

    private void credit(TransactionEntity tx, Account account, BigDecimal amount) {
        applyEntry(tx, account, EntryDirection.CREDIT, amount, account.getBalance().add(amount));
    }

    private void applyEntry(TransactionEntity tx, Account account, EntryDirection direction,
                             BigDecimal amount, BigDecimal newBalance) {
        if (newBalance.compareTo(BigDecimal.ZERO) < 0
                && (account.getAccountType() == AccountType.CUSTOMER_WALLET
                    || account.getAccountType() == AccountType.AGENT_FLOAT
                    || account.getAccountType() == AccountType.AGENT_COMMISSION
                    || account.getAccountType() == AccountType.VOUCHER_HOLDING)) {
            throw new InsufficientFundsException(
                    "Operation would result in negative balance for account " + account.getId());
        }

        account.setBalance(newBalance);
        Account savedAccount = accountRepository.save(account);

        TransactionEntryEntity entry = new TransactionEntryEntity();
        entry.setTransaction(tx);
        entry.setAccount(savedAccount);
        entry.setDirection(direction);
        entry.setAmount(amount);
        entry.setBalanceAfter(newBalance);

        // First save the parent transaction if not yet persisted so the FK exists
        if (tx.getId() == null) {
            transactionRepository.save(tx);
        }

        entryRepository.save(entry);
    }
}