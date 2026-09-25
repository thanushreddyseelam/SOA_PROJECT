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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RideServiceTest {

    @Mock
    private RideRepository rideRepository;

    @Mock
    private FareCalculationService fareCalculationService;

    @Mock
    private DriverClient driverClient;

    @Mock
    private PaymentClient paymentClient;

    @InjectMocks
    private RideService rideService;

    private Ride testRide;

    @BeforeEach
    public void setUp() {
        testRide = Ride.builder()
                .id(1L)
                .riderId(10L)
                .driverId(100L)
                .pickupLatitude(16.5062)
                .pickupLongitude(80.6480)
                .destinationLatitude(16.5193)
                .destinationLongitude(80.6305)
                .pickupAddress("PVP Mall")
                .dropAddress("Benz Circle")
                .fare(new BigDecimal("125.50"))
                .distance(3.2)
                .paymentMethod("UPI")
                .status(RideStatus.REQUESTED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    public void testBookRide_DriverAvailable_AssignsDriverAtomically() {
        RideRequest request = new RideRequest(10L, 16.5062, 80.6480, 16.5193, 80.6305, "PVP Mall", "Benz Circle", "UPI");

        when(fareCalculationService.calculateDistance(anyDouble(), anyDouble(), anyDouble(), anyDouble())).thenReturn(3.2);
        when(fareCalculationService.calculateFare(anyDouble(), anyDouble(), anyDouble(), anyDouble())).thenReturn(new BigDecimal("125.50"));

        DriverDTO driverDTO = DriverDTO.builder().id(100L).name("Raju").status("AVAILABLE").build();
        when(driverClient.findAvailableDriversNear(anyDouble(), anyDouble())).thenReturn(List.of(driverDTO));
        when(driverClient.reserveDriver(100L)).thenReturn(Map.of("driverId", 100L, "reserved", true));

        when(rideRepository.save(any(Ride.class))).thenAnswer(i -> {
            Ride r = i.getArgument(0);
            if (r.getId() == null) r.setId(1L);
            return r;
        });

        RideResponse response = rideService.bookRide(request);

        assertNotNull(response);
        assertEquals(RideStatus.DRIVER_ASSIGNED, response.getStatus());
        assertEquals(100L, response.getDriverId());
        assertEquals("UPI", response.getPaymentMethod());
        assertEquals(new BigDecimal("125.50"), response.getFare());
        verify(driverClient, times(1)).reserveDriver(100L);
    }

    @Test
    public void testBookRide_DriverReservationFails_RideRemainsRequested() {
        RideRequest request = new RideRequest(10L, 16.5062, 80.6480, 16.5193, 80.6305, "PVP Mall", "Benz Circle", "CARD");

        when(fareCalculationService.calculateDistance(anyDouble(), anyDouble(), anyDouble(), anyDouble())).thenReturn(3.2);
        when(fareCalculationService.calculateFare(anyDouble(), anyDouble(), anyDouble(), anyDouble())).thenReturn(new BigDecimal("125.50"));

        DriverDTO driverDTO = DriverDTO.builder().id(100L).name("Raju").status("AVAILABLE").build();
        when(driverClient.findAvailableDriversNear(anyDouble(), anyDouble())).thenReturn(List.of(driverDTO));
        // Another concurrent request grabbed driver 100 first, so reserved returns false
        when(driverClient.reserveDriver(100L)).thenReturn(Map.of("driverId", 100L, "reserved", false));

        when(rideRepository.save(any(Ride.class))).thenAnswer(i -> {
            Ride r = i.getArgument(0);
            if (r.getId() == null) r.setId(1L);
            return r;
        });

        RideResponse response = rideService.bookRide(request);

        assertNotNull(response);
        assertEquals(RideStatus.REQUESTED, response.getStatus());
        assertNull(response.getDriverId());
    }

    @Test
    public void testStateTransitions_HappyPath() {
        when(rideRepository.findById(1L)).thenReturn(Optional.of(testRide));
        when(rideRepository.save(any(Ride.class))).thenAnswer(i -> i.getArgument(0));

        // 1. DRIVER_ACCEPTED (valid from DRIVER_ASSIGNED)
        testRide.setStatus(RideStatus.DRIVER_ASSIGNED);
        RideResponse accepted = rideService.acceptRide(1L, "DRIVER", "driver1", 100L);
        assertEquals(RideStatus.DRIVER_ACCEPTED, accepted.getStatus());

        // 2. DRIVER_ARRIVED (valid from DRIVER_ACCEPTED)
        RideResponse arrived = rideService.driverArrived(1L, "DRIVER", "driver1");
        assertEquals(RideStatus.DRIVER_ARRIVED, arrived.getStatus());

        // 3. TRIP_STARTED (valid from DRIVER_ARRIVED)
        RideResponse started = rideService.startRide(1L, "DRIVER", "driver1");
        assertEquals(RideStatus.TRIP_STARTED, started.getStatus());
    }

    @Test
    public void testAcceptRide_DriverIdMismatch_ThrowsException() {
        testRide.setStatus(RideStatus.DRIVER_ASSIGNED);
        when(rideRepository.findById(1L)).thenReturn(Optional.of(testRide));

        // Calling with different driver ID 999 instead of 100
        assertThrows(UnauthorizedAccessException.class, () ->
                rideService.acceptRide(1L, "DRIVER", "wrong_driver", 999L));
    }

    @Test
    public void testAcceptRide_RiderRole_ThrowsException() {
        // Calling driver action with RIDER role must be rejected
        assertThrows(UnauthorizedAccessException.class, () ->
                rideService.acceptRide(1L, "RIDER", "rider1", 100L));
    }

    @Test
    public void testInvalidStateTransition_ThrowsException() {
        testRide.setStatus(RideStatus.REQUESTED);
        when(rideRepository.findById(1L)).thenReturn(Optional.of(testRide));

        // Attempting to START a ride directly from REQUESTED must fail
        assertThrows(InvalidRideStateException.class, () -> rideService.startRide(1L));
    }

    @Test
    public void testCancelRide_FromRequested_Succeeds() {
        testRide.setStatus(RideStatus.REQUESTED);
        when(rideRepository.findById(1L)).thenReturn(Optional.of(testRide));
        when(rideRepository.save(any(Ride.class))).thenAnswer(i -> i.getArgument(0));

        RideResponse cancelled = rideService.cancelRide(1L);
        assertEquals(RideStatus.CANCELLED, cancelled.getStatus());
    }

    @Test
    public void testCancelRide_FromTripStarted_Fails() {
        testRide.setStatus(RideStatus.TRIP_STARTED);
        when(rideRepository.findById(1L)).thenReturn(Optional.of(testRide));

        assertThrows(InvalidRideStateException.class, () -> rideService.cancelRide(1L));
    }

    @Test
    public void testCompleteRide_SuccessfulPayment_MarksPaidAndFreesDriver() {
        testRide.setStatus(RideStatus.TRIP_STARTED);
        when(rideRepository.findById(1L)).thenReturn(Optional.of(testRide));
        when(rideRepository.save(any(Ride.class))).thenAnswer(i -> i.getArgument(0));

        PaymentResponse paymentResponse = PaymentResponse.builder()
                .id(1L)
                .rideId(1L)
                .status("SUCCESS")
                .amount(new BigDecimal("125.50"))
                .paymentMethod("UPI")
                .build();
        when(paymentClient.processPayment(any(PaymentRequest.class))).thenReturn(paymentResponse);

        RideResponse completed = rideService.completeRide(1L, "DRIVER", "driver1");

        assertEquals(RideStatus.PAID, completed.getStatus());
        verify(driverClient, times(1)).updateDriverStatus(eq(100L), any());
    }

    @Test
    public void testCompleteRide_FailedPayment_MarksPaymentPendingAndFreesDriver() {
        testRide.setStatus(RideStatus.TRIP_STARTED);
        when(rideRepository.findById(1L)).thenReturn(Optional.of(testRide));
        when(rideRepository.save(any(Ride.class))).thenAnswer(i -> i.getArgument(0));

        PaymentResponse paymentResponse = PaymentResponse.builder()
                .id(1L)
                .rideId(1L)
                .status("FAILED")
                .amount(new BigDecimal("125.50"))
                .paymentMethod("UPI")
                .build();
        when(paymentClient.processPayment(any(PaymentRequest.class))).thenReturn(paymentResponse);

        RideResponse completed = rideService.completeRide(1L, "DRIVER", "driver1");

        assertEquals(RideStatus.PAYMENT_PENDING, completed.getStatus());
        verify(driverClient, times(1)).updateDriverStatus(eq(100L), any());
    }

    @Test
    public void testDriverAction_NullOrBlankRole_ThrowsUnauthorizedException() {
        assertThrows(UnauthorizedAccessException.class, () ->
                rideService.acceptRide(1L, null, "driver1", 100L));

        assertThrows(UnauthorizedAccessException.class, () ->
                rideService.driverArrived(1L, "", "driver1"));

        assertThrows(UnauthorizedAccessException.class, () ->
                rideService.startRide(1L, "  ", "driver1"));

        assertThrows(UnauthorizedAccessException.class, () ->
                rideService.completeRide(1L, null, "driver1"));
    }

    @Test
    public void testAdminRole_CanPerformDriverActions() {
        testRide.setStatus(RideStatus.DRIVER_ASSIGNED);
        when(rideRepository.findById(1L)).thenReturn(Optional.of(testRide));
        when(rideRepository.save(any(Ride.class))).thenAnswer(i -> i.getArgument(0));

        RideResponse accepted = rideService.acceptRide(1L, "ADMIN", "adminUser", 100L);
        assertEquals(RideStatus.DRIVER_ACCEPTED, accepted.getStatus());
    }

    @Test
    public void testProcessPaymentFallback_SetsPaymentPendingAndFreesDriver() {
        testRide.setStatus(RideStatus.TRIP_STARTED);
        when(rideRepository.findById(1L)).thenReturn(Optional.of(testRide));
        when(rideRepository.save(any(Ride.class))).thenAnswer(i -> i.getArgument(0));

        RideResponse fallbackResponse = rideService.processPaymentFallback(1L, "DRIVER", "driver1", new RuntimeException("Circuit open"));

        assertEquals(RideStatus.PAYMENT_PENDING, fallbackResponse.getStatus());
        verify(driverClient, times(1)).updateDriverStatus(eq(100L), any());
    }
}
