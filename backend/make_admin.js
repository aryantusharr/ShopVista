const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const email = "admin@shopvista.com";
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: "Admin User",
        email,
        password: "adminpassword",
        phone: "9999999999",
        isAdmin: true,
        isActive: true,
      });
      console.log("Admin user created successfully!");
    } else {
      user.isAdmin = true;
      user.password = "adminpassword"; // Reset/set password to test
      await user.save();
      console.log("Existing user updated to admin!");
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
