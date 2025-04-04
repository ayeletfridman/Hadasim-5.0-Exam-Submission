require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");
const indexRoutes = require("./routes/index");

const { connectDB } = require("./config/database");
const app = express();

// הגדרות תצוגה
app.set("view engine", "ejs");

// Middlewares
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// הגדרת סשן ואימות
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

connectDB();

// טעינת ראוטים
const supplierRoutes = require("./routes/supplierRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
app.use("/", indexRoutes);
app.use("/supplier", supplierRoutes);
app.use("/owner", ownerRoutes);

// הפעלת השרת
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
