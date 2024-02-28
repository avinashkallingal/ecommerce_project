const mongoose=require("mongoose");
const express=require("express")

mongoose.connect(process.env.MONGO_CONNECTER)
.then(()=>{console.log("connection established with mongodb on collection category")})
.catch((e)=>{console.error(e.message)})

const categorySchema=new mongoose.Schema({
    category:{
        type:String,
        required:true
    },
    list:{
        type:Number,
        required:true
    }

});

module.exports=mongoose.model("category",categorySchema);