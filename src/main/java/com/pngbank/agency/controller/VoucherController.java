package com.pngbank.agency.controller;

import com.pngbank.agency.dto.*;
import com.pngbank.agency.service.VoucherService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/vouchers")
public class VoucherController {

    private final VoucherService voucherService;

    public VoucherController(@NonNull VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @PostMapping("/initiate")
    public ResponseEntity<VoucherInitiateResponse> initiate(@Valid @RequestBody @NonNull VoucherInitiateRequest request) {
        return ResponseEntity.ok(voucherService.initiateVoucher(request));
    }

    @PostMapping("/redeem")
    public ResponseEntity<VoucherRedeemResponse> redeem(@Valid @RequestBody @NonNull VoucherRedeemRequest request) {
        return ResponseEntity.ok(voucherService.redeemVoucher(request));
    }
}