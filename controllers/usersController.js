const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { ro } = require("date-fns/locale");

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  // Get all users from MongoDB
  const users = await User.find().select("-password").lean();

  // If no users
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(users);
});

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { name, email, phone, building, appartment, password, roles, debt } =
    req.body;

  // Confirm data
  if (
    !name ||
    !email ||
    !phone ||
    !building ||
    !appartment ||
    !password ||
    !roles ||
    !roles.length ||
    typeof debt !== "number"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate appartment
  const duplicate = await User.findOne({ email })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate email" });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const userObject =
    Array.isArray(roles) && roles.length > 0
      ? {
          name,
          email,
          phone,
          building,
          appartment,
          password: hashedPwd,
          roles,
          debt,
        }
      : {
          name,
          email,
          phone,
          building,
          appartment,
          password: hashedPwd,
          debt,
        };
  // Create and store new user
  const user = await User.create(userObject);

  if (user) {
    //created
    res.status(201).json({ message: `New user ${name} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const {
    id,
    name,
    email,
    phone,
    building,
    appartment,
    password,
    debt,
    roles,
    active,
  } = req.body;

  console.log(req.body);
  // Confirm data
  if (
    !id ||
    !name ||
    !email ||
    !phone ||
    !building ||
    !appartment ||
    !roles ||
    !roles.length ||
    typeof debt !== "number" ||
    typeof active !== "boolean"
  ) {
    return res
      .status(400)
      .json({ message: "All fields except password are required" });
  }

  // Does the user exist to update?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check for duplicate
  const duplicate = await User.findOne({ email })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate email" });
  }

  user.name = name;
  user.email = email;
  user.phone = phone;
  user.building = building;
  user.appartment = appartment;
  user.debt = debt;
  user.roles = roles;
  user.active = active;

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10); // salt rounds
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.name} updated` });
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }

  // Does the user exist to delete?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.name} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
