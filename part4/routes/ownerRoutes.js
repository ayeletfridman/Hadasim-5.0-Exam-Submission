const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/ownerController");

router.get("/login", ownerController.loginPage);

router.post("/login", ownerController.login);

router.get("/dashboard", ownerController.dashboard);

router.get("/order", ownerController.showOrderPage);

router.post("/order", ownerController.createOrder);

router.get("/products", ownerController.getProductsForSupplier);

router.get("/orders", ownerController.showAllOrders);

router.post("/orders/complete/:orderId", ownerController.markOrderAsCompleted);

module.exports = router;
