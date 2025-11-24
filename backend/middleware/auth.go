package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"ecomm-backend/utils"
)

func Authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("token")
		if token == "" {
			authHeader := c.GetHeader("Authorization")
			if authHeader != "" {
				parts := strings.Split(authHeader, " ")
				if len(parts) == 2 {
					token = parts[1]
				}
			}
		}

		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No Authorization Header Provided"})
			c.Abort()
			return
		}

		userData, err := utils.ValidateToken(token)
		if err != nil {
			if err.Error() == "token is expired" {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "token is expired"})
			} else {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "The Token is invalid"})
			}
			c.Abort()
			return
		}

		// Set user data in context
		c.Set("user", userData)
		c.Next()
	}
}

