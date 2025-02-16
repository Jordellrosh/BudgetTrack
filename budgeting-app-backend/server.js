require("dotenv").config(); // Loads environment variables
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // Parses incoming JSON data

// Test route
app.get("/", (req, res) => {
  res.send("Budgeting App Backend is Running!");
});

// Import transaction routes (we will create this next)
const transactionRoutes = require("./routes/transactions");
app.use("/transactions", transactionRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
