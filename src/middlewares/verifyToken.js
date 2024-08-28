const jwt = require('jsonwebtoken');
const { generateAccessToken } = require("./generateToken");

module.exports.verifyToken = (req,res,next) => {
  try{
    const jwtToken = req?.cookies?.jwt;
    const csrfToken = req?.headers?.authorization;
    
    if(!jwtToken || !csrfToken){
        return res.status(440).send({message: "Please login again!"});
    }

    jwt.verify(jwtToken, process.env.SECRET, (err, decoded) => {

        if (err) {
          if (err.name === 'TokenExpiredError') {
            return res.status(440).send({ message: 'Token is expired' });
          } else {
            return res.status(440).send({ message: 'Unauthorized' });
          }
        }
        if(decoded.csrfToken != csrfToken){
          return res.status(401).send({message : "Unauthorized"});
        }

        req.user_id = decoded.user_id;
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (decoded.exp - currentTime < 600) {
          const { clientJwt, csrfToken } = generateAccessToken(decoded.user_id);
          res.cookie('jwt', clientJwt, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true });
          res.csrfToken = csrfToken;
        }
        else{
          res.csrfToken = csrfToken;
        }
        next();
      });
  }
  catch(err){
    res.status(503);
  }

}