const { sql } = require("../config/database");
const dbConfig = require("../config/database");

// Create a new supplier in the Suppliers table
exports.createSupplier = async (companyName, phone, representative) => {
  try {
    const result = await sql.query`
      INSERT INTO Suppliers (companyName, phone, representative) 
      VALUES (${companyName}, ${phone}, ${representative})
    `;
    return result.rowsAffected[0] > 0; // Return true if the insert was successful
  } catch (error) {
    console.error("Error inserting supplier:", error);
    return false;
  }
};

// Fetch a supplier by its company name
exports.getSupplierByName = async (companyName) => {
  try {
    const result = await sql.query`
      SELECT * FROM Suppliers WHERE companyName = ${companyName}
    `;
    return result.recordset[0]; // Return the first matching supplier
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return null;
  }
};

// Fetch orders for a given supplier by supplier ID
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

    return result.recordset; // Return the list of orders for the supplier
  } catch (error) {
    console.error("שגיאה בשליפת הזמנות:", error);
    throw error;
  }
};

// Update the status of a specific order
exports.updateOrderStatus = async (orderId, status) => {
  try {
    const pool = await sql.connect();

    await pool
      .request()
      .input("status", sql.NVarChar, status)
      .input("orderId", sql.Int, orderId).query(`
        UPDATE Orders SET status = @status WHERE id = @orderId
      `);
  } catch (error) {
    console.error("שגיאה בעדכון סטטוס ההזמנה:", error);
    throw error;
  }
};

// Register a supplier along with its products in the database
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
    // Insert supplier and get the inserted supplier's ID
    const result = await request.query(`
        INSERT INTO Suppliers (companyName, phone, representative) 
        OUTPUT INSERTED.id 
        VALUES (@companyName, @phone, @representative)
      `);

    const supplierId = result.recordset[0].id; // Get the ID of the newly inserted supplier

    // Insert products related to the newly created supplier
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

        // Insert product into the Products table
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
