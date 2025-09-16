package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Product struct {
	ProductID string  `bson:"Product_ID,omitempty"`
	Name      string  `bson:"product_name"`
	Price     float64 `bson:"price"`
	Rating    int     `bson:"rating"`
	Image     string  `bson:"image"`
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}
	defer func() { _ = client.Disconnect(context.Background()) }()

	db := client.Database("ecomm")
	col := db.Collection("Products")

	products := []interface{}{
		Product{Name: "Alienware x15", Price: 2500, Rating: 10, Image: "https://via.placeholder.com/400x300?text=Alienware"},
		Product{Name: "Ginger Ale", Price: 300, Rating: 8, Image: "https://via.placeholder.com/400x300?text=Ginger+Ale"},
		Product{Name: "iPhone 13", Price: 1700, Rating: 9, Image: "https://via.placeholder.com/400x300?text=iPhone+13"},
	}

	// Upsert by name to avoid duplicates if run multiple times
	insertedOrUpdated := 0
	for _, p := range products {
		prod := p.(Product)
		filter := bson.M{"product_name": prod.Name}
		update := bson.M{"$set": prod}
		opt := options.Update().SetUpsert(true)
		res, err := col.UpdateOne(context.Background(), filter, update, opt)
		if err != nil {
			log.Fatalf("seed error for %s: %v", prod.Name, err)
		}
		if res.UpsertedCount > 0 || res.ModifiedCount > 0 || res.MatchedCount > 0 {
			insertedOrUpdated++
		}
	}

	count, _ := col.CountDocuments(context.Background(), bson.D{})
	fmt.Printf("Seed completed. Affected: %d. Total products now: %d\n", insertedOrUpdated, count)
}
