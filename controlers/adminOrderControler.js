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
        const order = await orderModel.find();
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
    const id=req.query.id;
    const status=req.query.status
    const product=req.query.product
    console.log(id+" got order id in status button")
    console.log(status+" got status in status button")
    console.log(product+" got product name status in status button")
    try {
        if(status!="Delivered Successfully")
        await orderModel.updateOne({$and:[{ orderId: id,product:product}] }, { $pop: { status: -1 } });
        
      
            res.redirect("/admin/orderlist")
    }
    catch (e) {
        console.log("error while showing orderlist in admin order controler" + e)
    }
}


const cancelOrder=async (req,res)=>{
    const product=req.query.product
    const id=req.query.id
    const user=req.query.username
    console.log(id+"on cancel order")
    console.log(product+"on cancel order")
    const order=await orderModel.find({orderId:id,product:product});
    if(order[0].status[0]=="Delivered Successfully"){
        console.log("canot cancel")
        res.redirect("/admin/orderlist")

    }
    else{
        await orderModel.updateOne({$and:[{ orderId: id,product:product}] }, { $set: { adminCancel: 1 } });
        res.redirect("/admin/orderlist")
      
    }
}






module.exports = { listOrders, updateStatus,cancelOrder }