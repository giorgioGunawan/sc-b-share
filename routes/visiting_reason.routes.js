
module.exports = app => {
    // var express = require('express');
    // var app = express();
    const VR = require("../controllers/visiting_reason.controller");
    
    app.post('/getAllVisitingReason', VR.getAllVisitingReason)

    app.post('/getVisitingReasonById', VR.getVisitingReasonById)

    app.post('/createVisitingReason', VR.createVisitingReason)

    app.post('/updateVisitingReason', VR.updateVisitingReason)
    
    app.post('/deleteVisitingReason', VR.deleteVisitingReason)

    app.post('/getVisitingReasonReport', VR.getVisitingReasonReport)
};