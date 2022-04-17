const nodemailer = require('nodemailer');
const uuid4 = require('uuid4');


module.exports = {
	getEpoch: function () {
		let d = new Date();
		
		let TiDt = Math.round(d.getTime() / 1000);
		return TiDt;
	},
	encrptToken: function (pass) {
		var user_token = uuid4(pass);
		return user_token;
	},
	getuniqid: function () {
		return uuid4();
	},
	resetExpireTime: function () {
		return this.getEpoch() + 1800; // 30 minutes
	},

	insert: function (tableName, query) {
		return new Promise((resolve, reject) => {
			var newDream = new tableName(query);
			newDream.save((err, result) => {
				if (err) {
					reject({ status: 0, data: err });
				}
				else {
					resolve({ status: 1, data: result });
				}
			});
		})
	},
	findQuery: function (tableName, query) {
		return new Promise((resolve, reject) => {
			tableName.find(query, (err, result) => {
				if (err) {
					reject({ status: 0, data: err, length: 0 });
				}
				else {
					resolve({ status: 1, data: result, length: result.length });
				}
			}).sort({iCreatedAt:-1});
		})
	},
	findQuerySelect: function (tableName, query, option) {
		return new Promise((resolve, reject) => {
			tableName.find(query, (err, result) => {
				if (err) {
					reject({ status: 0, data: err, length: 0 });
				}
				else {
					resolve({ status: 1, data: result, length: result.length });
				}
			}).sort({iCreatedAt:-1}).select(option);
		})
	},
	findQuerySelectJoin: function (tableName, query, option, join, joinOption) {
		return new Promise((resolve, reject) => {
			tableName.find(query, (err, result) => {
				if (err) {
					reject({ status: 0, data: err, length: 0 });
				}
				else {
					resolve({ status: 1, data: result, length: result.length });
				}
			}).select(option).populate(join, joinOption);
		})
	},
	findQuerySelectMultipleJoin: function (tableName, query, option, join1, joinOption1, join2, joinOption2, join3, joinOption3) {
		return new Promise((resolve, reject) => {
			tableName.find(query, (err, result) => {
				if (err) {
					reject({ status: 0, data: err, length: 0 });
				}
				else {
					resolve({ status: 1, data: result, length: result.length });
				}
			}).select(option).populate(join1, joinOption1).populate(join2, joinOption2).populate(join3, joinOption3);
		})
	},
	updateOne: function (tableName, query, newValue) {
		return new Promise((resolve, reject) => {
			tableName.updateOne(query, { $set: newValue }, function (err, result) {
				if (err) {
					//console.log(err,'err');
					reject({ status: 0, data: err });
				}
				else {
					resolve({ status: 1, data: result });
				}
			});
		})
	},
	updateOnePush: function (tableName, query, newValue) {
		return new Promise((resolve, reject) => {
			tableName.updateOne(query,  newValue, function (err, result) {
				if (err) {
					//console.log(err,'err');
					reject({ status: 0, data: err });
				}
				else {
					resolve({ status: 1, data: result });
				}
			});
		})
	},
	updateMany: function (tableName, query, newValue) {
		return new Promise((resolve, reject) => {
			tableName.updateMany(query, { $set: newValue }, function (err, result) {
				if (err) {
					reject({ status: 0, data: err });
				}
				else {
					resolve({ status: 1, data: result });
				}
			});
		})
	},
	deleteOne: function (tableName, query) {
		return new Promise((resolve, reject) => {
			tableName.deleteOne(query, (err, result) => {
				if (err) {
					reject({ status: 0, data: result });
				}
				else {
					resolve({ status: 1, data: result });
				}
			});
		})
	},
	deleteMany: function (tableName, query) {
		return new Promise((resolve, reject) => {
			tableName.deleteMany(query, (err, result) => {
				if (err) {
					reject({ status: 0, data: result });
				}
				else {
					resolve({ status: 1, data: result });
				}
			});
		})
	},
	upload_s3_file: async function (bucket_name, file) {
		return new Promise((resolve, reject) => {
			multer({
				storage: multerS3({
					s3: s3,
					bucket: bucket_name,
					acl: "public-read",
					contentType: multerS3.AUTO_CONTENT_TYPE,
					metadata: function (req, file, cb) {
						cb(null, { fieldName: file.fieldname });
					},
					key: function (req, file, cb) {
						cb(null, Date.now().toString() + path.extname(file.originalname))
					}
				}),
				limits: { fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
				fileFilter: function (req, file, cb) {
					checkFileType(file, cb);
				}
			})

			function checkFileType(file, cb) {
				const filetypes = /jpeg|jpg|svg|png|gif/;
				const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
				const mimetype = filetypes.test(file.mimetype); if (mimetype && extname) {
					return cb(null, true);
				} else {
					cb('Error: Images Only!');
				}
			}
		})
	},
	delete_s3_file: async function (bucket_name, image_key) {
		return new Promise((resolve, reject) => {
			s3.deleteObject({
				Bucket: bucket_name,
				Key: image_key
			}, function (err, data) {
				if (err) {
					resolve(0);
				}
				else {
					resolve(1);
				}
			})
		})
	},
	get_s3_file: async function (bucket_name, image_key) {
		return new Promise((resolve, reject) => {
			s3.getObject({
				Bucket: bucket_name,
				key: image_key
			}, function (err, data) {
				if (err) {
					resolve(0);
				}
				else {
					let image = "<img src='data:image/jpeg;base64," + Buffer.from(data.img).toString('base64') + "'" + "/>";
					let startHTML = "<html><body></body>";
					let endHTML = "</body></html>";
					let html = startHTML + image + endHTML;
					resolve({ status: 1, data: html });
				}
			})
		})
	},
	send_mail : async function (SendTo,Subject,Text) {
		const transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 587,
			auth: {
				user:process.env.SMTPEMAIL,
				pass:process.env.SMTPPASSWORD 
			}
		});

		let mail =await transporter.sendMail({
			from: process.env.SMTPEMAIL,
			to: SendTo,
			subject: Subject,
			text: Text
		});
	},
	
	
};

