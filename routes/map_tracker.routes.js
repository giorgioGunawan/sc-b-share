
module.exports = app => {
    // var express = require('express');
    // var app = express();
    const MapTracker = require("../controllers/map_tracker.controller.js");
    
    // Get getOrder
    app.post('/getMapTracker', MapTracker.getMapTracker)

    app.post('/getMapTrackerbyUserId', MapTracker.getMapTrackerbyUserId)

    app.post('/createMapTracker', MapTracker.createMapTracker)  
};