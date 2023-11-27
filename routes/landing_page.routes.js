
module.exports = app => {
    const LandingPage = require("../controllers/landing_page.controller");
    
    // send an email
    app.post('/sendEmail', LandingPage.sendEmail)

    // setup affiliate
    // app.post('/setupAffiliate', LandingPage.setupAffiliate)
};