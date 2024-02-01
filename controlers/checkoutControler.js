const userModel = require("../models/userModel")
const productsModel = require("../models/productModel")
const categoryModel = require('../models/categoryModel')
const userControl = require('../controlers/userControler')
const tab = require("./tabSelection")
const cartModel = require("../models/cartModel")
var mongoose = require("mongoose");

const showCheckout=async (req,res)=>{
    // copy
    
        try {
            const cart = await cartModel.find({ username: req.session.username })
            console.log(req.session.username)
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
    
            
            const subTotal = cartPrice.length > 0 ? (cartPrice[0].totalSum+0) : 0;//without shipping charge total
            const total = subTotal == 0 ? 0 : subTotal + 50;//shipping charge 50 is included here bacause its is flat rate
            console.log(subTotal+typeof(subTotal) + " subtotal price")
            console.log(total+typeof(subTotal) + " total price")
    
            if (cart) {
                res.render("checkout", { cart, total, subTotal, count });
            } else {
                res.render("checkout", { cart: 0, total: 0, subTotal: 0, count: 0 });
            }
        }
        catch (e) {
            console.log("error while calculating total in checkout controller" + e)
            res.status(500).send("internal server error");
        }
    
    
    // copy
  
}




module.exports = { showCheckout }