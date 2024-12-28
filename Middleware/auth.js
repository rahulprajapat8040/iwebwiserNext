const { User } = require("../models");
const { verifyToken } = require("../services/auth.service");
const {  dataNotFound, newError, dataNotExist } = require("../helper/check_existence.helper");

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.get("Authorization");
        if (!authHeader) {
            newError(400, "Auth Token not Found")
        }
        
        const token = authHeader.split(" ")[1]
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            newError(decodedToken , 400, "Not found Token" )
        }
        const user = await User.findOne({ where: { id:  decodedToken.id } })
        if (!user) {
            dataNotExist(user, 404,"User Not Found")
        }
        req.user = decodedToken.id;
        next();
    } catch (err) {
        return next(err)
    }
};
