const jwt = require('jsonwebtoken');

module.exports.getUserID = (req,res,next) => {
  
  try{

      const jwtToken = req?.cookies?.jwt || null;
      const csrfToken = req?.headers?.authorization || null;
      
      if(!jwtToken || !csrfToken){
          return res.status(440).send({message: "Please login again!"});
      }

      jwt.verify(jwtToken, process.env.SECRET, (err, decoded) => {
          if (err) {
            if (err.name === 'TokenExpiredError') {
              return res.status(440).send({ message: 'Token is expired' });
            } else {
              return res.status(401).send({ message: 'Unauthorized' });
            }
          }

          if(decoded.csrfToken != csrfToken){
            return res.status(401).send({message : "Unauthorized"});
          }
          req.user_id = decoded.user_id;
          next();
        });

    }catch(err){
      res.status(503);
    }

}