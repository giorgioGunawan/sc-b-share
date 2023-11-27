const VR = require("../model/visiting_reason.model");
const moment = require("moment")

// Create and Save a new User
exports.getAllVisitingReason = (req, res) => {
    const company_id = req.body.company_id
    VR.getAllVisitingReason(company_id, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred."
          });
        else res.send(data);
    });
};

// Retrieve all clients from the database.
exports.getVisitingReasonById = (req, res) => {
    const id = req.body.id
    VR.getVisitingReasonById(id, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred."
          });
        else res.send(data);
    });
};

exports.createVisitingReason = (req, res) => {
  const newVisitingReason = {
    company_id: req.body.company_id,
    name: req.body.name,
    description: req.body.description,
    include_product: req.body.include_product ? 1 : 0
  }
  VR.createVisitingReason(newVisitingReason, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred."
        });
      else res.send(data);
    });
};

exports.updateVisitingReason = (req, res) => {
    const body = {
      id: req.body.id,
      name: req.body.name,
      description: req.body.description,
      include_product: req.body.include_product ? 1 : 0
    }
    VR.updateVisitingReason(body, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred."
          });
        else res.send(data);
      });
};

exports.deleteVisitingReason = (req, res) => {
    const id = req.body.id
    VR.deleteVisitingReason(id, (err, data) => {
        if (err)
            res.status(500).send({
            message:
                err.message || "Some error occurred."
            });
        else res.send(data);
    });
};

exports.getVisitingReasonReport = (req, res) => {
  const body = {
    company_id: req.body.company_id,
    start_date: req.body.start_date ? moment(req.body.start_date).format('YYYY-MM-DD HH:mm') : null,
    end_date: req.body.end_date ? moment(req.body.end_date).format('YYYY-MM-DD HH:mm') : req.body.start_date ? moment(req.body.start_date).format('YYYY-MM-DD HH:mm') : null,
  }
  VR.getVisitingReasonReport(body, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred."
        });
      else res.send(data);
  });
};