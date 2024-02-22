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
const Razorpay = require('razorpay'); 

const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

const createOrder = async(req,res)=>{

console.log('1')

    try {
        
        console.log(RAZORPAY_ID_KEY)
        const amount=Number(req.session.totalNow)*100
        //const amount = req.body.amount*100
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: 'razorUser@gmail.com'
        }
        console.log('2')
        razorpayInstance.orders.create(options, 
            (err, order)=>{
                console.log(order)
                console.log('3')
                if(!err){
                    console.log('4')
                    res.status(200).send({
                        
                        success:true,
                        msg:'Order Created',
                        order_id:order.id,
                        amount:amount,
                        key_id:RAZORPAY_ID_KEY,
                        //product_name:req.body.name,
                       // description:req.body.description,
                       // contact:"8567345632",
                       // name: "Sandeep Sharma",
                       // email: "sandeep@gmail.com"
                    });
                }
                else{
                    console.log(err)
                    res.status(400).send({success:false,msg:'Something went wrong!'});
                }
            }
        );

    } catch (error) {
        console.log(error.message);
    }
}
module.exports={createOrder}