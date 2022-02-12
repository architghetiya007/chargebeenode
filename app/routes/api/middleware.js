const jwt = require("jsonwebtoken");


const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(200).json({status: false,message:"Token is required for authentication"});
    }
    else {
        const decoded = jwt.verify(token, process.env.JWT_SECRET,(err,decoded)=>{
            if(err) {
                return res.status(200).json({status: false,message:"Failed To Verify Token"});
            }
            else {
                console.log(decoded,"requested user");
                req.user = decoded;
                next();
            }
        });
    }
}

module.exports = verifyToken;
