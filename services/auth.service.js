require('dotenv').config();
const jwt = require('jsonwebtoken');
const moment = require('moment')
const { newError , dataNotExist } = require('../helper/check_existence.helper');
const User = require('../models/userModel');
const { vars } = require('../server/constants');
const { statusCodeVars } = require('../server/statusCode');

exports.generateToken = async (userId) => {
    try {
        const user = await User.findOne({ where: {id: userId}});
        dataNotExist(user , vars.USER_NOT_FOUND , statusCodeVars.BADREQUEST)
        const accessToken = jwt.sign({
            id: user.id,
            type: user.type
        }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
        const accessTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
        return { accessToken , accessTokenExpires};
    
    } catch (error) {
        console.log(error); 
        throw error; 
    }
};

exports.verifyToken = async (token) => {
    try {
        const user = await User.findOne({ where: { accessToken: token }, })

        let access_token = user?.accessToken
        if (!access_token) {
            newError(400, "Invalid Auth Token")
        }
        const expireDuration = process.env.ACCESS_TOKEN_EXPIRE
        const currentTime = Date.now();
        const expirationTime = moment(currentTime).add(moment.duration(expireDuration)).valueOf();

        if ( user.id && expirationTime > new Date(user?.createdAt).getTime() ) {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_KEY);            
            return decoded;
        } else {
            access_token = null
            await user.save()
            newError(400,  "token expired" );          
        }
    } catch (err) {
        throw err;
    }
};


const googleLogin = async(data) =>{
    let user = await User.findOne({where : {email : data.email}});
    const token =  generateToken({ userId: user.id, email: user.email, contact: user.contact });
    return user
}