package com.urbanglide.driver.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;

@Entity
@Table(name = "drivers")
public class Driver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false, unique = true)
    private String vehicleNumber;

    @Column(nullable = false)
    private String vehicleType;

    private Double latitude;
    private Double longitude;
    private Boolean availability;

    @Enumerated(EnumType.STRING)
    private DriverStatus status;

    private static Double $default$latitude() {
        return 0.0;
    }

    private static Double $default$longitude() {
        return 0.0;
    }

    private static Boolean $default$availability() {
        return true;
    }

    private static DriverStatus $default$status() {
        return DriverStatus.AVAILABLE;
    }

    public static class DriverBuilder {
        private Long id;
        private Long userId;
        private String name;
        private String phone;
        private String vehicleNumber;
        private String vehicleType;
        private boolean latitude$set;
        private Double latitude$value;
        private boolean longitude$set;
        private Double longitude$value;
        private boolean availability$set;
        private Boolean availability$value;
        private boolean status$set;
        private DriverStatus status$value;

        DriverBuilder() {
        }

        public Driver.DriverBuilder id(final Long id) {
            this.id = id;
            return this;
        }

        public Driver.DriverBuilder userId(final Long userId) {
            this.userId = userId;
            return this;
        }

        public Driver.DriverBuilder name(final String name) {
            this.name = name;
            return this;
        }

        public Driver.DriverBuilder phone(final String phone) {
            this.phone = phone;
            return this;
        }

        public Driver.DriverBuilder vehicleNumber(final String vehicleNumber) {
            this.vehicleNumber = vehicleNumber;
            return this;
        }

        public Driver.DriverBuilder vehicleType(final String vehicleType) {
            this.vehicleType = vehicleType;
            return this;
        }

        public Driver.DriverBuilder latitude(final Double latitude) {
            this.latitude$value = latitude;
            this.latitude$set = true;
            return this;
        }

        public Driver.DriverBuilder longitude(final Double longitude) {
            this.longitude$value = longitude;
            this.longitude$set = true;
            return this;
        }

        public Driver.DriverBuilder availability(final Boolean availability) {
            this.availability$value = availability;
            this.availability$set = true;
            return this;
        }

        public Driver.DriverBuilder status(final DriverStatus status) {
            this.status$value = status;
            this.status$set = true;
            return this;
        }

        public Driver build() {
            Double latitude$value = this.latitude$value;
            if (!this.latitude$set) latitude$value = Driver.$default$latitude();
            Double longitude$value = this.longitude$value;
            if (!this.longitude$set) longitude$value = Driver.$default$longitude();
            Boolean availability$value = this.availability$value;
            if (!this.availability$set) availability$value = Driver.$default$availability();
            DriverStatus status$value = this.status$value;
            if (!this.status$set) status$value = Driver.$default$status();
            return new Driver(this.id, this.userId, this.name, this.phone, this.vehicleNumber, this.vehicleType, latitude$value, longitude$value, availability$value, status$value);
        }

        @Override
        public String toString() {
            return "Driver.DriverBuilder(id=" + this.id + ", userId=" + this.userId + ", name=" + this.name + ", phone=" + this.phone + ", vehicleNumber=" + this.vehicleNumber + ", vehicleType=" + this.vehicleType + ", latitude$value=" + this.latitude$value + ", longitude$value=" + this.longitude$value + ", availability$value=" + this.availability$value + ", status$value=" + this.status$value + ")";
        }
    }

    public static Driver.DriverBuilder builder() {
        return new Driver.DriverBuilder();
    }

    public Long getId() {
        return this.id;
    }

    public Long getUserId() {
        return this.userId;
    }

    public String getName() {
        return this.name;
    }

    public String getPhone() {
        return this.phone;
    }

    public String getVehicleNumber() {
        return this.vehicleNumber;
    }

    public String getVehicleType() {
        return this.vehicleType;
    }

    public Double getLatitude() {
        return this.latitude;
    }

    public Double getLongitude() {
        return this.longitude;
    }

    public Boolean getAvailability() {
        return this.availability;
    }

    public DriverStatus getStatus() {
        return this.status;
    }

    public void setId(final Long id) {
        this.id = id;
    }

    public void setUserId(final Long userId) {
        this.userId = userId;
    }

    public void setName(final String name) {
        this.name = name;
    }

    public void setPhone(final String phone) {
        this.phone = phone;
    }

    public void setVehicleNumber(final String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public void setVehicleType(final String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public void setLatitude(final Double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(final Double longitude) {
        this.longitude = longitude;
    }

    public void setAvailability(final Boolean availability) {
        this.availability = availability;
    }

    public void setStatus(final DriverStatus status) {
        this.status = status;
    }

    public Driver() {
        this.latitude = Driver.$default$latitude();
        this.longitude = Driver.$default$longitude();
        this.availability = Driver.$default$availability();
        this.status = Driver.$default$status();
    }

    public Driver(final Long id, final String name, final String phone, final String vehicleNumber, final String vehicleType, final Double latitude, final Double longitude, final Boolean availability, final DriverStatus status) {
        this(id, null, name, phone, vehicleNumber, vehicleType, latitude, longitude, availability, status);
    }

    public Driver(final Long id, final Long userId, final String name, final String phone, final String vehicleNumber, final String vehicleType, final Double latitude, final Double longitude, final Boolean availability, final DriverStatus status) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.phone = phone;
        this.vehicleNumber = vehicleNumber;
        this.vehicleType = vehicleType;
        this.latitude = latitude;
        this.longitude = longitude;
        this.availability = availability;
        this.status = status;
    }
}
