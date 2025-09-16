package controllers

import (
	"context"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/Riturajhmr/EcommGo/database"
	"github.com/Riturajhmr/EcommGo/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Application struct {
	prodCollection *mongo.Collection
	userCollection *mongo.Collection
}

func NewApplication(prodCollection, userCollection *mongo.Collection) *Application {
	return &Application{
		prodCollection: prodCollection,
		userCollection: userCollection,
	}
}

func (app *Application) AddToCart() gin.HandlerFunc {
	return func(c *gin.Context) {
		productQueryID := c.Query("id")
		if productQueryID == "" {
			log.Println("product id is empty")
			_ = c.AbortWithError(http.StatusBadRequest, errors.New("product id is empty"))
			return
		}
		userQueryID := c.Query("userID")
		if userQueryID == "" {
			log.Println("user id is empty")
			_ = c.AbortWithError(http.StatusBadRequest, errors.New("user id is empty"))
			return
		}
		productID, err := primitive.ObjectIDFromHex(productQueryID)
		if err != nil {
			log.Println(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		var ctx, cancel = context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		// Default quantity for legacy endpoint
		err = database.AddProductToCart(ctx, app.prodCollection, app.userCollection, productID, userQueryID, 1)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, err)
		}
		c.IndentedJSON(200, "Successfully Added to the cart")
	}
}

func (app *Application) RemoveItem() gin.HandlerFunc {
	return func(c *gin.Context) {
		productQueryID := c.Query("id")
		if productQueryID == "" {
			log.Println("product id is inavalid")
			_ = c.AbortWithError(http.StatusBadRequest, errors.New("product id is empty"))
			return
		}

		userQueryID := c.Query("userID")
		if userQueryID == "" {
			log.Println("user id is empty")
			_ = c.AbortWithError(http.StatusBadRequest, errors.New("UserID is empty"))
		}

		ProductID, err := primitive.ObjectIDFromHex(productQueryID)
		if err != nil {
			log.Println(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		err = database.RemoveCartItem(ctx, app.prodCollection, app.userCollection, ProductID, userQueryID)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, err)
			return
		}
		c.IndentedJSON(200, "Successfully removed from cart")
	}
}

func GetItemFromCart() gin.HandlerFunc {
	return func(c *gin.Context) {
		user_id := c.Query("id")
		if user_id == "" {
			c.Header("Content-Type", "application/json")
			c.JSON(http.StatusNotFound, gin.H{"error": "invalid id"})
			c.Abort()
			return
		}

		usert_id, _ := primitive.ObjectIDFromHex(user_id)

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var filledcart models.User
		err := UserCollection.FindOne(ctx, bson.D{primitive.E{Key: "_id", Value: usert_id}}).Decode(&filledcart)
		if err != nil {
			log.Println(err)
			c.IndentedJSON(500, "not id found")
			return
		}

		filter_match := bson.D{{Key: "$match", Value: bson.D{primitive.E{Key: "_id", Value: usert_id}}}}
		unwind := bson.D{{Key: "$unwind", Value: bson.D{primitive.E{Key: "path", Value: "$usercart"}}}}
		grouping := bson.D{{Key: "$group", Value: bson.D{primitive.E{Key: "_id", Value: "$_id"}, {Key: "total", Value: bson.D{primitive.E{Key: "$sum", Value: "$usercart.price"}}}}}}
		pointcursor, err := UserCollection.Aggregate(ctx, mongo.Pipeline{filter_match, unwind, grouping})
		if err != nil {
			log.Println(err)
		}
		var listing []bson.M
		if err = pointcursor.All(ctx, &listing); err != nil {
			log.Println(err)
			c.AbortWithStatus(http.StatusInternalServerError)
		}
		for _, json := range listing {
			c.IndentedJSON(200, json["total"])
			c.IndentedJSON(200, filledcart.UserCart)
		}
		ctx.Done()
	}
}

func (app *Application) BuyFromCart() gin.HandlerFunc {
	return func(c *gin.Context) {
		userQueryID := c.Query("id")
		if userQueryID == "" {
			log.Panicln("user id is empty")
			_ = c.AbortWithError(http.StatusBadRequest, errors.New("UserID is empty"))
		}
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()
		err := database.BuyItemFromCart(ctx, app.userCollection, userQueryID)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, err)
		}
		c.IndentedJSON(200, "Successfully Placed the order")
	}
}

func (app *Application) InstantBuy() gin.HandlerFunc {
	return func(c *gin.Context) {
		UserQueryID := c.Query("userid")
		if UserQueryID == "" {
			log.Println("UserID is empty")
			_ = c.AbortWithError(http.StatusBadRequest, errors.New("UserID is empty"))
		}
		ProductQueryID := c.Query("pid")
		if ProductQueryID == "" {
			log.Println("Product_ID id is empty")
			_ = c.AbortWithError(http.StatusBadRequest, errors.New("product_id is empty"))
		}
		productID, err := primitive.ObjectIDFromHex(ProductQueryID)
		if err != nil {
			log.Println(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		err = database.InstantBuyer(ctx, app.prodCollection, app.userCollection, productID, UserQueryID)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, err)
		}
		c.IndentedJSON(200, "Successully placed the order")
	}
}

// Modern cart functions that work with authentication middleware

func (app *Application) AddToCartModern() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from JWT token via middleware
		userID := c.GetString("uid")
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		var payload struct {
			ProductID string `json:"product_id" binding:"required"`
			Quantity  int    `json:"quantity"`
		}

		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		if payload.Quantity <= 0 {
			payload.Quantity = 1
		}

		productID, err := primitive.ObjectIDFromHex(payload.ProductID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		err = database.AddProductToCart(ctx, app.prodCollection, app.userCollection, productID, userID, payload.Quantity)
		if err != nil {
			log.Println("Error adding to cart:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add product to cart"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Successfully added to cart"})
	}
}

func (app *Application) RemoveFromCartModern() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from JWT token via middleware
		userID := c.GetString("uid")
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		productID := c.Param("id")
		if productID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Product ID is required"})
			return
		}

		productObjectID, err := primitive.ObjectIDFromHex(productID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID format"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		err = database.RemoveCartItem(ctx, app.prodCollection, app.userCollection, productObjectID, userID)
		if err != nil {
			log.Println("Error removing from cart:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove product from cart"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Successfully removed from cart"})
	}
}

func (app *Application) GetCartModern() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from JWT token via middleware
		userID := c.GetString("uid")
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		userObjectID, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Get the user's cart from the database
		var user models.User
		err = app.userCollection.FindOne(ctx, bson.D{primitive.E{Key: "_id", Value: userObjectID}}).Decode(&user)
		if err != nil {
			log.Println("Error getting user cart:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user cart"})
			return
		}

		// Return the user's cart items
		c.JSON(http.StatusOK, gin.H{
			"items":       user.UserCart,
			"user_id":     userID,
			"total_items": len(user.UserCart),
		})
	}
}

func (app *Application) ClearCartModern() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from JWT token via middleware
		userID := c.GetString("uid")
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		userObjectID, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		// Clear the user's cart
		filter := bson.D{primitive.E{Key: "_id", Value: userObjectID}}
		update := bson.D{{Key: "$set", Value: bson.D{primitive.E{Key: "usercart", Value: []models.ProductUser{}}}}}

		_, err = app.userCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			log.Println("Error clearing cart:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Cart cleared successfully"})
	}
}

func (app *Application) CheckoutModern() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from JWT token via middleware
		userID := c.GetString("uid")
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Get the user's cart
		var user models.User
		userObjectID, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
			return
		}

		err = app.userCollection.FindOne(ctx, bson.M{"_id": userObjectID}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user cart"})
			return
		}

		if len(user.UserCart) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
			return
		}

		// Process the order
		err = database.BuyItemFromCart(ctx, app.userCollection, userID)
		if err != nil {
			log.Println("Error processing checkout:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process checkout"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":      "Order placed successfully",
			"order_id":     primitive.NewObjectID(),
			"total_items":  len(user.UserCart),
			"total_amount": calculateTotal(user.UserCart),
		})
	}
}

func calculateTotal(cart []models.ProductUser) int {
	total := 0
	for _, item := range cart {
		total += item.Price * item.Quantity
	}
	return total
}

func (app *Application) InstantBuyModern() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from JWT token via middleware
		userID := c.GetString("uid")
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		var payload struct {
			ProductID string `json:"product_id" binding:"required"`
			Quantity  int    `json:"quantity"`
		}

		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		if payload.Quantity <= 0 {
			payload.Quantity = 1
		}

		productID, err := primitive.ObjectIDFromHex(payload.ProductID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID format"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		// Process the instant buy
		err = database.InstantBuyer(ctx, app.prodCollection, app.userCollection, productID, userID)
		if err != nil {
			log.Println("Error processing instant buy:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process instant buy"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":    "Order placed successfully",
			"order_id":   primitive.NewObjectID(),
			"product_id": payload.ProductID,
			"quantity":   payload.Quantity,
		})
	}
}
