const userModel = require("../models/userModel")
const productsModel = require("../models/productModel")
const categoryModel = require('../models/categoryModel')
const userControl = require('./userControler')
const tab = require("./tabSelection")
const cartModel = require("../models/cartModel")
const orderModel = require("../models/orderModel")
var mongoose = require("mongoose");


const listOrders = async (req, res) => {
    try {
        const order = await orderModel.find().sort({ _id: -1 });
        console.log(" orders in admin page list got")
        if (order) {
            res.render("orderList", { order })
        }
    }
    catch (e) {
        console.log("error while showing orderlist in admin order controler" + e)
    }
}


const updateStatus = async (req, res) => {
    const id = req.query.id;
    const status = req.query.status
    const product = req.query.product
    console.log(id + " got order id in status button")
    console.log(status + " got status in status button")
    console.log(product + " got product name status in status button")
    try {
        if (status == "Delivered Successfully" || status == "Requested to return" || status == "Return"|| status == "Return Rejected") {
            console.log("no action performed")
        }

        else {
            await orderModel.updateOne({ $and: [{ orderId: id, product: product }] }, { $pop: { status: -1 } });


            res.redirect("/admin/orderlist")
        }
    }
    catch (e) {
        console.log("error while showing orderlist in admin order controler" + e)
    }
}


const cancelOrder = async (req, res) => {
    const product = req.query.product
    const id = req.query.id
    const user = req.query.username
    console.log(id + "on cancel order")
    console.log(product + "on cancel order")
    const order = await orderModel.find({ orderId: id, product: product });
    if (order[0].status[0] == "Delivered Successfully") {
        console.log("canot cancel")
        res.redirect("/admin/orderlist")

    }
    else {
        await orderModel.updateOne({ $and: [{ orderId: id, product: product }] }, { $set: { adminCancel: 1 } });
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
        res.redirect("/admin/orderlist")

    }
}


const returnOrder = async (req, res) => {
    const product = req.query.product
    const id = req.query.id
    const user = req.query.username
    console.log(id + "on cancel order")
    console.log(product + "on cancel order")
    const order = await orderModel.findOne({$and:[{ orderId: id}, {product: product }]});
    if (order.status[0] == "Return Rejected") {
        console.log("canot return")
        res.redirect("/admin/orderlist")

    }
    else {
        console.log("Return fuction started")
        const statusNew = "Return"
        await orderModel.updateOne({ $and: [{ orderId: id, product: product }] }, { $set: { return: 1 } });
        await orderModel.updateOne(
            { orderId: id, product: product }, // Filter criteria
            {

                $pop: { status: -1 }, // Remove the first element from the 'status' array
            }
        );

        await orderModel.updateOne(
            { orderId: id, product: product }, // Filter criteria
            {
                $push: { status: statusNew } // Push the new 'status' into the 'status' array
            }
        );


        let price = Number(order.price) * Number(order.quantity)
        let priceNow;
        const user = await userModel.findOne({ username: req.session.username })
        if (user.wallet) {
            console.log("wallet found")
          //  Number(priceNow) = Number(price) + Number(user.wallet)

            await userModel.updateOne({ username: req.session.username }, { $inc: { wallet: price } })
        }
        else {

            console.log("wallet not found")
            await userModel.updateOne({ username: req.session.username }, { $set: { wallet: price } }, { upsert: true })
        }




        res.redirect("/admin/orderlist")

    }
}



const returnOrdeReject = async (req, res) => {
    const product = req.query.product
    const id = req.query.id
    const user = req.query.username
    console.log(id + "on return order")
    console.log(product + "on returnorder")
    const order = await orderModel.findOne({$and:[{ orderId: id}, {product: product }]});
    if (order.status[0] == "Return") {
        console.log("canot return")
        res.redirect("/admin/orderlist")

    }
    else {
        console.log("Return Reject fuction started")
        const statusNew = "Return Rejected"
        await orderModel.updateOne({ $and: [{ orderId: id, product: product }] }, { $set: { return: 1 } });
        await orderModel.updateOne(
            { orderId: id, product: product }, // Filter criteria
            {

                $pop: { status: -1 }, // Remove the first element from the 'status' array
            }
        );

        await orderModel.updateOne(
            { orderId: id, product: product }, // Filter criteria
            {
                $push: { status: statusNew } // Push the new 'status' into the 'status' array
            }
        );


        res.redirect("/admin/orderlist")

    }
}



const orderDetailsAdmin = async (req, res) => {
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

        let returnRequest;
        if (order) {
            //copy
            if (order[0].status[0] == "Requested to return") {
                console.log("return request")
                returnRequest = 1;

            }

            //copy
            res.render("orderDetailsAdmin", { order, returnRequest })
        } else {
            console.log("no order found")
        }
    }
    catch (e) {
        console.log("error while showing orderlist in admin order controler" + e)
    }
}







module.exports = { listOrders, updateStatus, cancelOrder, orderDetailsAdmin, returnOrder,returnOrdeReject }