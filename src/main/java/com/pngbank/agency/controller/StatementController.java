package com.pngbank.agency.controller;

import com.pngbank.agency.dto.StatementResponse;
import com.pngbank.agency.service.StatementService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/statements")
public class StatementController {

    private final StatementService statementService;

    public StatementController(@NonNull StatementService statementService) {
        this.statementService = statementService;
    }

    @GetMapping("/{accountId}/full")
    public ResponseEntity<StatementResponse> fullStatement(
            @PathVariable @NonNull UUID accountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) @NonNull OffsetDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) @NonNull OffsetDateTime endDate) {
        return ResponseEntity.ok(statementService.generateFullStatement(accountId, startDate, endDate));
    }

    @GetMapping("/{accountId}/mini")
    public ResponseEntity<Map<String, String>> miniStatement(@PathVariable @NonNull UUID accountId) {
        return ResponseEntity.ok(Map.of("miniStatement", statementService.generateMiniStatement(accountId)));
    }
}