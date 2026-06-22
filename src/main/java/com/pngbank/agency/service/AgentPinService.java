package com.pngbank.agency.service;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Stub Agent PIN service for local development.
 * In production, store bcrypt-hashed PINs against agent records in the database
 * and verify against that hash, with lockout after repeated failures.
 *
 * For local testing: every agent's PIN is "0000".
 */
@Service
public class AgentPinService {

    private final Map<UUID, String> devPinHashes = new HashMap<>();
    private static final String DEV_DEFAULT_PIN_HASH = BCrypt.hashpw("0000", BCrypt.gensalt(10));

    public boolean verifyPin(UUID agentId, String providedPin) {
        String hash = devPinHashes.getOrDefault(agentId, DEV_DEFAULT_PIN_HASH);
        return BCrypt.checkpw(providedPin, hash);
    }
}