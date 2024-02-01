const userModel = require("../models/userModel")
const tab = require("./tabSelection")
const bcrypt = require("bcrypt")
const sendEmail = require("../utils/sendEmail")
const jwt = require("jsonwebtoken")
require('dotenv').config()
const otpGenerator = require('otp-generator')
const productsModel = require("../models/productModel")
const categoryModel = require('../models/categoryModel')
const session = require('express-session')
const cartModel = require("../models/cartModel")
const addressModel = require("../models/addressModel")

const showPage = (req, res) => {
    res.render("addAddress")
}

const showEditPage = (req, res) => {
    
    res.render("addressEdit")
}


const addAddress = async (req, res) => {

    try {
        console.log(req.body+"   data from add address")
        console.log(req.session.username)

        const newAddress = new addressModel({
            username: req.session.username,
            fullname: req.body.name,
            phone: req.body.phone,
            address: {
                houseName: req.body.housename,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pincode,
                country: req.body.country
            },
            primary: 0
        })
        await newAddress.save()



        res.redirect("/userDetails");

    }
    catch (e) {
        console.log("error while saving data to odrder DB ORDER CONTROLER controller" + e)
        res.status(500).send("internal server error");
    }


}





module.exports = { showPage, addAddress,showEditPage }