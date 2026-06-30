package com.pngbank.agency.controller;

import com.pngbank.agency.entity.BeneficiaryBicMaster;
import com.pngbank.agency.entity.PaymentTypeMaster;
import com.pngbank.agency.repository.BeneficiaryBicMasterRepository;
import com.pngbank.agency.repository.PaymentTypeMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/master-data")
public class MasterDataController {

    @Autowired private PaymentTypeMasterRepository paymentTypeRepo;
    @Autowired private BeneficiaryBicMasterRepository bicRepo;

    // --- PAYMENT TYPES ---
    @GetMapping("/payment-types")
    public ResponseEntity<?> getActivePaymentTypes() {
        return ResponseEntity.ok(paymentTypeRepo.findByIsActiveTrue());
    }

    @PreAuthorize("hasRole('SUPERUSER')")
    @PostMapping("/payment-types")
    public ResponseEntity<?> savePaymentType(@RequestBody PaymentTypeMaster data) {
        return ResponseEntity.ok(paymentTypeRepo.save(data));
    }

    // --- BENEFICIARY BICS ---
    @GetMapping("/bics")
    public ResponseEntity<?> getActiveBics(@RequestParam(required = false) Long paymentTypeId) {
        if (paymentTypeId != null) {
            return ResponseEntity.ok(bicRepo.findByPaymentTypeIdAndIsActiveTrue(paymentTypeId));
        }
        return ResponseEntity.ok(bicRepo.findByIsActiveTrue());
    }

    @PreAuthorize("hasRole('SUPERUSER')")
    @PostMapping("/bics")
    public ResponseEntity<?> saveBic(@RequestBody BeneficiaryBicMaster data) {
        return ResponseEntity.ok(bicRepo.save(data));
    }
}