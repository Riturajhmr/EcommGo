package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Address struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	HouseName  string             `bson:"house_name" json:"house_name"`
	StreetName string             `bson:"street_name" json:"street_name"`
	CityName   string             `bson:"city_name" json:"city_name"`
	PinCode    string             `bson:"pin_code" json:"pin_code"`
}

type ProductUser struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	ProductID  string             `bson:"product_id" json:"product_id"`
	ProductName string            `bson:"product_name" json:"product_name"`
	Price      float64            `bson:"price" json:"price"`
	Rating     *float64           `bson:"rating,omitempty" json:"rating,omitempty"`
	Image      string             `bson:"image,omitempty" json:"image,omitempty"`
	Quantity   int                `bson:"quantity" json:"quantity"`
}

type Payment struct {
	Digital bool `bson:"digital" json:"digital"`
	COD     bool `bson:"cod" json:"cod"`
}

type Order struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	OrderList       []ProductUser      `bson:"order_list" json:"order_list"`
	OrderedOn       time.Time          `bson:"ordered_on" json:"ordered_on"`
	TotalPrice      float64            `bson:"total_price" json:"total_price"`
	Discount        *float64           `bson:"discount,omitempty" json:"discount,omitempty"`
	PaymentMethod   Payment            `bson:"payment_method" json:"payment_method"`
	RazorpayOrderID string             `bson:"razorpay_order_id,omitempty" json:"razorpay_order_id,omitempty"`
	RazorpayPaymentID string            `bson:"razorpay_payment_id,omitempty" json:"razorpay_payment_id,omitempty"`
	Status          string             `bson:"status,omitempty" json:"status,omitempty"`
	DeliveryAddress *Address           `bson:"delivery_address,omitempty" json:"delivery_address,omitempty"`
}

type User struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	FirstName   string             `bson:"first_name" json:"first_name"`
	LastName    string             `bson:"last_name" json:"last_name"`
	Password    string             `bson:"password" json:"-"`
	Email       string             `bson:"email" json:"email"`
	Phone       string             `bson:"phone" json:"phone"`
	Token       string             `bson:"token,omitempty" json:"token,omitempty"`
	RefreshToken string            `bson:"refresh_token,omitempty" json:"refresh_token,omitempty"`
	UserID      string             `bson:"user_id" json:"user_id"`
	UserCart    []ProductUser      `bson:"usercart" json:"usercart"`
	Address     []Address          `bson:"address" json:"address"`
	Orders      []Order            `bson:"orders" json:"orders"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}

