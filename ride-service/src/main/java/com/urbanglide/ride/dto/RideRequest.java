package com.urbanglide.ride.dto;

import java.util.Objects;

public class RideRequest {
    private Long riderId;
    private Double pickupLatitude;
    private Double pickupLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private Double dropoffLatitude;
    private Double dropoffLongitude;
    private String pickupAddress;
    private String dropAddress;
    private String pickupLocation;
    private String dropoffLocation;
    private String vehicleType;
    private String paymentMethod;

    public RideRequest() {
        this.paymentMethod = "CARD";
    }

    public RideRequest(Long riderId, Double pickupLatitude, Double pickupLongitude,
                       Double destinationLatitude, Double destinationLongitude,
                       String pickupAddress, String dropAddress) {
        this(riderId, pickupLatitude, pickupLongitude, destinationLatitude, destinationLongitude, pickupAddress, dropAddress, "CARD");
    }

    public RideRequest(Long riderId, Double pickupLatitude, Double pickupLongitude,
                       Double destinationLatitude, Double destinationLongitude,
                       String pickupAddress, String dropAddress, String paymentMethod) {
        this.riderId = riderId;
        this.pickupLatitude = pickupLatitude;
        this.pickupLongitude = pickupLongitude;
        this.destinationLatitude = destinationLatitude;
        this.destinationLongitude = destinationLongitude;
        this.pickupAddress = pickupAddress;
        this.dropAddress = dropAddress;
        this.paymentMethod = paymentMethod != null ? paymentMethod : "CARD";
    }

    public static RideRequestBuilder builder() {
        return new RideRequestBuilder();
    }

    public static class RideRequestBuilder {
        private Long riderId;
        private Double pickupLatitude;
        private Double pickupLongitude;
        private Double destinationLatitude;
        private Double destinationLongitude;
        private String pickupAddress;
        private String dropAddress;
        private String paymentMethod = "CARD";

        RideRequestBuilder() {
        }

        public RideRequestBuilder riderId(Long riderId) {
            this.riderId = riderId;
            return this;
        }

        public RideRequestBuilder pickupLatitude(Double pickupLatitude) {
            this.pickupLatitude = pickupLatitude;
            return this;
        }

        public RideRequestBuilder pickupLongitude(Double pickupLongitude) {
            this.pickupLongitude = pickupLongitude;
            return this;
        }

        public RideRequestBuilder destinationLatitude(Double destinationLatitude) {
            this.destinationLatitude = destinationLatitude;
            return this;
        }

        public RideRequestBuilder destinationLongitude(Double destinationLongitude) {
            this.destinationLongitude = destinationLongitude;
            return this;
        }

        public RideRequestBuilder pickupAddress(String pickupAddress) {
            this.pickupAddress = pickupAddress;
            return this;
        }

        public RideRequestBuilder dropAddress(String dropAddress) {
            this.dropAddress = dropAddress;
            return this;
        }

        public RideRequestBuilder paymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
            return this;
        }

        public RideRequest build() {
            return new RideRequest(riderId, pickupLatitude, pickupLongitude,
                    destinationLatitude, destinationLongitude, pickupAddress, dropAddress, paymentMethod);
        }
    }

    public Long getRiderId() {
        return riderId;
    }

    public void setRiderId(Long riderId) {
        this.riderId = riderId;
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
        if (this.destinationLatitude != null) {
            return this.destinationLatitude;
        }
        return this.dropoffLatitude != null ? this.dropoffLatitude : 0.0;
    }

    public void setDestinationLatitude(Double destinationLatitude) {
        this.destinationLatitude = destinationLatitude;
    }

    public Double getDestinationLongitude() {
        if (this.destinationLongitude != null) {
            return this.destinationLongitude;
        }
        return this.dropoffLongitude != null ? this.dropoffLongitude : 0.0;
    }

    public void setDestinationLongitude(Double destinationLongitude) {
        this.destinationLongitude = destinationLongitude;
    }

    public Double getDropoffLatitude() {
        return dropoffLatitude;
    }

    public void setDropoffLatitude(Double dropoffLatitude) {
        this.dropoffLatitude = dropoffLatitude;
    }

    public Double getDropoffLongitude() {
        return dropoffLongitude;
    }

    public void setDropoffLongitude(Double dropoffLongitude) {
        this.dropoffLongitude = dropoffLongitude;
    }

    public String getPickupAddress() {
        if (this.pickupAddress != null && !this.pickupAddress.isBlank()) {
            return this.pickupAddress;
        }
        return this.pickupLocation != null ? this.pickupLocation : "Pickup Location";
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public String getDropAddress() {
        if (this.dropAddress != null && !this.dropAddress.isBlank()) {
            return this.dropAddress;
        }
        return this.dropoffLocation != null ? this.dropoffLocation : "Dropoff Location";
    }

    public void setDropAddress(String dropAddress) {
        this.dropAddress = dropAddress;
    }

    public String getPickupLocation() {
        return pickupLocation;
    }

    public void setPickupLocation(String pickupLocation) {
        this.pickupLocation = pickupLocation;
    }

    public String getDropoffLocation() {
        return dropoffLocation;
    }

    public void setDropoffLocation(String dropoffLocation) {
        this.dropoffLocation = dropoffLocation;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getPaymentMethod() {
        return paymentMethod != null ? paymentMethod : "CARD";
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RideRequest that = (RideRequest) o;
        return Objects.equals(riderId, that.riderId) &&
                Objects.equals(pickupLatitude, that.pickupLatitude) &&
                Objects.equals(pickupLongitude, that.pickupLongitude) &&
                Objects.equals(destinationLatitude, that.destinationLatitude) &&
                Objects.equals(destinationLongitude, that.destinationLongitude) &&
                Objects.equals(pickupAddress, that.pickupAddress) &&
                Objects.equals(dropAddress, that.dropAddress) &&
                Objects.equals(paymentMethod, that.paymentMethod);
    }

    @Override
    public int hashCode() {
        return Objects.hash(riderId, pickupLatitude, pickupLongitude,
                destinationLatitude, destinationLongitude, pickupAddress, dropAddress, paymentMethod);
    }

    @Override
    public String toString() {
        return "RideRequest{" +
                "riderId=" + riderId +
                ", pickupLatitude=" + pickupLatitude +
                ", pickupLongitude=" + pickupLongitude +
                ", destinationLatitude=" + getDestinationLatitude() +
                ", destinationLongitude=" + getDestinationLongitude() +
                ", pickupAddress='" + getPickupAddress() + '\'' +
                ", dropAddress='" + getDropAddress() + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                '}';
    }
}
