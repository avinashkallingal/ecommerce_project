const mongoose=require("mongoose");
const express=require("express")


mongoose.connect(process.env.MONGO_CONNECTER)
.then(()=>{console.log("connection established with mongodb on collection address")})
.catch((e)=>{console.error(e.message)})
const userAddressSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    fullname:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    // email:{
    //     type:String,
    //     required:true
    // },
    address:{
        houseName:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        pincode:{
            type:Number,
            required:true
        },
        country:{
            type:String,
            required:true
        }
    },
    primary:{
        type:Number,
        required:true
    }
})
module.exports=mongoose.model("address",userAddressSchema);