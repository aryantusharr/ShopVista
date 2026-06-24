const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    await conn.connection.collection("users").createIndex({ email: 1 }, { unique: true });
    await conn.connection.collection("products").createIndex({ _id: 1 });
    await conn.connection.collection("orders").createIndex({ user: 1 });
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
