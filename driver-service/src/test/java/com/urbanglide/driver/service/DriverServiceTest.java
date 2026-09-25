package com.urbanglide.driver.service;

import com.urbanglide.driver.dto.CreateDriverRequest;
import com.urbanglide.driver.dto.DriverDTO;
import com.urbanglide.driver.entity.Driver;
import com.urbanglide.driver.entity.DriverStatus;
import com.urbanglide.driver.exception.DriverNotFoundException;
import com.urbanglide.driver.exception.DuplicateVehicleException;
import com.urbanglide.driver.exception.NoAvailableDriverException;
import com.urbanglide.driver.repository.DriverRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DriverServiceTest {

    @Mock
    private DriverRepository driverRepository;

    @InjectMocks
    private DriverService driverService;

    private Driver driver1;
    private Driver driver2;

    @BeforeEach
    public void setUp() {
        driver1 = Driver.builder()
                .id(1L)
                .name("Raju")
                .phone("9876543210")
                .vehicleNumber("AP16AB1234")
                .vehicleType("SEDAN")
                .latitude(16.5062)
                .longitude(80.6480)
                .availability(true)
                .status(DriverStatus.AVAILABLE)
                .build();

        driver2 = Driver.builder()
                .id(2L)
                .name("Siva")
                .phone("9876543211")
                .vehicleNumber("AP16BC2345")
                .vehicleType("SUV")
                .latitude(16.5193)
                .longitude(80.6305)
                .availability(true)
                .status(DriverStatus.AVAILABLE)
                .build();
    }

    @Test
    public void testCreateDriver_Success() {
        CreateDriverRequest request = new CreateDriverRequest("Kiran", "9876543212", "AP16CD3456", "HATCHBACK");

        when(driverRepository.findByVehicleNumber("AP16CD3456")).thenReturn(Optional.empty());
        when(driverRepository.save(any(Driver.class))).thenAnswer(invocation -> {
            Driver d = invocation.getArgument(0);
            d.setId(3L);
            return d;
        });

        DriverDTO created = driverService.createDriver(request);

        assertNotNull(created);
        assertEquals("Kiran", created.getName());
        assertEquals("AP16CD3456", created.getVehicleNumber());
        assertEquals(DriverStatus.OFFLINE, created.getStatus(), "New driver must default to OFFLINE until GPS location is sent");
        assertFalse(created.getAvailability(), "New driver must default to unavailable");
        assertNull(created.getLatitude());
        assertNull(created.getLongitude());
        verify(driverRepository, times(1)).save(any(Driver.class));
    }

    @Test
    public void testReserveDriver_Success() {
        when(driverRepository.reserveDriverIfAvailable(1L, DriverStatus.AVAILABLE, DriverStatus.BUSY))
                .thenReturn(1);

        boolean reserved = driverService.reserveDriver(1L);
        assertTrue(reserved, "Driver should be successfully reserved atomically");
    }

    @Test
    public void testReserveDriver_AlreadyTaken_ReturnsFalse() {
        when(driverRepository.reserveDriverIfAvailable(1L, DriverStatus.AVAILABLE, DriverStatus.BUSY))
                .thenReturn(0);

        boolean reserved = driverService.reserveDriver(1L);
        assertFalse(reserved, "Should return false if driver was already reserved by concurrent transaction");
    }

    @Test
    public void testCreateDriver_DuplicateVehicle_ThrowsException() {
        CreateDriverRequest request = new CreateDriverRequest("Raju Duplicate", "9999999999", "AP16AB1234", "SEDAN");

        when(driverRepository.findByVehicleNumber("AP16AB1234")).thenReturn(Optional.of(driver1));

        assertThrows(DuplicateVehicleException.class, () -> driverService.createDriver(request));
        verify(driverRepository, never()).save(any(Driver.class));
    }

    @Test
    public void testFindNearestDriver_Success() {
        // Search near driver 1 coordinates (16.5062, 80.6480)
        when(driverRepository.findByAvailabilityTrueAndStatus(DriverStatus.AVAILABLE))
                .thenReturn(List.of(driver1, driver2));

        DriverDTO nearest = driverService.findNearestDriver(16.5060, 80.6482);

        assertNotNull(nearest);
        assertEquals(1L, nearest.getId());
        assertEquals("Raju", nearest.getName());
    }

    @Test
    public void testFindNearestDriver_NoAvailableDrivers_ThrowsException() {
        when(driverRepository.findByAvailabilityTrueAndStatus(DriverStatus.AVAILABLE))
                .thenReturn(Collections.emptyList());

        assertThrows(NoAvailableDriverException.class, () -> 
                driverService.findNearestDriver(16.5062, 80.6480));
    }

    @Test
    public void testUpdateDriverStatus_Offline_SetsAvailabilityFalse() {
        when(driverRepository.findById(1L)).thenReturn(Optional.of(driver1));
        when(driverRepository.save(any(Driver.class))).thenAnswer(i -> i.getArgument(0));

        DriverDTO updated = driverService.updateDriverStatus(1L, DriverStatus.OFFLINE);

        assertEquals(DriverStatus.OFFLINE, updated.getStatus());
        assertFalse(updated.getAvailability());
    }

    @Test
    public void testUpdateDriverStatus_Busy_SetsAvailabilityFalse() {
        when(driverRepository.findById(1L)).thenReturn(Optional.of(driver1));
        when(driverRepository.save(any(Driver.class))).thenAnswer(i -> i.getArgument(0));

        DriverDTO updated = driverService.updateDriverStatus(1L, DriverStatus.BUSY);

        assertEquals(DriverStatus.BUSY, updated.getStatus());
        assertFalse(updated.getAvailability());
    }

    @Test
    public void testGetDriverById_NotFound_ThrowsException() {
        when(driverRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(DriverNotFoundException.class, () -> driverService.getDriverById(99L));
    }
}
