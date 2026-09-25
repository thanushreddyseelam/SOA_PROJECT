package com.urbanglide.ride.controller;

import com.urbanglide.ride.dto.RideRequest;
import com.urbanglide.ride.dto.RideResponse;
import com.urbanglide.ride.service.RideService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/rides")
public class RideController {
    private final RideService rideService;

    @PostMapping
    public ResponseEntity<RideResponse> bookRide(@RequestBody RideRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rideService.bookRide(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RideResponse> getRide(@PathVariable Long id) {
        return ResponseEntity.ok(rideService.getRide(id));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<RideResponse> acceptRide(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String callerRole,
            @RequestHeader(value = "X-User-Username", required = false) String callerUsername,
            @RequestParam(value = "driverId", required = false) Long driverId) {
        return ResponseEntity.ok(rideService.acceptRide(id, callerRole, callerUsername, driverId));
    }

    @PutMapping({"/{id}/arrived", "/{id}/arrive"})
    public ResponseEntity<RideResponse> driverArrived(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String callerRole,
            @RequestHeader(value = "X-User-Username", required = false) String callerUsername) {
        return ResponseEntity.ok(rideService.driverArrived(id, callerRole, callerUsername));
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<RideResponse> startRide(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String callerRole,
            @RequestHeader(value = "X-User-Username", required = false) String callerUsername) {
        return ResponseEntity.ok(rideService.startRide(id, callerRole, callerUsername));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<RideResponse> completeRide(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String callerRole,
            @RequestHeader(value = "X-User-Username", required = false) String callerUsername) {
        return ResponseEntity.ok(rideService.completeRide(id, callerRole, callerUsername));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<RideResponse> cancelRide(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String callerRole,
            @RequestHeader(value = "X-User-Username", required = false) String callerUsername) {
        return ResponseEntity.ok(rideService.cancelRide(id, callerRole, callerUsername));
    }

    @GetMapping("/rider/{riderId}")
    public ResponseEntity<List<RideResponse>> getRidesByRider(@PathVariable Long riderId) {
        return ResponseEntity.ok(rideService.getRidesByRider(riderId));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<RideResponse>> getRidesByDriver(@PathVariable Long driverId) {
        return ResponseEntity.ok(rideService.getRidesByDriver(driverId));
    }

    public RideController(final RideService rideService) {
        this.rideService = rideService;
    }
}
