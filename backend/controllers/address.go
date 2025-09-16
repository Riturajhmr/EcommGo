package controllers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/Riturajhmr/EcommGo/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func AddAddress() gin.HandlerFunc {
	return func(c *gin.Context) {
		user_id := c.Query("id")
		if user_id == "" {
			c.Header("Content-Type", "application/json")
			c.JSON(http.StatusNotFound, gin.H{"error": "Invalid code"})
			c.Abort()
			return
		}
		address, err := primitive.ObjectIDFromHex(user_id)
		if err != nil {
			c.IndentedJSON(500, "Internal Server Error")
		}
		var addresses models.Address
		addresses.Address_id = primitive.NewObjectID()
		if err = c.BindJSON(&addresses); err != nil {
			c.IndentedJSON(http.StatusNotAcceptable, err.Error())
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)

		match_filter := bson.D{{Key: "$match", Value: bson.D{primitive.E{Key: "_id", Value: address}}}}
		unwind := bson.D{{Key: "$unwind", Value: bson.D{primitive.E{Key: "path", Value: "$address"}}}}
		group := bson.D{{Key: "$group", Value: bson.D{primitive.E{Key: "_id", Value: "$address_id"}, {Key: "count", Value: bson.D{primitive.E{Key: "$sum", Value: 1}}}}}}

		pointcursor, err := UserCollection.Aggregate(ctx, mongo.Pipeline{match_filter, unwind, group})
		if err != nil {
			c.IndentedJSON(500, "Internal Server Error")
		}

		var addressinfo []bson.M
		if err = pointcursor.All(ctx, &addressinfo); err != nil {
			panic(err)
		}

		var size int32
		for _, address_no := range addressinfo {
			count := address_no["count"]
			size = count.(int32)
		}
		if size < 2 {
			filter := bson.D{primitive.E{Key: "_id", Value: address}}
			update := bson.D{{Key: "$push", Value: bson.D{primitive.E{Key: "address", Value: addresses}}}}
			_, err := UserCollection.UpdateOne(ctx, filter, update)
			if err != nil {
				fmt.Println(err)
			}
		} else {
			c.IndentedJSON(400, "Not Allowed ")
		}
		defer cancel()
		ctx.Done()
	}
}

func EditHomeAddress() gin.HandlerFunc {
	return func(c *gin.Context) {
		user_id := c.Query("id")
		if user_id == "" {
			c.Header("Content-Type", "application/json")
			c.JSON(http.StatusNotFound, gin.H{"Error": "Invalid"})
			c.Abort()
			return
		}
		usert_id, err := primitive.ObjectIDFromHex(user_id)
		if err != nil {
			c.IndentedJSON(500, err)
		}
		var editaddress models.Address
		if err := c.BindJSON(&editaddress); err != nil {
			c.IndentedJSON(http.StatusBadRequest, err.Error())
		}
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()
		filter := bson.D{primitive.E{Key: "_id", Value: usert_id}}
		update := bson.D{{Key: "$set", Value: bson.D{primitive.E{Key: "address.0.house_name", Value: editaddress.House}, {Key: "address.0.street_name", Value: editaddress.Street}, {Key: "address.0.city_name", Value: editaddress.City}, {Key: "address.0.pin_code", Value: editaddress.Pincode}}}}
		_, err = UserCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			c.IndentedJSON(500, "Something Went Wrong")
			return
		}
		defer cancel()
		ctx.Done()
		c.IndentedJSON(200, "Successfully Updated the Home address")
	}
}

func EditWorkAddress() gin.HandlerFunc {
	return func(c *gin.Context) {
		user_id := c.Query("id")
		if user_id == "" {
			c.Header("Content-Type", "application/json")
			c.JSON(http.StatusNotFound, gin.H{"Error": "Wrong id not provided"})
			c.Abort()
			return
		}
		usert_id, err := primitive.ObjectIDFromHex(user_id)
		if err != nil {
			c.IndentedJSON(500, err)
		}
		var editaddress models.Address
		if err := c.BindJSON(&editaddress); err != nil {
			c.IndentedJSON(http.StatusBadRequest, err.Error())
		}
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()
		filter := bson.D{primitive.E{Key: "_id", Value: usert_id}}
		update := bson.D{{Key: "$set", Value: bson.D{primitive.E{Key: "address.1.house_name", Value: editaddress.House}, {Key: "address.1.street_name", Value: editaddress.Street}, {Key: "address.1.city_name", Value: editaddress.City}, {Key: "address.1.pin_code", Value: editaddress.Pincode}}}}
		_, err = UserCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			c.IndentedJSON(500, "something Went wrong")
			return
		}
		defer cancel()
		ctx.Done()
		c.IndentedJSON(200, "Successfully updated the Work Address")
	}
}

func DeleteAddress() gin.HandlerFunc {
	return func(c *gin.Context) {
		user_id := c.Query("id")
		if user_id == "" {
			c.Header("Content-Type", "application/json")
			c.JSON(http.StatusNotFound, gin.H{"Error": "Invalid Search Index"})
			c.Abort()
			return
		}
		addresses := make([]models.Address, 0)
		usert_id, err := primitive.ObjectIDFromHex(user_id)
		if err != nil {
			c.IndentedJSON(500, "Internal Server Error")
		}
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()
		filter := bson.D{primitive.E{Key: "_id", Value: usert_id}}
		update := bson.D{{Key: "$set", Value: bson.D{primitive.E{Key: "address", Value: addresses}}}}
		_, err = UserCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			c.IndentedJSON(404, "Wromg")
			return
		}
		defer cancel()
		ctx.Done()
		c.IndentedJSON(200, "Successfully Deleted!")
	}
}

// Modern Address Controllers with JWT Authentication

func GetAddressesModern() gin.HandlerFunc {
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

		// Get user with addresses
		var user models.User
		err = UserCollection.FindOne(ctx, bson.M{"_id": userObjectID}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user addresses"})
			return
		}

		// Return addresses
		addresses := user.Address_Details
		if addresses == nil {
			addresses = []models.Address{}
		}

		c.JSON(http.StatusOK, gin.H{
			"addresses": addresses,
			"count":     len(addresses),
		})
	}
}

func AddAddressModern() gin.HandlerFunc {
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

		var address models.Address
		if err := c.ShouldBindJSON(&address); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		// Generate new address ID
		address.Address_id = primitive.NewObjectID()

		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Add address to user
		filter := bson.M{"_id": userObjectID}
		update := bson.M{"$push": bson.M{"address": address}}

		_, err = UserCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add address"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Address added successfully",
			"address": address,
		})
	}
}

func UpdateAddressModern() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from JWT token via middleware
		userID := c.GetString("uid")
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		// Get address ID from URL parameter
		addressID := c.Param("id")
		if addressID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Address ID is required"})
			return
		}

		addressObjectID, err := primitive.ObjectIDFromHex(addressID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid address ID format"})
			return
		}

		var address models.Address
		if err := c.ShouldBindJSON(&address); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Update specific address
		userObjectID, _ := primitive.ObjectIDFromHex(userID)
		filter := bson.M{"_id": userObjectID, "address._id": addressObjectID}
		update := bson.M{"$set": bson.M{
			"address.$.house_name":  address.House,
			"address.$.street_name": address.Street,
			"address.$.city_name":   address.City,
			"address.$.pin_code":    address.Pincode,
		}}

		result, err := UserCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update address"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Address not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Address updated successfully",
			"address": address,
		})
	}
}

func DeleteAddressModern() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from JWT token via middleware
		userID := c.GetString("uid")
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		// Get address ID from URL parameter
		addressID := c.Param("id")
		if addressID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Address ID is required"})
			return
		}

		addressObjectID, err := primitive.ObjectIDFromHex(addressID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid address ID format"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Remove specific address
		userObjectID, _ := primitive.ObjectIDFromHex(userID)
		filter := bson.M{"_id": userObjectID}
		update := bson.M{"$pull": bson.M{"address": bson.M{"_id": addressObjectID}}}

		result, err := UserCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete address"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Address deleted successfully",
		})
	}
}
