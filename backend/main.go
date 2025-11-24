package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"ecomm-backend/config"
	"ecomm-backend/routes"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		// .env file is optional
		fmt.Println("No .env file found, using environment variables")
	}

	// Connect to MongoDB
	if err := config.ConnectDB(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Setup Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "token"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Logging middleware
	router.Use(func(c *gin.Context) {
		fmt.Printf("%s %s\n", c.Request.Method, c.Request.URL.Path)
		c.Next()
	})

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "OK",
			"message": "Server is running",
		})
	})

	// API Routes
	routes.SetupRoutes(router)

	// Error handling middleware
	router.Use(func(c *gin.Context) {
		c.Next()
		if len(c.Errors) > 0 {
			c.JSON(500, gin.H{
				"error": c.Errors.Last().Error(),
			})
		}
	})

	// 404 handler
	router.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"error": "Route not found"})
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on port %s\n", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

