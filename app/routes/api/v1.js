const app = require('express').Router();
var path = require('path');
// Define Export Module

module.exports = (function () {
    var authRouter = require('./../../routes/api/v1/auth');
    app.use("/auth", authRouter);

    return app;
})();