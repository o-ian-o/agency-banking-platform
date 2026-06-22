package com.pngbank.agency.entity;

import com.pngbank.agency.enums.KycTier;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "primary_mobile", nullable = false, unique = true, length = 20)
    private String primaryMobile;

    @Column(name = "secondary_mobile", unique = true, length = 20)
    private String secondaryMobile;

    @Column(length = 150)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "kyc_tier", nullable = false, columnDefinition = "kyc_tier")
    private KycTier kycTier = KycTier.TIER_1_BASIC;

    @Column(name = "nid_number", unique = true, length = 50)
    private String nidNumber;

    @Column(name = "id_document_type", length = 50)
    private String idDocumentType;

    @Column(name = "id_document_ref", length = 100)
    private String idDocumentRef;

    @Column(length = 100)
    private String province;

    @Column(length = 100)
    private String district;

    @Column(length = 100)
    private String llg;

    @Column(length = 150)
    private String village;

    @Column(name = "phone_verified", nullable = false)
    private boolean phoneVerified = false;

    @Column(name = "photo_reference")
    private String photoReference;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_offline", nullable = false)
    private boolean createdOffline = false;

    @Column(name = "enrolled_by_agent_id")
    private UUID enrolledByAgentId;

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