package com.urbanglide.payment.service;

import com.urbanglide.payment.dto.PaymentRequest;
import com.urbanglide.payment.dto.PaymentResponse;
import com.urbanglide.payment.entity.Payment;
import com.urbanglide.payment.entity.PaymentMethod;
import com.urbanglide.payment.entity.PaymentStatus;
import com.urbanglide.payment.exception.DuplicatePaymentException;
import com.urbanglide.payment.exception.InvalidPaymentStateException;
import com.urbanglide.payment.exception.PaymentNotFoundException;
import com.urbanglide.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentService paymentService;

    private Payment testPayment;

    @BeforeEach
    public void setUp() {
        testPayment = Payment.builder()
                .id(1L)
                .rideId(10L)
                .riderId(5L)
                .amount(150.0)
                .paymentMethod(PaymentMethod.CARD)
                .transactionId("TXN12345678")
                .status(PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    public void testProcessPayment_DuplicateRideId_ThrowsException() {
        PaymentRequest request = new PaymentRequest(10L, 5L, java.math.BigDecimal.valueOf(150.0), "CARD");
        when(paymentRepository.existsByRideId(10L)).thenReturn(true);

        assertThrows(DuplicatePaymentException.class, () -> paymentService.processPayment(request));
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    public void testProcessPayment_NewPayment_SavesAndReturnsResponse() {
        PaymentRequest request = new PaymentRequest(20L, 5L, java.math.BigDecimal.valueOf(150.0), "CARD");
        when(paymentRepository.existsByRideId(20L)).thenReturn(false);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> {
            Payment p = i.getArgument(0);
            if (p.getId() == null) p.setId(2L);
            return p;
        });

        PaymentResponse response = paymentService.processPayment(request);

        assertNotNull(response);
        assertEquals(20L, response.getRideId());
        assertEquals(java.math.BigDecimal.valueOf(150.0), response.getAmount());
        assertNotNull(response.getStatus());
        // Status should be either SUCCESS or FAILED based on simulation
        assertTrue(response.getStatus() == PaymentStatus.SUCCESS || response.getStatus() == PaymentStatus.FAILED);
    }

    @Test
    public void testGetPaymentByRideId_Success() {
        testPayment.setStatus(PaymentStatus.SUCCESS);
        when(paymentRepository.findByRideId(10L)).thenReturn(Optional.of(testPayment));

        PaymentResponse response = paymentService.getPaymentByRideId(10L);

        assertNotNull(response);
        assertEquals(10L, response.getRideId());
        assertEquals(PaymentStatus.SUCCESS, response.getStatus());
    }

    @Test
    public void testGetPaymentByRideId_NotFound_ThrowsException() {
        when(paymentRepository.findByRideId(999L)).thenReturn(Optional.empty());

        assertThrows(PaymentNotFoundException.class, () -> paymentService.getPaymentByRideId(999L));
    }

    @Test
    public void testRefundPayment_Success() {
        testPayment.setStatus(PaymentStatus.SUCCESS);
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(testPayment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        PaymentResponse refunded = paymentService.refundPayment(1L);

        assertEquals(PaymentStatus.REFUNDED, refunded.getStatus());
    }

    @Test
    public void testRefundPayment_NonSuccessStatus_ThrowsException() {
        testPayment.setStatus(PaymentStatus.FAILED);
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(testPayment));

        assertThrows(InvalidPaymentStateException.class, () -> paymentService.refundPayment(1L));
        verify(paymentRepository, never()).save(any(Payment.class));
    }
}
