const express = require("express");
const router = express.Router();
const SupplierController = require("../controllers/SupplierController");

router.get("/login", SupplierController.showLoginPage);
router.post("/login", SupplierController.login);
router.get("/orders", SupplierController.viewOrders);
router.post("/orders/:id/approve", SupplierController.approveOrder);

// טופס הרשמה
router.get("/register", SupplierController.showRegisterPage);
router.post("/register", SupplierController.registerSupplier);

// דשבורד ספק
//router.get("/dashboard", SupplierController.supplierDashboard); // הוספנו את הניתוב עבור דשבורד ספק
console.log("SupplierController:", SupplierController); // הוספנו הדפסה

// עמוד הזמנות ספק
router.get("/orders", SupplierController.viewOrders);

module.exports = router;
