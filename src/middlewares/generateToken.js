const jwt = require('jsonwebtoken');
const crypto = require("crypto");

const generateSecret = () => {
     const genRanHex = crypto.randomBytes(16).toString("hex");
     return genRanHex;
}

exports.generateAccessToken = (user_id) =>
{    
     const csrfToken = generateSecret();
     const clientJwt = jwt.sign({user_id:user_id,csrfToken:csrfToken},process.env.SECRET,{expiresIn:'168h'});
     return {clientJwt,csrfToken};
 }
