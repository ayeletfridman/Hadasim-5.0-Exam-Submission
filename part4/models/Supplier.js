const { sql } = require("../config/database");
const dbConfig = require("../config/database");

exports.createSupplier = async (companyName, phone, representative) => {
  try {
    const result = await sql.query`
      INSERT INTO Suppliers (companyName, phone, representative) 
      VALUES (${companyName}, ${phone}, ${representative})
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

// הוספה של פונקציות נוספות מהקוד שסיפקתי לך
exports.getOrdersBySupplierId = async (supplierId) => {
  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();
    request.input("supplierId", sql.Int, supplierId);

    const result = await request.query(`
      SELECT 
        Orders.*, 
        Products.productName 
      FROM 
        Orders 
      JOIN 
        Products ON Orders.productId = Products.productId
      WHERE 
        Orders.supplierId = @supplierId
    `);

    return result.recordset;
  } catch (error) {
    console.error("שגיאה בשליפת הזמנות:", error);
    throw error;
  }
};

exports.updateOrderStatus = async (orderId, status) => {
  try {
    await sql.query(
      `
      UPDATE Orders SET status = @status WHERE id = @orderId
    `,
      { orderId: orderId, status: status }
    );
  } catch (error) {
    console.error("שגיאה בעדכון סטטוס ההזמנה:", error);
    throw error;
  }
};

exports.createSupplierWithProducts = async (
  companyName,
  phone,
  representative,
  products
) => {
  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    request.input("companyName", sql.NVarChar, companyName);
    request.input("phone", sql.NVarChar, phone);
    request.input("representative", sql.NVarChar, representative);

    const result = await request.query(`
        INSERT INTO Suppliers (companyName, phone, representative) 
        OUTPUT INSERTED.id 
        VALUES (@companyName, @phone, @representative)
      `);

    const supplierId = result.recordset[0].id;

    for (let i = 0; i < products.productNames.length; i++) {
      if (
        products.productNames[i] &&
        products.prices[i] &&
        products.minQuantities[i]
      ) {
        const requestProduct = pool.request();
        requestProduct.input("supplierId", sql.Int, supplierId);
        requestProduct.input(
          "productName",
          sql.NVarChar,
          products.productNames[i]
        );
        requestProduct.input("price", sql.Float, products.prices[i]);
        requestProduct.input("minQuantity", sql.Int, products.minQuantities[i]);

        await requestProduct.query(`
            INSERT INTO Products (supplierId, productName, price, minQuantity) 
            VALUES (@supplierId, @productName, @price, @minQuantity)
          `);
      }
    }
  } catch (error) {
    console.error("שגיאה בהרשמה:", error);
    throw error;
  }
};
