const OwnerModel = require("../models/owner");
// Render login page
exports.loginPage = (req, res) => {
  res.render("owner/login", { error: null });
};

// Handle login logic
exports.login = (req, res) => {
  const { password } = req.body;

  if (password === OwnerModel.getOwnerPassword()) {
    res.redirect("/owner/dashboard");
  } else {
    res.render("owner/login", { error: "סיסמה שגויה, נסה שוב." });
  }
};

// Render owner's dashboard
exports.dashboard = (req, res) => {
  res.render("owner/dashboard");
};

// Show order creation page with list of suppliers
exports.showOrderPage = async (req, res) => {
  try {
    const suppliers = await OwnerModel.getSuppliers();
    res.render("owner/order", { suppliers });
  } catch (error) {
    res.status(500).send("שגיאה בהבאת ספקים");
  }
};

// Handle order creation
exports.createOrder = async (req, res) => {
  const { supplierId, products } = req.body;

  try {
    await OwnerModel.createOrder(supplierId, products);
    res.redirect("/owner/orders");
  } catch (error) {
    res.status(500).send("שגיאה ביצירת הזמנה");
  }
};

// Return products for a specific supplier (used via AJAX)
exports.getProductsForSupplier = async (req, res) => {
  const { supplierId } = req.query;

  try {
    const products = await OwnerModel.getProductsForSupplier(supplierId);
    res.json(products);
  } catch (error) {
    res.status(500).send("שגיאה בהבאת מוצרים");
  }
};

// Show all orders
exports.showAllOrders = async (req, res) => {
  try {
    const orders = await OwnerModel.getAllOrders();
    res.render("owner/orders", { orders });
  } catch (error) {
    res.status(500).send("שגיאה בשליפת ההזמנות");
  }
};

// Mark an order as completed
exports.markOrderAsCompleted = async (req, res) => {
  const { orderId } = req.params;

  try {
    await OwnerModel.markOrderAsCompleted(orderId);
    res.redirect("/owner/orders");
  } catch (error) {
    res.status(500).send("שגיאה בעדכון סטטוס ההזמנה");
  }
};
