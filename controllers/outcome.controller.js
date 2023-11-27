const Outcome = require("../model/outcome.model");
const moment = require("moment")

// Create and Save a new User
exports.getAllOutcome = (req, res) => {
    const company_id = req.body.company_id
    Outcome.getAllOutcome(company_id, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred."
          });
        else res.send(data);
    });
};

// Retrieve all clients from the database.
exports.getOutcomeById = (req, res) => {
    const id = req.body.id
    Outcome.getOutcomeById(id, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred."
          });
        else res.send(data);
    });
};

exports.createOutcome = (req, res) => {
    const newOutcome = {
        company_id: req.body.company_id,
        name: req.body.name,
        description: req.body.description || null,
    }
    Outcome.createOutcome(newOutcome, (err, data) => {
        if (err)
            res.status(500).send({
            message:
                err.message || "Some error occurred."
            });
        else res.send(data);
    });
};

exports.updateOutcome = (req, res) => {
    const body = {
      id: req.body.id,
      name: req.body.name,
      description: req.body.description || null,
    }
    Outcome.updateOutcome(body, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred."
          });
        else res.send(data);
      });
};

exports.deleteOutcome = (req, res) => {
    const id = req.body.id
    Outcome.deleteOutcome(id, (err, data) => {
        if (err)
            res.status(500).send({
            message:
                err.message || "Some error occurred."
            });
        else res.send(data);
    });
};

exports.getOutcomeReport = (req, res) => {
    const body = {
      company_id: req.body.company_id,
      start_date: req.body.start_date ? moment(req.body.start_date).format('YYYY-MM-DD HH:mm') : null,
      end_date: req.body.end_date ? moment(req.body.end_date).format('YYYY-MM-DD HH:mm') : req.body.start_date ? moment(req.body.start_date).format('YYYY-MM-DD HH:mm') : null,
    }
    Outcome.getOutcomeReport(body, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred."
          });
        else res.send(data);
    });
  };