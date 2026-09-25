package com.urbanglide.ride.client;

import com.urbanglide.ride.client.dto.DriverDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "DRIVER-SERVICE")
public interface DriverClient {

    @GetMapping("/drivers/available")
    List<DriverDTO> getAvailableDrivers();

    @GetMapping("/drivers/nearest")
    DriverDTO findNearestDriver(@RequestParam("latitude") double latitude, @RequestParam("longitude") double longitude);

    @GetMapping("/drivers/nearby")
    List<DriverDTO> findAvailableDriversNear(@RequestParam("latitude") double latitude, @RequestParam("longitude") double longitude);

    @PutMapping("/drivers/{id}/reserve")
    Map<String, Object> reserveDriver(@PathVariable("id") Long id);

    @GetMapping("/drivers/{id}")
    DriverDTO getDriver(@PathVariable("id") Long id);

    @PutMapping("/drivers/{id}/status")
    DriverDTO updateDriverStatus(@PathVariable("id") Long id, @RequestBody Map<String, String> status);
}

