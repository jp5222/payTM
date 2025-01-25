const jwt = require("jsonwebtoken");
const {JWT_SECREST} =require('./config')
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log(authHeader)

    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //     return res.status(403).json({});
    // }

    const token = authHeader.split(' ')[1];

    try {

        const decoded =jwt.verify(authHeader, JWT_SECREST);

        req.userId = decoded._id;

        next();
    } catch (err) {
        return res.status(403).json({});
    }
};

module.exports = {
    authMiddleware
}