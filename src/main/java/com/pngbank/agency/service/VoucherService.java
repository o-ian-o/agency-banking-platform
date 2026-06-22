package com.pngbank.agency.service;

import com.pngbank.agency.dto.VoucherInitiateRequest;
import com.pngbank.agency.dto.VoucherInitiateResponse;
import com.pngbank.agency.dto.VoucherRedeemRequest;
import com.pngbank.agency.dto.VoucherRedeemResponse;
import com.pngbank.agency.entity.*;
import com.pngbank.agency.enums.*;
import com.pngbank.agency.exception.InsufficientFundsException;
import com.pngbank.agency.exception.InvalidVoucherException;
import com.pngbank.agency.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

@Service
public class VoucherService {

    private final AccountRepository accountRepository;
    private final TransactionEntityRepository transactionRepository;
    private final TransactionEntryRepository entryRepository;
    private final VoucherRepository voucherRepository;
    private final AgentRepository agentRepository;
    private final CommissionService commissionService;

    private final int expirationHours;
    private final int tokenLength;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public VoucherService(@NonNull AccountRepository accountRepository,
                           @NonNull TransactionEntityRepository transactionRepository,
                           @NonNull TransactionEntryRepository entryRepository,
                           @NonNull VoucherRepository voucherRepository,
                           @NonNull AgentRepository agentRepository,
                           @NonNull CommissionService commissionService,
                           @Value("${banking.voucher.expiration-hours}") int expirationHours,
                           @Value("${banking.voucher.token-length}") int tokenLength) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.entryRepository = entryRepository;
        this.voucherRepository = voucherRepository;
        this.agentRepository = agentRepository;
        this.commissionService = commissionService;
        this.expirationHours = expirationHours;
        this.tokenLength = tokenLength;
    }

    @Transactional
    public VoucherInitiateResponse initiateVoucher(@NonNull VoucherInitiateRequest request) {

        UUID idempotencyKey = Objects.requireNonNull(request.getIdempotencyKey(), "idempotencyKey is required");
        UUID senderAccountId = Objects.requireNonNull(request.getSenderAccountId(), "senderAccountId is required");
        BigDecimal requestAmount = Objects.requireNonNull(request.getAmount(), "amount is required");
        String recipientMobileNumber = Objects.requireNonNull(request.getRecipientMobileNumber(), "recipientMobileNumber is required");

        if (transactionRepository.existsByIdempotencyKey(idempotencyKey)) {
            throw new IllegalStateException("Duplicate request: idempotency key already processed");
        }

        Account senderAccount = accountRepository.findByIdForUpdate(senderAccountId)
                .orElseThrow(() -> new IllegalArgumentException("Sender account not found"));

        var commission = Objects.requireNonNull(commissionService.calculateFeesAndCommissions(
                new com.pngbank.agency.dto.CommissionRequest() {{
                    setTransactionType(TransactionType.VOUCHER_ISSUE);
                    setTotalAmount(requestAmount);
                    setAgentProvince("DEFAULT");
                }}
        ), "Commission calculation returned null");

        BigDecimal totalFee = Objects.requireNonNull(commission.getTotalFee(), "commission.totalFee is required");

        BigDecimal totalDeduction = requestAmount.add(totalFee);

        BigDecimal senderBalance = Objects.requireNonNull(senderAccount.getBalance(), "senderAccount.balance is required");
        if (senderBalance.compareTo(totalDeduction) < 0) {
            throw new InsufficientFundsException(
                    "Sender account balance insufficient for voucher amount + fees: required " + totalDeduction);
        }

        // Create transaction header
        TransactionEntity tx = new TransactionEntity();
        tx.setTransactionType(TransactionType.VOUCHER_ISSUE);
        tx.setAmount(requestAmount);
        tx.setFeeAmount(totalFee);
        tx.setCurrency("PGK");
        tx.setIdempotencyKey(idempotencyKey);
        tx.setStatus(TransactionStatus.PENDING);
        if (senderAccount.getOwnerCustomer() != null) {
            tx.setCustomer(senderAccount.getOwnerCustomer());
        }
        tx.setDescription("Voucher issued for " + recipientMobileNumber);
        tx = transactionRepository.save(tx);

        // Debit sender for amount + fee
        BigDecimal newSenderBalance = senderBalance.subtract(totalDeduction);
        senderAccount.setBalance(newSenderBalance);
        accountRepository.save(senderAccount);

        TransactionEntryEntity debitEntry = new TransactionEntryEntity();
        debitEntry.setTransaction(tx);
        debitEntry.setAccount(senderAccount);
        debitEntry.setDirection(EntryDirection.DEBIT);
        debitEntry.setAmount(totalDeduction);
        debitEntry.setBalanceAfter(newSenderBalance);
        entryRepository.save(debitEntry);

        // Credit a VOUCHER_HOLDING account for the principal amount (liability until redeemed)
        Account voucherHolding = accountRepository
                .findByOwnerAgentIdAndAccountType(null, AccountType.VOUCHER_HOLDING)
                .orElseGet(() -> {
                    Account holding = new Account();
                    holding.setAccountType(AccountType.VOUCHER_HOLDING);
                    holding.setCurrency("PGK");
                    holding.setBalance(BigDecimal.ZERO);
                    return accountRepository.save(holding);
                });

            BigDecimal holdingBalance = Objects.requireNonNull(voucherHolding.getBalance(), "voucherHolding.balance is required");
            BigDecimal newHoldingBalance = holdingBalance.add(requestAmount);
        voucherHolding.setBalance(newHoldingBalance);
        accountRepository.save(voucherHolding);

        TransactionEntryEntity creditEntry = new TransactionEntryEntity();
        creditEntry.setTransaction(tx);
        creditEntry.setAccount(voucherHolding);
        creditEntry.setDirection(EntryDirection.CREDIT);
        creditEntry.setAmount(requestAmount);
        creditEntry.setBalanceAfter(newHoldingBalance);
        entryRepository.save(creditEntry);

        // Distribute fees (platform/agent/tax) via dedicated accounts
        distributeFees(tx, commission);

        tx.setStatus(TransactionStatus.POSTED);
        tx.setPostedAt(OffsetDateTime.now());
        transactionRepository.save(tx);

        // Generate raw numeric token, hash with bcrypt
        String rawToken = generateNumericToken(tokenLength);
        String tokenHash = BCrypt.hashpw(rawToken, BCrypt.gensalt(10));

        Voucher voucher = new Voucher();
        voucher.setIssuingTransaction(tx);
        voucher.setSenderAccount(senderAccount);
        voucher.setRecipientMobile(recipientMobileNumber);
        voucher.setAmount(requestAmount);
        voucher.setTokenHash(tokenHash);
        voucher.setTokenSalt(""); // salt embedded in bcrypt hash; field kept for schema compatibility
        voucher.setStatus(VoucherStatus.ACTIVE);
        voucher.setExpiresAt(OffsetDateTime.now().plusHours(expirationHours));

        voucher = voucherRepository.save(voucher);

        VoucherInitiateResponse response = new VoucherInitiateResponse();
        response.setVoucherId(voucher.getId());
        response.setRawToken(rawToken); // ONLY time this is exposed
        response.setAmount(requestAmount);
        response.setFeeCharged(totalFee);
        response.setExpiresAt(voucher.getExpiresAt());

        return response;
    }

    @Transactional
    public VoucherRedeemResponse redeemVoucher(@NonNull VoucherRedeemRequest request) {

        UUID idempotencyKey = Objects.requireNonNull(request.getIdempotencyKey(), "idempotencyKey is required");
        UUID requestAgentId = Objects.requireNonNull(request.getAgentId(), "agentId is required");
        String recipientMobileNumber = Objects.requireNonNull(request.getRecipientMobileNumber(), "recipientMobileNumber is required");
        String providedRawToken = Objects.requireNonNull(request.getProvidedRawToken(), "providedRawToken is required");

        if (transactionRepository.existsByIdempotencyKey(idempotencyKey)) {
            throw new IllegalStateException("Duplicate request: idempotency key already processed");
        }

        Agent agent = agentRepository.findById(requestAgentId)
                .orElseThrow(() -> new IllegalArgumentException("Agent not found"));

        if (agent.getStatus() != AgentStatus.ACTIVE) {
            throw new IllegalStateException("Agent is not ACTIVE");
        }

        // Find candidate vouchers for this mobile number; verify token hash one by one.
        // PESSIMISTIC_WRITE lock prevents concurrent redemption (double-spend) of the same voucher.
        var candidateVouchers = voucherRepository.findAll().stream()
            .filter(v -> recipientMobileNumber.equals(v.getRecipientMobile()))
                .filter(v -> v.getStatus() == VoucherStatus.ACTIVE)
                .toList();

        Voucher matchedVoucher = null;
        for (Voucher candidate : candidateVouchers) {
            if (BCrypt.checkpw(providedRawToken, Objects.requireNonNull(candidate.getTokenHash(), "voucher.tokenHash is required"))) {
                matchedVoucher = voucherRepository.findByTokenHashForUpdate(candidate.getTokenHash())
                        .orElseThrow(() -> new InvalidVoucherException("Voucher disappeared during lock acquisition"));
                break;
            }
        }

        if (matchedVoucher == null) {
            throw new InvalidVoucherException("Invalid voucher token or recipient mobile number");
        }

        // Re-check status under lock (handles race where another tx redeemed it just before lock acquisition)
        if (matchedVoucher.getStatus() != VoucherStatus.ACTIVE) {
            throw new InvalidVoucherException("Voucher is not active. Current status: " + matchedVoucher.getStatus());
        }

        OffsetDateTime expiresAt = Objects.requireNonNull(matchedVoucher.getExpiresAt(), "voucher.expiresAt is required");
        if (expiresAt.isBefore(OffsetDateTime.now())) {
            matchedVoucher.setStatus(VoucherStatus.EXPIRED);
            voucherRepository.save(matchedVoucher);
            throw new InvalidVoucherException("Voucher has expired");
        }

        UUID agentId = Objects.requireNonNull(agent.getId(), "agent.id is required");
        Agent currentAgent = agentRepository.findById(agentId).orElseThrow();
        BigDecimal voucherAmount = Objects.requireNonNull(matchedVoucher.getAmount(), "voucher.amount is required");
        BigDecimal dailyCashoutLimit = Objects.requireNonNull(currentAgent.getDailyCashoutLimit(), "agent.dailyCashoutLimit is required");
        if (voucherAmount.compareTo(dailyCashoutLimit) > 0) {
            throw new InsufficientFundsException(
                    "Voucher amount exceeds agent's daily cashout limit of " + dailyCashoutLimit);
        }

        // Create redemption transaction
        TransactionEntity tx = new TransactionEntity();
        tx.setTransactionType(TransactionType.VOUCHER_REDEEM);
        tx.setAmount(voucherAmount);
        tx.setFeeAmount(BigDecimal.ZERO);
        tx.setCurrency("PGK");
        tx.setInitiatingAgent(agent);
        tx.setIdempotencyKey(idempotencyKey);
        tx.setStatus(TransactionStatus.PENDING);
        tx.setDescription("Voucher redeemed by agent " + agent.getAgentCode()
            + " for " + recipientMobileNumber
                + " | Identity: " + request.getRecipientClaimedIdentityMetadata());
        tx = transactionRepository.save(tx);

        // Debit VOUCHER_HOLDING
        Account voucherHolding = accountRepository
                .findByOwnerAgentIdAndAccountType(null, AccountType.VOUCHER_HOLDING)
                .orElseThrow(() -> new IllegalStateException("Voucher holding account not found"));

        BigDecimal holdingBalance = Objects.requireNonNull(voucherHolding.getBalance(), "voucherHolding.balance is required");
        BigDecimal newHoldingBalance = holdingBalance.subtract(voucherAmount);
        if (newHoldingBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalStateException("Voucher holding account would go negative — data integrity issue");
        }
        voucherHolding.setBalance(newHoldingBalance);
        accountRepository.save(voucherHolding);

        TransactionEntryEntity debitEntry = new TransactionEntryEntity();
        debitEntry.setTransaction(tx);
        debitEntry.setAccount(voucherHolding);
        debitEntry.setDirection(EntryDirection.DEBIT);
        debitEntry.setAmount(voucherAmount);
        debitEntry.setBalanceAfter(newHoldingBalance);
        entryRepository.save(debitEntry);

        // Credit agent's float (agent pays out cash, gets reimbursed via float credit)
        Account agentFloat = accountRepository
            .findByAgentIdAndTypeForUpdate(agentId, AccountType.AGENT_FLOAT)
                .orElseThrow(() -> new IllegalStateException("Agent float account not found"));

        BigDecimal floatBalance = Objects.requireNonNull(agentFloat.getBalance(), "agentFloat.balance is required");
        BigDecimal newFloatBalance = floatBalance.add(voucherAmount);
        agentFloat.setBalance(newFloatBalance);
        accountRepository.save(agentFloat);

        TransactionEntryEntity creditEntry = new TransactionEntryEntity();
        creditEntry.setTransaction(tx);
        creditEntry.setAccount(agentFloat);
        creditEntry.setDirection(EntryDirection.CREDIT);
        creditEntry.setAmount(voucherAmount);
        creditEntry.setBalanceAfter(newFloatBalance);
        entryRepository.save(creditEntry);

        tx.setStatus(TransactionStatus.POSTED);
        tx.setPostedAt(OffsetDateTime.now());
        transactionRepository.save(tx);

        // Mark voucher as redeemed
        matchedVoucher.setStatus(VoucherStatus.REDEEMED);
        matchedVoucher.setRedeemedByAgent(agent);
        matchedVoucher.setRedeemedAt(OffsetDateTime.now());
        matchedVoucher.setRedeemingTransaction(tx);
        voucherRepository.save(matchedVoucher);

        String receipt = String.format(
                "RECEIPT | Voucher: %s | Amount: PGK %s | Agent: %s | Recipient: %s | Time: %s",
                matchedVoucher.getId(), matchedVoucher.getAmount(), agent.getAgentCode(),
                request.getRecipientMobileNumber(), matchedVoucher.getRedeemedAt());

        VoucherRedeemResponse response = new VoucherRedeemResponse();
        response.setVoucherId(matchedVoucher.getId());
        response.setRedeemingTransactionId(tx.getId());
        response.setAmountCredited(voucherAmount);
        response.setReceiptString(receipt);
        response.setRedeemedAt(matchedVoucher.getRedeemedAt());

        return response;
    }

    private void distributeFees(@NonNull TransactionEntity tx, @NonNull com.pngbank.agency.dto.CommissionResponse commission) {
        BigDecimal totalFee = Objects.requireNonNull(commission.getTotalFee(), "commission.totalFee is required");
        if (totalFee.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        BigDecimal platformRevenue = Objects.requireNonNull(commission.getPlatformRevenue(), "commission.platformRevenue is required");
        BigDecimal taxFraction = Objects.requireNonNull(commission.getTaxFraction(), "commission.taxFraction is required");
        BigDecimal agentImmediateCommission = Objects.requireNonNull(commission.getAgentImmediateCommission(), "commission.agentImmediateCommission is required");

        // Platform revenue
        creditPlatformAccount(tx, AccountType.PLATFORM_REVENUE,
            "00000000-0000-0000-0000-000000000001", platformRevenue);

        // Tax liability
        creditPlatformAccount(tx, AccountType.TAX_LIABILITY,
            "00000000-0000-0000-0000-000000000002", taxFraction);

        // Agent commission — only if there is an initiating agent
        if (tx.getInitiatingAgent() != null) {
            Account agentCommission = accountRepository
                    .findByAgentIdAndTypeForUpdate(tx.getInitiatingAgent().getId(), AccountType.AGENT_COMMISSION)
                    .orElseThrow(() -> new IllegalStateException("Agent commission account not found"));

                BigDecimal currentBalance = Objects.requireNonNull(agentCommission.getBalance(), "agentCommission.balance is required");
                BigDecimal newBalance = currentBalance.add(agentImmediateCommission);
            agentCommission.setBalance(newBalance);
            accountRepository.save(agentCommission);

            TransactionEntryEntity entry = new TransactionEntryEntity();
            entry.setTransaction(tx);
            entry.setAccount(agentCommission);
            entry.setDirection(EntryDirection.CREDIT);
            entry.setAmount(agentImmediateCommission);
            entry.setBalanceAfter(newBalance);
            entryRepository.save(entry);
        } else {
            // If no initiating agent (e.g. self-service voucher issuance), route agent share to platform too
            creditPlatformAccount(tx, AccountType.PLATFORM_REVENUE,
                    "00000000-0000-0000-0000-000000000001", agentImmediateCommission);
        }
    }

    private void creditPlatformAccount(@NonNull TransactionEntity tx, @NonNull AccountType type, @NonNull String accountIdStr, @NonNull BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }
        UUID accountId = UUID.fromString(accountIdStr);
        Account account = accountRepository.findByIdForUpdate(accountId)
                .orElseThrow(() -> new IllegalStateException("Platform account " + type + " not found"));

        BigDecimal currentBalance = Objects.requireNonNull(account.getBalance(), "account.balance is required");
        BigDecimal newBalance = currentBalance.add(amount);
        account.setBalance(newBalance);
        accountRepository.save(account);

        TransactionEntryEntity entry = new TransactionEntryEntity();
        entry.setTransaction(tx);
        entry.setAccount(account);
        entry.setDirection(EntryDirection.CREDIT);
        entry.setAmount(amount);
        entry.setBalanceAfter(newBalance);
        entryRepository.save(entry);
    }

    private String generateNumericToken(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(SECURE_RANDOM.nextInt(10));
        }
        return sb.toString();
    }
}