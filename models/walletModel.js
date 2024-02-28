const mongoose=require("mongoose");
const express=require("express")

mongoose.connect(process.env.MONGO_CONNECTER))
.then(()=>{console.log("connection established with mongodb on collection wallet")})
.catch((e)=>{console.error(e.message)})

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