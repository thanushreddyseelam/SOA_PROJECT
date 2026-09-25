package com.urbanglide.driver.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class HaversineUtilTest {

    @Test
    public void testDistanceBetweenSamePointsIsZero() {
        double lat = 16.5062;
        double lon = 80.6480;
        double distance = HaversineUtil.calculateDistance(lat, lon, lat, lon);
        assertEquals(0.0, distance, 0.001, "Distance between identical points should be 0");
    }

    @Test
    public void testDistanceSymmetry() {
        // Point A: Benz Circle, Vijayawada
        double lat1 = 16.5062;
        double lon1 = 80.6480;
        // Point B: PVP Mall, Vijayawada
        double lat2 = 16.5193;
        double lon2 = 80.6305;

        double distAB = HaversineUtil.calculateDistance(lat1, lon1, lat2, lon2);
        double distBA = HaversineUtil.calculateDistance(lat2, lon2, lat1, lon1);

        assertTrue(distAB > 0, "Distance between distinct points should be positive");
        assertEquals(distAB, distBA, 0.001, "Distance A->B should equal distance B->A");
    }

    @Test
    public void testKnownDistanceAccuracy() {
        // Benz Circle to Vijayawada Railway Station (~4-5 km)
        double lat1 = 16.5062;
        double lon1 = 80.6480;
        double lat2 = 16.5175;
        double lon2 = 80.6200;

        double distance = HaversineUtil.calculateDistance(lat1, lon1, lat2, lon2);
        assertTrue(distance >= 2.0 && distance <= 6.0, 
                "Distance should be approximately 3-4 km, got: " + distance);
    }
}
