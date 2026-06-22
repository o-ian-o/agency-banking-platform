package com.pngbank.agency.entity;

import com.pngbank.agency.enums.AgentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "agents")
public class Agent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "agent_code", nullable = false, unique = true, length = 30)
    private String agentCode;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "primary_mobile", nullable = false, unique = true, length = 20)
    private String primaryMobile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "agent_status")
    private AgentStatus status = AgentStatus.PENDING_VERIFICATION;

    @Column(name = "device_imei", length = 50)
    private String deviceImei;

    @Column(name = "device_mac", length = 50)
    private String deviceMac;

    @Column(name = "device_fingerprint_hash", nullable = false, unique = true)
    private String deviceFingerprintHash;

    @Column(length = 100)
    private String province;

    @Column(length = 100)
    private String district;

    @Column(length = 100)
    private String llg;

    @Column(name = "village_or_location", length = 150)
    private String villageOrLocation;

    @Column(precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(name = "daily_cashout_limit", nullable = false, precision = 15, scale = 2)
    private BigDecimal dailyCashoutLimit = new BigDecimal("5000.00");

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}