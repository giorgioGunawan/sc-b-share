const Branch = require("../model/branch.model.js");
// Create and Save a new Company
exports.createBranch = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a Branch
  const branch = new Branch({
    branch_name: req.body.branch_name,
    company_id: req.body.company_id,
  });

  // T1_Giorgio: WIP Save Branch in the database
  Branch.createBranch(branch, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Company."
      });
    else res.send(data);
  });
};

// Retrieve all branches from the database.
exports.findAllBranch = (req, res) => {
    Branch.getAllBranch((err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving Companys."
          });
        else res.send(data);
      });
};

exports.findBranchByID = (req, res) => {
  Branch.getBranchByID(req.body.branch_id,(err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Companys."
        });
      else res.send(data);
    });
};

exports.findBranchByCompanyId = (req, res) => {
  Company.getBranchByCompanyId(req.body.company_id,(err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Companys."
        });
      else res.send(data);
    });
};

exports.updateBranch = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const branch = new Branch({
    branch_id: req.body.branch_id,
    branch_name: req.body.branch_name,
    company_id: req.body.company_id,
  });

  Branch.updateBranchById(
    req.body.branch_id,
    branch,
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Branch with id ${req.params.branch_id}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating Branch with id " + req.params.branch_id
          });
        }
      } else res.send(data);
    }
  );
};

// T1_Giorgio: WIP turn this into updateBranch
/*
exports.updateCompany = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const company = new Company({
    company_id: req.body.company_id,
    company_entity_name: req.body.company_entity_name,
    company_owner_name: req.body.company_owner_name,
    address: req.body.address,
    phone_number: req.body.phone_number,
    notes: req.body.notes,
    upload: req.body.upload,
    time_limit_per_schedule: req.body.time_limit_per_schedule,
    late_policy: req.body.late_policy,
    min_schedule_time: req.body.min_schedule_time,
    max_schedule_time: req.body.max_schedule_time,
    company_info: req.body.company_info
  });

  Company.updateCompanyById(
    req.body.company_id,
    company,
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Company with id ${req.params.company_id}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating Company with id " + req.params.company_id
          });
        }
      } else res.send(data);
    }
  );
};

// Delete a Company with the specified CompanyId in the request
exports.deleteCompany = (req, res) => {
    Company.removeCompany(req.body.company_id, (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Not found Company with id ${req.params.company_id}.`
            });
          } else {
            res.status(500).send({
              message: "Could not delete Company with id " + req.params.company_id
            });
          }
        } else res.send({ message: `Company was deleted successfully!` });
      });
};

// Delete all Companys from the database.
exports.deleteAllCompany = (req, res) => {
    Company.removeAllCompany((err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while removing all Companys."
          });
        else res.send({ message: `All Companys were deleted successfully!` });
    });
};*/