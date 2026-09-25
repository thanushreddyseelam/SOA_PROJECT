package com.urbanglide.ride.dto;

import com.urbanglide.ride.entity.RideStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

public class RideResponse {
    private Long id;
    private Long riderId;
    private Long driverId;
    private Double pickupLatitude;
    private Double pickupLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private String pickupAddress;
    private String dropAddress;
    private BigDecimal fare;
    private Double distance;
    private String paymentMethod;
    private RideStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RideResponse() {
    }

    public RideResponse(Long id, Long riderId, Long driverId, Double pickupLatitude, Double pickupLongitude,
                        Double destinationLatitude, Double destinationLongitude, String pickupAddress,
                        String dropAddress, BigDecimal fare, Double distance, String paymentMethod,
                        RideStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.riderId = riderId;
        this.driverId = driverId;
        this.pickupLatitude = pickupLatitude;
        this.pickupLongitude = pickupLongitude;
        this.destinationLatitude = destinationLatitude;
        this.destinationLongitude = destinationLongitude;
        this.pickupAddress = pickupAddress;
        this.dropAddress = dropAddress;
        this.fare = fare;
        this.distance = distance;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static RideResponseBuilder builder() {
        return new RideResponseBuilder();
    }

    public static class RideResponseBuilder {
        private Long id;
        private Long riderId;
        private Long driverId;
        private Double pickupLatitude;
        private Double pickupLongitude;
        private Double destinationLatitude;
        private Double destinationLongitude;
        private String pickupAddress;
        private String dropAddress;
        private BigDecimal fare;
        private Double distance;
        private String paymentMethod;
        private RideStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        RideResponseBuilder() {
        }

        public RideResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public RideResponseBuilder riderId(Long riderId) {
            this.riderId = riderId;
            return this;
        }

        public RideResponseBuilder driverId(Long driverId) {
            this.driverId = driverId;
            return this;
        }

        public RideResponseBuilder pickupLatitude(Double pickupLatitude) {
            this.pickupLatitude = pickupLatitude;
            return this;
        }

        public RideResponseBuilder pickupLongitude(Double pickupLongitude) {
            this.pickupLongitude = pickupLongitude;
            return this;
        }

        public RideResponseBuilder destinationLatitude(Double destinationLatitude) {
            this.destinationLatitude = destinationLatitude;
            return this;
        }

        public RideResponseBuilder destinationLongitude(Double destinationLongitude) {
            this.destinationLongitude = destinationLongitude;
            return this;
        }

        public RideResponseBuilder pickupAddress(String pickupAddress) {
            this.pickupAddress = pickupAddress;
            return this;
        }

        public RideResponseBuilder dropAddress(String dropAddress) {
            this.dropAddress = dropAddress;
            return this;
        }

        public RideResponseBuilder fare(BigDecimal fare) {
            this.fare = fare;
            return this;
        }

        public RideResponseBuilder distance(Double distance) {
            this.distance = distance;
            return this;
        }

        public RideResponseBuilder paymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
            return this;
        }

        public RideResponseBuilder status(RideStatus status) {
            this.status = status;
            return this;
        }

        public RideResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public RideResponseBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public RideResponse build() {
            return new RideResponse(id, riderId, driverId, pickupLatitude, pickupLongitude,
                    destinationLatitude, destinationLongitude, pickupAddress, dropAddress,
                    fare, distance, paymentMethod, status, createdAt, updatedAt);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRiderId() {
        return riderId;
    }

    public void setRiderId(Long riderId) {
        this.riderId = riderId;
    }

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public Double getPickupLatitude() {
        return pickupLatitude;
    }

    public void setPickupLatitude(Double pickupLatitude) {
        this.pickupLatitude = pickupLatitude;
    }

    public Double getPickupLongitude() {
        return pickupLongitude;
    }

    public void setPickupLongitude(Double pickupLongitude) {
        this.pickupLongitude = pickupLongitude;
    }

    public Double getDestinationLatitude() {
        return destinationLatitude;
    }

    public void setDestinationLatitude(Double destinationLatitude) {
        this.destinationLatitude = destinationLatitude;
    }

    public Double getDestinationLongitude() {
        return destinationLongitude;
    }

    public void setDestinationLongitude(Double destinationLongitude) {
        this.destinationLongitude = destinationLongitude;
    }

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public String getDropAddress() {
        return dropAddress;
    }

    public void setDropAddress(String dropAddress) {
        this.dropAddress = dropAddress;
    }

    public BigDecimal getFare() {
        return fare;
    }

    public void setFare(BigDecimal fare) {
        this.fare = fare;
    }

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public RideStatus getStatus() {
        return status;
    }

    public void setStatus(RideStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RideResponse that = (RideResponse) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(riderId, that.riderId) &&
                Objects.equals(driverId, that.driverId) &&
                Objects.equals(pickupLatitude, that.pickupLatitude) &&
                Objects.equals(pickupLongitude, that.pickupLongitude) &&
                Objects.equals(destinationLatitude, that.destinationLatitude) &&
                Objects.equals(destinationLongitude, that.destinationLongitude) &&
                Objects.equals(pickupAddress, that.pickupAddress) &&
                Objects.equals(dropAddress, that.dropAddress) &&
                Objects.equals(fare, that.fare) &&
                Objects.equals(distance, that.distance) &&
                Objects.equals(paymentMethod, that.paymentMethod) &&
                status == that.status &&
                Objects.equals(createdAt, that.createdAt) &&
                Objects.equals(updatedAt, that.updatedAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, riderId, driverId, pickupLatitude, pickupLongitude,
                destinationLatitude, destinationLongitude, pickupAddress, dropAddress,
                fare, distance, paymentMethod, status, createdAt, updatedAt);
    }

    @Override
    public String toString() {
        return "RideResponse{" +
                "id=" + id +
                ", riderId=" + riderId +
                ", driverId=" + driverId +
                ", pickupLatitude=" + pickupLatitude +
                ", pickupLongitude=" + pickupLongitude +
                ", destinationLatitude=" + destinationLatitude +
                ", destinationLongitude=" + destinationLongitude +
                ", pickupAddress='" + pickupAddress + '\'' +
                ", dropAddress='" + dropAddress + '\'' +
                ", fare=" + fare +
                ", distance=" + distance +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", status=" + status +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
