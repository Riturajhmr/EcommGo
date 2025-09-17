package database

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/Riturajhmr/EcommGo/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	ErrCantFindProduct    = errors.New("can't find product")
	ErrCantDecodeProducts = errors.New("can't find product")
	ErrUserIDIsNotValid   = errors.New("user is not valid")
	ErrCantUpdateUser     = errors.New("cannot add product to cart")
	ErrCantRemoveItem     = errors.New("cannot remove item from cart")
	ErrCantGetItem        = errors.New("cannot get item from cart ")
	ErrCantBuyCartItem    = errors.New("cannot update the purchase")
	ErrProductNotFound    = errors.New("product not found")
)

func AddProductToCart(ctx context.Context, prodCollection, userCollection *mongo.Collection, productID primitive.ObjectID, userID string, quantity int) error {
	// Use FindOne for single product instead of Find
	var product models.Product
	err := prodCollection.FindOne(ctx, bson.M{"_id": productID}).Decode(&product)
	if err != nil {
		log.Println(err)
		return ErrCantFindProduct
	}

	// Convert Product to ProductUser
	var rating *uint
	if product.Rating != nil {
		u := uint(*product.Rating)
		rating = &u
	}

	productUser := models.ProductUser{
		Product_ID:   product.Product_ID,
		Product_Name: product.Product_Name,
		Price:        int(*product.Price), // Convert uint64 to int
		Rating:       rating,
		Image:        product.Image,
		Quantity:     quantity,  // Use the passed quantity
		ID:           productID, // Store the MongoDB _id for consistency
	}

	id, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Println(err)
		return ErrUserIDIsNotValid
	}

	// First, get the user to check if product exists in cart
	var user models.User
	err = userCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		log.Println(err)
		return ErrUserIDIsNotValid
	}

	// Check if product already exists in cart
	productExists := false
	for i, cartItem := range user.UserCart {
		if cartItem.ID == productID {
			// Product exists, update quantity using array index
			productExists = true
			filter := bson.M{"_id": id}
			update := bson.M{"$inc": bson.M{fmt.Sprintf("usercart.%d.quantity", i): quantity}}
			_, err = userCollection.UpdateOne(ctx, filter, update)
			if err != nil {
				log.Println("Error updating existing cart item quantity:", err)
				return ErrCantUpdateUser
			}
			log.Printf("Updated existing cart item quantity for product %s by %d", product.Product_ID, quantity)
			break
		}
	}

	if !productExists {
		// Product doesn't exist, add new item
		filter := bson.M{"_id": id}
		update := bson.M{"$push": bson.M{"usercart": productUser}}
		_, err = userCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			log.Println("Error adding new cart item:", err)
			return ErrCantUpdateUser
		}
		log.Printf("Added new cart item for product %s with quantity %d", product.Product_ID, quantity)
	}

	return nil
}

func RemoveCartItem(ctx context.Context, prodCollection, userCollection *mongo.Collection, productID primitive.ObjectID, userID string) error {
	id, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Println(err)
		return ErrUserIDIsNotValid
	}

	// First get the product to get its string Product_ID
	var product models.Product
	err = prodCollection.FindOne(ctx, bson.M{"_id": productID}).Decode(&product)
	if err != nil {
		log.Println(err)
		return ErrProductNotFound
	}

	filter := bson.D{primitive.E{Key: "_id", Value: id}}
	// Use the MongoDB _id for matching cart items
	update := bson.M{"$pull": bson.M{"usercart": bson.M{"_id": productID}}}
	_, err = userCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		return ErrCantRemoveItem
	}
	return nil
}

func UpdateCartItem(ctx context.Context, prodCollection, userCollection *mongo.Collection, productID primitive.ObjectID, userID string, quantity int) error {
	// First get the product to get its string Product_ID
	var product models.Product
	err := prodCollection.FindOne(ctx, bson.M{"_id": productID}).Decode(&product)
	if err != nil {
		log.Println("Error finding product:", err)
		return ErrProductNotFound
	}

	id, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Println("Error converting userID to ObjectID:", err)
		return ErrUserIDIsNotValid
	}

	// First, get the user to find the cart item index
	var user models.User
	err = userCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		log.Println("Error finding user:", err)
		return ErrUserIDIsNotValid
	}

	// Find the cart item index
	itemIndex := -1
	for i, cartItem := range user.UserCart {
		if cartItem.ID == productID {
			itemIndex = i
			break
		}
	}

	if itemIndex == -1 {
		log.Printf("Product %s not found in user's cart", product.Product_ID)
		return ErrCantFindProduct
	}

	// Update the quantity using array index
	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{fmt.Sprintf("usercart.%d.quantity", itemIndex): quantity}}
	_, err = userCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		log.Println("Error updating cart item quantity:", err)
		return ErrCantUpdateUser
	}

	log.Printf("Updated cart item quantity for product %s to %d", product.Product_ID, quantity)
	return nil
}

func BuyItemFromCart(ctx context.Context, userCollection *mongo.Collection, userID string) error {
	id, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Println(err)
		return ErrUserIDIsNotValid
	}
	var getcartitems models.User
	var ordercart models.Order
	ordercart.Order_ID = primitive.NewObjectID()
	ordercart.Orderered_At = time.Now()
	ordercart.Order_Cart = make([]models.ProductUser, 0)
	ordercart.Payment_Method.COD = true
	unwind := bson.D{{Key: "$unwind", Value: bson.D{primitive.E{Key: "path", Value: "$usercart"}}}}
	grouping := bson.D{{Key: "$group", Value: bson.D{primitive.E{Key: "_id", Value: "$_id"}, {Key: "total", Value: bson.D{primitive.E{Key: "$sum", Value: "$usercart.price"}}}}}}
	currentresults, err := userCollection.Aggregate(ctx, mongo.Pipeline{unwind, grouping})
	ctx.Done()
	if err != nil {
		panic(err)
	}
	var getusercart []bson.M
	if err = currentresults.All(ctx, &getusercart); err != nil {
		panic(err)
	}
	var total_price int32
	for _, user_item := range getusercart {
		price := user_item["total"]
		total_price = price.(int32)
	}
	ordercart.Price = int(total_price)
	filter := bson.D{primitive.E{Key: "_id", Value: id}}
	update := bson.D{{Key: "$push", Value: bson.D{primitive.E{Key: "orders", Value: ordercart}}}}
	_, err = userCollection.UpdateMany(ctx, filter, update)
	if err != nil {
		log.Println(err)
	}
	err = userCollection.FindOne(ctx, bson.D{primitive.E{Key: "_id", Value: id}}).Decode(&getcartitems)
	if err != nil {
		log.Println(err)
	}
	filter2 := bson.D{primitive.E{Key: "_id", Value: id}}
	update2 := bson.M{"$push": bson.M{"orders.$[].order_list": bson.M{"$each": getcartitems.UserCart}}}
	_, err = userCollection.UpdateOne(ctx, filter2, update2)
	if err != nil {
		log.Println(err)
	}
	usercart_empty := make([]models.ProductUser, 0)
	filtered := bson.D{primitive.E{Key: "_id", Value: id}}
	updated := bson.D{{Key: "$set", Value: bson.D{primitive.E{Key: "usercart", Value: usercart_empty}}}}
	_, err = userCollection.UpdateOne(ctx, filtered, updated)
	if err != nil {
		return ErrCantBuyCartItem

	}
	return nil
}

func InstantBuyer(ctx context.Context, prodCollection, userCollection *mongo.Collection, productID primitive.ObjectID, UserID string) error {
	id, err := primitive.ObjectIDFromHex(UserID)
	if err != nil {
		log.Println(err)
		return ErrUserIDIsNotValid
	}
	var product_details models.ProductUser
	var orders_detail models.Order
	orders_detail.Order_ID = primitive.NewObjectID()
	orders_detail.Orderered_At = time.Now()
	orders_detail.Order_Cart = make([]models.ProductUser, 0)
	orders_detail.Payment_Method.COD = true
	err = prodCollection.FindOne(ctx, bson.D{primitive.E{Key: "_id", Value: productID}}).Decode(&product_details)
	if err != nil {
		log.Println(err)
	}
	orders_detail.Price = product_details.Price
	filter := bson.D{primitive.E{Key: "_id", Value: id}}
	update := bson.D{{Key: "$push", Value: bson.D{primitive.E{Key: "orders", Value: orders_detail}}}}
	_, err = userCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		log.Println(err)
	}
	filter2 := bson.D{primitive.E{Key: "_id", Value: id}}
	update2 := bson.M{"$push": bson.M{"orders.$[].order_list": product_details}}
	_, err = userCollection.UpdateOne(ctx, filter2, update2)
	if err != nil {
		log.Println(err)
	}
	return nil
}
