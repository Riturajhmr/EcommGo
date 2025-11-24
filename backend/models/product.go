package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Product struct {
	ID                 primitive.ObjectID      `bson:"_id,omitempty" json:"_id,omitempty"`
	ProductID          string                  `bson:"product_id,omitempty" json:"product_id,omitempty"`
	ProductName        string                  `bson:"product_name" json:"product_name"`
	Price              float64                 `bson:"price" json:"price"`
	Category           string                  `bson:"category,omitempty" json:"category,omitempty"`
	Rating             *float64                `bson:"rating,omitempty" json:"rating,omitempty"`
	Feature            string                  `bson:"feature,omitempty" json:"feature,omitempty"`
	Description        string                  `bson:"description,omitempty" json:"description,omitempty"`
	DetailedDescription string                 `bson:"detailed_description,omitempty" json:"detailed_description,omitempty"`
	Specifications     map[string]string       `bson:"specifications,omitempty" json:"specifications,omitempty"`
	Image              string                  `bson:"image,omitempty" json:"image,omitempty"`
	Images             []string                `bson:"images,omitempty" json:"images,omitempty"`
	Stock              *int                    `bson:"stock,omitempty" json:"stock,omitempty"`
	Tags               []string                `bson:"tags,omitempty" json:"tags,omitempty"`
	CreatedAt          time.Time               `bson:"createdAt" json:"createdAt"`
	UpdatedAt          time.Time               `bson:"updatedAt" json:"updatedAt"`
}

