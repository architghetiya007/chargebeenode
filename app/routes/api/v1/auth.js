const app = require('express').Router();
const verifyToken = require('./../middleware');

module.exports = (function () {
const authCtrl = require("./../../../controller/api/v1/authController");

    app.get("/chargebee-item-list",authCtrl.chargeBeeItemList);
    app.post("/chargebee-user-list",authCtrl.chargeBeeListOfCustomer);
    app.put("/verify-mail",authCtrl.verifyMail);
    app.put("/chargebee-save-user-detail",authCtrl.login);
    app.post("/chargebee-checkout",authCtrl.chargeBeeCheckout);
    app.put("/chargebee-network", verifyToken, authCtrl.chargeBeeGetNetwork);
    app.put("/chargebee-update-network", verifyToken, authCtrl.chargeBeeUpdateNetwork);
    app.get("/chargebee-get-user-detail", verifyToken, authCtrl.chargeBeeGetUserDetail);
    
return app;
})();
