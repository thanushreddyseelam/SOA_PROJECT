package com.urbanglide.ride.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "rides")
public class Ride {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long riderId;

    @Column(nullable = true)
    private Long driverId;

    @Column(nullable = false)
    private Double pickupLatitude;

    @Column(nullable = false)
    private Double pickupLongitude;

    @Column(nullable = false)
    private Double destinationLatitude;

    @Column(nullable = false)
    private Double destinationLongitude;

    @Column(nullable = true)
    private String pickupAddress;

    @Column(nullable = true)
    private String dropAddress;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal fare;

    @Column(nullable = false)
    private Double distance;

    @Column(length = 20)
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RideStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Ride() {
        this.fare = BigDecimal.ZERO;
        this.distance = 0.0;
        this.status = RideStatus.REQUESTED;
        this.paymentMethod = "CARD";
    }

    public Ride(Long id, Long riderId, Long driverId, Double pickupLatitude, Double pickupLongitude,
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
        this.fare = fare != null ? fare : BigDecimal.ZERO;
        this.distance = distance != null ? distance : 0.0;
        this.paymentMethod = paymentMethod != null ? paymentMethod : "CARD";
        this.status = status != null ? status : RideStatus.REQUESTED;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static RideBuilder builder() {
        return new RideBuilder();
    }

    public static class RideBuilder {
        private Long id;
        private Long riderId;
        private Long driverId;
        private Double pickupLatitude;
        private Double pickupLongitude;
        private Double destinationLatitude;
        private Double destinationLongitude;
        private String pickupAddress;
        private String dropAddress;
        private BigDecimal fare = BigDecimal.ZERO;
        private Double distance = 0.0;
        private String paymentMethod = "CARD";
        private RideStatus status = RideStatus.REQUESTED;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        RideBuilder() {
        }

        public RideBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public RideBuilder riderId(Long riderId) {
            this.riderId = riderId;
            return this;
        }

        public RideBuilder driverId(Long driverId) {
            this.driverId = driverId;
            return this;
        }

        public RideBuilder pickupLatitude(Double pickupLatitude) {
            this.pickupLatitude = pickupLatitude;
            return this;
        }

        public RideBuilder pickupLongitude(Double pickupLongitude) {
            this.pickupLongitude = pickupLongitude;
            return this;
        }

        public RideBuilder destinationLatitude(Double destinationLatitude) {
            this.destinationLatitude = destinationLatitude;
            return this;
        }

        public RideBuilder destinationLongitude(Double destinationLongitude) {
            this.destinationLongitude = destinationLongitude;
            return this;
        }

        public RideBuilder pickupAddress(String pickupAddress) {
            this.pickupAddress = pickupAddress;
            return this;
        }

        public RideBuilder dropAddress(String dropAddress) {
            this.dropAddress = dropAddress;
            return this;
        }

        public RideBuilder fare(BigDecimal fare) {
            this.fare = fare;
            return this;
        }

        public RideBuilder distance(Double distance) {
            this.distance = distance;
            return this;
        }

        public RideBuilder paymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
            return this;
        }

        public RideBuilder status(RideStatus status) {
            this.status = status;
            return this;
        }

        public RideBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public RideBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Ride build() {
            return new Ride(id, riderId, driverId, pickupLatitude, pickupLongitude,
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
        Ride ride = (Ride) o;
        return Objects.equals(id, ride.id) &&
                Objects.equals(riderId, ride.riderId) &&
                Objects.equals(driverId, ride.driverId) &&
                Objects.equals(pickupLatitude, ride.pickupLatitude) &&
                Objects.equals(pickupLongitude, ride.pickupLongitude) &&
                Objects.equals(destinationLatitude, ride.destinationLatitude) &&
                Objects.equals(destinationLongitude, ride.destinationLongitude) &&
                Objects.equals(pickupAddress, ride.pickupAddress) &&
                Objects.equals(dropAddress, ride.dropAddress) &&
                Objects.equals(fare, ride.fare) &&
                Objects.equals(distance, ride.distance) &&
                Objects.equals(paymentMethod, ride.paymentMethod) &&
                status == ride.status &&
                Objects.equals(createdAt, ride.createdAt) &&
                Objects.equals(updatedAt, ride.updatedAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, riderId, driverId, pickupLatitude, pickupLongitude, destinationLatitude,
                destinationLongitude, pickupAddress, dropAddress, fare, distance, paymentMethod, status, createdAt, updatedAt);
    }

    @Override
    public String toString() {
        return "Ride{" +
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
