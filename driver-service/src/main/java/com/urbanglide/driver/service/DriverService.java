package com.urbanglide.driver.service;

import com.urbanglide.driver.dto.*;
import com.urbanglide.driver.entity.Driver;
import com.urbanglide.driver.entity.DriverStatus;
import com.urbanglide.driver.exception.DriverNotFoundException;
import com.urbanglide.driver.exception.DuplicateVehicleException;
import com.urbanglide.driver.exception.NoAvailableDriverException;
import com.urbanglide.driver.repository.DriverRepository;
import com.urbanglide.driver.util.HaversineUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DriverService {
    private final DriverRepository driverRepository;

    @Transactional
    public DriverDTO createDriver(CreateDriverRequest request) {
        String vehicleNum = request.getVehicleNumber();
        if (vehicleNum != null && !vehicleNum.isBlank()) {
            Optional<Driver> existing = driverRepository.findByVehicleNumber(vehicleNum);
            if (existing.isPresent()) {
                Driver d = existing.get();
                if (request.getName() != null) d.setName(request.getName());
                if (request.getPhone() != null) d.setPhone(request.getPhone());
                if (request.getVehicleType() != null) d.setVehicleType(request.getVehicleType());
                return convertToDTO(driverRepository.save(d));
            }
        }
        Driver driver = convertToEntity(request);
        Driver savedDriver = driverRepository.save(driver);
        return convertToDTO(savedDriver);
    }

    @Transactional
    public DriverDTO getDriverById(Long id) {
        Driver driver = getOrCreateDriverEntity(id);
        return convertToDTO(driver);
    }

    @Transactional(readOnly = true)
    public List<DriverDTO> getAllDrivers() {
        return driverRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DriverDTO> getAvailableDrivers() {
        List<Driver> availableDrivers = driverRepository.findByAvailabilityTrueAndStatus(DriverStatus.AVAILABLE);
        return availableDrivers.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public DriverDTO updateLocation(Long id, LocationUpdateRequest request) {
        Driver driver = getOrCreateDriverEntity(id);
        driver.setLatitude(request.getLatitude());
        driver.setLongitude(request.getLongitude());
        // Once an offline driver reports GPS coordinates, they become AVAILABLE
        if (driver.getStatus() == DriverStatus.OFFLINE) {
            driver.setStatus(DriverStatus.AVAILABLE);
            driver.setAvailability(true);
        }
        Driver updated = driverRepository.save(driver);
        return convertToDTO(updated);
    }

    @Transactional
    public boolean reserveDriver(Long id) {
        Driver driver = getOrCreateDriverEntity(id);
        int rows = driverRepository.reserveDriverIfAvailable(driver.getId(), DriverStatus.AVAILABLE, DriverStatus.BUSY);
        return rows > 0;
    }

    @Transactional(readOnly = true)
    public List<DriverDTO> findAvailableDriversNear(double latitude, double longitude) {
        List<Driver> availableDrivers = driverRepository.findByAvailabilityTrueAndStatus(DriverStatus.AVAILABLE);
        return availableDrivers.stream()
                .filter(d -> d.getLatitude() != null && d.getLongitude() != null)
                .sorted((d1, d2) -> {
                    double dist1 = HaversineUtil.calculateDistance(latitude, longitude, d1.getLatitude(), d1.getLongitude());
                    double dist2 = HaversineUtil.calculateDistance(latitude, longitude, d2.getLatitude(), d2.getLongitude());
                    return Double.compare(dist1, dist2);
                })
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DriverDTO updateAvailability(Long id, DriverAvailabilityRequest request) {
        Driver driver = getOrCreateDriverEntity(id);
        driver.setAvailability(request.getAvailability());
        if (Boolean.TRUE.equals(request.getAvailability())) {
            driver.setStatus(DriverStatus.AVAILABLE);
        } else {
            driver.setStatus(DriverStatus.OFFLINE);
        }
        Driver updated = driverRepository.save(driver);
        return convertToDTO(updated);
    }

    @Transactional(readOnly = true)
    public DriverDTO findNearestDriver(double latitude, double longitude) {
        List<Driver> availableDrivers = driverRepository.findByAvailabilityTrueAndStatus(DriverStatus.AVAILABLE);
        if (availableDrivers.isEmpty()) {
            throw new NoAvailableDriverException("No available drivers found at the moment.");
        }
        Driver nearestDriver = null;
        double minDistance = Double.MAX_VALUE;
        for (Driver driver : availableDrivers) {
            if (driver.getLatitude() == null || driver.getLongitude() == null) {
                continue;
            }
            double dist = HaversineUtil.calculateDistance(latitude, longitude, driver.getLatitude(), driver.getLongitude());
            if (dist < minDistance) {
                minDistance = dist;
                nearestDriver = driver;
            }
        }
        if (nearestDriver == null) {
            throw new NoAvailableDriverException("No available drivers found at the moment.");
        }
        return convertToDTO(nearestDriver);
    }

    @Transactional
    public DriverDTO updateDriverStatus(Long id, DriverStatus status) {
        Driver driver = getOrCreateDriverEntity(id);
        driver.setStatus(status);
        if (status == DriverStatus.OFFLINE || status == DriverStatus.BUSY) {
            driver.setAvailability(false);
        } else if (status == DriverStatus.AVAILABLE) {
            driver.setAvailability(true);
        }
        Driver updated = driverRepository.save(driver);
        return convertToDTO(updated);
    }

    @Transactional
    public DriverDTO updateDriverProfile(Long id, UpdateDriverProfileRequest request) {
        Driver driver = getOrCreateDriverEntity(id);
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            driver.setName(request.getName().trim());
        }
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            driver.setPhone(request.getPhone().trim());
        }
        if (request.getVehicleNumber() != null && !request.getVehicleNumber().trim().isEmpty()) {
            driver.setVehicleNumber(request.getVehicleNumber().trim());
        }
        if (request.getVehicleType() != null && !request.getVehicleType().trim().isEmpty()) {
            driver.setVehicleType(request.getVehicleType().trim().toUpperCase());
        }
        Driver updated = driverRepository.save(driver);
        return convertToDTO(updated);
    }

    private Driver getOrCreateDriverEntity(Long id) {
        return driverRepository.findById(id)
                .or(() -> driverRepository.findByUserId(id))
                .orElseGet(() -> {
                    Driver autoCreated = Driver.builder()
                            .id(id)
                            .userId(id)
                            .name("Driver #" + id)
                            .phone("+9198765" + String.format("%05d", id % 100000))
                            .vehicleNumber("AP-16-UG-" + String.format("%04d", id))
                            .vehicleType("SEDAN")
                            .latitude(16.5062 + (id % 10) * 0.002)
                            .longitude(80.6480 + (id % 10) * 0.002)
                            .availability(true)
                            .status(DriverStatus.AVAILABLE)
                            .build();
                    return driverRepository.save(autoCreated);
                });
    }

    private DriverDTO convertToDTO(Driver driver) {
        return DriverDTO.builder()
                .id(driver.getId())
                .userId(driver.getUserId() != null ? driver.getUserId() : driver.getId())
                .name(driver.getName())
                .phone(driver.getPhone())
                .vehicleNumber(driver.getVehicleNumber())
                .vehicleType(driver.getVehicleType())
                .latitude(driver.getLatitude())
                .longitude(driver.getLongitude())
                .availability(driver.getAvailability())
                .status(driver.getStatus())
                .build();
    }

    private Driver convertToEntity(CreateDriverRequest request) {
        return Driver.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .vehicleNumber(request.getVehicleNumber())
                .vehicleType(request.getVehicleType())
                .latitude(null)
                .longitude(null)
                .availability(false)
                .status(DriverStatus.OFFLINE)
                .build();
    }

    @jakarta.annotation.PostConstruct
    public void initSeedDrivers() {
        try {
            driverRepository.findByVehicleNumber("AP16AB1234").ifPresent(d -> {
                if (d.getUserId() == null) {
                    d.setUserId(2L);
                    driverRepository.save(d);
                }
            });
            driverRepository.findByVehicleNumber("DL-998877").ifPresentOrElse(
                    d -> {
                        if (d.getUserId() == null) {
                            d.setUserId(4L);
                            driverRepository.save(d);
                        }
                    },
                    () -> {
                        Driver dave = Driver.builder()
                                .name("Driver Dave")
                                .phone("+15559876543")
                                .vehicleNumber("DL-998877")
                                .vehicleType("SEDAN")
                                .latitude(37.7749)
                                .longitude(-122.4194)
                                .availability(true)
                                .status(DriverStatus.AVAILABLE)
                                .userId(4L)
                                .build();
                        driverRepository.save(dave);
                    }
            );
        } catch (Exception ignored) {
        }
    }

    public DriverService(final DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }
}
