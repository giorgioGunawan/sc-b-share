const sql = require("./db.js");
// constructor
const SalesClient = function (salesclient) {
  this.sales_client_id = salesclient.sales_client_id,
    this.user_id = salesclient.user_id,
    this.client_id = salesclient.client_id
};

SalesClient.createSalesClient = (newSalesClient, result) => {

  // console.log(user_id, newSalesClient.client_id)
  sql.query(`Select sales_client_id from sales_client where user_id IN (${newSalesClient.user_id}) and client_id = ${newSalesClient.client_id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (JSON.stringify(res[0]) != undefined) {
      result(null, res[0]);
      return;
    } else {
      for (let index = 0; index < newSalesClient.user_id.length; index++) {
        const user_id = newSalesClient.user_id[index];
        sql.query(`INSERT INTO sales_client SET user_id = ${user_id}, client_id = ${newSalesClient.client_id}`, (err, res) => {
          if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
          }

          console.log("created SalesClient: ", { id: res.insertId, ...newSalesClient });
          // result(null, { id: res.insertId, ...newSalesClient });
        });

      }
      result(null, { id: 1 })
    }
  });



};

SalesClient.importSales = (newSales, result) => {
  sql.query("INSERT INTO sales_client (user_id, client_id) VALUES ?", newSales, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, newSales });
    
  });
};

SalesClient.createSalesClientWithCSV = (newSalesClient, result) => {

  // console.log(user_id, newSalesClient.client_id)
  sql.query(`Select sales_client_id from sales_client where user_id IN (${newSalesClient.user_id}) and client_id = ${newSalesClient.client_id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("checked sales_client: ", res[0]);
    if (JSON.stringify(res[0]) != undefined) {
      result(null, res[0]);
      return;
    } else {
      sql.query(`INSERT INTO sales_client SET user_id = ${newSalesClient.user_id}, client_id = ${newSalesClient.client_id}`, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }

        // result(null, { id: res.insertId, ...newSalesClient });
      });
    }
  });



};

SalesClient.getAllSalesClient = (result) => {
  sql.query(`SELECT
	sc.sales_client_id,
	c.client_entity_name,
  u.full_name,
  co.company_id,
  co.company_entity_name
FROM
	sales_client sc
LEFT OUTER JOIN client c
	ON c.client_id = sc.client_id
LEFT OUTER JOIN user u
  ON u.user_id = sc.user_id
LEFT OUTER JOIN company co
  ON c.company_id = co.company_id
WHERE u.isAdmin = 0`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    result(null, res);
  });
};

SalesClient.getSalesClientById = (sales_client_id, result) => {
  sql.query(`SELECT
  c.client_entity_name,
  c.client_id,
  u.full_name,
  u.user_id,
  co.company_id,
  co.company_entity_name
FROM
	sales_client sc
LEFT OUTER JOIN client c
	ON c.client_id = sc.client_id
LEFT OUTER JOIN user u
  ON u.user_id = sc.user_id
LEFT OUTER JOIN company co
  ON c.company_id = co.company_id
WHERE u.isAdmin = 0 and sc.sales_client_id = ?`, sales_client_id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    result(null, res[0]);
  });
};

SalesClient.getSalesClientsByCompanyId = (company_id, result) => {
  sql.query(`SELECT
	sc.sales_client_id,
  c.client_entity_name,
  c.client_id,
  u.full_name,
  u.user_id
FROM
	sales_client sc
LEFT OUTER JOIN client c
	ON c.client_id = sc.client_id
LEFT OUTER JOIN user u
  ON u.user_id = sc.user_id
WHERE u.isAdmin = 0 and u.company_id IN (${company_id}) and c.company_id IN (${company_id})`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    result(null, res);
  });
};

SalesClient.getBranchSalesClientWithFilter = ({company_id, limit, offset, user_id, client_id, branch_id, client_entity_name, full_name}, result) => {
  sql.query(`SELECT
	sc.sales_client_id,
  c.client_entity_name,
  c.client_id,
  u.full_name,
  u.user_id
FROM
	sales_client sc
LEFT OUTER JOIN client c
	ON c.client_id = sc.client_id
LEFT OUTER JOIN user u
  ON u.user_id = sc.user_id
WHERE 
  (u.branch_id = ${branch_id} and u.isAdmin = 0 and u.company_id IN (${company_id}) and c.company_id IN (${company_id}) ${user_id ? `and u.user_id = ${user_id}` : ''} ${client_id ? `and c.client_id = ${client_id}` : ''})
  ${
    client_entity_name
      ?
      `AND (c.client_entity_name LIKE '%${client_entity_name}%')`
      :
      ''
    }
  ${
    full_name
      ?
      `AND (u.full_name LIKE '%${full_name}%')`
      :
      ''
    }
  ORDER by sc.sales_client_id DESC ${limit ? `LIMIT ${limit}` : ''} ${offset ? `OFFSET ${offset}` : ''}`, 
  (err, res) => {
    sql.query(`
      SELECT
      COUNT(*) as total
      FROM
        sales_client sc
      LEFT OUTER JOIN client c
        ON c.client_id = sc.client_id
      LEFT OUTER JOIN user u
        ON u.user_id = sc.user_id
      WHERE 
      (u.isAdmin = 0 and u.company_id IN (${company_id}) and c.company_id IN (${company_id}) ${user_id ? `and u.user_id = ${user_id}` : ''} ${client_id ? `and c.client_id = ${client_id}` : ''})
      ${
        client_entity_name
          ?
          `AND (c.client_entity_name LIKE '%${client_entity_name}%')`
          :
          ''
        }
      ${
        full_name
          ?
          `AND (u.full_name LIKE '%${full_name}%')`
          :
          ''
        }
      `, (errTotal, total) => {
            if (err) {
              console.log(err, errTotal)
              result(null, err);
              return;
            }
            const data = {
              data: res,
              total: total?.[0]?.total ? total?.[0]?.total : 0,
              limit,
              offset
            }
            result(null, data);
          })
  });
};

SalesClient.getCompanySalesClientWithFilter = ({company_id, limit, offset, user_id, client_id, client_entity_name, full_name}, result) => {
  sql.query(`SELECT
	sc.sales_client_id,
  c.client_entity_name,
  c.client_id,
  u.full_name,
  u.user_id
FROM
	sales_client sc
LEFT OUTER JOIN client c
	ON c.client_id = sc.client_id
LEFT OUTER JOIN user u
  ON u.user_id = sc.user_id
WHERE 
  (u.isAdmin = 0 and u.company_id IN (${company_id}) and c.company_id IN (${company_id}) ${user_id ? `and u.user_id = ${user_id}` : ''} ${client_id ? `and c.client_id = ${client_id}` : ''})
  ${
    client_entity_name
      ?
      `AND (c.client_entity_name LIKE '%${client_entity_name}%')`
      :
      ''
    }
  ${
    full_name
      ?
      `AND (u.full_name LIKE '%${full_name}%')`
      :
      ''
    } 
  ORDER by sc.sales_client_id DESC ${limit ? `LIMIT ${limit}` : ''} ${offset ? `OFFSET ${offset}` : ''}`, 
  (err, res) => {
    sql.query(`
      SELECT
      COUNT(*) as total
      FROM
        sales_client sc
      LEFT OUTER JOIN client c
        ON c.client_id = sc.client_id
      LEFT OUTER JOIN user u
        ON u.user_id = sc.user_id
      WHERE 
      (u.isAdmin = 0 and u.company_id IN (${company_id}) and c.company_id IN (${company_id}) ${user_id ? `and u.user_id = ${user_id}` : ''} ${client_id ? `and c.client_id = ${client_id}` : ''})
      ${
        client_entity_name
          ?
          `AND (c.client_entity_name LIKE '%${client_entity_name}%')`
          :
          ''
        }
      ${
        full_name
          ?
          `AND (u.full_name LIKE '%${full_name}%')`
          :
          ''
        } 
      `, (errTotal, total) => {
            if (err) {
              console.log(err, errTotal)
              result(null, err);
              return;
            }
            const data = {
              data: res,
              total: total?.[0]?.total ? total?.[0]?.total : 0,
              limit,
              offset
            }
            result(null, data);
          })
  });
};

SalesClient.getClientsById = (user_id, result) => {
  sql.query(`SELECT sc.client_id, c.client_entity_name, c.custom_field, c.address, c.location FROM sales_client sc INNER JOIN client c ON sc.client_id = c.client_id WHERE sc.user_id = ?`, user_id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    result(null, res);
  });
};

SalesClient.updateSalesClientById = (sales_client_id, sales_client, result) => {

  sql.query(`Select sales_client_id from sales_client where user_id = ${sales_client.user_id} and client_id = ${sales_client.client_id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (JSON.stringify(res[0]) != undefined) {
      result(null, res[0]);
      return;
    } else {
      sql.query(
        "UPDATE sales_client SET user_id = ?, client_id = ? WHERE sales_client_id = ?",
        [sales_client.user_id, sales_client.client_id, sales_client_id],
        (err, res) => {
          if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
          }

          if (res.affectedRows == 0) {
            // not found Client with the id
            result({ kind: "not_found" }, null);
            return;
          }

          result(null, { id: sales_client_id, res });
        }
      );
    }
  });
};

SalesClient.removeSalesClient = (sales_client_id, result) => {
  sql.query("DELETE FROM sales_client WHERE sales_client_id = ?", sales_client_id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found Client with the compny_id
      result({ kind: "not_found" }, null);
      return;
    }

    result(null, res);
  });
};

SalesClient.removeAllSalesClient = result => {
  sql.query("DELETE FROM sales_client", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    result(null, res);
  });
};

module.exports = SalesClient;