const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, 'KSkCQocJLzlx1-UkEaOtjKcrH0oP5C1bWadvVAqOeNHr7yL7eTd6GX80DvQ1cFh7FVZQ');
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};