const sql = require("mssql");
const dbConfig = require("../config/database");

const SupplierController = {
  // הצגת דף התחברות לספקים
  showLoginPage: (req, res) => {
    res.render("supplier/login");
  },

  // התחברות ספק
  login: async (req, res) => {
    const { companyName, password } = req.body;

    try {
      // יצירת בקשת SQL
      const request = new sql.Request();

      // הוספת פרמטר לשאילתה
      request.input("companyName", sql.NVarChar, companyName);

      // ביצוע השאילתה
      const result = await request.query(
        "SELECT * FROM Suppliers WHERE companyName = @companyName"
      );

      if (result.recordset.length === 0) {
        return res.status(404).send("ספק לא נמצא");
      }

      const supplier = result.recordset[0];

      // אם הסיסמה תואמת, ממשיכים
      if (supplier.passwordHash === password) {
        return res.send(`התחברת בהצלחה כחברה: ${companyName}`);
      } else {
        return res.status(401).send("סיסמה לא נכונה");
      }
    } catch (error) {
      console.error("שגיאה בהתחברות:", error);
      res.status(500).send("שגיאה בהתחברות");
    }
  },

  // הצגת רשימת ההזמנות של הספק
  viewOrders: async (req, res) => {
    const { companyName } = req.query;

    try {
      // שליפת ההזמנות של הספק
      const result = await sql.query(
        `
        SELECT * FROM Orders WHERE supplierName = @companyName
      `,
        { companyName: companyName }
      );

      if (result.recordset.length === 0) {
        return res.send("אין הזמנות לספק הזה.");
      }

      // הצגת ההזמנות
      res.json(result.recordset);
    } catch (error) {
      console.error("שגיאה בשליפת הזמנות:", error);
      res.status(500).send("שגיאה בשליפת הזמנות");
    }
  },

  // אישור הזמנה ע"י ספק
  approveOrder: async (req, res) => {
    const orderId = req.params.id;

    try {
      // עדכון סטטוס ההזמנה
      await sql.query(
        `
        UPDATE Orders SET status = 'בתהליך' WHERE id = @orderId
      `,
        { orderId: orderId }
      );

      res.send(`הזמנה ${orderId} אושרה בהצלחה`);
    } catch (error) {
      console.error("שגיאה בעדכון סטטוס ההזמנה:", error);
      res.status(500).send("שגיאה בעדכון סטטוס ההזמנה");
    }
  },

  // הצגת דף הרשמה לספק
  showRegisterPage: (req, res) => {
    res.render("supplier/register");
  },

  // שמירת הספק למסד הנתונים
  registerSupplier: async (req, res) => {
    const { companyName, phone, representative, password } = req.body;
    const productNames = req.body.productName || [];
    const prices = req.body.price || [];
    const minQuantities = req.body.minQuantity || [];

    const safePassword =
      password && password.trim() !== "" ? password : "defaultPassword";

    try {
      // התחברות למסד הנתונים
      const pool = await sql.connect(dbConfig);
      const request = pool.request();

      // הכנסת פרטי הספק
      request.input("companyName", sql.NVarChar, companyName);
      request.input("phone", sql.NVarChar, phone);
      request.input("representative", sql.NVarChar, representative);
      request.input("password", sql.NVarChar, safePassword);

      // הוספת הספק לטבלה
      const result = await request.query(`
        INSERT INTO Suppliers (companyName, phone, representative, passwordHash) 
        OUTPUT INSERTED.id 
        VALUES (@companyName, @phone, @representative, @password)
      `);

      // קבלת ה-ID של הספק שנוסף
      const supplierId = result.recordset[0].id;

      // הוספת המוצרים לטבלת Products
      for (let i = 0; i < productNames.length; i++) {
        if (productNames[i] && prices[i] && minQuantities[i]) {
          const requestProduct = pool.request();
          requestProduct.input("supplierId", sql.Int, supplierId);
          requestProduct.input("productName", sql.NVarChar, productNames[i]);
          requestProduct.input("price", sql.Float, prices[i]);
          requestProduct.input("minQuantity", sql.Int, minQuantities[i]);

          await requestProduct.query(`
            INSERT INTO Products (supplierId, productName, price, minQuantity) 
            VALUES (@supplierId, @productName, @price, @minQuantity)
          `);
        }
      }

      res.redirect("/supplier/login");
    } catch (error) {
      console.error("שגיאה בהרשמה:", error);
      res.status(500).send("שגיאה בהרשמה");
    }
  },
};

module.exports = SupplierController;
