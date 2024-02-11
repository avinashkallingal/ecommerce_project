const mongoose=require("mongoose");
const express=require("express")

mongoose.connect("mongodb://0.0.0.0:27017/frutable")
.then(()=>{console.log("connection established with mongodb on collection wallet")})
.catch(()=>{console.error(e.message)})

const walletSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    }
 
});

module.exports=mongoose.model("wallet",walletSchema);