module.exports = app => {
    const Branch = require("../controllers/branch.controller.js");
    
    // Get Branch
    app.post("/getBranch", Branch.findAllBranch);

    // Get Branch by Company Id
    app.post("/getBranchByCompanyId", Branch.findBranchByCompanyId);

    // Get Branch by id
    app.post("/getBranchById", Branch.findBranchByID);

    //Add New Branch
    app.post("/addBranch", Branch.createBranch);

    //Update Company
    app.post("/updateBranch", Branch.updateBranch);
};