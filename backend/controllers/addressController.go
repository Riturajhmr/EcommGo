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

// GET /api/address
func GetAddresses(c *gin.Context) {
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

	c.JSON(http.StatusOK, gin.H{"addresses": user.Address})
}

// POST /api/address
func AddAddress(c *gin.Context) {
	userData, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userMap := userData.(map[string]interface{})
	userID := userMap["uid"].(string)

	var req struct {
		HouseName  string `json:"house_name" binding:"required"`
		StreetName string `json:"street_name" binding:"required"`
		CityName   string `json:"city_name" binding:"required"`
		PinCode    string `json:"pin_code" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "All address fields are required"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	newAddress := models.Address{
		ID:         primitive.NewObjectID(),
		HouseName:  req.HouseName,
		StreetName: req.StreetName,
		CityName:   req.CityName,
		PinCode:    req.PinCode,
	}

	update := bson.M{
		"$push": bson.M{"address": newAddress},
		"$set":  bson.M{"updatedAt": time.Now()},
	}

	_, err := config.UserCollection.UpdateOne(ctx, bson.M{"user_id": userID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add address"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Address added successfully", "address": newAddress})
}

// PUT /api/address/:id
func UpdateAddress(c *gin.Context) {
	userData, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userMap := userData.(map[string]interface{})
	userID := userMap["uid"].(string)
	addressID := c.Param("id")

	var req struct {
		HouseName  string `json:"house_name"`
		StreetName string `json:"street_name"`
		CityName   string `json:"city_name"`
		PinCode    string `json:"pin_code"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
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

	// Find address index
	addressIndex := -1
	for i, addr := range user.Address {
		if addr.ID.Hex() == addressID {
			addressIndex = i
			break
		}
	}

	if addressIndex == -1 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Address not found"})
		return
	}

	// Update address fields
	if req.HouseName != "" {
		user.Address[addressIndex].HouseName = req.HouseName
	}
	if req.StreetName != "" {
		user.Address[addressIndex].StreetName = req.StreetName
	}
	if req.CityName != "" {
		user.Address[addressIndex].CityName = req.CityName
	}
	if req.PinCode != "" {
		user.Address[addressIndex].PinCode = req.PinCode
	}

	update := bson.M{
		"$set": bson.M{
			"address":   user.Address,
			"updatedAt": time.Now(),
		},
	}

	_, err = config.UserCollection.UpdateOne(ctx, bson.M{"user_id": userID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update address"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Address updated successfully"})
}

// DELETE /api/address/:id
func DeleteAddress(c *gin.Context) {
	userData, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userMap := userData.(map[string]interface{})
	userID := userMap["uid"].(string)
	addressID := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := config.UserCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Filter out the address
	filteredAddresses := []models.Address{}
	for _, addr := range user.Address {
		if addr.ID.Hex() != addressID {
			filteredAddresses = append(filteredAddresses, addr)
		}
	}

	update := bson.M{
		"$set": bson.M{
			"address":   filteredAddresses,
			"updatedAt": time.Now(),
		},
	}

	_, err = config.UserCollection.UpdateOne(ctx, bson.M{"user_id": userID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete address"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Address deleted successfully"})
}
