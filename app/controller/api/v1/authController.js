const common = require('./../../../../config/common');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const chargebee = require("chargebee");
const nodemailer = require("nodemailer");
const client = require('./../../../../database');
const axios = require('axios');


chargebee.configure({
		site: "archittest2-test",
		api_key: "test_Y2LUzyYO2EIlGKRnUMOGgEqRK3hcxiNa"
});

exports.chargeBeeItemList = async (req, res) => {
	try {
		chargebee.item_price.list({
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
		chargebee.customer.list({
			"email[is]":req.body.email
		}).request(function (error, result) {
			if (error) {
				console.log(error);
				res.status(200).json({ status: false, code: 400, message: 'Invalid OTP'});
			}
			else {
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

exports.login = async (req, res) => {
	try {
		let encryptedPass = md5(req.body.password);
		chargebee.customer.list({
			"email[is]": req.body.email
		}).request(function (error, result) {
			if (error) {
				console.log(error);
				res.status(200).json({ status: false, code: 400, message: 'Error From Chargbee' });
			}
			else {
				let updateObj = { 
					first_name: req.body.firstName,
					last_name: req.body.lastName,
					cf_birthday: req.body.birthday,
					billing_address: {
						line1: req.body.serviceAddress
					}
				};
				if (result.list.length > 0) {

					if (result.list[0].customer.cf_password == encryptedPass || result.list[0].customer.cf_password == undefined ) {
					updateObj.cf_password = encryptedPass;
						chargebee.customer.update(result.list[0].customer.id, updateObj).request(function (error, response) {
							if (error) {
								//handle error
								console.log(error);
								res.status(200).json({ status: false, code: 400, message: 'Error From Chargbee' });
							} else {
								let token = jwt.sign({id:result.list[0].customer.id,email:result.list[0].customer.email},process.env.JWT_SECRET,{ expiresIn: 60 * 60 *24 });
								res.status(200).json({ status: true, code: 200, message: 'Information updated successfully',data:{ token:token} });
							}
						});
					} else {
						res.status(200).json({ status: false, code: 401, message: 'Email and password does not match' });
					}
				} else {
					res.status(200).json({ status: false, code: 401, message: 'Email Is not Register' });
				}
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
					item_price_id : req.body.price_id,
					quantity : 1
				}],
				customer: { id: req.user.id },
				redirect_url:'http://localhost:4200/differ-my-profile',
				cancel_url:"http://localhost:4200/differ-checkout"
		  }).request(function(error,result) {
			if(error){
			  //handle error
			  console.log(error);
			  res.status(200).json({ status: false, code: 400, message: 'Error From Chargbee' });
			}
			else{
			  res.status(200).json({ status: true, code: 200, message: 'Successfully checkout', data:result });
			}
		  });
	}
	catch (e) {
		console.log(e, "????????");
		res.status(200).json({ status: false, code: 400, message: 'catch error', data: e + "" });
	}
} 

exports.chargeBeeGetNetwork = async (req, res) => {
	try {
		chargebee.customer.list({
			"email[is]": req.body.email
		}).request(async function (error, result) {
			if (error) {
				console.log(error);
				res.status(200).json({ status: false, code: 400, message: 'Error From Chargbee' });
			}
			else {
				const networkData = await axios.get(`http://management-interface.differ.ca/api/v1/customer/${result.list[0].customer.id}/network`, {
					headers: {
						'Authorization': '8d13c8d9e3c69876865973d69c3a01a2c03e2cbe6cb1f154350dee0132b74729'
					}
				});
				res.status(200).json({ status: true, code: 200, message: 'Network data',data:networkData.data });
			}
		})
	}
	catch (e) {
		console.log(e, "????????");
		res.status(200).json({ status: false, code: 400, message: 'catch error', data: e + "" });
	}
}

exports.chargeBeeUpdateNetwork = async (req, res) => {
	try {
		chargebee.customer.list({
			"email[is]": req.user.email
		}).request(async function (error, result) {
			if (error) {
				console.log(error);
				res.status(200).json({ status: false, code: 400, message: 'Error From Chargbee' });
			}
			else {
				if(result.list.length > 0) {
					const networkData = await axios({
						method: 'put',
						url: `http://management-interface.differ.ca/api/v1/customer/${result.list[0].customer.id}/network`,
						headers: {
							'Authorization': '8d13c8d9e3c69876865973d69c3a01a2c03e2cbe6cb1f154350dee0132b74729'
						},
						data: {
							ssid: req.body.ssid,
							wpa2_key:  req.body.wpa2_key
						}
					});
					res.status(200).json({ status: true, code: 200, message: 'Network data',data:networkData.data });
				}
			}
		})
	}
	catch (e) {
		console.log(e, "????????");
		res.status(200).json({ status: false, code: 400, message: 'catch error', data: e + "" });
	}
}

exports.chargeBeeGetUserDetail = async (req, res) => {
	try {
		chargebee.customer.list({ 
			"email[is]": req.user.email
		}).request(async function (error, result) {
			if (error) {
				console.log(error);
				res.status(200).json({ status: false, code: 400, message: 'Error From Chargbee' });
			}
			else {
				if (result.list.length > 0) {
					res.status(200).json({ status: true, code: 200, message: 'User Information', data:result.list[0].customer });
				} else {
					res.status(200).json({ status: false, code: 204, message: 'User Information' });
				}				
			}
		})
	}
	catch (e) {
		console.log(e, "????????");
		res.status(200).json({ status: false, code: 400, message: 'catch error', data: e + "" });
	}
}

exports.chargeBeeSubscriptionDetail = async (req, res) => {
	try {
		chargebee.customer.list({ 
			"email[is]": req.user.email
		}).request(async function (error, result) {
			if (error) {
				console.log(error);
				res.status(200).json({ status: false, code: 400, message: 'Error From Chargbee' });
			}
			else {
				if (result.list.length > 0) {
					res.status(200).json({ status: true, code: 200, message: 'User Information', data:result.list[0].customer });
				} else {
					res.status(200).json({ status: false, code: 204, message: 'User Information' });
				}				
			}
		})
	}
	catch (e) {
		console.log(e, "????????");
		res.status(200).json({ status: false, code: 400, message: 'catch error', data: e + "" });
	}
}

exports.chargeBeeSubscriptionList = async (req, res) => {
	try {
		chargebee.subscription.list({ 
			"customer_id[is]": req.user.id
		}).request(async function (error, result) {
			if (error) {
				console.log(error);
				res.status(200).json({ status: false, code: 400, message: 'Error From Chargbee' });
			}
			else {
				if (result.list.length > 0) {
					res.status(200).json({ status: true, code: 200, message: 'subscription list', data: result.list });
				} else {
					res.status(200).json({ status: false, code: 204, message: 'subscription list' });
				}				
			}
		})
	}
	catch (e) {
		console.log(e, "????????");
		res.status(200).json({ status: false, code: 400, message: 'catch error', data: e + "" });
	}
}

exports.chargeBeeUpdateSubscription = async (req, res) => {
	try {
		chargebee.hosted_page.checkout_existing_for_items({
			subscription : {
			  id : req.body.subscriptionId
			  },
			subscription_items : [
			  {
				item_price_id : req.body.itemPriceId,
				quantity : 1,
			  }],
			  redirect_url:'http://localhost:4200/differ-my-profile',
			  cancel_url:"http://localhost:4200/differ-my-profile"
			}).request(async function (error, result) {
			if (error) {
				console.log(error);
				res.status(200).json({ status: false, code: 400, message: 'Error From Chargbee' });
			}
			else {
				if (result.hosted_page) {
					res.status(200).json({ status: true, code: 200, message: 'update subscription',  data: result });
				} else {
					res.status(200).json({ status: false, code: 204, message: 'update subscription' });
				}				
			}
		})
	}
	catch (e) {
		console.log(e, "????????");
		res.status(200).json({ status: false, code: 400, message: 'catch error', data: e + "" });
	}
}

exports.chargeBeeChangeBillingDetail = async (req, res) => {
	try {
		chargebee.hosted_page.manage_payment_sources({
			card : {
			  gateway_account_id : req.body.gatewayAccountId
			  },
			customer : {
			  id : req.body.customerId
			  },
			//   redirect_url:'http://localhost:4200/differ-my-profile'
		  }).request(async function (error, result) {
			if (error) {
				console.log(error);
				res.status(200).json({ status: false, code: 400, message: 'Error From Chargbee' });
			}
			else {
				if (result.hosted_page) {
					res.status(200).json({ status: true, code: 200, message: 'update subscription',  data: result });
				} else {
					res.status(200).json({ status: false, code: 204, message: 'update subscription' });
				}				
			}
		})
	}
	catch (e) {
		console.log(e, "????????");
		res.status(200).json({ status: false, code: 400, message: 'catch error', data: e + "" });
	}
}



