const sql = require("mssql");
const dbConfig = require("../config/database");

const OWNER_PASSWORD = "1234"; // הסיסמה שאתה רוצה לבדוק מולה

// הצגת דף התחברות
exports.loginPage = (req, res) => {
  res.render("owner/login", { error: null });
};

// התחברות
exports.login = (req, res) => {
  const { password } = req.body;

  if (password === OWNER_PASSWORD) {
    // כניסה מוצלחת
    res.redirect("/owner/dashboard");
  } else {
    // סיסמה שגויה
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
    const result = await sql.query("SELECT * FROM Suppliers");
    res.render("owner/order", { suppliers: result.recordset });
  } catch (error) {
    console.error("שגיאה בהבאת ספקים:", error);
    res.status(500).send("שגיאה בהבאת ספקים");
  }
};

// יצירת הזמנה
exports.createOrder = async (req, res) => {
  const { supplierId, products } = req.body;
  console.log(req.body);

  try {
    const pool = await sql.connect(dbConfig);

    // עבור כל מוצר
    for (let product of products) {
      const parsedProductId = parseInt(product.productId);
      const parsedQuantity = parseInt(product.quantity);

      console.log({ parsedProductId, parsedQuantity });

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

    res.redirect("/owner/orders");
  } catch (error) {
    console.error("שגיאה ביצירת הזמנה:", error);
    res.status(500).send("שגיאה ביצירת הזמנה");
  }
};

// פונקציה לשליפת המוצרים של ספק
exports.getProductsForSupplier = async (req, res) => {
  const { supplierId } = req.query;

  try {
    const result = await sql.query(`
      SELECT * FROM Products WHERE supplierId = ${supplierId}
    `);

    res.json(result.recordset); // מחזיר את המוצרים כ־JSON
  } catch (error) {
    console.error("שגיאה בהבאת מוצרים:", error);
    res.status(500).send("שגיאה בהבאת מוצרים");
  }
};

// הצגת כל ההזמנות (כולל כאלה שהושלמו)
exports.showAllOrders = async (req, res) => {
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

    res.render("owner/orders", { orders: result.recordset });
  } catch (error) {
    console.error("שגיאה בשליפת ההזמנות:", error);
    res.status(500).send("שגיאה בשליפת ההזמנות");
  }
};

// שינוי סטטוס של הזמנה ל"הושלמה"
exports.markOrderAsCompleted = async (req, res) => {
  const { orderId } = req.params;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request().input("orderId", sql.Int, orderId).query(`
          UPDATE Orders
          SET status = N'הושלמה'
          WHERE id = @orderId
        `);

    res.redirect("/owner/orders");
  } catch (error) {
    console.error("שגיאה בעדכון סטטוס ההזמנה:", error);
    res.status(500).send("שגיאה בעדכון סטטוס ההזמנה");
  }
};
