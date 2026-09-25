package com.urbanglide.driver.dto;

public class CreateDriverRequest {
    private String name;
    private String username;
    private String email;
    private String password;
    private String phone;
    private String vehicleNumber;
    private String licenseNumber;
    private String vehicleType;

    public CreateDriverRequest() {
    }

    public CreateDriverRequest(String name, String username, String email, String password, String phone, String vehicleNumber, String licenseNumber, String vehicleType) {
        this.name = name;
        this.username = username;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.vehicleNumber = vehicleNumber;
        this.licenseNumber = licenseNumber;
        this.vehicleType = vehicleType;
    }

    public String getName() {
        if (this.name != null && !this.name.trim().isEmpty()) {
            return this.name;
        }
        return this.username;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUsername() {
        return this.username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return this.email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return this.password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return this.phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getVehicleNumber() {
        if (this.vehicleNumber != null && !this.vehicleNumber.trim().isEmpty()) {
            return this.vehicleNumber;
        }
        return this.licenseNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getLicenseNumber() {
        return this.licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public String getVehicleType() {
        return this.vehicleType != null ? this.vehicleType : "SEDAN";
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    @Override
    public String toString() {
        return "CreateDriverRequest{" +
                "name='" + getName() + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", vehicleNumber='" + getVehicleNumber() + '\'' +
                ", vehicleType='" + getVehicleType() + '\'' +
                '}';
    }
}
