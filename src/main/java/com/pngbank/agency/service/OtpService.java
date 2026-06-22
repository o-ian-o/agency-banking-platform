package com.pngbank.agency.service;

import org.springframework.stereotype.Service;

/**
 * Stub OTP service for local development.
 * In production, integrate with an SMS gateway (e.g. Digicel/Telikom aggregator API)
 * and store OTPs with expiry in Redis or a dedicated table.
 *
 * For local testing: any 6-digit code starting with "1" is accepted (e.g. "123456").
 */
@Service
public class OtpService {

    public boolean verifyOtp(String mobileNumber, String providedOtp) {
        if (providedOtp == null || providedOtp.length() != 6) {
            return false;
        }
        // DEV-ONLY STUB — replace with real SMS OTP verification before production use.
        return providedOtp.startsWith("1");
    }
}