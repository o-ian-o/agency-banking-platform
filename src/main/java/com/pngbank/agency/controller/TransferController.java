package com.pngbank.agency.controller;

import com.pngbank.agency.entity.PaymentTransfer;
import com.pngbank.agency.repository.PaymentTransferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/v1/transfers")
public class TransferController {

    @Autowired
    private PaymentTransferRepository transferRepo;

    @PreAuthorize("hasRole('MAKER') or hasRole('SUPERUSER')")
    @PostMapping("/initiate")
    public ResponseEntity<PaymentTransfer> initiateTransfer(@RequestBody PaymentTransfer transfer, @RequestHeader("X-USER-ID") String makerId) {
        // Generate System Serial No automatically in Backend
        String prefix = transfer.getPaymentType() != null && transfer.getPaymentType().length() >= 2 
                        ? transfer.getPaymentType().substring(0,2).toUpperCase() : "TR";
        String generatedSerial = prefix + String.format("%08d", new Random().nextInt(99999999));
        
        transfer.setPaymentSerialNo(generatedSerial);
        transfer.setStatus("PENDING_AUTHORIZATION");
        transfer.setOutIn("OUT");
        transfer.setMakerId(makerId);
        transfer.setMakerDate(Instant.now().toString());

        return ResponseEntity.ok(transferRepo.save(transfer));
    }

    @PreAuthorize("hasRole('MAKER') or hasRole('SUPERUSER')")
    @GetMapping("/maker-inquiries")
    public ResponseEntity<?> getMakerInquiries(@RequestHeader("X-USER-ID") String makerId) {
        return ResponseEntity.ok(transferRepo.findByMakerIdOrderByDateDesc(makerId));
    }

    @PreAuthorize("hasRole('CHECKER') or hasRole('SUPERUSER')")
    @PostMapping("/checker-queue")
    public ResponseEntity<?> getCheckerQueue(@RequestBody Map<String, String> filters) {
        // In a real app, write a dynamic JPA Specification here based on the filters. 
        // For now, we return PENDING items to feed the Checker table.
        String status = filters.getOrDefault("status", "PENDING_AUTHORIZATION");
        if(status.equals("ALL")) {
             return ResponseEntity.ok(transferRepo.findAll());
        }
        return ResponseEntity.ok(transferRepo.findByStatusOrderByDateDesc(status));
    }

    @PreAuthorize("hasRole('CHECKER') or hasRole('SUPERUSER')")
    @PostMapping("/authorize")
    public ResponseEntity<?> authorizeTransfer(@RequestBody Map<String, String> actionData, @RequestHeader("X-USER-ID") String checkerId) {
        PaymentTransfer transfer = transferRepo.findById(actionData.get("paymentSerialNo"))
                .orElseThrow(() -> new RuntimeException("Transaction Not Found"));

        String action = actionData.get("action"); // APPROVE, REJECT, MODIFY
        
        if(action.equals("APPROVE")) transfer.setStatus("AUTHORIZED");
        else if(action.equals("REJECT")) transfer.setStatus("REJECTED");
        else transfer.setStatus("MODIFICATION_REQUESTED");

        transfer.setCheckerId(checkerId);
        transfer.setCheckerDate(Instant.now().toString());
        transfer.setCheckerRemarks(actionData.get("remarks"));

        return ResponseEntity.ok(transferRepo.save(transfer));
    }
}