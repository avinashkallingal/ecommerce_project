const userModel = require("../models/userModel")
const productsModel = require("../models/productModel")
const categoryModel = require('../models/categoryModel')
const userControl = require('../controlers/userControler')
const tab = require("./tabSelection")
const cartModel = require("../models/cartModel")
const addressModel = require("../models/addressModel")
const couponModel = require("../models/couponModel")
var mongoose = require("mongoose");



const showPage = async (req, res) => {
    const coupon = await couponModel.find();
    message = req.query.message
    res.render("coupon", { coupon, message })
}

const addCoupon = async (req, res) => {
    try {

        //checking duplicate coupon
        if (Number(req.body.discount) == 0 || Number(req.body.minimum) == 0 || Number(req.body.discount) == Number(req.body.minimum) || (req.body.name == "") || (req.body.minimum == "") || (req.body.discount == "") || (req.body.expiry == "")) {
            console.log("invalid input")//discount cant be zero and discount cant equal to minimum amount
            res.redirect("/admin/listCoupon?message=invalid input")
        } else {

            if (!(Number(req.body.discount) > Number(req.body.minimum))) {
                //checking minumum amount is greater than discount

                const couponName = await couponModel.findOne({ name: req.body.name })
                if (couponName) {
                    res.redirect("/admin/listCoupon?message=Coupon Already in registry")
                }
                else {
                    const coupon = new couponModel({
                        name: req.body.name,
                        expiry: req.body.expiry,
                        discount: req.body.discount,
                        minimumAmount: req.body.minimum
                    })
                    await coupon.save();
                    res.redirect("/admin/listCoupon")
                }
            }
            else {
                console.log("discount value exeeded minimum amount value")
                // const message=document.getElementById("errMsg")
                //message.innerHTML="discount value exeeded minimum amount value"
                res.redirect("/admin/listCoupon?message=discount value exeeded minimum amount value")
            }
        }

    }
    catch (e) {
        console.log("error in adding coupon to schema in coupon controler " + e)
    }
}

const deleteCoupon = async (req, res) => {
    try {
        await couponModel.deleteOne({ name: req.params.name })
        res.redirect("/admin/listCoupon")
    }
    catch (e) {
        console.log("error while deleting " + e)
    }
}

const editCoupon = async (req, res) => {
    try {
        const couponName = await couponModel.findOne({ name: req.body.name })
        if (req.body)
            if (!couponName || req.body.name == req.body.oldCouponName) {
                if (Number(req.body.discount) == 0 || Number(req.body.minimum) == 0 || Number(req.body.discount) == Number(req.body.minimum) || (req.body.name == "") || (req.body.minimum == "") || (req.body.discount == "") || (req.body.expiry == "")) {
                    console.log("invalid input")//discount cant be zero and discount cant equal to minimum amount
                    res.redirect("/admin/listCoupon?message=invalid input")
                } else {
                    if (!(Number(req.body.discount) > Number(req.body.minimum))){


                        await couponModel.updateOne({ name: req.params.name }, {
                            name: req.body.name,
                            expiry: req.body.expiry,
                            discount: req.body.discount,
                            minimumAmount: req.body.minimum
                        })
                    res.redirect("/admin/listCoupon")
                }
                else {
                    console.log("discount value exeeded minimum amount value")
                    // const message=document.getElementById("errMsg")
                    //message.innerHTML="discount value exeeded minimum amount value"
                    res.redirect("/admin/listCoupon?message=discount value exeeded minimum amount value")
                }


                }

            }
            else {
                res.redirect("/admin/listCoupon?message=Coupon Already in registry")
            }

    }
    catch (e) {
        console.log("error in updation coupon in coupon controler " + e)

    }
}


const couponOperation = async (req, res) => {
    console.log("hi this is apply coupon backend    ")
    try {
        console.log("hiiii this is backend coupon")

        //calculation total and made global
        // const cartPrice = await cartModel.aggregate([
        //     { $match: { username: req.session.username } },
        //     {
        //         $project: {
        //             _id: 1,
        //             multiply: {
        //                 $multiply: [
        //                     { $toDouble: "$price" },
        //                     { $toDouble: "$quantity" }
        //                 ]
        //             }
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: null,
        //             totalSum: { $sum: "$multiply" }
        //         }
        //     }
        // ])
        // const subTotal1 = cartPrice.length > 0 ? (cartPrice[0].totalSum + 0) : 0;//without shipping charge total
        // const total = subTotal1 == 0 ? 0 : subTotal1 + 50;//shipping charge 50 is included here bacause its is flat rate

        const coupon = await couponModel.findOne({ name: req.body.name })
        let couponTotal = req.session.totalNow;
        let total = req.session.totalNow;


        if (req.body.operation == 0) {
            //remove coupon function
            if (req.session.couponCount == 1) {
                req.session.couponDiscountAmount = coupon.discount;
                // const oneTimeUse = await userModel.updateOne({ username: req.session.username }, { $pull: { coupon: req.body.name } })//NEED to use in last confirm pafe confirm button
                req.session.totalNow = req.session.totalNow + req.session.couponDiscountAmount;
                total = req.session.totalNow;
                req.session.couponCount = 0;
                res.header("Content-Type", "application/json").json({ discount: 0, priceTotal: total, message: "", removeButton: 0 });

            }
            else {
                console.log("there is no coupon to remove")
                const message = "there is no coupon to remove"
                res.header("Content-Type", "application/json").json({ message: message });

            }

        }

        if (coupon) {


            req.session.couponDiscountAmount = coupon.discount;

            if (total >= coupon.minimumAmount) {
                if (coupon.expiry - new Date() >= 0) {

                    console.log("coupon found in apply coupon function")


                    const couponFound = await userModel.findOne({ $and: [{ username: req.session.username }, { coupon: { $in: [req.body.name] } }] })

                    //appy coupon operation
                    if (req.body.operation == "1") {//checking apply coupon clicked or remove coupon

                        if (!couponFound) {

                            //const oneTimeUse = await userModel.updateOne({ username: req.session.username }, { $push: { coupon: req.body.name } })//need to use in confirm page confirm button
                            const cart = await cartModel.find({ username: req.session.username })

                            if (cart) {

                                if (req.session.couponCount == 10) {//need to change only for review purpose made this 10
                                    console.log("it is the coupon repeat add check")
                                    couponTotal = req.session.totalNow
                                    const message = "already applied in total"
                                    res.header("Content-Type", "application/json").json({ discount: coupon.discount, priceTotal: couponTotal, message: "", removeButton: 1 });

                                } else {
                                    couponTotal = total - coupon.discount;
                                    req.session.totalNow = couponTotal;
                                    req.session.couponCount = 0;
                                    req.session.coupon = req.body.name;
                                    req.session.couponCount = 1;
                                    res.header("Content-Type", "application/json").json({ discount: coupon.discount, priceTotal: couponTotal, message: "", removeButton: 1 });
                                }
                            } else {
                                res.header("Content-Type", "application/json").json({ discount: 0, priceTotal: 0, message: 0 });
                            }
                        }
                        else {
                            console.log("coupon already applied")
                            const message = "Coupon already applied for this user"
                            //req.session.couponCount = req.session.couponCount + 1;
                            res.header("Content-Type", "application/json").json({ message: message });
                        }
                    }

                    //operation remove changed from here to top






                }
                else {
                    console.log("expiry date")
                    const message = "Coupon date expired"
                    res.header("Content-Type", "application/json").json({ message: message });
                }

            }
            else {
                console.log("need minimum amount" + coupon.minimumAmount)
                const message = "need minimum amount " + coupon.minimumAmount
                res.header("Content-Type", "application/json").json({ message: message });
            }
        }

        else {
            console.log("Coupon not valid")
            const message = "Coupon not valid"
            res.header("Content-Type", "application/json").json({ message: message });
        }
    }
    catch (e) {
        console.log("error while applying coupon from coupon controller " + e)
    }
}

module.exports = { showPage, addCoupon, deleteCoupon, editCoupon, couponOperation }

