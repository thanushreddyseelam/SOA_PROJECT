package com.urbanglide.ride.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class FareCalculationService {

    private static final double BASE_FARE = 50.0;
    private static final double PER_KM_CHARGE = 15.0;
    private static final double TIME_CHARGE = 30.0;
    private static final int EARTH_RADIUS_KM = 6371;

    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    public BigDecimal calculateFare(double pickupLat, double pickupLng, double destLat, double destLng) {
        double distance = calculateDistance(pickupLat, pickupLng, destLat, destLng);
        double fare = BASE_FARE + (distance * PER_KM_CHARGE) + TIME_CHARGE;
        return BigDecimal.valueOf(fare)
                .setScale(2, RoundingMode.HALF_UP);
    }
}
