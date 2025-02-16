require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // Parses incoming JSON data

// Test route to check if server is running
app.get("/", (req, res) => {
  res.send("Budgeting App Backend is Running!");
});

// Debugging Route: Lists all registered API endpoints
app.get("/routes", (req, res) => {
  res.json(app._router.stack
    .filter(r => r.route) // Filters middleware, keeps routes
    .map(r => r.route.path) // Extracts available paths
  );
});

// Import transaction routes
const transactionRoutes = require("./routes/transactions");
app.use("/transactions", transactionRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
