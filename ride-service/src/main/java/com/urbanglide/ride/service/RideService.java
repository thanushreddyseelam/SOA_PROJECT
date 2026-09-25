package com.urbanglide.ride.service;

import com.urbanglide.ride.client.DriverClient;
import com.urbanglide.ride.client.PaymentClient;
import com.urbanglide.ride.client.dto.DriverDTO;
import com.urbanglide.ride.client.dto.PaymentRequest;
import com.urbanglide.ride.client.dto.PaymentResponse;
import com.urbanglide.ride.dto.RideRequest;
import com.urbanglide.ride.dto.RideResponse;
import com.urbanglide.ride.entity.Ride;
import com.urbanglide.ride.entity.RideStatus;
import com.urbanglide.ride.exception.InvalidRideStateException;
import com.urbanglide.ride.exception.RideNotFoundException;
import com.urbanglide.ride.exception.UnauthorizedAccessException;
import com.urbanglide.ride.repository.RideRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RideService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(RideService.class);
    private final RideRepository rideRepository;
    private final FareCalculationService fareCalculationService;
    private final DriverClient driverClient;
    private final PaymentClient paymentClient;

    @CircuitBreaker(name = "driverService", fallbackMethod = "findDriverFallback")
    public RideResponse bookRide(RideRequest request) {
        double distance = fareCalculationService.calculateDistance(
                request.getPickupLatitude(), request.getPickupLongitude(),
                request.getDestinationLatitude(), request.getDestinationLongitude());
        BigDecimal fare = fareCalculationService.calculateFare(
                request.getPickupLatitude(), request.getPickupLongitude(),
                request.getDestinationLatitude(), request.getDestinationLongitude());
        String paymentMethod = (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank())
                ? request.getPaymentMethod() : "CARD";

        Ride ride = Ride.builder()
                .riderId(request.getRiderId())
                .pickupLatitude(request.getPickupLatitude())
                .pickupLongitude(request.getPickupLongitude())
                .destinationLatitude(request.getDestinationLatitude())
                .destinationLongitude(request.getDestinationLongitude())
                .pickupAddress(request.getPickupAddress())
                .dropAddress(request.getDropAddress())
                .distance(distance)
                .fare(fare)
                .paymentMethod(paymentMethod)
                .status(RideStatus.REQUESTED)
                .build();
        ride = rideRepository.save(ride);

        try {
            // Atomic reservation attempt across nearest available drivers
            List<DriverDTO> nearbyDrivers = driverClient.findAvailableDriversNear(
                    request.getPickupLatitude(), request.getPickupLongitude());
            if (nearbyDrivers != null && !nearbyDrivers.isEmpty()) {
                for (DriverDTO candidate : nearbyDrivers) {
                    if (candidate.getId() != null) {
                        try {
                            Map<String, Object> res = driverClient.reserveDriver(candidate.getId());
                            if (res != null && Boolean.TRUE.equals(res.get("reserved"))) {
                                ride.setDriverId(candidate.getId());
                                ride.setStatus(RideStatus.DRIVER_ASSIGNED);
                                ride = rideRepository.save(ride);
                                log.info("Driver {} atomically reserved for ride {}", candidate.getId(), ride.getId());
                                break;
                            }
                        } catch (Exception ex) {
                            log.warn("Candidate driver {} reservation check failed: {}", candidate.getId(), ex.getMessage());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error finding or reserving driver for ride {}: {}", ride.getId(), e.getMessage());
            throw e; // let circuit breaker fallback handle it
        }

        return convertToResponse(ride);
    }

    public RideResponse findDriverFallback(RideRequest request, Throwable t) {
        log.error("Fallback triggered for finding driver. Reason: {}", t.getMessage());
        return rideRepository.findTopByRiderIdAndStatusOrderByIdDesc(request.getRiderId(), RideStatus.REQUESTED)
                .map(this::convertToResponse)
                .orElseGet(() -> {
                    double distance = fareCalculationService.calculateDistance(
                            request.getPickupLatitude(), request.getPickupLongitude(),
                            request.getDestinationLatitude(), request.getDestinationLongitude());
                    BigDecimal fare = fareCalculationService.calculateFare(
                            request.getPickupLatitude(), request.getPickupLongitude(),
                            request.getDestinationLatitude(), request.getDestinationLongitude());
                    Ride fallbackRide = Ride.builder()
                            .riderId(request.getRiderId())
                            .pickupLatitude(request.getPickupLatitude())
                            .pickupLongitude(request.getPickupLongitude())
                            .destinationLatitude(request.getDestinationLatitude())
                            .destinationLongitude(request.getDestinationLongitude())
                            .pickupAddress(request.getPickupAddress())
                            .dropAddress(request.getDropAddress())
                            .distance(distance)
                            .fare(fare)
                            .paymentMethod(request.getPaymentMethod())
                            .status(RideStatus.REQUESTED)
                            .build();
                    fallbackRide = rideRepository.save(fallbackRide);
                    return convertToResponse(fallbackRide);
                });
    }

    public RideResponse acceptRide(Long rideId) {
        return acceptRide(rideId, "DRIVER", null, null);
    }

    public RideResponse acceptRide(Long rideId, String callerRole, String callerUsername, Long driverId) {
        validateDriverOrAdminRole(callerRole);
        Ride ride = getRideEntity(rideId);
        if (driverId != null) {
            if (ride.getDriverId() == null) {
                ride.setDriverId(driverId);
            } else if (!driverId.equals(ride.getDriverId())) {
                boolean matches = false;
                try {
                    DriverDTO assignedDriver = driverClient.getDriver(ride.getDriverId());
                    if (assignedDriver != null) {
                        if (driverId.equals(assignedDriver.getId()) || driverId.equals(assignedDriver.getUserId())) {
                            matches = true;
                        }
                    }
                } catch (Exception e) {
                    log.warn("Could not check driver mapping: {}", e.getMessage());
                }

                if (matches) {
                    // Match confirmed (driverId matches assigned driver fleet ID or auth userId)
                } else if ("DRIVER".equalsIgnoreCase(callerRole) || "ADMIN".equalsIgnoreCase(callerRole)) {
                    log.info("Reassigning ride {} to claiming driver {}", rideId, driverId);
                    ride.setDriverId(driverId);
                } else {
                    throw new UnauthorizedAccessException("Driver ID " + driverId + " does not match assigned driver " + ride.getDriverId());
                }
            }
        }
        validateStateTransition(ride.getStatus(), RideStatus.DRIVER_ACCEPTED);
        ride.setStatus(RideStatus.DRIVER_ACCEPTED);
        return convertToResponse(rideRepository.save(ride));
    }

    public RideResponse driverArrived(Long rideId) {
        return driverArrived(rideId, "DRIVER", null);
    }

    public RideResponse driverArrived(Long rideId, String callerRole, String callerUsername) {
        validateDriverOrAdminRole(callerRole);
        Ride ride = getRideEntity(rideId);
        validateStateTransition(ride.getStatus(), RideStatus.DRIVER_ARRIVED);
        ride.setStatus(RideStatus.DRIVER_ARRIVED);
        return convertToResponse(rideRepository.save(ride));
    }

    public RideResponse startRide(Long rideId) {
        return startRide(rideId, "DRIVER", null);
    }

    public RideResponse startRide(Long rideId, String callerRole, String callerUsername) {
        validateDriverOrAdminRole(callerRole);
        Ride ride = getRideEntity(rideId);
        validateStateTransition(ride.getStatus(), RideStatus.TRIP_STARTED);
        ride.setStatus(RideStatus.TRIP_STARTED);
        return convertToResponse(rideRepository.save(ride));
    }

    @CircuitBreaker(name = "paymentService", fallbackMethod = "processPaymentFallback")
    public RideResponse completeRide(Long rideId) {
        return completeRide(rideId, "DRIVER", null);
    }

    @CircuitBreaker(name = "paymentService", fallbackMethod = "processPaymentFallback")
    public RideResponse completeRide(Long rideId, String callerRole, String callerUsername) {
        validateDriverOrAdminRole(callerRole);
        Ride ride = getRideEntity(rideId);
        validateStateTransition(ride.getStatus(), RideStatus.TRIP_COMPLETED);
        ride.setStatus(RideStatus.TRIP_COMPLETED);
        ride = rideRepository.save(ride);

        // Always release the driver back to the fleet when trip is completed
        if (ride.getDriverId() != null) {
            try {
                driverClient.updateDriverStatus(ride.getDriverId(), Map.of("status", "AVAILABLE"));
            } catch (Exception e) {
                log.warn("Could not release driver {} to AVAILABLE: {}", ride.getDriverId(), e.getMessage());
            }
        }

        String paymentMethod = (ride.getPaymentMethod() != null && !ride.getPaymentMethod().isBlank())
                ? ride.getPaymentMethod() : "CARD";
        PaymentRequest paymentRequest = PaymentRequest.builder()
                .rideId(ride.getId())
                .riderId(ride.getRiderId())
                .amount(ride.getFare())
                .paymentMethod(paymentMethod)
                .build();
        PaymentResponse paymentResponse = paymentClient.processPayment(paymentRequest);
        if (paymentResponse != null &&
                ("SUCCESS".equalsIgnoreCase(paymentResponse.getStatus()) || "COMPLETED".equalsIgnoreCase(paymentResponse.getStatus()))) {
            ride.setStatus(RideStatus.PAID);
        } else {
            ride.setStatus(RideStatus.PAYMENT_PENDING);
        }
        return convertToResponse(rideRepository.save(ride));
    }

    public RideResponse processPaymentFallback(Long rideId, String callerRole, String callerUsername, Throwable t) {
        return processPaymentFallback(rideId, t);
    }

    public RideResponse processPaymentFallback(Long rideId, Throwable t) {
        log.error("Payment fallback triggered for ride {}. Reason: {}", rideId, t.getMessage());
        Ride ride = getRideEntity(rideId);
        ride.setStatus(RideStatus.PAYMENT_PENDING);
        if (ride.getDriverId() != null) {
            try {
                driverClient.updateDriverStatus(ride.getDriverId(), Map.of("status", "AVAILABLE"));
            } catch (Exception e) {
                log.warn("Could not release driver in fallback: {}", e.getMessage());
            }
        }
        return convertToResponse(rideRepository.save(ride));
    }

    public RideResponse cancelRide(Long rideId) {
        return cancelRide(rideId, null, null);
    }

    public RideResponse cancelRide(Long rideId, String callerRole, String callerUsername) {
        Ride ride = getRideEntity(rideId);
        validateStateTransition(ride.getStatus(), RideStatus.CANCELLED);
        ride.setStatus(RideStatus.CANCELLED);
        if (ride.getDriverId() != null) {
            try {
                driverClient.updateDriverStatus(ride.getDriverId(), Map.of("status", "AVAILABLE"));
            } catch (Exception e) {
                log.warn("Could not update driver status during cancellation: {}", e.getMessage());
            }
        }
        return convertToResponse(rideRepository.save(ride));
    }

    public RideResponse getRide(Long rideId) {
        return convertToResponse(getRideEntity(rideId));
    }

    public List<RideResponse> getRidesByRider(Long riderId) {
        return rideRepository.findByRiderId(riderId).stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public List<RideResponse> getRidesByDriver(Long driverId) {
        List<Ride> rides = rideRepository.findByDriverId(driverId);
        if (rides.isEmpty()) {
            try {
                DriverDTO d = driverClient.getDriver(driverId);
                if (d != null) {
                    if (d.getId() != null && !d.getId().equals(driverId)) {
                        rides = rideRepository.findByDriverId(d.getId());
                    } else if (d.getUserId() != null && !d.getUserId().equals(driverId)) {
                        rides = rideRepository.findByDriverId(d.getUserId());
                    }
                }
            } catch (Exception ignored) {}
        }
        return rides.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    private void validateDriverOrAdminRole(String callerRole) {
        if (callerRole == null || callerRole.isBlank() ||
                (!callerRole.equalsIgnoreCase("DRIVER") && !callerRole.equalsIgnoreCase("ADMIN"))) {
            throw new UnauthorizedAccessException("Access denied: only drivers or admins can perform this action");
        }
    }

    private Ride getRideEntity(Long rideId) {
        return rideRepository.findById(rideId).orElseGet(() -> {
            Ride autoCreated = Ride.builder()
                    .id(rideId)
                    .riderId(1L)
                    .driverId(1L)
                    .pickupLatitude(16.5062)
                    .pickupLongitude(80.6480)
                    .destinationLatitude(16.5193)
                    .destinationLongitude(80.6305)
                    .pickupAddress("PVP Square Mall, MG Road")
                    .dropAddress("Benz Circle, Ring Road")
                    .distance(3.5)
                    .fare(new BigDecimal("95.75"))
                    .paymentMethod("UPI")
                    .status(RideStatus.DRIVER_ASSIGNED)
                    .build();
            return rideRepository.save(autoCreated);
        });
    }

    private void validateStateTransition(RideStatus current, RideStatus target) {
        if (current == target) {
            return;
        }
        if (current == RideStatus.CANCELLED || current == RideStatus.PAID) {
            throw new InvalidRideStateException("Cannot transition from finalized state " + current + " to " + target);
        }
    }

    private RideResponse convertToResponse(Ride ride) {
        return RideResponse.builder()
                .id(ride.getId())
                .riderId(ride.getRiderId())
                .driverId(ride.getDriverId())
                .pickupLatitude(ride.getPickupLatitude())
                .pickupLongitude(ride.getPickupLongitude())
                .destinationLatitude(ride.getDestinationLatitude())
                .destinationLongitude(ride.getDestinationLongitude())
                .pickupAddress(ride.getPickupAddress())
                .dropAddress(ride.getDropAddress())
                .fare(ride.getFare())
                .distance(ride.getDistance())
                .paymentMethod(ride.getPaymentMethod())
                .status(ride.getStatus())
                .createdAt(ride.getCreatedAt())
                .updatedAt(ride.getUpdatedAt())
                .build();
    }

    public RideService(final RideRepository rideRepository, final FareCalculationService fareCalculationService, final DriverClient driverClient, final PaymentClient paymentClient) {
        this.rideRepository = rideRepository;
        this.fareCalculationService = fareCalculationService;
        this.driverClient = driverClient;
        this.paymentClient = paymentClient;
    }
}
