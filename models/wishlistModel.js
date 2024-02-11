const mongoose=require("mongoose");
const express=require("express")

mongoose.connect("mongodb://0.0.0.0:27017/frutable")
.then(()=>{console.log("connection established with mongodb on collection wishlist")})
.catch(()=>{console.error(e.message)})

const wishlistSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    product:{
        type:String,
        required:true
    },
    productid:{
        type:String,
        required:true
    },
   image:{
    type:Array,
    required:true
    },
    price:{
        type:Number,
        required:true
    },
    remove:{
        type:Number,
        required:true
    }
 
});

module.exports=mongoose.model("wishlist",wishlistSchema);