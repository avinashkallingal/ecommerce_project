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
const puppeteer = require("puppeteer");
const path = require("path");
const os = require('node:os');
const fs = require("fs");


const orderConfirmPage = async (req, res) => {
    if (req.body.Delivery == 2) {
        if (req.session.totalNow > 1000) {
            const message = "use online payment for puchase above 1000 Rs"
            res.redirect("/checkout?message=use online payment for puchase above 1000 Rs")
            console.log("hiiiiiiiiiiiiiiiiiiiiii")
        }
    }

    ////////

    req.session.addressData = req.body;
    let razorpay;
    let total = req.session.totalNow;
    console.log(req.session.totalNow + "total now at the starting of confirm page")
    let subTotal1 = Number(req.session.checkoutTotal) - 50;


    /////////////
    if (req.body.Delivery == 1) {
        razorpay = req.body.Delivery;
        console.log("hiiiiiiiiiiiiiiiiiiiiii")
    }

    //////////
    console.log(req.body.Delivery + " clicked details")

    const cart = await cartModel.find({ username: req.session.username })
    console.log(req.session.totalNow + "total now  in confirm page  111111")
    let coupon = 0;

    //////////
    if (req.session.couponCount == 1) {
        coupon = await couponModel.findOne({ name: req.session.coupon })
    }
    //////////


    if (coupon) {

        req.session.totalNow = total;//for taking total in add order function and add discounded total
        if (cart) {

            console.log(req.session.totalNow + " total before confirm page render if wallet applied")
            res.render("orderconfirm", { cart, total, subTotal1, razorpay });
        } else {
            res.render("orderconfirm", { cart: 0, total: 0, subTotal1: 0, razorpay: 0 });
        }
    }
    else {

        req.session.totalNow = total;//for taking total in add order function and add without discount total
        if (cart) {

            console.log(req.session.totalNow + " total before confirm page render if wallet not applied")
            res.render("orderconfirm", { cart, total, subTotal1, razorpay });
        } else {
            res.render("orderconfirm", { cart: 0, total: 0, subTotal1: 0, razorpay: 0 });
        }
    }

    const addDate = new Date();
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

const showOrderPage = async (req, res) => {
    try {
        // const order = await orderModel.find({username:req.session.username}).sort({_id:-1});


        const order = await orderModel.aggregate([
            { $match: { username: req.session.username } },
            {
                $group: {
                    _id: "$orderId",
                    totalPrice: { $first: "$totalPrice" },
                    date: { $first: "$orderDate" },
                    paymentMethod: { $first: "$payment" },
                    status: { $first: "$status" }
                }
            },
            { $sort: { date: -1 } }, // Sort by date field in descending order
            { $project: { _id: 0, orderId: "$_id", totalPrice: 1, date: 1, paymentMethod: 1, status: 1 } }
        ])






        console.log(" orders in user page list got")
        if (order) {
            res.render("orderHistory", { order })
        }
    }
    catch (e) {
        console.log("error while showing orderlist in admin order controler" + e)
    }
}

//backup
// const showOrderPage=async (req, res) => {
//     try {
//         const order = await orderModel.find({username:req.session.username}).sort({_id:-1});
//         console.log(" orders in user page list got")
//         if (order) {
//             res.render("orderHistory", { order })
//         }
//     }
//     catch (e) {
//         console.log("error while showing orderlist in admin order controler" + e)
//     }
// }



const showOrderProductsPage = async (req, res) => {
    try {
        const order = await orderModel.find({ $and: [{ username: req.session.username }, { orderId: req.params.orderId }] })

        // const order = await orderModel.find({username:req.session.username}).sort({_id:-1});
        console.log(" orders in user page list got")
        if (order) {
            res.render("orderProductHistory", { order })
        }
    }
    catch (e) {
        console.log("error while showing orderlist in admin order controler" + e)
    }
}



const orderDetails = async (req, res) => {
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



const addOrder = async (req, res) => {
    try {
        const cart = await cartModel.find({ username: req.session.username })
        console.log(req.session.username)
        console.log(req.session.addressData.Delivery + " payment method")
        console.log(req.session.addressData.Razorpay + " payment method")

        // const count = await cartModel.find().count();       

        const addDate = new Date();
        const dateFormated = new Date().toISOString().split('T')[0];
        const readableDateString = addDate.toLocaleDateString();
        const readableTimeString = addDate.toLocaleTimeString();
        const timeFormated = addDate.toLocaleTimeString();

        const orderid = require('otp-generator')
        const id = orderid.generate(10, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        let payment;
        if (req.session.addressData.Delivery == 1) {
            payment = "Razorpay"
        }
        else if (req.session.addressData.Delivery == 2) {
            payment = "COD"
        }
        if (req.session.walletApplied) {
            await userModel.updateOne(
                { username: req.session.username },
                { wallet: req.session.walletNow }
            );
        }
        if (req.session.couponCount) {
            await userModel.updateOne({ username: req.session.username }, { $push: { coupon: req.session.coupon } })
        }

        if (cart) {
            for (let i = 0; i < cart.length; i++) {
                const newOrder = new orderModel({

                    orderId: id,
                    username: req.session.username,
                    name: req.session.addressData.name,
                    orderDate: readableDateString,
                    orderTime: readableTimeString,
                    date: addDate,
                    price: cart[i].price,
                    totalPrice: req.session.totalNow,
                    coupon: req.session.coupon,
                    status: ["Placed", "Shipped", "Out for delivery", "Delivered Successfully"],
                    payment: payment,
                    adminCancel: 0,
                    product: cart[i].product,
                    quantity: cart[i].quantity,
                    image: cart[i].image,
                    address: {
                        houseName: req.session.addressData.housename,
                        city: req.session.addressData.city,
                        state: req.session.addressData.state,
                        pincode: req.session.addressData.pincode,
                        country: req.session.addressData.country,
                        phone: req.session.addressData.phone
                    }



                })
                await newOrder.save()
            }
            //for deleting the cart db of that user after order placed
            await cartModel.deleteMany({ username: req.session.username })
            // need wallet update

            //need coupon update


            res.render("orderPlacedMessage", { id, dateFormated, timeFormated });
        } else {
            res.redirect("/checkout")
        }
    }
    catch (e) {
        console.log("error while saving data to odrder DB ORDER CONTROLER controller" + e)
        res.status(500).send("internal server error");
    }


}



const FailedAddOrder = async (req, res) => {
    try {
        const cart = await cartModel.find({ username: req.session.username })
        const id=req.query.id;



        const addDate = new Date();
        const dateFormated = new Date().toISOString().split('T')[0];
        const readableDateString = addDate.toLocaleDateString();
        const readableTimeString = addDate.toLocaleTimeString();
        const timeFormated = addDate.toLocaleTimeString();
        const orderCheck=await orderModel.find({orderId:id});
        if(orderCheck.length!=0){
        //updating the failed order in db with success 
      await orderModel.updateMany(
            { orderId:id }, // Filter condition
            { 
              $pop: { status: -1 }
            }
            );
            await orderModel.updateMany(
                { orderId:id }, // Filter condition
                { 
                 $set:{
                    orderDate: readableDateString,
                    orderTime: readableTimeString,
                    date: addDate,
                 }
                }
                );
                res.render("orderPlacedMessage", { id, dateFormated, timeFormated });
            }
            else{
                console.log("failed order not found")
                res.redirect("/orderHistory")
            }
           
        
    }
    catch (e) {
        console.log("error while saving data to odrder DB ORDER CONTROLER controller" + e)
        res.status(500).send("internal server error");
    }


}







const paymentFailed = async (req, res) => {
    try {
        const cart = await cartModel.find({ username: req.session.username })
        const orderCheck = await orderModel.find({ orderId: req.query.id })
        const addDate = new Date();
            const dateFormated = new Date().toISOString().split('T')[0];
            const readableDateString = addDate.toLocaleDateString();
            const readableTimeString = addDate.toLocaleTimeString();
            const timeFormated = addDate.toLocaleTimeString();
        if (orderCheck.length!=0) {
            console.log(orderCheck+" order already failed")
            const id=req.query.id;
         
            console.log(req.session.username)
            console.log(req.session.addressData.Delivery + " payment method")
            console.log(req.session.addressData.Razorpay + " payment method")

            // const count = await cartModel.find().count();       

            

            res.render("orderFailedMessage", { id, dateFormated, timeFormated });
        }

        else {
            const orderid = require('otp-generator')
            const id = orderid.generate(10, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
            let payment;
            if (req.session.addressData.Delivery == 1) {
                payment = "Razorpay"
            }
            else if (req.session.addressData.Delivery == 2) {
                payment = "COD"
            }
            if (req.session.walletApplied) {
                await userModel.updateOne(
                    { username: req.session.username },
                    { wallet: req.session.walletNow }
                );
            }
            if (req.session.couponCount) {
                await userModel.updateOne({ username: req.session.username }, { $push: { coupon: req.session.coupon } })
            }

            if (cart) {

                for (let i = 0; i < cart.length; i++) {
                    const newOrder = new orderModel({

                        orderId: id,
                        username: req.session.username,
                        name: req.session.addressData.name,
                        orderDate: readableDateString,
                        orderTime: readableTimeString,
                        date: addDate,
                        price: cart[i].price,
                        totalPrice: req.session.totalNow,
                        coupon: req.session.coupon,
                        status: ["Payment failed", "Placed", "Shipped", "Out for delivery", "Delivered Successfully"],
                        payment: payment,
                        adminCancel: 0,
                        product: cart[i].product,
                        quantity: cart[i].quantity,
                        image: cart[i].image,
                        address: {
                            houseName: req.session.addressData.housename,
                            city: req.session.addressData.city,
                            state: req.session.addressData.state,
                            pincode: req.session.addressData.pincode,
                            country: req.session.addressData.country,
                            phone: req.session.addressData.phone
                        }



                    })
                    await newOrder.save()
                }
                //for deleting the cart db of that user after order placed
                await cartModel.deleteMany({ username: req.session.username })
                // need wallet update

                //need coupon update


                res.render("orderFailedMessage", { id, dateFormated, timeFormated });
            } else {
                res.redirect("/checkout")
            }
        }
    }
    catch (e) {
        console.log("error while saving data to odrder DB ORDER CONTROLER controller" + e)
        res.status(500).send("internal server error");
    }


}


const discardPaymentFailed = async (req, res) => {
    try {
        const order = await orderModel.find({ orderId: req.query.id })
        if (order) {
            const total = await orderModel.aggregate([
                {
                    $match: {
                        orderId: req.query.id // Match documents with the specified orderId
                    }
                },
                {
                    $group: {
                        _id: "$orderId", // Group by orderId
                        totalPrice: {
                            $sum: {
                                $multiply: ["$price", "$quantity"] // Multiply price and quantity fields
                            }
                        }
                    }
                }
            ])
            let totalOrderPriceCoupon = 0;
            let totalOrderPrice = total[0].totalPrice+50
            let orderDbPrice=order[0].totalPrice ;
            if (order[0].coupon.length !== 0) {
                console.log("Field exists and has a length of 0.");

                // if(order[0].coupon.length!=0){
                const coupon = await couponModel.findOne({ name: order[0].coupon });
                console.log(order[0].coupon+" coupon name ")
                orderDbPrice = orderDbPrice + coupon.discount
                console.log(totalOrderPrice + " price after m")
                await userModel.updateOne({ username: req.session.username }, {
                    $pull: { coupon: order[0].coupon }
                })
            }
            // }  else {
            //     console.log("Field does not exist or has a non-zero length.");
            //   }
            let walletRefill = totalOrderPrice - orderDbPrice
            console.log(walletRefill + " wallet refill amount after discard")
            console.log(order[0].totalPrice + " order database price")

            await userModel.updateOne(
                { username: req.session.username }, // Filter condition
                { $inc: { wallet: walletRefill } } // Update operation using $inc to increment the wallet field
            );
            //   await orderModel.updateMany(
            //     { orderId: req.query.id }, // Filter condition
            //     { $unset: { "status.0": "" } } // Update operation to remove the first element of the status array
            //   );
            await orderModel.updateMany(
                { orderId: req.query.id }, // Filter condition
                {
                    $pop: { status: -1 },   // Remove the first element of the status array

                }
            );
            await orderModel.updateMany(
                { orderId: req.query.id }, {
                $push: {
                    status: {
                        $each: ["Order Discard"], // New value to add
                        $position: 0 // Add the new value at the beginning of the array
                    }
                }
            });



            res.redirect("/orderHistory")

        } else {
            console.log("no failed order found to discard")
        }

    }
    catch (e) {
        console.log("error in discard payment in userorderControler" + e)
    }
}








const cancelOrder = async (req, res) => {
    const product = req.query.product
    const id = req.query.id
    const user = req.query.username
    console.log(req.body.reason + "on cancel order")

    console.log(id + "on cancel order")
    console.log(product + "on cancel order")
    await orderModel.updateOne({ $and: [{ orderId: id, product: product }] }, { $set: { adminCancel: 1, reason: req.body.reason } }, { upsert: true });
    const order = await orderModel.findOne({ $and: [{ orderId: id, product: product }] })
    console.log(order.price + " " + order.quantity + " " + order.payment + "guuu hiiiiiiiiiiiiiii")
    if (order.payment == "Razorpay") {
        let price = Number(order.price) * Number(order.quantity)
        let priceNow;
        const user = await userModel.findOne({ username: req.session.username })
        if (user.wallet) {
            priceNow = price + Number(user.wallet)
        }
        else {
            priceNow = price
        }
        console.log(price + "total price ,cancel button clicked")
        await userModel.updateOne({ username: req.session.username }, { $set: { wallet: priceNow } }, { upsert: true })


    }
    res.redirect("/orderHistory")
}




const returnOrder = async (req, res) => {
    const product = req.query.product
    const id = req.query.id
    const user = req.query.username
    console.log(req.body.reason + " return")

    console.log(id + "on cancel order")
    console.log(product + "on cancel order")
    const statusNew = "Requested to return"
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




const invoice = async (req, res) => {
    //data
    const orders = await orderModel.find({ orderId: req.params.orderId })
    //data


    // copy
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    <style>
        /*! tailwindcss v3.0.12 | MIT License | https://tailwindcss.com*/*,:after,:before{box-sizing:border-box;border:0 solid #e5e7eb}:after,:before{--tw-content:""}html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:initial}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button;background-color:initial;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:initial}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0}fieldset,legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input:-ms-input-placeholder,textarea:-ms-input-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]{display:none}*,:after,:before{--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:#3b82f680;--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }.flex{display:flex}.table{display:table}.table-cell{display:table-cell}.table-header-group{display:table-header-group}.table-row-group{display:table-row-group}.table-row{display:table-row}.hidden{display:none}.w-60{width:15rem}.w-40{width:10rem}.w-full{width:100%}.w-\[12rem\]{width:12rem}.w-9\/12{width:75%}.w-3\/12{width:25%}.w-6\/12{width:50%}.w-2\/12{width:16.666667%}.w-\[10\%\]{width:10%}.flex-1{flex:1 1 0%}.flex-col{flex-direction:column}.items-start{align-items:flex-start}.items-end{align-items:flex-end}.justify-center{justify-content:center}.rounded-l-lg{border-top-left-radius:.5rem;border-bottom-left-radius:.5rem}.rounded-r-lg{border-top-right-radius:.5rem;border-bottom-right-radius:.5rem}.border-x-\[1px\]{border-left-width:1px;border-right-width:1px}.bg-gray-700{--tw-bg-opacity:1;background-color:rgb(55 65 81/var(--tw-bg-opacity))}.p-10{padding:2.5rem}.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.px-4{padding-left:1rem;padding-right:1rem}.py-6{padding-top:1.5rem;padding-bottom:1.5rem}.pl-4{padding-left:1rem}.pb-20{padding-bottom:5rem}.pb-16{padding-bottom:4rem}.pb-1{padding-bottom:.25rem}.pb-2{padding-bottom:.5rem}.pt-20{padding-top:5rem}.pr-10{padding-right:2.5rem}.pl-24{padding-left:6rem}.pb-6{padding-bottom:1.5rem}.pl-10{padding-left:2.5rem}.text-left{text-align:left}.text-center{text-align:center}.text-right{text-align:right}.text-4xl{font-size:2.25rem;line-height:2.5rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.font-bold{font-weight:700}.font-normal{font-weight:400}.text-gray-500{--tw-text-opacity:1;color:rgb(107 114 128/var(--tw-text-opacity))}.text-white{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity))}.text-gray-400{--tw-text-opacity:1;color:rgb(156 163 175/var(--tw-text-opacity))}.text-black{--tw-text-opacity:1;color:rgb(0 0 0/var(--tw-text-opacity))}
    </style>
</head>
<body>
    <div class="p-10">
        <!--Logo and Other info-->
        <div class="flex items-start justify-center">
            <div class="flex-1">
                <div class="w-60 pb-6">
                    <img class="w-40" src="https://www.freeiconspng.com/uploads/black-shopping-cart-icon-25.jpg" alt="Logo">
                </div>
                
                <div class="w-60 pl-4 pb-6">
                    <h3 class="font-bold">Frutable</h3>
                    <p>HSR Layout</p>
                    <p>Banglore 560102</p>
                </div>
                
                <div class="pl-4 pb-20">
                    <p class="text-gray-500">Bill To:</p>
                    <h3 class="font-bold">${orders[0].name}</h3>
                </div>
                
            </div>
            <div class="flex items-end flex-col">

                <div class="pb-16">
                    <h1 class=" font-normal text-4xl pb-1">Delivery Report</h1>
                    <br><p class="text-right text-gray-500 text-xl">invoice</p>
                    <p class="text-right text-gray-500 text-xl"># ${orders[0].orderId}</p>
                </div>

                <div class="flex">
                    <div class="flex flex-col items-end">
                        <p class="text-gray-500 py-1">Date:</p>
                        <p class="text-gray-500 py-1">Payment Method:</p>
                        <p class="font-bold text-xl py-1 pb-2 ">TOTAL:</p>
                    </div>
                    <div class="flex flex-col items-end w-[12rem] text-right">
                        <p class="py-1">${orders[0].orderDate}</p>
                        <p class="py-1 pl-10">${orders[0].payment}</p>
                        <div class="pb-2 py-1">
                            <p class="font-bold text-xl">₹${orders[0].totalPrice}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!--Items List-->
        <div class="table w-full">
            <div class=" table-header-group bg-gray-700 text-white ">
                <div class=" table-row ">
                    <div class=" table-cell w-6/12 text-left py-2 px-4 rounded-l-lg border-x-[1px]">Item</div>
                    <div class=" table-cell w-[10%] text-center border-x-[1px]">Quantity</div>
                    <div class=" table-cell w-2/12 text-center border-x-[1px]">Rate</div>
                    <div class=" table-cell w-2/12 text-center rounded-r-lg border-x-[1px]">Amount</div>
                </div>
            </div>

            <div class="table-row-group">
                ${getDeliveryItemsHTML(orders)}
            </div>
        </div>
        
        <!--Total Amount-->
        <div class=" pt-20 pr-10 text-right">
            <p class="text-gray-400">Total: <span class="pl-24 text-black">₹${orders[0].totalPrice}</span></p>
        </div>

        <!--Notes and Other info-->
        <div class="py-6">
            <p class="text-gray-400 pb-2">Notes:</p>
            <p>Thank you for being a Awesome customer!</p>
        </div>

        <div class="">
            <p class="text-gray-400 pb-2">Terms:</p>
            <p>Invoice is Auto generated at the time of delivery,if there is any issue contact provider.</p>
        </div>
    </div>
</body>
</html>
`;



    //table function for inserting dynamic product details into invoice
    function getDeliveryItemsHTML(orders) {
        let data = ""
        for (let order of orders) {
            data += `
    <div class="table-row">
        <div class=" table-cell w-6/12 text-left font-bold py-1 px-4">${order.product}</div>
        <div class=" table-cell w-[10%] text-center">${order.quantity}</div>
        <div class=" table-cell w-2/12 text-center">₹${order.price}</div>
        <div class=" table-cell w-2/12 text-center">₹${order.price * order.quantity}</div>
    </div>
    `
        }
        return data
    }

    const browser = await puppeteer.launch({
    executablePath:'/usr/bin/chromium-browser'});

    const page = await browser.newPage();
    await page.setContent(htmlContent);


    const pdfBuffer = await page.pdf();

    await browser.close();

    // const downloadsPath = path.join(os.homedir(), "Downloads");
    // const pdfFilePath = path.join(downloadsPath, "invoice.pdf");


    // fs.writeFileSync(pdfFilePath, pdfBuffer);

    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.status(200).end(pdfBuffer);
    // copy
}


module.exports = { addOrder, orderConfirmPage, paymentFailed, discardPaymentFailed, FailedAddOrder, showOrderPage, cancelOrder, returnOrder, orderDetails, invoice, showOrderProductsPage }