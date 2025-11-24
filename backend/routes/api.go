package routes

import (
	"ecomm-backend/controllers"
	"ecomm-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		// Auth routes (public)
		api.POST("/auth/register", controllers.SignUp)
		api.POST("/auth/login", controllers.Login)
		api.POST("/auth/logout", controllers.Logout)

		// Product routes (public)
		api.GET("/products", controllers.GetAllProducts)
		api.GET("/products/:id", controllers.GetProductById)
		api.GET("/products/search", controllers.SearchProducts)

		// Cart routes (protected - require authentication)
		api.GET("/cart", middleware.Authenticate(), controllers.GetCart)
		api.POST("/cart", middleware.Authenticate(), controllers.AddToCart)
		api.PUT("/cart/items/:id", middleware.Authenticate(), controllers.UpdateCartItem)
		api.DELETE("/cart/:id", middleware.Authenticate(), controllers.RemoveFromCart)
		api.DELETE("/cart", middleware.Authenticate(), controllers.ClearCart)

		// Checkout route (protected)
		api.POST("/checkout", middleware.Authenticate(), controllers.Checkout)

		// User routes (protected)
		api.GET("/user/profile", middleware.Authenticate(), controllers.GetProfile)
		api.PUT("/user/profile", middleware.Authenticate(), controllers.UpdateProfile)

		// Address routes (protected)
		api.GET("/address", middleware.Authenticate(), controllers.GetAddresses)
		api.POST("/address", middleware.Authenticate(), controllers.AddAddress)
		api.PUT("/address/:id", middleware.Authenticate(), controllers.UpdateAddress)
		api.DELETE("/address/:id", middleware.Authenticate(), controllers.DeleteAddress)

		// Order routes (protected)
		api.GET("/orders", middleware.Authenticate(), controllers.GetOrders)
		api.GET("/orders/:id", middleware.Authenticate(), controllers.GetOrderById)

		// Payment routes (protected) - Mock endpoints for frontend compatibility
		api.POST("/payment/create-order", middleware.Authenticate(), controllers.CreatePaymentOrder)
		api.POST("/payment/verify", middleware.Authenticate(), controllers.VerifyPayment)
		api.GET("/payment/:id", middleware.Authenticate(), controllers.GetPaymentStatus)
	}
}

