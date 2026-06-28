package com.pngbank.agency.repository;
import com.pngbank.agency.entity.PaymentTypeMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PaymentTypeMasterRepository extends JpaRepository<PaymentTypeMaster, Long> {
    List<PaymentTypeMaster> findByIsActiveTrue();
}