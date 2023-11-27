const CF = require("../model/custom_form.model");

exports.getCustomUploadField = (req, res) => {
    const company_id = req.body.company_id
    const form_name = req.body.form_name
    CF.getCustomUploadField({company_id, form_name}, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred."
          });
        else res.send(data);
    });
};

exports.getAllCustomUploadField = (req, res) => {
    const company_id = req.body.company_id
    CF.getAllCustomUploadField(company_id, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred."
          });
        else res.send(data);
    });
};

exports.createCustomUploadField = (req, res) => {
    const newVisitingReason = {
      company_id: req.body.company_id,
      form_id: req.body.form_id,
      enable: req.body.enable  ? 1 : 0,
      required: req.body.required ? 1 : 0
    }
    CF.createCustomUploadField(newVisitingReason, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred."
          });
        else res.send(data);
      });
  };
  
  exports.updateCustomUploadField = (req, res) => {
      const body = {
        id: req.body.id,
        company_id: req.body.company_id,
        form_id: req.body.form_id,
        enable: req.body.enable ? 1 : 0,
        required: req.body.required ? 1 : 0
      }
      CF.updateCustomUploadField(body, (err, data) => {
          if (err)
            res.status(500).send({
              message:
                err.message || "Some error occurred."
            });
          else res.send(data);
        });
  };