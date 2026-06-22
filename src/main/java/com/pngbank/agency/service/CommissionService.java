package com.pngbank.agency.service;

import com.pngbank.agency.dto.CommissionRequest;
import com.pngbank.agency.dto.CommissionResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class CommissionService {

    private final BigDecimal defaultFeePercentage;
    private final BigDecimal platformShare;
    private final BigDecimal agentShare;
    @SuppressWarnings("unused")
    private final BigDecimal taxShare;

    public CommissionService(
            @Value("${banking.fees.default-percentage}") @NonNull BigDecimal defaultFeePercentage,
            @Value("${banking.fees.platform-share}") @NonNull BigDecimal platformShare,
            @Value("${banking.fees.agent-share}") @NonNull BigDecimal agentShare,
            @Value("${banking.fees.tax-share}") @NonNull BigDecimal taxShare) {
        this.defaultFeePercentage = defaultFeePercentage;
        this.platformShare = platformShare;
        this.agentShare = agentShare;
        this.taxShare = taxShare;
    }

    public CommissionResponse calculateFeesAndCommissions(@NonNull CommissionRequest request) {

        BigDecimal feePercentage = resolveFeePercentage(request);

        BigDecimal totalFee = request.getTotalAmount()
                .multiply(feePercentage)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal platformRevenue = totalFee.multiply(platformShare).setScale(2, RoundingMode.HALF_UP);
        BigDecimal agentCommission = totalFee.multiply(agentShare).setScale(2, RoundingMode.HALF_UP);
        BigDecimal taxFraction = totalFee.subtract(platformRevenue).subtract(agentCommission);

        // Ensure tax doesn't go negative due to rounding
        if (taxFraction.compareTo(BigDecimal.ZERO) < 0) {
            taxFraction = BigDecimal.ZERO;
        }

        BigDecimal netAmountToCustomer = request.getTotalAmount().subtract(totalFee);

        CommissionResponse response = new CommissionResponse();
        response.setTotalFee(totalFee);
        response.setPlatformRevenue(platformRevenue);
        response.setAgentImmediateCommission(agentCommission);
        response.setTaxFraction(taxFraction);
        response.setNetAmountToCustomer(netAmountToCustomer);

        return response;
    }

    private BigDecimal resolveFeePercentage(@NonNull CommissionRequest request) {
        // Provincial sliding scale: remote provinces get a slightly higher fee
        // to incentivize agent presence (per spec section on commission engine).
        java.util.Set<String> remoteProvinces = java.util.Set.of(
                "Western", "Sandaun", "West Sepik", "Manus", "New Ireland",
                "Bougainville", "Milne Bay", "Gulf"
        );

        BigDecimal baseRate = defaultFeePercentage;

        // Volume-based sliding scale: larger transactions get a slightly lower percentage
        if (request.getTotalAmount().compareTo(new BigDecimal("1000")) >= 0) {
            baseRate = baseRate.multiply(new BigDecimal("0.8")); // 20% discount on rate for high-value tx
        } else if (request.getTotalAmount().compareTo(new BigDecimal("50")) < 0) {
            baseRate = baseRate.multiply(new BigDecimal("1.2")); // 20% surcharge on rate for micro tx
        }

        if (request.getAgentProvince() != null && remoteProvinces.contains(request.getAgentProvince())) {
            baseRate = baseRate.add(new BigDecimal("0.005")); // +0.5% incentive for remote agents
        }

        // VOUCHER_ISSUE carries a flat reduced rate per spec (remittance fee distinct from cash-in/out)
        if (request.getTransactionType() == com.pngbank.agency.enums.TransactionType.VOUCHER_ISSUE) {
            baseRate = new BigDecimal("0.01");
        }

        return baseRate;
    }
}