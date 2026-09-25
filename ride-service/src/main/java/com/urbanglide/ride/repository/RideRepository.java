package com.urbanglide.ride.repository;

import com.urbanglide.ride.entity.Ride;
import com.urbanglide.ride.entity.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByRiderId(Long riderId);
    List<Ride> findByDriverId(Long driverId);
    List<Ride> findByStatus(RideStatus status);
    java.util.Optional<Ride> findTopByRiderIdAndStatusOrderByIdDesc(Long riderId, RideStatus status);
}

