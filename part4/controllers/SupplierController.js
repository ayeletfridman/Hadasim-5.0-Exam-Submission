const sql = require("mssql");

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
    const {
      companyName,
      phone,
      representative,
      productName,
      price,
      minQuantity,
    } = req.body;

    try {
      // הוספת הספק לטבלת הספקים
      const supplierResult = await sql.query(
        `
        INSERT INTO Suppliers (companyName, phone, representative, passwordHash)
        VALUES (@companyName, @phone, @representative, @password)
      `,
        {
          companyName: companyName,
          phone: phone,
          representative: representative,
          password: "defaultPassword", // אם הסיסמה נשארת כמות שהיא
        }
      );

      // קבלת ה-ID של הספק החדש שהוזן
      const supplierId = supplierResult.recordset[0].id;

      // הוספת המוצרים לטבלת המוצרים
      for (let i = 0; i < productName.length; i++) {
        await sql.query(
          `
          INSERT INTO Products (productName, price, minQuantity, supplierId)
          VALUES (@productName, @price, @minQuantity, @supplierId)
        `,
          {
            productName: productName[i],
            price: price[i],
            minQuantity: minQuantity[i],
            supplierId: supplierId,
          }
        );
      }

      // הפניית המשתמש לעמוד התחברות
      res.redirect("/supplier/login");
    } catch (error) {
      console.error("שגיאה בהרשמה:", error);
      res.status(500).send("שגיאה בהרשמה");
    }
  },
};

module.exports = SupplierController;
