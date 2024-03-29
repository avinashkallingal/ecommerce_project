const mongoose=require("mongoose");
const express=require("express")

mongoose.connect(process.env.MONGO_CONNECTER)
.then(()=>{console.log("connection established with mongodb on collection products")})
.catch((e)=>{console.log(e)})

const productSchema=new mongoose.Schema({
    productname:{
        type:String,
        required:true,
        trim:true
    },
    price:{
        type:Number,
        required:true
    },
    categoryid:{
        type:String,
        required:true
    },
   category:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    imagepath:{
        type:Array,
        required:true
    },
    list:{
        type:Number,
        required:true
    },
    display:{
        type:Number,
        required:true
    }
});

module.exports=mongoose.model("products",productSchema);