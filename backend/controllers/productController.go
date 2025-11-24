package controllers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"ecomm-backend/config"
	"ecomm-backend/models"
)


// GET /api/products - Get all products
func GetAllProducts(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var products []models.Product
	cursor, err := config.ProductCollection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &products); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	// If no products exist, seed some mock products
	if len(products) == 0 {
		mockProducts := []models.Product{
			{ProductName: "Wireless Headphones", Price: 299, Category: "Audio", Rating: floatPtr(4.5), Image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"},
			{ProductName: "Smart Watch", Price: 199, Category: "Wearables", Rating: floatPtr(4.8), Image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"},
			{ProductName: "Gaming Monitor", Price: 449, Category: "Electronics", Rating: floatPtr(4.7), Image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400"},
			{ProductName: "Wireless Mouse", Price: 89, Category: "Gaming", Rating: floatPtr(4.6), Image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400"},
			{ProductName: "Bluetooth Speaker", Price: 129, Category: "Audio", Rating: floatPtr(4.5), Image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400"},
			{ProductName: "Mechanical Keyboard", Price: 159, Category: "Gaming", Rating: floatPtr(4.4), Image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400"},
			{ProductName: "USB-C Hub", Price: 79, Category: "Accessories", Rating: floatPtr(4.3), Image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400"},
			{ProductName: "Laptop Stand", Price: 49, Category: "Accessories", Rating: floatPtr(4.2), Image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400"},
		}

		for i := range mockProducts {
			mockProducts[i].ProductID = fmt.Sprintf("product_%d_%s", time.Now().UnixNano(), primitive.NewObjectID().Hex()[:9])
			mockProducts[i].CreatedAt = time.Now()
			mockProducts[i].UpdatedAt = time.Now()
		}

		_, err = config.ProductCollection.InsertMany(ctx, convertToInterfaceSlice(mockProducts))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to seed products"})
			return
		}

		// Fetch again
		cursor, err = config.ProductCollection.Find(ctx, bson.M{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
			return
		}
		defer cursor.Close(ctx)
		if err = cursor.All(ctx, &products); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
			return
		}
	}

	c.JSON(http.StatusOK, products)
}

// GET /api/products/:id
func GetProductById(c *gin.Context) {
	id := c.Param("id")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var product models.Product
	objectID, err := primitive.ObjectIDFromHex(id)
	if err == nil {
		// Try MongoDB ObjectID
		err = config.ProductCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&product)
	} else {
		// Try product_id field
		err = config.ProductCollection.FindOne(ctx, bson.M{"product_id": id}).Decode(&product)
	}

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch product"})
		return
	}

	c.JSON(http.StatusOK, product)
}

// GET /api/products/search?name=query
func SearchProducts(c *gin.Context) {
	query := c.Query("name")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"Error": "Invalid Search Index"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var products []models.Product
	filter := bson.M{
		"product_name": bson.M{"$regex": query, "$options": "i"},
	}

	cursor, err := config.ProductCollection.Find(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search products"})
		return
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &products); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search products"})
		return
	}

	c.JSON(http.StatusOK, products)
}

func floatPtr(f float64) *float64 {
	return &f
}

func convertToInterfaceSlice(products []models.Product) []interface{} {
	result := make([]interface{}, len(products))
	for i, p := range products {
		result[i] = p
	}
	return result
}

