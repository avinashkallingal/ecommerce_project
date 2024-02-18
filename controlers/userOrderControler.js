const userModel = require("../models/userModel")
const productsModel = require("../models/productModel")
const categoryModel = require('../models/categoryModel')
const userControl = require('./userControler')
const tab = require("./tabSelection")
const cartModel = require("../models/cartModel")
const orderModel = require("../models/orderModel")
var mongoose = require("mongoose");
const couponModel = require("../models/couponModel")
const Razorpay = require("razorpay")


const orderConfirmPage=async(req,res)=>{
   
    req.session.addressData=req.body;
    let razorpay;
    let total=req.session.totalNow;
       let subTotal1= Number(req.session.checkoutTotal)-50;
    
    if(req.body.Delivery==1){
        razorpay=req.body.Delivery;
        console.log("hiiiiiiiiiiiiiiiiiiiiii")
    }
    console.log(req.body.Delivery+" clicked details")

    const cart = await cartModel.find({ username: req.session.username })
  
         let coupon=0;
        if(req.session.couponCount==1){
         coupon=await couponModel.findOne({name:req.session.coupon})
        }
      

        
        if(coupon){
       // let total1 = subTotal == 0 ? 0 : subTotal + 50;//shipping charge 50 is included here bacause its is flat rate
       // let total=total1-coupon.discount;
       
        
        //checking wallet is clicked
        // if(req.session.wallet==1){
          
        //    console.log(req.session.walletAmount+" wallet amount in session")

        //     total=total-req.session.walletAmount;
        // }
        
        req.session.totalNow=total;//for taking total in add order function and add discounded total
        if (cart) {
              //checking wallet is clicked
            if(req.session.wallet===1){
          
           console.log(req.session.walletAmount+" wallet amount in session")

            //total=total-Number(req.session.walletAmount);
            total=req.session.totalNow;
        }
      
            res.render("orderconfirm", { cart, total, subTotal1,razorpay });
         } else {
             res.render("orderconfirm", { cart: 0, total: 0, subTotal1: 0 ,razorpay:0});
         }
        }
        else{
            let total = subTotal1 == 0 ? 0 : subTotal1 + 50;//shipping charge 50 is included here bacause its is flat rate
            req.session.totalNow=total;//for taking total in add order function and add without discount total
            if (cart) {
                 //checking wallet is clicked
                if(req.session.wallet===1){
          
                    console.log(req.session.walletAmount+" wallet amount in session")
                  //  const walletNow=await userModel.findOne({username:req.session.username},{_id:0,wallet:1})
         
                    // total=total-Number(req.session.walletAmount);
                    total=req.session.totalNow;
                 }
                res.render("orderconfirm", { cart, total, subTotal1,razorpay });
             } else {
                 res.render("orderconfirm", { cart: 0, total: 0, subTotal1: 0 ,razorpay:0});
             }
        }

        const addDate=new Date();
        // const today = new Date().toISOString().split('T')[0];
        
    
    // copy ends
   

}


// const orderConfirmPage=async(req,res)=>{
//     req.session.addressData=req.body;
//     console.log(req.body+"hiiiiiiiiiiiii")
//     console.log(req.body.test+"test")
//     console.log(req.body.priceShow+" pricetotoal")
//     const Razorpay=req.body.Razorpay
//     // copy starts
//     const cart = await cartModel.find({ username: req.session.username })

//     const total = req.body.priceTotal//without shipping charge total
//     console.log(req.session.addressData.totalPrice)
//     console.log(req.body.priceTotal)
  
//     ;//shipping charge 50 is included here bacause its is flat rate
//         const subTotal =total-50
//         const addDate=new Date();
//         // const today = new Date().toISOString().split('T')[0];
//         if (cart) {
//            res.render("orderconfirm", { cart, total, subTotal,Razorpay });
//         } else {
//             res.render("orderconfirm", { cart: 0, total: 0, subTotal: 0 ,Razorpay:0});
//         }
    
//     // copy ends
   

// }

const showOrderPage=async (req, res) => {
    try {
        const order = await orderModel.find({username:req.session.username}).sort({_id:-1});
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
        let payment;
        if(req.session.addressData.Delivery==1){
            payment="Razorpay"
        }
        else if(req.session.addressData.Delivery==2){
            payment="COD"
        }
        if(req.session.walletApplied){
                await userModel.updateOne(
                { username: req.session.username },
                { wallet:req.session.walletNow }
              );
        }
        if(req.session.couponCount){
            await userModel.updateOne({ username: req.session.username }, { $push: { coupon: req.session.coupon } })
        }

        if (cart) {
            for(let i=0;i<cart.length;i++){
            const newOrder=new orderModel({
              
                orderId:id,
                username:req.session.username,
                name:req.session.addressData.name,
                orderDate:readableDateString,
                orderTime:readableTimeString,
                date:addDate,
                price:cart[i].price,
                totalPrice: req.session.totalNow,
                coupon:req.session.coupon,
                status:["Placed","Shipped","Out for delivery","Delivered Successfully"],
                payment:payment,
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
        // need wallet update

        //need coupon update


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
    console.log(req.body.reason+"on cancel order")
    
    console.log(id+"on cancel order")
    console.log(product+"on cancel order")
    await orderModel.updateOne({$and:[{ orderId: id,product:product}] }, {$set: { adminCancel: 1, reason:req.body.reason}},{ upsert: true });
   const order=await orderModel.findOne({$and:[{ orderId: id,product:product}] })
   console.log(order.price+" "+order.quantity+" "+order.payment+"guuu hiiiiiiiiiiiiiii")
   if(order.payment=="Razorpay"){
    let price=Number(order.price)*Number(order.quantity)
    let priceNow;
    const user=await userModel.findOne({username:req.session.username})
    if(user.wallet){
    priceNow=price+Number(user.wallet)}
    else{
        priceNow=price
    }
    console.log(price+"total price ,cancel button clicked")
    await userModel.updateOne({username:req.session.username},{$set:{wallet:priceNow}},{ upsert: true })

 
   }
    res.redirect("/orderHistory")
}




const returnOrder=async (req,res)=>{
    const product=req.query.product
    const id=req.query.id
    const user=req.query.username
    console.log(req.body.reason+" return")
    
    console.log(id+"on cancel order")
    console.log(product+"on cancel order")
    const statusNew="Requested to return"
    // await orderModel.updateOne(
    //     { orderId: id, product: product }, // Filter criteria
    //     { 
    //       $set: { return:1, reason: req.body.reason },
    //       $pop: { status: -1 }, // Remove the first element from the 'status' array
    //       $push: { status: statusNew } // Push the new 'status' into the 'status' array
    //     }
    //   );
      //copy
      await orderModel.updateOne(
        { orderId: id, product: product }, // Filter criteria
        { 
          $set: { returnOrder: 1, reason: req.body.reason },
          $pop: { status: -1 }, // Remove the first element from the 'status' array
        }
      );
      
      await orderModel.updateOne(
        { orderId: id, product: product }, // Filter criteria
        { 
          $push: { status: statusNew } // Push the new 'status' into the 'status' array
        }
      );
      
      //copy
      

    res.redirect("/orderHistory")
}


module.exports = { addOrder,orderConfirmPage,showOrderPage,cancelOrder,returnOrder,orderDetails }