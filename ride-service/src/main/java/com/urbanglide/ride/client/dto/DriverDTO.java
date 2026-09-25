package com.urbanglide.ride.client.dto;

public class DriverDTO {
    private Long id;
    private Long userId;
    private String name;
    private String phone;
    private String vehicleNumber;
    private String vehicleType;
    private Double latitude;
    private Double longitude;
    private Boolean availability;
    private String status;

    public static class DriverDTOBuilder {
        private Long id;
        private Long userId;
        private String name;
        private String phone;
        private String vehicleNumber;
        private String vehicleType;
        private Double latitude;
        private Double longitude;
        private Boolean availability;
        private String status;

        DriverDTOBuilder() {
        }

        public DriverDTO.DriverDTOBuilder id(final Long id) {
            this.id = id;
            return this;
        }

        public DriverDTO.DriverDTOBuilder userId(final Long userId) {
            this.userId = userId;
            return this;
        }

        public DriverDTO.DriverDTOBuilder name(final String name) {
            this.name = name;
            return this;
        }

        public DriverDTO.DriverDTOBuilder phone(final String phone) {
            this.phone = phone;
            return this;
        }

        public DriverDTO.DriverDTOBuilder vehicleNumber(final String vehicleNumber) {
            this.vehicleNumber = vehicleNumber;
            return this;
        }

        public DriverDTO.DriverDTOBuilder vehicleType(final String vehicleType) {
            this.vehicleType = vehicleType;
            return this;
        }

        public DriverDTO.DriverDTOBuilder latitude(final Double latitude) {
            this.latitude = latitude;
            return this;
        }

        public DriverDTO.DriverDTOBuilder longitude(final Double longitude) {
            this.longitude = longitude;
            return this;
        }

        public DriverDTO.DriverDTOBuilder availability(final Boolean availability) {
            this.availability = availability;
            return this;
        }

        public DriverDTO.DriverDTOBuilder status(final String status) {
            this.status = status;
            return this;
        }

        public DriverDTO build() {
            return new DriverDTO(this.id, this.userId, this.name, this.phone, this.vehicleNumber, this.vehicleType, this.latitude, this.longitude, this.availability, this.status);
        }
    }

    public static DriverDTO.DriverDTOBuilder builder() {
        return new DriverDTO.DriverDTOBuilder();
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

    public String getStatus() {
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

    public void setStatus(final String status) {
        this.status = status;
    }

    public DriverDTO() {
    }

    public DriverDTO(final Long id, final String name, final String phone, final String vehicleNumber, final String vehicleType, final Double latitude, final Double longitude, final Boolean availability, final String status) {
        this(id, null, name, phone, vehicleNumber, vehicleType, latitude, longitude, availability, status);
    }

    public DriverDTO(final Long id, final Long userId, final String name, final String phone, final String vehicleNumber, final String vehicleType, final Double latitude, final Double longitude, final Boolean availability, final String status) {
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
