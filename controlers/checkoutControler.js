const userModel = require("../models/userModel")
const productsModel = require("../models/productModel")
const categoryModel = require('../models/categoryModel')
const userControl = require('../controlers/userControler')
const tab = require("./tabSelection")
const cartModel = require("../models/cartModel")
const addressModel = require("../models/addressModel")
var mongoose = require("mongoose");

const showCheckout = async (req, res) => {
    // copy

    try {
        console.log(req.session.couponCount + " coupon count")
        console.log(req.session.walletApplied + " wallet apllied")

        const cart = await cartModel.find({ username: req.session.username })
        const addresses = await addressModel.find({ username: req.session.username })
        const wallet = await userModel.findOne({ username: req.session.username }, { _id: 0, wallet: 1 })

        const count = await cartModel.find().count();
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






        // Check if req.session.couponCount exists
        // if (req.session.couponCount == 1) {

        //     // req.session.couponCount  exist
        //     console.log('coupon exist');
        //     if (cart) {

        //         let total = req.session.totalNow;
        //         let wallet = req.session.walletNow;
        //         let subTotal1 = req.session.checkoutTotal

        //         res.render("checkout", { cart, total, subTotal1, count, addresses, wallet: wallet, removeCoupon: 1 });
        //     } else {
        //         res.render("checkout", { cart: 0, total: 0, subTotal1: 0, count: 0, addresses: 0 });
        //     }


        // } 

        //for wallet
    //    else if (req.session.walletApplied == 1) {

    //         // req.session.couponCount  exist
    //         console.log('wallet exist req.session.walletApplied'+req.session.walletApplied);
    //         if (cart) {

    //             let total = req.session.totalNow;
    //             let wallet = req.session.walletNow;
    //             let subTotal1 = req.session.checkoutTotal

    //             res.render("checkout", { cart, total, subTotal1, count, addresses, wallet: wallet, removeWallet: 1 });
    //         } else {
    //             res.render("checkout", { cart: 0, total: 0, subTotal1: 0, count: 0, addresses: 0 });
    //         }


    //     } else {
            ////////////
            // req.session.total exists


            console.log(req.session.username)




            const subTotal1 = cartPrice.length > 0 ? (cartPrice[0].totalSum + 0) : 0;//without shipping charge total
            const total = subTotal1 == 0 ? 0 : subTotal1 + 50;//shipping charge 50 is included here bacause its is flat rate

            req.session.checkoutTotal = total;
            if (cart) {

                req.session.totalNow = total;
                res.render("checkout", { cart, total, subTotal1, count, addresses, wallet: wallet.wallet });
            } else {
                res.render("checkout", { cart: 0, total: 0, subTotal1: 0, count: 0, addresses: 0 });
            }
        //}


    }
    catch (e) {
        console.log("error while calculating total in checkout controller" + e)
        res.status(500).send("internal server error");
    }


    // copy

}




module.exports = { showCheckout }