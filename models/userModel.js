const mongoose=require("mongoose");
const express=require("express")

mongoose.connect("mongodb://0.0.0.0:27017/frutable")
.then(()=>{console.log("connection established with mongodb on collection users")})
.catch(()=>{console.error(e.message)})

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    coupon:{
        type:Array,
        required:false,
        trim:true
    },
    isAdmin:{
        type:Number,
        required:true
    },
    userBlock:{
        type:Number,
        required:true
    },
    wallet:{
        type:Number,
        required:true
    }

});

module.exports=mongoose.model("users",userSchema);