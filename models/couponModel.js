const mongoose = require("mongoose");
const express = require("express") 

mongoose.connect(process.env.MONGO_CONNECTER)
    .then(() => { console.log("connection established with mongodb on collection coupons") })
    .catch((e)=>{console.log(e)})

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    expiry: {
        type: Date,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    minimumAmount: {
        type: Number,
        required: true
    }

});

module.exports = mongoose.model("coupons", couponSchema);