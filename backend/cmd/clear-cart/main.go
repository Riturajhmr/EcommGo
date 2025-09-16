package main

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Connect to MongoDB
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(context.Background())

	// Get collections
	userCollection := client.Database("ecomm").Collection("Users")

	// Clear all user carts
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Update all users to have empty carts
	filter := bson.M{}
	update := bson.M{"$set": bson.M{"usercart": []interface{}{}}}

	result, err := userCollection.UpdateMany(ctx, filter, update)
	if err != nil {
		log.Fatal("Error clearing carts:", err)
	}

	log.Printf("Successfully cleared carts for %d users", result.ModifiedCount)
}
