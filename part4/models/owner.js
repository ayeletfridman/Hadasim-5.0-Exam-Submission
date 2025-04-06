// OwnerModel.js
const sql = require("mssql");
const dbConfig = require("../config/database");

const OWNER_PASSWORD = "1234"; // הסיסמה שאתה רוצה לבדוק מולה

exports.getOwnerPassword = () => {
  return OWNER_PASSWORD;
};

exports.getSuppliers = async () => {
  try {
    const result = await sql.query("SELECT * FROM Suppliers");
    return result.recordset;
  } catch (error) {
    console.error("שגיאה בהבאת ספקים:", error);
    throw error;
  }
};

exports.createOrder = async (supplierId, products) => {
  try {
    const pool = await sql.connect(dbConfig);

    for (let product of products) {
      const parsedProductId = parseInt(product.productId);
      const parsedQuantity = parseInt(product.quantity);

      if (!isNaN(parsedQuantity) && parsedQuantity > 0) {
        const request = pool.request();
        request.input("supplierId", sql.Int, supplierId);
        request.input("productId", sql.Int, parsedProductId);
        request.input("quantity", sql.Int, parsedQuantity);
        request.input("status", sql.NVarChar, "בתהליך");
        request.input("orderDate", sql.DateTime, new Date());

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

exports.getProductsForSupplier = async (supplierId) => {
  try {
    const result = await sql.query(`
      SELECT * FROM Products WHERE supplierId = ${supplierId}
    `);
    return result.recordset;
  } catch (error) {
    console.error("שגיאה בהבאת מוצרים:", error);
    throw error;
  }
};

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
    return result.recordset;
  } catch (error) {
    console.error("שגיאה בשליפת ההזמנות:", error);
    throw error;
  }
};

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
