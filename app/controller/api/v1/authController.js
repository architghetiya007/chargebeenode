const common = require('./../../../../config/common');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const chargebee = require("chargebee");
const nodemailer = require("nodemailer");
const client = require('./../../../../database');

	// chargebee.configure({
	// 	site: "differ-test",
	// 	api_key: "test_wuz31AKbSdAacuv8lgv16toQ43cwqt0N2"
	// });

	// chargebee.configure({
	// 	site: "archit-test",
	// 	api_key: "test_wuz31AKbSdAacuv8lgv16toQ43cwqt0N2"
	// });

 chargebee.configure({
		site: "archittest-test",
		api_key: "test_ZQbcdpBTEEy8mUycxOM5CIvgPo0fcd3nsf"
	});


// chargebee.configure({
// 	site: "architnew2-test",
// 	api_key: "test_rY26HFiCmFbTpzyjDODpwxpIrvqZUpcX"
// });

exports.chargeBeeItemList = async (req, res) => {
	try {
		chargebee.item.list({
			limit: 100
		}).request(function (error, result) {
			if (error) {
				//handle error
				console.log(error);
				res.status(200).json({ status: false, code: 204, message: 'Error in getting from ', data: error });
			} else {
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
		chargebee.customer.list({
			"email[is]": req.body.email,
		}).request( function (error, result) {
			if (error) {
				//handle error
				console.log(error);
				return res.status(200).json({ status: false, code: 400, message: 'Error getting from chargeebee', data: error });
			} else {
				//TODO: check for existing customer 
				if (result.list.length > 0) {
					if(result.list[0].customer.cf_validation_code == 1) {
						return res.status(200).json({ status: true, code: 201, message: 'user already created', data: result.list });
					} else {
						const sendmail =  common.send_mail(req.body.email, "OTP FOR CHARGEBEE VERIFY", random);
						console.log(result.list[0],">>>>>>>>>>>>>>>>>>>");
						chargebee.customer.update(result.list[0].customer.id, {
							cf_validation_code: random
						}).request(function (error, result) {
							if (error) {
								//handle error
								console.log(error);
								return res.status(200).json({ status: false, code: 400, message: 'Error getting from chargeebee' });
							} else {
								return res.status(200).json({ status: true, code: 204, message: 'Customer already created but till not verify', data: result });
							}
						});
					}
				}
				//TODO: create new customer 
				else {
					const sendmail =  common.send_mail(req.body.email, "OTP FOR CHARGEBEE VERIFY", random);
					var queryString  = "INSERT INTO address (email, address) VALUES ('"+ req.body.email+"','"+req.body.address +"')";
					console.log(queryString,"queryString>>>>>>>>>>");
					client.query(queryString ,(err,res) => {
						if(err){
							console.log(err,"Error While save into DB");
						}
						else{
							console.log(res);
						}
					})
					chargebee.customer.create({
						email: req.body.email,
						cf_validation_code:random
					}).request(function (error, result) {
						if (error) {
							//handle error
							console.log(error);
							return res.status(200).json({ status: false, code: 400, message: 'Error in getting from chargeebee', data: error });
						} else {
							return res.status(200).json({ status: true, code: 200, message: 'New customer Created', data: result });
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
		console.log(req.body,"body>>>>>>>>>>>>>>>>>>>>>");
		chargebee.customer.list({
			"email[is]":req.body.email
		}).request(function (error, result) {
			if (error) {
				console.log(error);
				res.status(200).json({ status: false, code: 400, message: 'Invalid OTP'});
			}
			else {
				console.log(result.list[0].customer,"customer>>>>>>>");
				if (result.list[0].customer.cf_validation_code == req.body.FULL_OTP) {
					chargebee.customer.update(result.list[0].customer.id,{
						cf_validation_code : 1,
					  }).request(function(error,response) {
						if(error){
							res.status(200).json({ status: false, code: 400, message: 'Invalid OTP' });
						}else{
							res.status(200).json({ status: true, code: 200, message: 'OTP verify', data: result.list[0].customer.id });
						}
					  });
				}
				else {
					res.status(200).json({ status: false, code: 400, message: 'Invalid OTP' });
				}
			}
		});
	}
	catch (e) {
		console.log(e, "????????");
		res.status(200).json({ status: false, code: 400, message: 'catch error', data: e + "" });
	}
}

exports.chargeBeeSaveUserDetail = async (req, res) => {
	try {
		let encryptedPass = md5(req.body.password);
		console.log(req.body, "body>>>>>>>>>>>>>>>>>>>>>");
		chargebee.customer.list({
			"email[is]": req.body.email
		}).request(function (error, result) {
			if (error) {
				console.log(error);
				res.status(200).json({ status: false, code: 400, message: 'Error From Chargbee' });
			}
			else {
				console.log(result.list[0].customer.id, "customer>>>>>>>");
				chargebee.customer.update(result.list[0].customer.id, {
					first_name: req.body.firstName,
					last_name: req.body.lastName,
					cf_password: encryptedPass,
					cf_birthday: req.body.birthday,
					billing_address: {
						line1: req.body.serviceAddress
					}
				}).request(function (error, response) {
					if (error) {
						//handle error
						console.log(error);
						res.status(200).json({ status: false, code: 400, message: 'Error From Chargbee' });
					} else {
						console.log(response);
						res.status(200).json({ status: true, code: 200, message: 'Information updated successfully' });
					}
				});
			}
		});
	}
	catch (e) {
		console.log(e, "????????");
		res.status(200).json({ status: false, code: 400, message: 'catch error', data: e + "" });
	}
}

exports.chargeBeeCheckout = async (req, res) => {
	try {
		chargebee.hosted_page.checkout_new_for_items({
			subscription_items : [
			  {
				item_price_id : "",	
				unit_price : 100,
			  },
			  {
				item_price_id : "cbdemo_additional_analytics",
				quantity : 1  
			  }]
		  }).request(function(error,result) {
			if(error){
			  //handle error
			  console.log(error);
			}else{
			  console.log(result);
			  var hosted_page = result.hosted_page;
			}
		  });
	}
	catch (e) {
		console.log(e, "????????");
		res.status(200).json({ status: false, code: 400, message: 'catch error', data: e + "" });
	}
} 


