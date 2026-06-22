package com.pngbank.agency.repository;

import com.pngbank.agency.entity.Account;
import com.pngbank.agency.enums.AccountType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.id = :id")
    Optional<Account> findByIdForUpdate(UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.ownerCustomer.id = :customerId AND a.accountType = :type")
    Optional<Account> findByCustomerIdAndTypeForUpdate(UUID customerId, AccountType type);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.ownerAgent.id = :agentId AND a.accountType = :type")
    Optional<Account> findByAgentIdAndTypeForUpdate(UUID agentId, AccountType type);

    Optional<Account> findByOwnerCustomerIdAndAccountType(UUID customerId, AccountType type);

    Optional<Account> findByOwnerAgentIdAndAccountType(UUID agentId, AccountType type);
}