package com.urbanglide.ride.client.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

public class PaymentResponse {
    private Long id;
    private Long rideId;
    private Long riderId;
    private BigDecimal amount;
    private String paymentMethod;
    private String transactionId;
    private String status;
    private LocalDateTime createdAt;

    public PaymentResponse() {
    }

    public PaymentResponse(Long id, Long rideId, Long riderId, BigDecimal amount, String paymentMethod, String transactionId, String status, LocalDateTime createdAt) {
        this.id = id;
        this.rideId = rideId;
        this.riderId = riderId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.transactionId = transactionId;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static PaymentResponseBuilder builder() {
        return new PaymentResponseBuilder();
    }

    public static class PaymentResponseBuilder {
        private Long id;
        private Long rideId;
        private Long riderId;
        private BigDecimal amount;
        private String paymentMethod;
        private String transactionId;
        private String status;
        private LocalDateTime createdAt;

        PaymentResponseBuilder() {
        }

        public PaymentResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PaymentResponseBuilder rideId(Long rideId) {
            this.rideId = rideId;
            return this;
        }

        public PaymentResponseBuilder riderId(Long riderId) {
            this.riderId = riderId;
            return this;
        }

        public PaymentResponseBuilder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public PaymentResponseBuilder paymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
            return this;
        }

        public PaymentResponseBuilder transactionId(String transactionId) {
            this.transactionId = transactionId;
            return this;
        }

        public PaymentResponseBuilder status(String status) {
            this.status = status;
            return this;
        }

        public PaymentResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public PaymentResponse build() {
            return new PaymentResponse(id, rideId, riderId, amount, paymentMethod, transactionId, status, createdAt);
        }
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

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PaymentResponse that = (PaymentResponse) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(rideId, that.rideId) &&
                Objects.equals(riderId, that.riderId) &&
                Objects.equals(amount, that.amount) &&
                Objects.equals(paymentMethod, that.paymentMethod) &&
                Objects.equals(transactionId, that.transactionId) &&
                Objects.equals(status, that.status) &&
                Objects.equals(createdAt, that.createdAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, rideId, riderId, amount, paymentMethod, transactionId, status, createdAt);
    }

    @Override
    public String toString() {
        return "PaymentResponse{" +
                "id=" + id +
                ", rideId=" + rideId +
                ", riderId=" + riderId +
                ", amount=" + amount +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", transactionId='" + transactionId + '\'' +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
