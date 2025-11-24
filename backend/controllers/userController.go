package controllers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"

	"ecomm-backend/config"
	"ecomm-backend/models"
)

// GET /api/user/profile
func GetProfile(c *gin.Context) {
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

	// Don't return password
	user.Password = ""

	c.JSON(http.StatusOK, user)
}

// PUT /api/user/profile
func UpdateProfile(c *gin.Context) {
	userData, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userMap := userData.(map[string]interface{})
	userID := userMap["uid"].(string)

	var req struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
		Phone     string `json:"phone"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{"$set": bson.M{"updatedAt": time.Now()}}
	if req.FirstName != "" {
		update["$set"].(bson.M)["first_name"] = req.FirstName
	}
	if req.LastName != "" {
		update["$set"].(bson.M)["last_name"] = req.LastName
	}
	if req.Email != "" {
		update["$set"].(bson.M)["email"] = strings.ToLower(req.Email)
	}
	if req.Phone != "" {
		update["$set"].(bson.M)["phone"] = req.Phone
	}

	if len(update["$set"].(bson.M)) == 1 { // Only updatedAt
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	_, err := config.UserCollection.UpdateOne(ctx, bson.M{"user_id": userID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}

