package com.pngbank.agency.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "master_beneficiary_bics")
public class BeneficiaryBicMaster {
    
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Integer id; // <--- MUST BE Integer
    
    @Column(name = "bic_code", unique = true) 
    private String bicCode;
    
    @Column(name = "bank_name") 
    private String bankName;
    
    private String country;
    
    @Column(name = "payment_type_id") 
    private Integer paymentTypeId; // <--- MUST BE Integer
    
    @Column(name = "is_active") 
    private Boolean isActive = true;

    // Getters and Setters
    public Integer getId() { return id; } 
    public void setId(Integer id) { this.id = id; }
    
    public String getBicCode() { return bicCode; } 
    public void setBicCode(String bicCode) { this.bicCode = bicCode; }
    
    public String getBankName() { return bankName; } 
    public void setBankName(String bankName) { this.bankName = bankName; }
    
    public String getCountry() { return country; } 
    public void setCountry(String country) { this.country = country; }
    
    public Integer getPaymentTypeId() { return paymentTypeId; } 
    public void setPaymentTypeId(Integer paymentTypeId) { this.paymentTypeId = paymentTypeId; }
    
    public Boolean getIsActive() { return isActive; } 
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}