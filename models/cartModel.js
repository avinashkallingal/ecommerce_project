const mongoose=require("mongoose");
const express=require("express")

mongoose.connect(process.env.MONGO_CONNECTER)
.then(()=>{console.log("connection established with mongodb on collection cart")})
.catch((e)=>{console.log(e)})

const cartSchema=new mongoose.Schema({
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
    quantity:{
        type:Number,
        required:1
    }
 
});

module.exports=mongoose.model("cart",cartSchema);