package com.urbanglide.payment.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long rideId;

    @Column(nullable = false)
    private Long riderId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Column(unique = true)
    private String transactionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.transactionId == null) {
            this.transactionId = "TXN" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }

    public Payment() {
    }

    public Payment(Long id, Long rideId, Long riderId, BigDecimal amount, PaymentMethod paymentMethod, String transactionId, PaymentStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.rideId = rideId;
        this.riderId = riderId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.transactionId = transactionId;
        this.status = status != null ? status : PaymentStatus.PENDING;
        this.createdAt = createdAt;
    }

    public static PaymentBuilder builder() {
        return new PaymentBuilder();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRideId() {
        return rideId;
    }

    public void setRideId(Long rideId) {
        this.rideId = rideId;
    }

    public Long getRiderId() {
        return riderId;
    }

    public void setRiderId(Long riderId) {
        this.riderId = riderId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static class PaymentBuilder {
        private Long id;
        private Long rideId;
        private Long riderId;
        private BigDecimal amount;
        private PaymentMethod paymentMethod;
        private String transactionId;
        private PaymentStatus status;
        private LocalDateTime createdAt;

        PaymentBuilder() {
        }

        public PaymentBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PaymentBuilder rideId(Long rideId) {
            this.rideId = rideId;
            return this;
        }

        public PaymentBuilder riderId(Long riderId) {
            this.riderId = riderId;
            return this;
        }

        public PaymentBuilder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public PaymentBuilder amount(Double amount) {
            this.amount = amount != null ? BigDecimal.valueOf(amount) : null;
            return this;
        }

        public PaymentBuilder paymentMethod(PaymentMethod paymentMethod) {
            this.paymentMethod = paymentMethod;
            return this;
        }

        public PaymentBuilder transactionId(String transactionId) {
            this.transactionId = transactionId;
            return this;
        }

        public PaymentBuilder status(PaymentStatus status) {
            this.status = status;
            return this;
        }

        public PaymentBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Payment build() {
            return new Payment(this.id, this.rideId, this.riderId, this.amount, this.paymentMethod, this.transactionId, this.status, this.createdAt);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Payment payment = (Payment) o;
        return Objects.equals(id, payment.id) && Objects.equals(rideId, payment.rideId) && Objects.equals(riderId, payment.riderId) && Objects.equals(amount, payment.amount) && paymentMethod == payment.paymentMethod && Objects.equals(transactionId, payment.transactionId) && status == payment.status && Objects.equals(createdAt, payment.createdAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, rideId, riderId, amount, paymentMethod, transactionId, status, createdAt);
    }
}
