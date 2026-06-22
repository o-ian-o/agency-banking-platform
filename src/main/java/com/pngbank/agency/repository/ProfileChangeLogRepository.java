package com.pngbank.agency.repository;

import com.pngbank.agency.entity.ProfileChangeLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProfileChangeLogRepository extends JpaRepository<ProfileChangeLog, UUID> {
}