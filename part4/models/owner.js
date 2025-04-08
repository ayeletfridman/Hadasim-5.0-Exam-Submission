// Importing the mssql library for SQL database operations
const sql = require("mssql");
const dbConfig = require("../config/database");

// Hardcoded owner password for validation
const OWNER_PASSWORD = "1234";

// Function to retrieve the owner's password
exports.getOwnerPassword = () => {
  return OWNER_PASSWORD;
};
// Function to get all suppliers from the database
exports.getSuppliers = async () => {
  try {
    const result = await sql.query("SELECT * FROM Suppliers"); // Query to fetch suppliers
    return result.recordset; // Return the result set of suppliers
  } catch (error) {
    console.error("שגיאה בהבאת ספקים:", error);
    throw error;
  }
};

// Function to create a new order with supplier and product details
exports.createOrder = async (supplierId, products) => {
  try {
    const pool = await sql.connect(dbConfig);

    // Loop through the products and insert each into the orders table
    for (let product of products) {
      const parsedProductId = parseInt(product.productId);
      const parsedQuantity = parseInt(product.quantity);

      if (!isNaN(parsedQuantity) && parsedQuantity > 0) {
        const request = pool.request();
        request.input("supplierId", sql.Int, supplierId);
        request.input("productId", sql.Int, parsedProductId);
        request.input("quantity", sql.Int, parsedQuantity);
        request.input("status", sql.NVarChar, "בהמתנה"); // Initial status: "Pending"
        request.input("orderDate", sql.DateTime, new Date()); // Set order date to current time

        // Insert query to add a new order to the database
        await request.query(`
        INSERT INTO Orders (supplierId, productId, quantity, status, orderDate)
        VALUES (@supplierId, @productId, @quantity, @status, @orderDate)
      `);
      }
    }
  } catch (error) {
    console.error("שגיאה ביצירת הזמנה:", error);
    throw error;
  }
};

// Function to get all products for a specific supplier
exports.getProductsForSupplier = async (supplierId) => {
  try {
    const result = await sql.query(`
      SELECT * FROM Products WHERE supplierId = ${supplierId}
    `);
    return result.recordset; // Return the product list for the supplier
  } catch (error) {
    console.error("שגיאה בהבאת מוצרים:", error);
    throw error;
  }
};

// Function to retrieve all orders from the database with supplier and product details
exports.getAllOrders = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        Orders.id,
        Orders.quantity,
        Orders.status,
        Orders.orderDate,
        Suppliers.companyName,
        Products.productName
      FROM Orders
      JOIN Suppliers ON Orders.supplierId = Suppliers.id
      JOIN Products ON Orders.productId = Products.productId
      ORDER BY Orders.orderDate DESC
    `);
    return result.recordset; // Return the orders data
  } catch (error) {
    console.error("שגיאה בשליפת ההזמנות:", error);
    throw error;
  }
};

// Function to update an order's status to 'Completed'
exports.markOrderAsCompleted = async (orderId) => {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request().input("orderId", sql.Int, orderId).query(`
      UPDATE Orders
      SET status = N'הושלמה'
      WHERE id = @orderId
    `);
  } catch (error) {
    console.error("שגיאה בעדכון סטטוס ההזמנה:", error);
    throw error;
  }
};
