
module.exports = app => {
    const Absent = require("../controllers/absent.controller.js");
    
    app.post('/getAbsent', Absent.getAbsent)
    
    app.post('/getAbsentV2', Absent.getAbsentV2)

    app.post('/checkInAbsent', Absent.checkin)

    app.post('/checkOutAbsent', Absent.checkout)  

    app.post('/getAllAbsent', Absent.getAllAbsent)

    app.post('/getAllCompanyAbsentFeature', Absent.getAllCompanyAbsentFeature)

    app.post('/updateAbsentFeature', Absent.updateAbsentFeature)

    app.post('/getAllCompanyAllowSelfCreateFeature', Absent.getAllCompanyAllowSelfCreateFeature)

    app.post('/updateAllowSelfCreateFeature', Absent.updateAllowSelfCreateFeature)
};