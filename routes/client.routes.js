
module.exports = app => {
// var express = require('express');
// var app = express();
const Client = require("../controllers/client.controller.js");

// Get Client
app.post("/getClient", Client.findAllClient);

// Get Client by Company_id
app.post("/getClientByCompanyId", Client.findAllClientById);


// Get Client with filter
app.post("/getClientWithFilter", Client.findAllClientWithFilter);

// Get Client Profile by client_entity_name
app.post("/getClientProfileById", Client.findClientProfileById);

//Add New Client
app.post("/addClient", Client.createClient);

//Import New Client
app.post("/importClient", Client.importClient);

//Add New Client
// app.post("/addClientWithCSV", Client.createClientWithCSV);

//Delete Client
app.post("/deleteClient", Client.deleteClient);

//Update Client
app.post("/updateClient", Client.updateClient);

app.post("/updateClientApproval", Client.updateClientApproval);
};