// PaymentTransferRepository.java
package com.pngbank.agency.repository;
import com.pngbank.agency.entity.PaymentTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PaymentTransferRepository extends JpaRepository<PaymentTransfer, String> {
    List<PaymentTransfer> findByMakerIdOrderByDateDesc(String makerId);
    List<PaymentTransfer> findByStatusOrderByDateDesc(String status);
}