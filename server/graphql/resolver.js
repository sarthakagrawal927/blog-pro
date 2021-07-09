const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("validator");

module.exports = {
  createUser: async function ({ userInput }, req) {
    const { email, name, password } = userInput;
    const existingUser = await User.findOne({ email: email });

    let errors = [];
    if (!validator.isEmail(email)) errors.push({ message: "Invalid email" });
    if (validator.isEmpty(password)) errors.push({ message: "short password" });
    if (errors.length > 0) {
      const error = new Error("invalid input");
      throw error;
    }

    if (existingUser) {
      const error = new Error("User already exists");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      name: name,
      password: hashedPw,
    });

    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
};
