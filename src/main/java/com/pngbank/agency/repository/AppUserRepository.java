package com.pngbank.agency.repository;

import com.pngbank.agency.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, String> {
    // Find the user solely by their ID
    Optional<AppUser> findByUserIdIgnoreCase(String userId);
}