const sql = require("mssql");

const sqlConfig = {
  user: "ayfridma_SQLLogin_1",
  password: "h1qnrxfoqk",
  database: "shoppingdb",
  server: "shoppingdb.mssql.somee.com",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function connectDB() {
  try {
    await sql.connect(sqlConfig);
    console.log(" התחברות מוצלחת למסד הנתונים!");
  } catch (error) {
    console.error(" שגיאה בחיבור למסד הנתונים:", error);
  }
}

module.exports = { sql, connectDB, sqlConfig };
