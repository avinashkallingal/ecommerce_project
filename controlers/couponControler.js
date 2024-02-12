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
    res.render("coupon", { coupon })
}

const addCoupon = async (req, res) => {
    try {
        const coupon = new couponModel({
            name: req.body.name,
            expiry: req.body.expiry,
            discount: req.body.discount,
            minimumAmount: req.body.minimum
        })
        await coupon.save();
        res.redirect("/admin/listCoupon")
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
        await couponModel.updateOne({ name: req.params.name }, {
            name: req.body.name,
            expiry: req.body.expiry,
            discount: req.body.discount,
            minimumAmount: req.body.minimum
        })
        res.redirect("/admin/listCoupon")
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
        const subTotal1 = cartPrice.length > 0 ? (cartPrice[0].totalSum + 0) : 0;//without shipping charge total
        const total = subTotal1 == 0 ? 0 : subTotal1 + 50;//shipping charge 50 is included here bacause its is flat rate

        const coupon = await couponModel.findOne({ name: req.body.name })
        let couponTotal = total

        if (coupon) {

            if (total >= coupon.minimumAmount) {
                if (coupon.expiry - new Date() >= 0) {

                    console.log("coupon found in apply coupon function")

                    couponTotal = total - coupon.discount;
                    const couponFound = await userModel.findOne({ $and: [{ username: req.session.username }, { coupon: { $in: [req.body.name] } }] })
                    if (req.body.operation == "1") {//checking apply coupon clicked or remove coupon

                        if (!couponFound) {

                            const oneTimeUse = await userModel.updateOne({ username: req.session.username }, { $push: { coupon: req.body.name } })
                            const cart = await cartModel.find({ username: req.session.username })

                            if (cart) {
                                req.session.couponCount = 0;
                                req.session.coupon = req.body.name;
                                req.session.couponCount = req.session.couponCount + 1;
                                res.header("Content-Type", "application/json").json({ discount: coupon.discount, priceTotal: couponTotal, message: "", removeButton: 1 });
                            } else {
                                res.header("Content-Type", "application/json").json({ discount: 0, priceTotal: 0, message: 0 });
                            }
                        }
                        else {
                            console.log("coupon already applied")
                            const message = "Coupon already applied"
                            req.session.couponCount = req.session.couponCount + 1;
                            res.header("Content-Type", "application/json").json({ message: message });
                        }
                    }
                    else if (req.body.operation == 0) {
                        //remove coupon function
                        if (couponFound) {
                            const oneTimeUse = await userModel.updateOne({ username: req.session.username }, { $pull: { coupon: req.body.name } })
                            req.session.couponCount = req.session.couponCount + 1;
                            res.header("Content-Type", "application/json").json({ discount: 0, priceTotal: total, message: "", removeButton: 0 });
                        }
                        else {
                            console.log("there is no coupon to remove")
                        }

                    }






                }
                else {
                    console.log("expiry date")
                    const message="Coupon date expired"
                    res.header("Content-Type", "application/json").json({ message: message });
                }

            }
            else{
                console.log("need minimum amount"+coupon.minimumAmount)
                const message="need minimum amount "+coupon.minimumAmount
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