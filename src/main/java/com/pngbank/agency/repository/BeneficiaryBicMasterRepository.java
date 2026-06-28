package com.pngbank.agency.repository;
import com.pngbank.agency.entity.BeneficiaryBicMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface BeneficiaryBicMasterRepository extends JpaRepository<BeneficiaryBicMaster, Long> {
    List<BeneficiaryBicMaster> findByIsActiveTrue();
    // NEW: Fetch BICs by their Payment Type Parent ID
    List<BeneficiaryBicMaster> findByPaymentTypeIdAndIsActiveTrue(Long paymentTypeId);
}