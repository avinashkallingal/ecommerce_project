const mongoose=require("mongoose");
const express=require("express")

mongoose.connect("mongodb://0.0.0.0:27017/frutable")
.then(()=>{console.log("connection established with mongodb on collection category")})
.catch(()=>{console.error(e.message)})

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