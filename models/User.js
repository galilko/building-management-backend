const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  building: {
    type: Number,
    required: true,
  },
  appartment: {
    type: Number,
    required: true,
  },
  debt: {
    type: Number,
    default: 0,
  },
  roles: {
    type: [String],
    default: ["Tenant"],
  },
  active: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("User", userSchema);
