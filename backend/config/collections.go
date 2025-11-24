package config

import "go.mongodb.org/mongo-driver/mongo"

var (
	UserCollection    *mongo.Collection
	ProductCollection *mongo.Collection
)

func InitCollections() {
	if DB != nil {
		UserCollection = DB.Collection("users")
		ProductCollection = DB.Collection("products")
	}
}

