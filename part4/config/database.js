const sql = require("mssql");

const sqlConfig = {
  user: "ayfridma_SQLLogin_1",
  password: "h1qnrxfoqk",
  database: "shoppingdb",
  server: "shoppingdb.mssql.somee.com", // ודאי שזו מחרוזת תקינה
  options: {
    encrypt: true, // חיבור מאובטח
    trustServerCertificate: true, // חובה ל-Somee
  },
};

// פונקציה להתחברות למסד הנתונים
async function connectDB() {
  try {
    await sql.connect(sqlConfig);
    console.log("✅ התחברות מוצלחת למסד הנתונים!");
  } catch (error) {
    console.error("❌ שגיאה בחיבור למסד הנתונים:", error);
  }
}

module.exports = { sql, connectDB, sqlConfig };
