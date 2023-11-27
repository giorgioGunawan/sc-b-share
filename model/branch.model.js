const sql = require("./db.js");
// constructor
const Branch = function(branch) {
  this.branch_name = branch.branch_name;
  this.company_id = branch.company_id;
};

Branch.createBranch = (newBranch, result) => {
    sql.query("INSERT INTO branch SET ?", newBranch, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      result(null, { id: res.insertId, ...newBranch });
    });
};

Branch.getBranchByID = (branch_id, result) => {
  sql.query(`SELECT * FROM branch WHERE branch_id=?`, [branch_id], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res[0]);
  });
};

Branch.getAllBranch = (result) => {
  sql.query(`SELECT *, c.company_entity_name FROM branch b LEFT OUTER JOIN company c ON b.company_id = c.company_id`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res);
  });
};

Branch.getBranchByCompanyId = (company_id, result) => {
  sql.query(`SELECT * FROM branch where branch.company_id=?`, company_id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res[0]);
  });
};

Branch.updateBranchById = (branch_id, branch, result) => {
  sql.query(
    `UPDATE branch 
    SET
    branch_name=?, company_id = ?
    WHERE
     branch_id = ?`,
    [ branch.branch_name, branch.company_id, branch_id],
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
      result(null, { branch_id: branch_id, ...branch });
    }
  );
};

// T1_Giorgio: WIP update branch and delete branch
/*
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
};*/

module.exports = Branch;