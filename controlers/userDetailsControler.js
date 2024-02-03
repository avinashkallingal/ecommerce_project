const userModel = require("../models/userModel")
const tab = require("./tabSelection")
const bcrypt = require("bcrypt")
const sendEmail = require("../utils/sendEmail")
const jwt = require("jsonwebtoken")
require('dotenv').config()
const otpGenerator = require('otp-generator')
const productsModel = require("../models/productModel")
const categoryModel = require('../models/categoryModel')
const session=require('express-session')
const cartModel = require("../models/cartModel")
const addressModel = require("../models/addressModel")

const showPage=async(req,res)=>{
try{
    const address=await addressModel.find({$and:[{username:req.session.username},{primary:0}]})
    const addressPrimary=await addressModel.find({$and:[{username:req.session.username},{primary:1}]})
    // console.log(address+" address details")
    res.render("userDetails",{address,addressPrimary})
}
catch(e){
    console.log("error while fetching address in user details controller"+e)
}
}

const profileEdit=async(req,res)=>{
    try{
        const address=await addressModel.find({$and:[{username:req.session.username},{primary:0}]})
        const addressPrimary=await addressModel.find({$and:[{username:req.session.username},{primary:1}]})
        console.log(address+" address details")
        res.render("userDetails",{address,addressPrimary})
    }
    catch(e){
        console.log("error while fetching address in user details controller"+e)
    }
    }


module.exports = {showPage}