const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://building-management.onrender.com"]
    : ["http://localhost:3000"];

module.exports = allowedOrigins;
