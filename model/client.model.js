const sql = require("./db.js");
const SalesClient = require("./salesclient.model.js");
// constructor
const Client = function (client) {
  this.client_id = client.client_id;
  this.custom_field = client.custom_field;
  this.client_entity_name = client.client_entity_name;
  this.address = client.address;
  this.phone_number = client.phone_number;
  this.location = client.location;
  this.company_id = client.company_id;
  this.approved = client.approved,
  this.created_by = client.created_by
};

Client.createClient = (newClient, result) => {
  sql.query(`Select client_id from client where phone_number = '${newClient.phone_number}'`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    // This code makes the phone number unique, we dont need this
    /*
    if (JSON.stringify(res[0]) != undefined) {
      result(null, { client_id: res[0].client_id });
      return;
    } else {
      sql.query("INSERT INTO client SET ?", newClient, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
        result(null, { id: res.insertId, ...newClient });
        
      });
    }*/
  
    let allow_self_create_client = 0;
    // If company id allows self create, change the approve to true
    sql.query(`SELECT allow_self_create_client FROM company WHERE company_id = ${newClient.company_id}`,
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      const allow_self_create_clientJson = JSON.stringify(res[0].allow_self_create_client)

      allow_self_create_client = JSON.parse(allow_self_create_clientJson)?.data

      if (allow_self_create_client) {
        allow_self_create_client = Number(allow_self_create_client[0])
      }

      // IF NEWCLIENT IS INITIALLY NOT APPROVED, CHECK IF ALLOW_SELF_CREATE_CLIENT CAN OVERRIDE
      if (
        newClient.approved == 0 
        && allow_self_create_client 
        && allow_self_create_client == 1
      ) {
        newClient.approved = allow_self_create_client;
      }        
      sql.query("INSERT INTO client SET ?", newClient, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
        if (newClient.approved) {
          const salesclient = new SalesClient({
            user_id: [newClient.created_by],
            client_id: res.insertId
          });
          SalesClient.createSalesClient(salesclient, () => {
            console.log(salesclient, 'salesclient')
            result(null, { id: res.insertId, ...newClient });
          });
        } else {
          console.log(salesclient, 'salesclient')
          result(null, { id: res.insertId, ...newClient });
        }
      });
    });

    
  });

};

Client.importClient = (newClient, result) => {
  sql.query("INSERT INTO client (client_entity_name, address, phone_number, approved, company_id, created_by, location) VALUES ?", newClient, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, newClient });
    
  });
};

Client.getAllClient = (result) => {
  sql.query(`SELECT c.*, co.company_entity_name, u.full_name FROM client c LEFT OUTER JOIN company co ON c.company_id = co.company_id 
  LEFT OUTER JOIN user u ON c.created_by = u.user_id
  `, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res);
  });
};

Client.getAllClientById = (company_id, result) => {
  sql.query(`SELECT c.*, u.full_name FROM client c LEFT OUTER JOIN user u ON c.created_by = u.user_id where c.company_id IN (${company_id})`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res);
  });
};

Client.getAllBranchClientWithFilter = ({company_id, limit, offset, approved, created_by, keyword, branch_id, client_entity_name, created_by_name}, result) => {
  sql.query(`
    SELECT c.*, u.full_name FROM client c
      LEFT OUTER JOIN user u ON c.created_by = u.user_id 
        where 
        (u.branch_id = ${branch_id} AND c.company_id = ${company_id} ${approved === true ?  `AND c.approved = ${approved}` : approved === false ?  `AND c.approved = ${approved}` : ''} ${created_by ?  `AND c.created_by = ${created_by}` : ''}) 
        ${
          client_entity_name
            ?
            `AND (c.client_entity_name LIKE '%${client_entity_name}%')`
            :
            ''
          }
        ${
          created_by_name
            ?
            `AND (u.full_name LIKE '%${created_by_name}%')`
            :
            ''
          } 
          ORDER by c.client_id DESC ${limit ? `LIMIT ${limit}` : ''} ${offset ? `OFFSET ${offset}` : ''}`,
    (err, res) => {
      sql.query(`
      SELECT COUNT(*) as total FROM client c
      LEFT OUTER JOIN user u ON c.created_by = u.user_id 
        where 
        (c.company_id = ${company_id} ${approved === true ?  `AND c.approved = ${approved}` : approved === false ?  `AND c.approved = ${approved}` : ''} ${created_by ?  `AND c.created_by = ${created_by}` : ''}) 
        ${
          client_entity_name
            ?
            `AND (c.client_entity_name LIKE '%${client_entity_name}%')`
            :
            ''
          }
        ${
          created_by_name
            ?
            `AND (u.full_name LIKE '%${created_by_name}%')`
            :
            ''
          } `, (errTotal, total) => {
          if (err) {
            console.log("error: ", err);
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

Client.getAllCompanyClientWithFilter = ({company_id, limit, offset, approved, created_by, client_entity_name, created_by_name}, result) => {
  sql.query(`
    SELECT c.*, u.full_name FROM client c
      LEFT OUTER JOIN user u ON c.created_by = u.user_id 
        where 
        (c.company_id = ${company_id} ${approved === true ?  `AND c.approved = ${approved}` : approved === false ?  `AND c.approved = ${approved}` : ''} ${created_by ?  `AND c.created_by = ${created_by}` : ''}) 
        ${
          client_entity_name
            ?
            `AND (c.client_entity_name LIKE '%${client_entity_name}%')`
            :
            ''
          }
        ${
          created_by_name
            ?
            `AND (u.full_name LIKE '%${created_by_name}%')`
            :
            ''
          } 
          ORDER by c.client_id DESC ${limit ? `LIMIT ${limit}` : ''} ${offset ? `OFFSET ${offset}` : ''}`,
    (err, res) => {
      sql.query(`
      SELECT COUNT(*) as total FROM client c
      LEFT OUTER JOIN user u ON c.created_by = u.user_id 
        where 
        (c.company_id = ${company_id} ${approved === true ?  `AND c.approved = ${approved}` : approved === false ?  `AND c.approved = ${approved}` : ''} ${created_by ?  `AND c.created_by = ${created_by}` : ''}) 
        ${
          client_entity_name
            ?
            `AND (c.client_entity_name LIKE '%${client_entity_name}%')`
            :
            ''
          }
        ${
          created_by_name
            ?
            `AND (u.full_name LIKE '%${created_by_name}%')`
            :
            ''
          } `, (errTotal, total) => {
          if (err) {
            console.log("error: ", err);
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


Client.getClientProfileById = (client_id, result) => {
  sql.query(`SELECT c.client_entity_name, c.custom_field, c.address, c.phone_number, c.company_id, c.location, c.approved, c.created_by, co.company_entity_name 
  FROM client c LEFT OUTER JOIN company co ON c.company_id = co.company_id where c.client_id=${client_id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res[0]);
  });
};

Client.updateClientById = (client_id, client, result) => {

  sql.query(
    "UPDATE client SET client_entity_name=?, custom_field = ?, address = ?, phone_number = ?, location = ?, company_id = ?, approved = ?, created_by = ? WHERE client_id = ?",
    [client.client_entity_name, client.custom_field, client.address, client.phone_number, client.location, client.company_id, client.approved, client.created_by, client_id],
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

      if (client.approved) {
        
        const salesclient = new SalesClient({
          user_id: [client.user_id],
          client_id: client_id
        });
        sql.query(`SELECT * FROM user where user_id = ${client.user_id}`, (err, res) => {
          if (res.isAdmin || res.isSuperAdmin) {
            result(null, { client_id: client_id, ...client });
          }else{
            SalesClient.createSalesClient(salesclient, () => {
              result(null, { client_id: client_id, ...client });
            });
          }
        })
      } else {
        result(null, { client_id: client_id, ...client });
      }
    }
  );

};

Client.updateClientApprovalById = (client_id, client, result) => {

  sql.query(
    "UPDATE client SET approved = ? WHERE client_id = ?",
    [client.approved, client_id],
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

      if (client.approved) {
        
        const salesclient = new SalesClient({
          user_id: [client.user_id],
          client_id: client_id
        });
        sql.query(`SELECT * FROM user where user_id = ${client.user_id}`, (err, res) => {
          
          // If created by admin, just simply approve
          if (res.isAdmin || res.isSuperAdmin) {
            result(null, { client_id: client_id, ...client });

            // If created by sales, create sales client, and approve sales client
          }else{
            SalesClient.createSalesClient(salesclient, () => {
            result(null, { client_id: client_id, ...client });
          });
          }
          
        })
      } else {
        result(null, { client_id: client_id, ...client });
      }
    }
  );

};

Client.removeClient = (client_id, result) => {
  sql.query("DELETE FROM client WHERE client_id = ?", client_id, (err, res) => {
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

Client.removeAllClient = result => {
  sql.query("DELETE FROM client", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} client`);
    sql.query("DELETE FROM sales_client", (err, res) => {
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
    });
    // result(null, res);
  });
};

module.exports = Client;