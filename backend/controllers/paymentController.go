package controllers

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

// POST /api/payment/create-order
func CreatePaymentOrder(c *gin.Context) {
	var req struct {
		Amount  float64 `json:"amount"`
		Items   []interface{} `json:"items"`
		Address interface{} `json:"address"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Generate mock order ID
	orderID := fmt.Sprintf("order_%d_%s", time.Now().UnixNano(), fmt.Sprintf("%x", time.Now().UnixNano())[:9])

	razorpayKey := os.Getenv("RAZORPAY_KEY")
	if razorpayKey == "" {
		razorpayKey = "rzp_test_key"
	}

	c.JSON(http.StatusOK, gin.H{
		"order_id":    orderID,
		"amount":      req.Amount * 100, // Convert to paise
		"currency":    "INR",
		"razorpay_key": razorpayKey,
	})
}

// POST /api/payment/verify
func VerifyPayment(c *gin.Context) {
	var req struct {
		RazorpayOrderID   string `json:"razorpay_order_id"`
		RazorpayPaymentID string `json:"razorpay_payment_id"`
		RazorpaySignature string `json:"razorpay_signature"`
		Items             []interface{} `json:"items"`
		Address           interface{} `json:"address"`
		Total             float64 `json:"total"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Mock verification - always succeeds
	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"message":     "Payment verified successfully",
		"order_id":    req.RazorpayOrderID,
		"payment_id":  req.RazorpayPaymentID,
	})
}

// GET /api/payment/:id
func GetPaymentStatus(c *gin.Context) {
	paymentID := c.Param("id")

	// Mock payment status
	c.JSON(http.StatusOK, gin.H{
		"payment_id": paymentID,
		"status":     "completed",
		"amount":     0,
	})
}

