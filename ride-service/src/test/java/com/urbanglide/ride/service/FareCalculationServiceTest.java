package com.urbanglide.ride.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

public class FareCalculationServiceTest {

    private FareCalculationService fareCalculationService;

    @BeforeEach
    public void setUp() {
        fareCalculationService = new FareCalculationService();
    }

    @Test
    public void testDistanceCalculation_ZeroDistance() {
        double dist = fareCalculationService.calculateDistance(16.5062, 80.6480, 16.5062, 80.6480);
        assertEquals(0.0, dist, 0.001);
    }

    @Test
    public void testDistanceCalculation_PositiveDistance() {
        // Distance between two points in Vijayawada (~2-3 km)
        double dist = fareCalculationService.calculateDistance(16.5062, 80.6480, 16.5193, 80.6305);
        assertTrue(dist > 1.0 && dist < 5.0, "Calculated distance should be reasonable");
    }

    @Test
    public void testFareCalculation_ZeroDistance_ShouldBeBasePlusTimeCharge() {
        // Fare = BASE_FARE (50) + (0 * 15) + TIME_CHARGE (30) = 80.00
        BigDecimal fare = fareCalculationService.calculateFare(16.5062, 80.6480, 16.5062, 80.6480);
        assertEquals(new BigDecimal("80.00"), fare);
    }

    @Test
    public void testFareCalculation_PositiveDistance() {
        BigDecimal fare = fareCalculationService.calculateFare(16.5062, 80.6480, 16.5193, 80.6305);
        // Base (50) + Time (30) = 80, distance charge > 0 -> fare must be > 80.0
        assertTrue(fare.compareTo(new BigDecimal("80.00")) > 0, "Fare must include distance charges");
    }
}
