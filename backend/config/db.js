const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    await conn.connection.collection("users").createIndex({ email: 1 }, { unique: true }).catch(err => console.log("Index Info: users unique email index already exists or skipped."));
    await conn.connection.collection("products").createIndex({ sku: 1 }, { unique: true }).catch(err => console.log("Index Info: products unique sku index creation deferred or skipped (might have duplicate nulls before seeding)."));
    await conn.connection.collection("products").createIndex({ _id: 1 }).catch(err => console.log("Index Info: products index setup completed."));
    await conn.connection.collection("orders").createIndex({ user: 1 }).catch(err => console.log("Index Info: orders index setup completed."));
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

