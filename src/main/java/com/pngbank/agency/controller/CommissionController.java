package com.pngbank.agency.controller;

import com.pngbank.agency.dto.CommissionRequest;
import com.pngbank.agency.dto.CommissionResponse;
import com.pngbank.agency.service.CommissionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/commissions")
public class CommissionController {

    private final CommissionService commissionService;

    public CommissionController(CommissionService commissionService) {
        this.commissionService = commissionService;
    }

    @PostMapping("/calculate")
    public ResponseEntity<CommissionResponse> calculate(@Valid @RequestBody @NonNull CommissionRequest request) {
        return ResponseEntity.ok(commissionService.calculateFeesAndCommissions(request));
    }
}