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
module.exports = router;
