const sql = require("./db.js");

const Product = function() {
  
}

Product.getAllProduct = (company_id, result) => {
    sql.query(`
        SELECT company_id, company_entity_name FROM company WHERE company_id = ${company_id}
        `, (err, companyResponse) => {
                if (err || !companyResponse.length) {
                const error = {
                    message: 'company_id not found'
                }
                result(error, null);
                return;
            }
            sql.query(`
                SELECT * FROM product WHERE company_id = ${company_id}
                `, (err, productResponse) => {
                        if (err || !productResponse.length) {
                        const error = {
                            message: 'company_id not found'
                        }
                        result(error, null);
                        return;
                    }
                    result(null, {
                        ...companyResponse[0],
                        data: productResponse
                    });
                }
            )
        }
    )
};

Product.getProductById = (id, result) => {
    sql.query(`
        SELECT product.*, company.company_entity_name FROM product
        INNER JOIN company ON product.company_id = company.company_id
        WHERE product.id = ${id}
        `,
        (err, res) => {
            if (err || !res.length) {
            const error = {
                message: 'id not found'
            }
            result(error, null);
            return;
            }
            result(null, res[0]);
    })
};

Product.createProduct = (newProduct, result) => {
    if (!newProduct.name.length) {
        result({}, null);
    }
    sql.query(`SELECT * FROM company WHERE company_id = ${newProduct.company_id}`, (err, res) => {
        if (err || !res.length) {
          const error = {
            message: 'company_id not found'
          }
          result(error, null);
          return;
        }
        sql.query(`
            INSERT INTO product
            SET name='${newProduct.name}', description='${newProduct.description}', company_id = ${newProduct.company_id};
            `, (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    result(err, null);
                    return;
                }
                result(null, { res });
        });
    })
};

Product.updateProduct = (body, result) => {
    sql.query(
        'UPDATE product SET `name`=?, `description`=? WHERE id = ?', [body.name, body.description, body.id],
        (err, res) => {
          if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
          }
    
          if (res.affectedRows == 0) {
            // not found company with the id
            result({ kind: "not_found" }, null);
            return;
          }
          result(null, { id: body.id, status: 201 });
        }
    );
}
Product.deleteProduct = (id, result) => {
    sql.query(`
        DELETE product FROM product WHERE id = ${id}
        `,
        (err, res) => {
            if (err || !res.length) {
                const error = {
                    message: 'id not found'
                }
                result(error, null);
                return;
            }
            result(null, res[0]);
    })
}
module.exports = Product;