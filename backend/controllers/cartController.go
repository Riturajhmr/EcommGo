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

// POST /api/cart - Add item to cart
func AddToCart(c *gin.Context) {
	userData, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userMap := userData.(map[string]interface{})
	userID := userMap["uid"].(string)

	var req struct {
		ProductID string `json:"productId" binding:"required"`
		Qty       int    `json:"qty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "productId is required"})
		return
	}

	quantity := req.Qty
	if quantity == 0 {
		quantity = 1
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find product
	var product models.Product
	objectID, err := primitive.ObjectIDFromHex(req.ProductID)
	if err == nil {
		err = config.ProductCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&product)
	}
	if err != nil || product.ID.IsZero() {
		err = config.ProductCollection.FindOne(ctx, bson.M{"product_id": req.ProductID}).Decode(&product)
	}
	if err != nil || product.ID.IsZero() {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// Find user
	var user models.User
	err = config.UserCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Check if product already in cart
	existingItemIndex := -1
	for i, item := range user.UserCart {
		itemProductID := item.ProductID
		if itemProductID == product.ProductID || itemProductID == product.ID.Hex() ||
			item.ID.Hex() == product.ID.Hex() {
			existingItemIndex = i
			break
		}
	}

	if existingItemIndex >= 0 {
		// Update quantity
		user.UserCart[existingItemIndex].Quantity += quantity
	} else {
		// Add new item
		user.UserCart = append(user.UserCart, models.ProductUser{
			ProductID:   product.ProductID,
			ProductName: product.ProductName,
			Price:       product.Price,
			Rating:      product.Rating,
			Image:       product.Image,
			Quantity:    quantity,
		})
	}

	update := bson.M{"$set": bson.M{"usercart": user.UserCart, "updatedAt": time.Now()}}
	_, err = config.UserCollection.UpdateOne(ctx, bson.M{"user_id": userID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add product to cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Successfully added to cart"})
}

// DELETE /api/cart/:id - Remove item from cart
func RemoveFromCart(c *gin.Context) {
	userData, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userMap := userData.(map[string]interface{})
	userID := userMap["uid"].(string)
	productID := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := config.UserCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Remove item from cart
	filteredCart := []models.ProductUser{}
	for _, item := range user.UserCart {
		itemID := item.ID.Hex()
		itemProductID := item.ProductID
		if itemID != productID && itemProductID != productID {
			filteredCart = append(filteredCart, item)
		}
	}

	update := bson.M{"$set": bson.M{"usercart": filteredCart, "updatedAt": time.Now()}}
	_, err = config.UserCollection.UpdateOne(ctx, bson.M{"user_id": userID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove product from cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Successfully removed from cart"})
}

// GET /api/cart - Get cart with total
func GetCart(c *gin.Context) {
	userData, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userMap := userData.(map[string]interface{})
	userID := userMap["uid"].(string)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := config.UserCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Calculate total
	total := 0.0
	for _, item := range user.UserCart {
		total += item.Price * float64(item.Quantity)
	}

	c.JSON(http.StatusOK, gin.H{
		"items": user.UserCart,
		"total": total,
	})
}

// PUT /api/cart/items/:id - Update cart item quantity
func UpdateCartItem(c *gin.Context) {
	userData, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userMap := userData.(map[string]interface{})
	userID := userMap["uid"].(string)
	itemID := c.Param("id")

	var req struct {
		Quantity int `json:"quantity" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil || req.Quantity < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Quantity must be at least 1"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := config.UserCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Find and update item
	itemIndex := -1
	for i, item := range user.UserCart {
		if item.ID.Hex() == itemID {
			itemIndex = i
			break
		}
	}

	if itemIndex == -1 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	}

	user.UserCart[itemIndex].Quantity = req.Quantity

	update := bson.M{"$set": bson.M{"usercart": user.UserCart, "updatedAt": time.Now()}}
	_, err = config.UserCollection.UpdateOne(ctx, bson.M{"user_id": userID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart item updated successfully"})
}

// DELETE /api/cart - Clear entire cart
func ClearCart(c *gin.Context) {
	userData, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userMap := userData.(map[string]interface{})
	userID := userMap["uid"].(string)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{"$set": bson.M{"usercart": []models.ProductUser{}, "updatedAt": time.Now()}}
	_, err := config.UserCollection.UpdateOne(ctx, bson.M{"user_id": userID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart cleared successfully"})
}
