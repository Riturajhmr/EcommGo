const { MongoClient } = require('mongodb');

async function debugProducts() {
  const uri = "mongodb://localhost:27017/ecomm";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("ecomm");
    const collection = database.collection("Products");

    // Get first product to see structure
    const product = await collection.findOne({});
    console.log("Product structure:");
    console.log(JSON.stringify(product, null, 2));
    
    console.log("\nKey fields:");
    console.log(`- _id: ${product._id} (type: ${typeof product._id})`);
    console.log(`- product_id: ${product.product_id} (type: ${typeof product.product_id})`);
    console.log(`- product_name: ${product.product_name}`);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

debugProducts();

