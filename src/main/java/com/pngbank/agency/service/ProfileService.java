package com.pngbank.agency.service;

import com.pngbank.agency.dto.ProfileUpdateRequest;
import com.pngbank.agency.entity.Agent;
import com.pngbank.agency.entity.Customer;
import com.pngbank.agency.entity.ProfileChangeLog;
import com.pngbank.agency.exception.ProfileVerificationException;
import com.pngbank.agency.repository.AgentRepository;
import com.pngbank.agency.repository.CustomerRepository;
import com.pngbank.agency.repository.ProfileChangeLogRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Field;
import java.util.Map;
import java.util.Set;

@Service
public class ProfileService {

    private static final Set<String> ALLOWED_FIELDS = Set.of(
            "secondaryMobile", "email", "province", "district", "llg", "village"
    );

    private final CustomerRepository customerRepository;
    private final AgentRepository agentRepository;
    private final ProfileChangeLogRepository changeLogRepository;
    private final OtpService otpService;
    private final AgentPinService agentPinService;

    public ProfileService(@NonNull CustomerRepository customerRepository,
                           @NonNull AgentRepository agentRepository,
                           @NonNull ProfileChangeLogRepository changeLogRepository,
                           @NonNull OtpService otpService,
                           @NonNull AgentPinService agentPinService) {
        this.customerRepository = customerRepository;
        this.agentRepository = agentRepository;
        this.changeLogRepository = changeLogRepository;
        this.otpService = otpService;
        this.agentPinService = agentPinService;
    }

    @Transactional
    public Customer updateCustomerProfile(@NonNull ProfileUpdateRequest request) {

        var customerId = java.util.Objects.requireNonNull(request.getCustomerId(), "customerId is required");
        var agentId = java.util.Objects.requireNonNull(request.getAgentId(), "agentId is required");

        Customer customer = customerRepository.findByIdForUpdate(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new IllegalArgumentException("Agent not found"));

        // Dual-factor: Agent PIN + Customer SMS OTP
        if (!agentPinService.verifyPin(agent.getId(), request.getAgentPin())) {
            throw new ProfileVerificationException("Invalid agent PIN");
        }

        if (!otpService.verifyOtp(customer.getPrimaryMobile(), request.getCustomerSmsOtp())) {
            throw new ProfileVerificationException("Invalid or expired customer OTP");
        }

        for (Map.Entry<String, String> change : request.getUpdatedFields().entrySet()) {
            String fieldName = change.getKey();
            String newValue = change.getValue();

            if (!ALLOWED_FIELDS.contains(fieldName)) {
                throw new IllegalArgumentException("Field not allowed for update: " + fieldName);
            }

            try {
                Field field = Customer.class.getDeclaredField(fieldName);
                field.setAccessible(true);
                String oldValue = (String) field.get(customer);

                if (java.util.Objects.equals(oldValue, newValue)) {
                    continue; // no-op, skip logging
                }

                field.set(customer, newValue);

                ProfileChangeLog log = new ProfileChangeLog();
                log.setCustomer(customer);
                log.setChangedByAgent(agent);
                log.setFieldName(fieldName);
                log.setOldValue(oldValue);
                log.setNewValue(newValue);
                log.setAuthMethod("AGENT_PIN+SMS_OTP");
                changeLogRepository.save(log);

            } catch (NoSuchFieldException | IllegalAccessException e) {
                throw new IllegalArgumentException("Unable to update field: " + fieldName, e);
            }
        }

        return customerRepository.save(customer);
    }
}