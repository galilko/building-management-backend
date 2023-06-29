const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://building-management.onrender.com"]
    : ["http://localhost:3000"];
console.log(allowedOrigins);
module.exports = allowedOrigins;
