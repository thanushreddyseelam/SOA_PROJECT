package com.urbanglide.payment.repository;

import com.urbanglide.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByRideId(Long rideId);
    Optional<Payment> findByTransactionId(String transactionId);
    List<Payment> findByRiderId(Long riderId);
    boolean existsByRideId(Long rideId);
}

