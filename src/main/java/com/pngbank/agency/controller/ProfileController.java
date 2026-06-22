package com.pngbank.agency.controller;

import com.pngbank.agency.dto.ProfileUpdateRequest;
import com.pngbank.agency.entity.Customer;
import com.pngbank.agency.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(@NonNull ProfileService profileService) {
        this.profileService = profileService;
    }

    @PutMapping("/update")
    public ResponseEntity<Customer> update(@Valid @RequestBody @NonNull ProfileUpdateRequest request) {
        return ResponseEntity.ok(profileService.updateCustomerProfile(request));
    }
}