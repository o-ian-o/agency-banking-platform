package com.pngbank.agency.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "master_payment_types")
public class PaymentTypeMaster {
    
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Integer id; // <--- MUST BE Integer
    
    @Column(name = "type_code", unique = true) 
    private String typeCode;
    
    private String description;
    
    @Column(name = "is_active") 
    private Boolean isActive = true;

    // Getters and Setters
    public Integer getId() { return id; } 
    public void setId(Integer id) { this.id = id; }
    
    public String getTypeCode() { return typeCode; } 
    public void setTypeCode(String typeCode) { this.typeCode = typeCode; }
    
    public String getDescription() { return description; } 
    public void setDescription(String description) { this.description = description; }
    
    public Boolean getIsActive() { return isActive; } 
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}