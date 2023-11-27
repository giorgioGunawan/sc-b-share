
module.exports = app => {
    // var express = require('express');
    // var app = express();
    const VR = require("../controllers/product.controller");
    
    app.post('/getAllProduct', VR.getAllProduct)

    app.post('/getProductById', VR.getProductById)

    app.post('/createProduct', VR.createProduct)

    app.post('/updateProduct', VR.updateProduct)
    
    app.post('/deleteProduct', VR.deleteProduct)
};