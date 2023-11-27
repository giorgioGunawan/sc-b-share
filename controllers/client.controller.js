const axios = require("axios");
const { GOOGLE_MAP_API_KEY } = require("../config/api.js");
const Client = require("../model/client.model.js");
// Create and Save a new client
exports.createClient = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }


  // Create a Client
  const client = new Client({
    client_entity_name: req.body.client_entity_name,
    custom_field: req.body.custom_field,
    address:req.body.address,
    phone_number:req.body.phone_number,
    location:req.body.location,
    company_id:req.body.company_id,
    created_by: req.body.created_by,
    approved: req.body.approved
  });

  // Save client in the database
  Client.createClient(client, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the client."
      });
    else res.send(data);
  });
};

exports.importClient = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }


  // Create a Client
  const raw = await Promise.all(req.body.map(item => axios(`https://maps.googleapis.com/maps/api/geocode/json?address=${item.address}&key=${GOOGLE_MAP_API_KEY}`)))
  const client = [req.body.map((item, i) => {
    let location = null
    if (raw[i].data.results.length) {
      const locations = raw[i].data.results[0].geometry.location
      const latitude = locations.lat
      const longitude = locations.lng
      location = `${latitude} ${longitude}`
    }
    return [
      item.client_entity_name,
      item.address,
      item.phone_number,
      item.approved,
      item.company_id,
      item.created_by,
      location
    ]
    })
  ]
  // Save client in the database
  Client.importClient(client, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the client."
      });
    else res.send(data);
  });
};

// exports.createClientWithCSV = (req, res) => {
//   // Validate request
//   if (!req.body) {
//     res.status(400).send({
//       message: "Content can not be empty!"
//     });
//   }


//   // Create a Client
//   const client = new Client({
//     client_entity_name: req.body.client_entity_name,
//     custom_field: req.body.custom_field,
//     address:req.body.address,
//     phone_number:req.body.phone_number,
//     location:req.body.location,
//     company_id:req.body.company_id,
//     created_by: req.body.created_by,
//     approved: req.body.approved
//   });
//   console.log(client);

//   // Save client in the database
//   Client.createClientWithCSV(client, (err, data) => {
//     console.log(client);
//     if (err)
//       res.status(500).send({
//         message:
//           err.message || "Some error occurred while creating the client."
//       });
//     else res.send(data);
//   });
// };

// Retrieve all clients from the database.
exports.findAllClient = (req, res) => {
    Client.getAllClient((err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving Clients."
          });
        else res.send(data);
      });
};

exports.findClientProfileById = (req, res) => {
  Client.getClientProfileById(req.body.client_id, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Clients."
        });
      else res.send(data);
    });
};

// Retrieve all clients from the database.
exports.findAllClientById = (req, res) => {
  Client.getAllClientById(req.body.company_id, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Clients."
        });
      else res.send(data);
    });
};

// Retrieve all clients from the database.
exports.findAllClientWithFilter = (req, res) => {
  let body = {}
  if (req.body.branch_id) {
    body = {
      company_id: req.body.company_id,
      limit: req.body.limit,
      offset: req.body.offset,
      approved: req.body.approved,
      created_by: req.body.created_by,
      branch_id: req.body.branch_id,
      client_entity_name: req.body.client_entity_name,
      created_by_name: req.body.created_by_name
    }
    Client.getAllBranchClientWithFilter(body, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Clients."
        });
      else res.send(data);
    });
  } else {
    body = {
      company_id: req.body.company_id,
      limit: req.body.limit,
      offset: req.body.offset,
      approved: req.body.approved,
      created_by: req.body.created_by,
      client_entity_name: req.body.client_entity_name,
      created_by_name: req.body.created_by_name
    }
    Client.getAllCompanyClientWithFilter(body, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Clients."
        });
      else res.send(data);
    });
  }
};

// Update a Client identified by the ClientId in the request
exports.updateClient = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const client = {
    client_id: req.body.client_id,
    custom_field: req.body.custom_field,
    client_entity_name: req.body.client_entity_name,
    address: req.body.address,
    phone_number: req.body.phone_number,
    location: req.body.location,
    company_id: req.body.company_id,
    approved: req.body.approved,
    created_by: req.body.created_by,
    user_id: req.body.user_id
  };

  Client.updateClientById(
    req.body.client_id,
    client,
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found client with id ${req.params.client_id}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating client with id " + req.params.client_id
          });
        }
      } else res.send(data);
    }
  );
};

exports.updateClientApproval = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const client = {
    client_id: req.body.client_id,
    approved: req.body.approved,
    user_id: req.body.user_id
  };

  Client.updateClientApprovalById(
    req.body.client_id,
    client,
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found client with id ${req.params.client_id}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating client approval with id " + req.params.client_id
          });
        }
      } else res.send(data);
    }
  );
};


// Delete a client with the specified clientId in the request
exports.deleteClient = (req, res) => {
    Client.removeClient(req.body.client_id, (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Not found client with id ${req.params.client_id}.`
            });
          } else {
            res.status(500).send({
              message: "Could not delete client with id " + req.params.client_id
            });
          }
        } else res.send({ message: `client was deleted successfully!` });
      });
};

// Delete all clients from the database.
exports.deleteAllClient = (req, res) => {
    Client.removeAllClient((err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while removing all Clients."
          });
        else res.send({ message: `All Clients were deleted successfully!` });
    });
};