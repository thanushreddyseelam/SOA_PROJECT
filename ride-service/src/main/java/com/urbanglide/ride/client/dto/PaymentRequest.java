package com.urbanglide.ride.client.dto;

import java.math.BigDecimal;
import java.util.Objects;

public class PaymentRequest {
    private Long rideId;
    private Long riderId;
    private BigDecimal amount;
    private String paymentMethod;

    public PaymentRequest() {
    }

    public PaymentRequest(Long rideId, Long riderId, BigDecimal amount, String paymentMethod) {
        this.rideId = rideId;
        this.riderId = riderId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
    }

    public static PaymentRequestBuilder builder() {
        return new PaymentRequestBuilder();
    }

    public static class PaymentRequestBuilder {
        private Long rideId;
        private Long riderId;
        private BigDecimal amount;
        private String paymentMethod;

        PaymentRequestBuilder() {
        }

        public PaymentRequestBuilder rideId(Long rideId) {
            this.rideId = rideId;
            return this;
        }

        public PaymentRequestBuilder riderId(Long riderId) {
            this.riderId = riderId;
            return this;
        }

        public PaymentRequestBuilder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public PaymentRequestBuilder paymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
            return this;
        }

        public PaymentRequest build() {
            return new PaymentRequest(this.rideId, this.riderId, this.amount, this.paymentMethod);
        }
    }

    public Long getRideId() {
        return this.rideId;
    }

    public Long getRiderId() {
        return this.riderId;
    }

    public BigDecimal getAmount() {
        return this.amount;
    }

    public String getPaymentMethod() {
        return this.paymentMethod;
    }

    public void setRideId(Long rideId) {
        this.rideId = rideId;
    }

    public void setRiderId(Long riderId) {
        this.riderId = riderId;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PaymentRequest that = (PaymentRequest) o;
        return Objects.equals(rideId, that.rideId) &&
                Objects.equals(riderId, that.riderId) &&
                Objects.equals(amount, that.amount) &&
                Objects.equals(paymentMethod, that.paymentMethod);
    }

    @Override
    public int hashCode() {
        return Objects.hash(rideId, riderId, amount, paymentMethod);
    }

    @Override
    public String toString() {
        return "PaymentRequest{" +
                "rideId=" + rideId +
                ", riderId=" + riderId +
                ", amount=" + amount +
                ", paymentMethod='" + paymentMethod + '\'' +
                '}';
    }
}
