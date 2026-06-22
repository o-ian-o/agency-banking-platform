package com.pngbank.agency.repository;

import com.pngbank.agency.entity.TransactionEntryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface TransactionEntryRepository extends JpaRepository<TransactionEntryEntity, UUID> {

    List<TransactionEntryEntity> findByAccountIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            UUID accountId, OffsetDateTime start, OffsetDateTime end);

    List<TransactionEntryEntity> findTop10ByAccountIdOrderByCreatedAtDesc(UUID accountId);
}