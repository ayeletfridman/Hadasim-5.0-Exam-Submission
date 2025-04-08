require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");
const indexRoutes = require("./routes/index");

const { connectDB } = require("./config/database");
const app = express(); // Initialize Express app

app.set("view engine", "ejs"); // Set EJS as the templating engin

// Middlewares
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// Session and authentication setup
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

connectDB();
// Route setup
const supplierRoutes = require("./routes/supplierRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
app.use("/", indexRoutes);
app.use("/supplier", supplierRoutes);
app.use("/owner", ownerRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`)); // Start server
