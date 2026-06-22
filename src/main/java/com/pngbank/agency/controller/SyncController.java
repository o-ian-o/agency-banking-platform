package com.pngbank.agency.controller;

import com.pngbank.agency.dto.EnrolmentBatchRequest;
import com.pngbank.agency.dto.SyncReportResponse;
import com.pngbank.agency.service.EnrolmentSyncService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sync")
public class SyncController {

    private final EnrolmentSyncService enrolmentSyncService;

    public SyncController(EnrolmentSyncService enrolmentSyncService) {
        this.enrolmentSyncService = enrolmentSyncService;
    }

    @PostMapping("/offline-batch")
    public ResponseEntity<SyncReportResponse> syncOfflineBatch(@Valid @RequestBody EnrolmentBatchRequest request) {
        SyncReportResponse report = enrolmentSyncService.processBatch(request);
        return ResponseEntity.ok(report);
    }
}