package controllers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"

	"ecomm-backend/config"
	"ecomm-backend/models"
	"ecomm-backend/utils"
)


// POST /api/auth/register
func SignUp(c *gin.Context) {
	var req struct {
		FirstName string `json:"first_name" binding:"required"`
		LastName  string `json:"last_name" binding:"required"`
		Email     string `json:"email" binding:"required"`
		Password  string `json:"password" binding:"required"`
		Phone     string `json:"phone" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "All fields are required"})
		return
	}

	// Validation
	if len(req.FirstName) < 2 || len(req.FirstName) > 30 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "First name must be between 2 and 30 characters"})
		return
	}

	if len(req.LastName) < 2 || len(req.LastName) > 30 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Last name must be between 2 and 30 characters"})
		return
	}

	if len(req.Password) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password must be at least 6 characters"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if user exists
	emailLower := strings.ToLower(req.Email)
	var existingUser models.User
	err := config.UserCollection.FindOne(ctx, bson.M{"email": emailLower}).Decode(&existingUser)
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User already exists"})
		return
	}

	// Check phone
	err = config.UserCollection.FindOne(ctx, bson.M{"phone": req.Phone}).Decode(&existingUser)
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Phone is already in use"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 14)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create user
	userID := primitive.NewObjectID().Hex()
	token, refreshToken, err := utils.TokenGenerator(emailLower, req.FirstName, req.LastName, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	user := models.User{
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Email:        emailLower,
		Password:     string(hashedPassword),
		Phone:        req.Phone,
		Token:        token,
		RefreshToken: refreshToken,
		UserID:       userID,
		UserCart:     []models.ProductUser{},
		Address:      []models.Address{},
		Orders:       []models.Order{},
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	_, err = config.UserCollection.InsertOne(ctx, user)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email or phone is already in use"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Successfully Signed Up!!"})
}

// POST /api/auth/login
func Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email and password are required"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := config.UserCollection.FindOne(ctx, bson.M{"email": strings.ToLower(req.Email)}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "login or password incorrect"})
		return
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Login Or Password is Incorrect"})
		return
	}

	// Generate new tokens
	token, refreshToken, err := utils.TokenGenerator(user.Email, user.FirstName, user.LastName, user.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Update tokens in database
	err = utils.UpdateAllTokens(token, refreshToken, user.UserID, config.UserCollection)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update tokens"})
		return
	}

	// Return user data (without password)
	user.Password = ""
	user.Token = token
	user.RefreshToken = refreshToken

	c.JSON(http.StatusOK, user)
}

// POST /api/auth/logout
func Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

