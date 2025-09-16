package main

import (
	"log"
	"os"

	"github.com/Riturajhmr/EcommGo/controllers"
	"github.com/Riturajhmr/EcommGo/database"
	"github.com/Riturajhmr/EcommGo/middleware"
	"github.com/Riturajhmr/EcommGo/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from dev.env if present
	_ = godotenv.Load("dev.env")
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	app := controllers.NewApplication(database.ProductData(database.Client, "Products"), database.UserData(database.Client, "Users"))

	router := gin.New()
	router.Use(gin.Logger())

	// Add CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, token")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// API routes
	api := router.Group("/api")
	{
		// Auth routes
		api.POST("/auth/register", controllers.SignUp())
		api.POST("/auth/login", controllers.Login())
		api.POST("/auth/logout", controllers.Logout())

		// Product routes
		api.GET("/products", controllers.GetAllProducts())
		api.GET("/products/:id", controllers.GetProductById())
		api.GET("/products/category/:category", controllers.GetProductsByCategory())
		api.GET("/products/search", controllers.SearchProductByQuery())

		// Cart routes (protected)
		api.GET("/cart", middleware.Authentication(), app.GetCartModern())
		api.POST("/cart/add", middleware.Authentication(), app.AddToCartModern())
		api.PUT("/cart/items/:id", middleware.Authentication(), controllers.UpdateCartItem())
		api.DELETE("/cart/items/:id", middleware.Authentication(), app.RemoveFromCartModern())
		api.DELETE("/cart", middleware.Authentication(), app.ClearCartModern())
		api.POST("/cart/instantbuy", middleware.Authentication(), app.InstantBuyModern())

		// Order routes (protected)
		api.POST("/orders", middleware.Authentication(), app.CheckoutModern())
		api.GET("/orders", middleware.Authentication(), controllers.GetOrders())
		api.GET("/orders/:id", middleware.Authentication(), controllers.GetOrderById())

		// User routes (protected)
		api.GET("/user/profile", middleware.Authentication(), controllers.GetUserProfile())
		api.PUT("/user/profile", middleware.Authentication(), controllers.UpdateUserProfile())

		// Address routes (protected)
		api.GET("/address", middleware.Authentication(), controllers.GetAddressesModern())
		api.POST("/address", middleware.Authentication(), controllers.AddAddressModern())
		api.PUT("/address/:id", middleware.Authentication(), controllers.UpdateAddressModern())
		api.DELETE("/address/:id", middleware.Authentication(), controllers.DeleteAddressModern())
	}

	// Legacy routes for backward compatibility
	routes.UserRoutes(router)
	router.Use(middleware.Authentication())
	router.GET("/addtocart", app.AddToCart())
	router.GET("/removeitem", app.RemoveItem())
	router.GET("/listcart", controllers.GetItemFromCart())
	router.POST("/addaddress", controllers.AddAddress())
	router.PUT("/edithomeaddress", controllers.EditHomeAddress())
	router.PUT("/editworkaddress", controllers.EditWorkAddress())
	router.GET("/deleteaddresses", controllers.DeleteAddress())
	router.GET("/cartcheckout", app.BuyFromCart())
	router.GET("/instantbuy", app.InstantBuy())

	log.Printf("Server starting on port %s", port)
	log.Fatal(router.Run(":" + port))
}
