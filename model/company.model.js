const sql = require("./db.js");
// constructor
const Company = function(company) {
  this.company_entity_name = company.company_entity_name;
  this.company_owner_name = company.company_owner_name;
  this.address = company.address;
  this.phone_number = company.phone_number;
  this.notes = company.notes;
  this.upload = company.upload;
  this.time_limit_per_schedule = company.time_limit_per_schedule;
  this.late_policy = company.late_policy;
  this.min_schedule_time = company.min_schedule_time;
  this.max_schedule_time = company.max_schedule_time;
  this.company_info = company.company_info
};

Company.createCompany = (newCompany, result) => {
    sql.query(`Select company_id from company where phone_number = '${newCompany.phone_number}'`, (err, res) => {
      if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if(JSON.stringify(res[0]) != undefined) {
      result(null, "This company is exist." );
      return;
    } else {
      sql.query("INSERT INTO company SET ?", newCompany, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
        result(null, { id: res.insertId, ...newCompany });
      });
    }
  });
};

Company.getAllCompany = (result) => {
  sql.query(`SELECT * FROM company`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res);
  });
};

Company.getCompanysByUserId = (user_id, result) => {
  sql.query(`SELECT * FROM company where company_id=(Select company_id from user where user_id=${user_id})`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res);
  });
};

Company.getCompanyByID = (company_id, result) => {
  sql.query(`SELECT * FROM company where company_id=?`, company_id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    const data = { ...res[0] };
    Object.keys(res[0] || {})?.forEach?.(key => {
      if (Buffer.isBuffer(data?.[key])) {
        data[key] = !!data[key].readUInt8()
      }
    });
    result(null, data);
  });
};

Company.updateCompanyById = (company_id, company, result) => {
  sql.query(
    `UPDATE company 
    SET
     company_entity_name=?, company_owner_name = ?, address = ?,
     phone_number = ?, notes = ?, upload = ?, time_limit_per_schedule = ?,
     late_policy = ?, min_schedule_time = ?, max_schedule_time = ?, company_info = ?
    WHERE
     company_id = ?`,
    [ company.company_entity_name, company.company_owner_name, 
      company.address, company.phone_number, company.notes, company.upload,
      company.time_limit_per_schedule, company.late_policy,
      company.min_schedule_time, company.max_schedule_time,
      company.company_info,
       company_id
    ],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found company with the id
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { company_id: company_id, ...company });
    }
  );
};

Company.removeCompany = (company_id, result) => {
  sql.query("DELETE FROM company WHERE company_id = ?", company_id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found Company with the compny_id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted company with company_id: ", company_id);
    result(null, res);
  });
};

Company.removeAllCompany = result => {
  sql.query("DELETE FROM company", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res);
  });
};

module.exports = Company;