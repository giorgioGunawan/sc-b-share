
module.exports = app => {
    const Setting = require("../controllers/setting.controller");

    app.post("/getLiveTrackerSetting", Setting.getLiveTrackerSetting);

    app.post("/getAllLiveTrackerSetting", Setting.getAllLiveTrackerSetting);

    app.post("/updateLiveTrackerSetting", Setting.updateLiveTrackerSetting);

};