const VR = require("../model/product.model");

// Create and Save a new User
exports.getAllProduct = (req, res) => {
    const company_id = req.body.company_id
    VR.getAllProduct(company_id, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred."
          });
        else res.send(data);
    });
};

// Retrieve all clients from the database.
exports.getProductById = (req, res) => {
    const id = req.body.id
    VR.getProductById(id, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred."
          });
        else res.send(data);
    });
};

exports.createProduct = (req, res) => {
    const newProduct = {
        company_id: req.body.company_id,
        name: req.body.name,
        description: req.body.description || null,
    }
    VR.createProduct(newProduct, (err, data) => {
        if (err)
            res.status(500).send({
            message:
                err.message || "Some error occurred."
            });
        else res.send(data);
    });
};

exports.updateProduct = (req, res) => {
    const body = {
      id: req.body.id,
      name: req.body.name,
      description: req.body.description || null,
    }
    VR.updateProduct(body, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred."
          });
        else res.send(data);
      });
};

exports.deleteProduct = (req, res) => {
    const id = req.body.id
    VR.deleteProduct(id, (err, data) => {
        if (err)
            res.status(500).send({
            message:
                err.message || "Some error occurred."
            });
        else res.send(data);
    });
};