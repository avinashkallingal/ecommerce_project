const userModel = require("../models/userModel")
const productsModel = require("../models/productModel")
const categoryModel = require('../models/categoryModel')
const userControl = require('./userControler')
const tab = require("./tabSelection")
const cartModel = require("../models/cartModel")
const orderModel = require("../models/orderModel")
var mongoose = require("mongoose");


const orderConfirmPage=async(req,res)=>{
    req.session.addressData=req.body;
    const Razorpay=req.body.Razorpay
    // copy starts
    const cart = await cartModel.find({ username: req.session.username })
     // const count = await cartModel.find().count();
        const cartPrice = await cartModel.aggregate([
            { $match: { username: req.session.username } },
            {
                $project: {
                    _id: 1,
                    multiply: {
                        $multiply: [
                            { $toDouble: "$price" },
                            { $toDouble: "$quantity" }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSum: { $sum: "$multiply" }
                }
            }
        ])

        
        const subTotal = cartPrice.length > 0 ? (cartPrice[0].totalSum+0) : 0;//without shipping charge total
        const total = subTotal == 0 ? 0 : subTotal + 50;//shipping charge 50 is included here bacause its is flat rate
        const addDate=new Date();
        // const today = new Date().toISOString().split('T')[0];
        if (cart) {
           res.render("orderconfirm", { cart, total, subTotal,Razorpay });
        } else {
            res.render("orderconfirm", { cart: 0, total: 0, subTotal: 0 ,Razorpay:0});
        }
    
    // copy ends
   

}

const showOrderPage=async (req, res) => {
    try {
        const order = await orderModel.find().sort({_id:-1});
        console.log(" orders in user page list got")
        if (order) {
            res.render("orderHistory", { order })
        }
    }
    catch (e) {
        console.log("error while showing orderlist in admin order controler" + e)
    }
}



const orderDetails= async (req, res) => {
    console.log("order details clicked")
    console.log(req.query.id)
    console.log(req.query.product)
    try {
        const order = await orderModel.find({
            orderId: req.query.id,
            product: req.query.product
        });
        // const order = await orderModel.find({$and:[{orderId:req.query.id},{product:req.query.product}]});
        console.log(" orders in user page list got")
        if (order) {
            res.render("orderDetails", { order })
        }
        {
            console.log("no order found")
        }
    }
    catch (e) {
        console.log("error while showing orderlist in admin order controler" + e)
    }
}



const addOrder=async (req,res)=>{
    try {
        const cart = await cartModel.find({ username: req.session.username })
        console.log(req.session.username)   
        console.log(req.session.addressData.Delivery+" payment method")
        console.log(req.session.addressData.Razorpay+" payment method")
       
        // const count = await cartModel.find().count();       
      
        const addDate=new Date();
        const dateFormated = new Date().toISOString().split('T')[0];
        const readableDateString = addDate.toLocaleDateString();
const readableTimeString = addDate.toLocaleTimeString();
const timeFormated=addDate.toLocaleTimeString();

        const orderid = require('otp-generator')
        const id = orderid.generate(10, { upperCaseAlphabets: false, specialChars: false,lowerCaseAlphabets:false });

        if (cart) {
            for(let i=0;i<cart.length;i++){
            const newOrder=new orderModel({
              
                orderId:id,
                username:req.session.username,
                name:req.session.addressData.name,
                orderDate:readableDateString,
                orderTime:readableTimeString,
                price:cart[i].price,
                status:["Placed","Shipped","Out for delivery","Delivered Successfully"],
                payment:req.session.addressData.Delivery||req.session.addressData.Razorpay,
                adminCancel:0,
                product:cart[i].product,
                quantity:cart[i].quantity,
                image:cart[i].image,
                address:{
                    houseName:req.session.addressData.housename,
                    city:req.session.addressData.city,
                    state:req.session.addressData.state,
                    pincode:req.session.addressData.pincode,
                    country:req.session.addressData.country,
                    phone:req.session.addressData.phone
                }
           
                

            })
            await newOrder.save()
        }
        //for deleting the cart db of that user after order placed
        await cartModel.deleteMany({ username: req.session.username })


            res.render("orderPlacedMessage", { id, dateFormated,timeFormated});
        } else {
           res.redirect("/checkout")
        }
    }
    catch (e) {
        console.log("error while saving data to odrder DB ORDER CONTROLER controller" + e)
        res.status(500).send("internal server error");
    }


}

const cancelOrder=async (req,res)=>{
    const product=req.query.product
    const id=req.query.id
    const user=req.query.username
    console.log(id+"on cancel order")
    console.log(product+"on cancel order")
    await orderModel.updateOne({$and:[{ orderId: id,product:product}] }, { $set: { adminCancel: 1 } });
    res.redirect("/orderHistory")
}



module.exports = { addOrder,orderConfirmPage,showOrderPage,cancelOrder,orderDetails }