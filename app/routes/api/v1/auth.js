const app = require('express').Router();
const jwt = require('jsonwebtoken');


module.exports = (function () {
const authCtrl = require("./../../../controller/api/v1/authController");

    app.get("/chargebee-item-list",authCtrl.chargeBeeItemList);
    app.post("/chargebee-user-list",authCtrl.chargeBeeListOfCustomer);
    app.put("/verify-mail",authCtrl.verifyMail);
    app.put("/chargebee-save-user-detail",authCtrl.chargeBeeSaveUserDetail);
    app.post("/chargebee-checkout",authCtrl.chargeBeeCheckout);
return app;
})();
