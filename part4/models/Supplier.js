const { sql } = require("../config/database");

exports.createSupplier = async (
  companyName,
  phone,
  representative,
  passwordHash
) => {
  try {
    const result = await sql.query`
            INSERT INTO Suppliers (companyName, phone, representative, passwordHash) 
            VALUES (${companyName}, ${phone}, ${representative}, ${passwordHash})
        `;
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Error inserting supplier:", error);
    return false;
  }
};

exports.getSupplierByName = async (companyName) => {
  try {
    const result = await sql.query`
            SELECT * FROM Suppliers WHERE companyName = ${companyName}
        `;
    return result.recordset[0];
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return null;
  }
};
