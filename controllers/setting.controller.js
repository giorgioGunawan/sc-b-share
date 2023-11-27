const Setting = require("../model/setting.model");

// Create and Save a new User
exports.updateLiveTrackerSetting = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  
   // Create a newSetting
    const newSetting = {
        company_id: req.body.company_id,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
    };
  console.log(newSetting);
  
  // Save Setting in the database
  Setting.updateLiveTrackerSetting(newSetting, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred."
      });
    else res.send(data);
  });
};

// Retrieve all clients from the database.
exports.getLiveTrackerSetting = (req, res) => {
    const company_id = req.body.company_id
    Setting.getLiveTrackerSetting(company_id, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred."
          });
        else res.send(data);
      });
};

exports.getAllLiveTrackerSetting = (req, res) => {
  const body = {
    company_id: req.body.company_id,
    limit: req.body.limit,
    offset: req.body.offset,
    keyword: req.body.keyword,
  }
  Setting.getAllLiveTrackerSetting(body, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred."
        });
      else res.send(data);
    });
};