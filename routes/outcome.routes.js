
module.exports = app => {
    // var express = require('express');
    // var app = express();
    const Outcome = require("../controllers/outcome.controller");
    
    app.post('/getAllOutcome', Outcome.getAllOutcome)

    app.post('/getOutcomeById', Outcome.getOutcomeById)

    app.post('/createOutcome', Outcome.createOutcome)

    app.post('/updateOutcome', Outcome.updateOutcome)
    
    app.post('/deleteOutcome', Outcome.deleteOutcome)

    app.post('/getOutcomeReport', Outcome.getOutcomeReport)
};