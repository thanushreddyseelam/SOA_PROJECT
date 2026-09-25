package com.urbanglide.driver.dto;

public class UpdateDriverProfileRequest {
    private String name;
    private String phone;
    private String vehicleNumber;
    private String vehicleType;

    public UpdateDriverProfileRequest() {
    }

    public UpdateDriverProfileRequest(String name, String phone, String vehicleNumber, String vehicleType) {
        this.name = name;
        this.phone = phone;
        this.vehicleNumber = vehicleNumber;
        this.vehicleType = vehicleType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }
}
