package com.pngbank.agency.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "payment_transfers")
public class PaymentTransfer {
    
    @Id
    @Column(name = "payment_serial_no")
    private String paymentSerialNo;
    
    private String status;
    
    @Column(name = "transfer_date") 
    private String date;
    
    @Column(name = "payment_type") 
    private String paymentType;
    
    @Column(name = "out_in") 
    private String outIn;
    
    @Column(name = "payment_currency") 
    private String paymentCurrency;
    
    @Column(name = "payment_amount") 
    private BigDecimal paymentAmount;
    
    @Column(name = "from_account") 
    private String fromAccount;
    
    @Column(name = "beneficiary_bic") 
    private String beneficiaryBic;
    
    @Column(name = "beneficiary_account") 
    private String beneficiaryAccount;
    
    @Column(name = "beneficiary_name") 
    private String beneficiaryName;
    
    @Column(name = "beneficiary_address") 
    private String beneficiaryAddress;
    
    @Column(name = "payment_remarks") 
    private String paymentRemarks;
    
    @Column(name = "maker_id") 
    private String makerId;
    
    @Column(name = "maker_date") 
    private String makerDate;
    
    @Column(name = "checker_id") 
    private String checkerId;
    
    @Column(name = "checker_date") 
    private String checkerDate;
    
    @Column(name = "checker_remarks") 
    private String checkerRemarks;

    // ==========================================
    // GETTERS AND SETTERS
    // ==========================================

    public String getPaymentSerialNo() { return paymentSerialNo; }
    public void setPaymentSerialNo(String paymentSerialNo) { this.paymentSerialNo = paymentSerialNo; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getPaymentType() { return paymentType; }
    public void setPaymentType(String paymentType) { this.paymentType = paymentType; }

    public String getOutIn() { return outIn; }
    public void setOutIn(String outIn) { this.outIn = outIn; }

    public String getPaymentCurrency() { return paymentCurrency; }
    public void setPaymentCurrency(String paymentCurrency) { this.paymentCurrency = paymentCurrency; }

    public BigDecimal getPaymentAmount() { return paymentAmount; }
    public void setPaymentAmount(BigDecimal paymentAmount) { this.paymentAmount = paymentAmount; }

    public String getFromAccount() { return fromAccount; }
    public void setFromAccount(String fromAccount) { this.fromAccount = fromAccount; }

    public String getBeneficiaryBic() { return beneficiaryBic; }
    public void setBeneficiaryBic(String beneficiaryBic) { this.beneficiaryBic = beneficiaryBic; }

    public String getBeneficiaryAccount() { return beneficiaryAccount; }
    public void setBeneficiaryAccount(String beneficiaryAccount) { this.beneficiaryAccount = beneficiaryAccount; }

    public String getBeneficiaryName() { return beneficiaryName; }
    public void setBeneficiaryName(String beneficiaryName) { this.beneficiaryName = beneficiaryName; }

    public String getBeneficiaryAddress() { return beneficiaryAddress; }
    public void setBeneficiaryAddress(String beneficiaryAddress) { this.beneficiaryAddress = beneficiaryAddress; }

    public String getPaymentRemarks() { return paymentRemarks; }
    public void setPaymentRemarks(String paymentRemarks) { this.paymentRemarks = paymentRemarks; }

    public String getMakerId() { return makerId; }
    public void setMakerId(String makerId) { this.makerId = makerId; }

    public String getMakerDate() { return makerDate; }
    public void setMakerDate(String makerDate) { this.makerDate = makerDate; }

    public String getCheckerId() { return checkerId; }
    public void setCheckerId(String checkerId) { this.checkerId = checkerId; }

    public String getCheckerDate() { return checkerDate; }
    public void setCheckerDate(String checkerDate) { this.checkerDate = checkerDate; }

    public String getCheckerRemarks() { return checkerRemarks; }
    public void setCheckerRemarks(String checkerRemarks) { this.checkerRemarks = checkerRemarks; }
}