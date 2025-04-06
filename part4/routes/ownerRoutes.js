const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/ownerController");

// טופס התחברות
router.get("/login", ownerController.loginPage);

// שליחת התחברות
router.post("/login", ownerController.login);

// דשבורד אחרי התחברות
router.get("/dashboard", ownerController.dashboard);

// הצגת דף הזמנה
router.get("/order", ownerController.showOrderPage);

// יצירת הזמנה
router.post("/order", ownerController.createOrder);

router.get("/products", ownerController.getProductsForSupplier); // כאן אנחנו שולחים את הפונקציה של הקונטרולר

// נתיב לצפייה בכל ההזמנות
router.get("/orders", ownerController.showAllOrders);

// נתיב לעדכון סטטוס של הזמנה להושלמה
router.post("/orders/complete/:orderId", ownerController.markOrderAsCompleted);

module.exports = router;
