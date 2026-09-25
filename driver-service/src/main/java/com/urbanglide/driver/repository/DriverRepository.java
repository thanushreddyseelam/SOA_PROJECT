package com.urbanglide.driver.repository;

import com.urbanglide.driver.entity.Driver;
import com.urbanglide.driver.entity.DriverStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    List<Driver> findByAvailabilityTrueAndStatus(DriverStatus status);
    Optional<Driver> findByVehicleNumber(String vehicleNumber);
    Optional<Driver> findByUserId(Long userId);
    Optional<Driver> findByName(String name);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE Driver d SET d.status = :busyStatus, d.availability = false WHERE d.id = :driverId AND d.status = :availableStatus AND d.availability = true")
    int reserveDriverIfAvailable(@Param("driverId") Long driverId,
                                @Param("availableStatus") DriverStatus availableStatus,
                                @Param("busyStatus") DriverStatus busyStatus);
}

