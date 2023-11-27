
module.exports = app => {
    // var express = require('express');
    // var app = express();
    const CF = require("../controllers/custom_form.controller");
    
    app.post('/getCustomUploadField', CF.getCustomUploadField)
    app.post('/getAllCustomUploadField', CF.getAllCustomUploadField)
    app.post('/createCustomUploadField', CF.createCustomUploadField)
    app.post('/updateCustomUploadField', CF.updateCustomUploadField)
};