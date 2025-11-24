package utils

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var secretKey = getSecretKey()

func getSecretKey() string {
	key := os.Getenv("SECRET_LOVE")
	if key == "" {
		return "your-secret-key-here"
	}
	return key
}

type Claims struct {
	Email     string `json:"Email"`
	FirstName string `json:"First_Name"`
	LastName  string `json:"Last_Name"`
	UID       string `json:"Uid"`
	jwt.RegisteredClaims
}

type RefreshClaims struct {
	jwt.RegisteredClaims
}

func TokenGenerator(email, firstname, lastname, uid string) (string, string, error) {
	// Access token - 24 hours
	accessClaims := &Claims{
		Email:     email,
		FirstName: firstname,
		LastName:  lastname,
		UID:       uid,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}

	// Refresh token - 7 days
	refreshClaims := &RefreshClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)

	accessTokenString, err := accessToken.SignedString([]byte(secretKey))
	if err != nil {
		return "", "", err
	}

	refreshTokenString, err := refreshToken.SignedString([]byte(secretKey))
	if err != nil {
		return "", "", err
	}

	return accessTokenString, refreshTokenString, nil
}

func ValidateToken(signedToken string) (map[string]interface{}, error) {
	token, err := jwt.ParseWithClaims(signedToken, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		// Check expiration
		if claims.ExpiresAt != nil && claims.ExpiresAt.Time.Before(time.Now()) {
			return nil, errors.New("token is expired")
		}

		return map[string]interface{}{
			"email":      claims.Email,
			"first_name": claims.FirstName,
			"last_name":  claims.LastName,
			"uid":        claims.UID,
		}, nil
	}

	return nil, errors.New("invalid token")
}

func UpdateAllTokens(signedToken, signedRefreshToken, userID string, userCollection *mongo.Collection) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"token":        signedToken,
			"refresh_token": signedRefreshToken,
			"updatedAt":     time.Now(),
		},
	}

	_, err := userCollection.UpdateOne(
		ctx,
		bson.M{"user_id": userID},
		update,
	)

	return err
}

