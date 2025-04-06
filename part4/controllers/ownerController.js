// OwnerController.js
const OwnerModel = require("../models/owner");

// הצגת דף התחברות
exports.loginPage = (req, res) => {
  res.render("owner/login", { error: null });
};

// התחברות
exports.login = (req, res) => {
  const { password } = req.body;

  if (password === OwnerModel.getOwnerPassword()) {
    res.redirect("/owner/dashboard");
  } else {
    res.render("owner/login", { error: "סיסמה שגויה, נסה שוב." });
  }
};

// דשבורד
exports.dashboard = (req, res) => {
  res.render("owner/dashboard");
};

// הצגת דף יצירת הזמנה
exports.showOrderPage = async (req, res) => {
  try {
    const suppliers = await OwnerModel.getSuppliers();
    res.render("owner/order", { suppliers });
  } catch (error) {
    res.status(500).send("שגיאה בהבאת ספקים");
  }
};

// יצירת הזמנה
exports.createOrder = async (req, res) => {
  const { supplierId, products } = req.body;

  try {
    await OwnerModel.createOrder(supplierId, products);
    res.redirect("/owner/orders");
  } catch (error) {
    res.status(500).send("שגיאה ביצירת הזמנה");
  }
};

// פונקציה לשליפת המוצרים של ספק
exports.getProductsForSupplier = async (req, res) => {
  const { supplierId } = req.query;

  try {
    const products = await OwnerModel.getProductsForSupplier(supplierId);
    res.json(products);
  } catch (error) {
    res.status(500).send("שגיאה בהבאת מוצרים");
  }
};

// הצגת כל ההזמנות (כולל כאלה שהושלמו)
exports.showAllOrders = async (req, res) => {
  try {
    const orders = await OwnerModel.getAllOrders();
    res.render("owner/orders", { orders });
  } catch (error) {
    res.status(500).send("שגיאה בשליפת ההזמנות");
  }
};

// שינוי סטטוס של הזמנה ל"הושלמה"
exports.markOrderAsCompleted = async (req, res) => {
  const { orderId } = req.params;

  try {
    await OwnerModel.markOrderAsCompleted(orderId);
    res.redirect("/owner/orders");
  } catch (error) {
    res.status(500).send("שגיאה בעדכון סטטוס ההזמנה");
  }
};
