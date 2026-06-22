package com.pngbank.agency.entity;

import com.pngbank.agency.enums.VoucherStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "vouchers")
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "issuing_transaction_id", nullable = false)
    private TransactionEntity issuingTransaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "redeeming_transaction_id")
    private TransactionEntity redeemingTransaction;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_account_id", nullable = false)
    private Account senderAccount;

    @Column(name = "recipient_mobile", nullable = false, length = 20)
    private String recipientMobile;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;

    @Column(name = "token_salt", nullable = false)
    private String tokenSalt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "voucher_status")
    private VoucherStatus status = VoucherStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "redeemed_by_agent_id")
    private Agent redeemedByAgent;

    @Column(name = "redeemed_at")
    private OffsetDateTime redeemedAt;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}