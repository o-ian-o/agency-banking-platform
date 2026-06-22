package com.pngbank.agency.service;

import com.pngbank.agency.dto.StatementResponse;
import com.pngbank.agency.entity.Account;
import com.pngbank.agency.entity.TransactionEntryEntity;
import com.pngbank.agency.repository.AccountRepository;
import com.pngbank.agency.repository.TransactionEntryRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StatementService {

    private final AccountRepository accountRepository;
    private final TransactionEntryRepository entryRepository;

    public StatementService(@NonNull AccountRepository accountRepository, @NonNull TransactionEntryRepository entryRepository) {
        this.accountRepository = accountRepository;
        this.entryRepository = entryRepository;
    }

    public StatementResponse generateFullStatement(@NonNull UUID accountId, @NonNull OffsetDateTime start, @NonNull OffsetDateTime end) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountId));

        List<TransactionEntryEntity> entries = entryRepository
                .findByAccountIdAndCreatedAtBetweenOrderByCreatedAtDesc(accountId, start, end);

        StatementResponse response = new StatementResponse();
        response.setAccountId(accountId.toString());
        response.setStartDate(start);
        response.setEndDate(end);
        response.setCurrentBalance(account.getBalance());

        response.setEntries(entries.stream().map(e -> {
            StatementResponse.LineItem item = new StatementResponse.LineItem();
            item.setDate(e.getCreatedAt());
            item.setType(e.getTransaction().getTransactionType().name());
            item.setDirection(e.getDirection().name());
            item.setAmount(e.getAmount());
            item.setBalanceAfter(e.getBalanceAfter());
            item.setDescription(e.getTransaction().getDescription());
            return item;
        }).collect(Collectors.toList()));

        return response;
    }

    public String generateMiniStatement(@NonNull UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountId));

        List<TransactionEntryEntity> recent = entryRepository.findTop10ByAccountIdOrderByCreatedAtDesc(accountId);

        StringBuilder sb = new StringBuilder();
        sb.append("BAL: PGK ").append(account.getBalance()).append("\n");

        for (TransactionEntryEntity e : recent) {
            String sign = e.getDirection().name().equals("CREDIT") ? "+" : "-";
            sb.append(e.getCreatedAt().toLocalDate())
              .append(" ")
              .append(e.getTransaction().getTransactionType().name())
              .append(" ")
              .append(sign)
              .append(e.getAmount())
              .append("\n");
        }

        return sb.toString();
    }
}