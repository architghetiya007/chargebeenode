const common = require('./../../../../config/common');
const DB_HELPER = require('./../../../../config/db_helper');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const chargebee = require("chargebee");
const nodemailer = require("nodemailer");
chargebee.configure({
	site: "archit-test",
	api_key: "test_wuz31AKbSdAacuv8lgv16toQ43cwqt0N2"
});

exports.chargeBeeItemList = async (req, res) => {
	try {
		chargebee.configure({
			site: "archit-test",
			api_key: "test_wuz31AKbSdAacuv8lgv16toQ43cwqt0N2"
		})
		chargebee.item.list({
			limit: 100
		}).request(function (error, result) {
			if (error) {
				//handle error
				console.log(error);
				res.status(200).json({ status: false, code: 204, message: 'Error in getting from ', data: error });
			} else {
				console.log(result, "result>>>>>>>>>>>>>>>>>");
				res.status(200).json({ status: true, code: 200, message: 'List of item', data: result });
			}
		});
	}
	catch (e) {
		console.log(e, "????????");
		res.status(200).json({ status: false, code: 400, message: 'catch error', data: e + "" });
	}
}

exports.chargeBeeCreateCustomer = async (req, res) => {
	try {
		chargebee.customer.create({
			first_name: "John",
			last_name: "Doe",
			email: "john@test.com",
			locale: "fr-CA"
		}).request(function (error, result) {
			if (error) {
				console.log(error);
				res.status(200).json({ status: false, code: 204, message: 'Error in getting from ', data: error });
			} else {
				console.log(result, "result>>>>>>>>>>>>>>>>>");
				res.status(200).json({ status: true, code: 200, message: 'create customer', data: result });
			}
		});
	}
	catch (e) {
		console.log(e, "????????");
		res.status(200).json({ status: false, code: 400, message: 'catch error', data: e + "" });
	}
}

exports.chargeBeeListOfCustomer = async (req, res) => {
	try {
		const random = Math.random().toString().substr(2, 6);
		console.log(req.body, "request>>>>>>>>>>>");
		chargebee.customer.list({
			"email[is]": req.body.email,
			"first_name":"0"
		}).request( function (error, result) {
			if (error) {
				//handle error
				console.log(error);
				return res.status(200).json({ status: false, code: 205, message: 'Error in getting from chargeebee', data: error });
			} else {
				if (result.list.length > 0) {
					if(result.list[0].customer.first_name == 1) {
						return res.status(200).json({ status: false, code: 204, message: 'user already created', data: result.list });
					} else {
						const sendmail =  common.send_mail(req.body.email, "OTP FOR CHARGEBEE VERIFY", random);
						console.log(result.list[0],">>>>>>>>>>>>>>>>>>>");
						chargebee.customer.update(result.list[0].customer.id, {
							first_name: random
						}).request(function (error, result) {
							if (error) {
								//handle error
								console.log(error);
							} else {
								return res.status(200).json({ status: true, code: 204, message: 'Customer Created', data: result });
							}
						});
					}
				}
				else {
					const sendmail =  common.send_mail(req.body.email, "OTP FOR CHARGEBEE VERIFY", random);
					chargebee.customer.create({
						email: req.body.email,
					}).request(function (error, result) {
						if (error) {
							//handle error
							console.log(error);
							return res.status(200).json({ status: false, code: 205, message: 'Error in getting from chargeebee', data: error });
						} else {
							chargebee.customer.update(result.customer.id, {
								first_name: random
							}).request(function (error, result) {
								if (error) {
									//handle error
									console.log(error);
								} else {
									return res.status(200).json({ status: true, code: 200, message: 'Customer Created', data: result });
								}
							});
						}
					});
				}
			}
		});
	}
	catch (e) {
		console.log(e, "????????");
		res.status(200).json({ status: false, code: 400, message: 'catch error', data: e + "" });
	}
}

exports.verifyMail = async (req, res) => {
	try {
		chargebee.customer.update(result.customer.id, {
			first_name: 1
		}).request(function (error, result) {
			if (error) {
				//handle error
				console.log(error);
			} else {
				return res.status(200).json({ status: true, code: 200, message: 'Customer Created', data: result });
			}
		});
	}
	catch (e) {
		console.log(e, "????????");
		res.status(200).json({ status: false, code: 400, message: 'catch error', data: e + "" });
	}
}

