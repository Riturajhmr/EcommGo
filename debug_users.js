const { MongoClient } = require('mongodb');

async function debugUsers() {
  const uri = "mongodb://localhost:27017/ecomm";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("ecomm");
    const usersCollection = database.collection("Users");

    // Check if there are any users
    const userCount = await usersCollection.countDocuments();
    console.log(`Total users in database: ${userCount}`);

    if (userCount > 0) {
      const user = await usersCollection.findOne({});
      console.log("User structure:");
      console.log(JSON.stringify(user, null, 2));
      
      console.log("\nKey fields:");
      console.log(`- _id: ${user._id} (type: ${typeof user._id})`);
      console.log(`- email: ${user.email}`);
      console.log(`- usercart length: ${user.usercart ? user.usercart.length : 'undefined'}`);
    } else {
      console.log("No users found in database");
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

debugUsers();
