const express = require("express");
const router = express.Router();
const sql = require("mssql");
const bcrypt = require("bcrypt");
const { sqlConfig } = require("../config/database");

// דף התחברות - הצגת הטופס
router.get("/login", (req, res) => {
  res.render("owner/login");
});

// התחברות - אימות פרטי בעל המכולת
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    let pool = await sql.connect(sqlConfig);
    let result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM Owners WHERE username = @username");

    if (result.recordset.length === 0) {
      return res.send("❌ שם משתמש לא קיים");
    }

    let owner = result.recordset[0];

    // השוואת סיסמה עם הסיסמה המוצפנת מהמסד נתונים
    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.send("❌ סיסמה שגויה");
    }

    // שמירת מזהה המשתמש בסשן
    req.session.ownerId = owner.id;
    res.redirect("/owner/orders"); // מעבר לרשימת ההזמנות
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ שגיאה בשרת");
  }
});

module.exports = router;
