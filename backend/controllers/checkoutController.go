package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"ecomm-backend/config"
	"ecomm-backend/models"
)

// POST /api/checkout - Mock checkout with receipt
func Checkout(c *gin.Context) {
	userData, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userMap := userData.(map[string]interface{})
	userID := userMap["uid"].(string)

	var req struct {
		CartItems []models.ProductUser `json:"cartItems"`
	}

	c.ShouldBindJSON(&req)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := config.UserCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Use cartItems from body if provided, otherwise use user's cart
	itemsToCheckout := req.CartItems
	if len(itemsToCheckout) == 0 {
		itemsToCheckout = user.UserCart
	}

	if len(itemsToCheckout) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
		return
	}

	// Calculate total
	total := 0.0
	for _, item := range itemsToCheckout {
		qty := item.Quantity
		if qty == 0 {
			qty = 1
		}
		total += item.Price * float64(qty)
	}

	// Create order
	order := models.Order{
		ID:        primitive.NewObjectID(),
		OrderList: itemsToCheckout,
		OrderedOn: time.Now(),
		TotalPrice: total,
		PaymentMethod: models.Payment{
			Digital: false,
			COD:     true,
		},
		Status: "completed",
	}

	// Add order to user's orders and clear cart
	update := bson.M{
		"$push": bson.M{"orders": order},
		"$set": bson.M{
			"usercart":  []models.ProductUser{},
			"updatedAt": time.Now(),
		},
	}

	_, err = config.UserCollection.UpdateOne(ctx, bson.M{"user_id": userID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process checkout"})
		return
	}

	// Return mock receipt
	receipt := gin.H{
		"total":     total,
		"timestamp": time.Now().Format(time.RFC3339),
		"order_id":  order.ID.Hex(),
		"items":     len(itemsToCheckout),
	}

	c.JSON(http.StatusOK, receipt)
}

