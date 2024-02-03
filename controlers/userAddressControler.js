const userModel = require("../models/userModel")
const tab = require("./tabSelection")
const bcrypt = require("bcrypt")
const sendEmail = require("../utils/sendEmail")
const jwt = require("jsonwebtoken")
require('dotenv').config()
const otpGenerator = require('otp-generator')
const productsModel = require("../models/productModel")
const categoryModel = require('../models/categoryModel')
const session = require('express-session')
const cartModel = require("../models/cartModel")
const addressModel = require("../models/addressModel")
const { default: mongoose } = require("mongoose")

const showPage = (req, res) => {
    res.render("addAddress")
}
const showSavedAddressEditPage =async (req, res) => {
    var id = new mongoose.Types.ObjectId(req.params.id);
    const address=await addressModel.find({$and:[{username:req.session.username},{primary:0},{_id:id}]})
    console.log("address found not primary "+address)
    res.render("savedAddressEdit",{address})
}

const showEditPage =async (req, res) => {
    const addressPrimary=await addressModel.find({$and:[{username:req.session.username},{primary:1}]})
    res.render("profileEdit",{addressPrimary})

}


const editSavedAddressFuntion =async (req, res) => {
    try{
        console.log("edit saved address function")
        var id = new mongoose.Types.ObjectId(req.params.id);
       await addressModel.updateOne({$and:[{username:req.session.username},{primary:0},{_id:id}]},{
            
            
                username: req.session.username,
                fullname: req.body.name,
                phone: req.body.phone,
                address: {
                    houseName: req.body.housename,
                    city: req.body.city,
                    state: req.body.state,
                    pincode: req.body.pincode,
                    country: req.body.country
                },
                primary: 0
            

        
        })   


        res.redirect("/userDetails");

    
}
catch(e){
    console.log("error in editing saved address in useraddresscontroler"+e)
}
    

}



const editProfile =async (req, res) => {
    try{
        console.log("edit profile function")
    const addressPrimary=await addressModel.findOne({$and:[{username:req.session.username},{primary:1}]})
    if(addressPrimary){
        console.log("found a primary address")
        await addressModel.updateOne({$and:[{username:req.session.username},{primary:1}]},{
            
                username: req.session.username,
                fullname: req.body.name,
                phone: req.body.phone,
                address: {
                    houseName: req.body.housename,
                    city: req.body.city,
                    state: req.body.state,
                    pincode: req.body.pincode,
                    country: req.body.country
                },
                primary: 1
            

        })
        res.redirect("/userDetails")
    }
    else{
        console.log("no address record found adding new primary")
        const newAddress = new addressModel({
            username: req.session.username,
            fullname: req.body.name,
            phone: req.body.phone,
            address: {
                houseName: req.body.housename,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pincode,
                country: req.body.country
            },
            primary: 1
        })
        await newAddress.save()



        res.redirect("/userDetails");

    }
}
catch(e){
    console.log("error in adding primary address in useraddresscontroler"+e)
}
    

}



const fetchAddress = async (req, res) => {
   try{
    var id = new mongoose.Types.ObjectId(req.body.id);
    const address=await addressModel.find({_id:id})
    if(address){
        const name=address[0].fullname
        const house=address[0].address.houseName
        const city=address[0].address.city
        const state=address[0].address.state
        const pincode=address[0].address.pincode
        const country=address[0].address.country
        const mobile=address[0].phone
        res.header("Content-Type", "application/json").json({ name:name,house:house,city:city,state:state,pincode:pincode,country:country,mobile:mobile });
    }
    else{
        console.log("error fetching address")
    }
}
catch(e){
    res.send("server fetch error")
    console.log("error in fetching address for fetch request in userAddress contriler"+e)
}
}


const addAddress = async (req, res) => {

    try {
        console.log(req.body+"   data from add address")
        console.log(req.session.username)

        const newAddress = new addressModel({
            username: req.session.username,
            fullname: req.body.name,
            phone: req.body.phone,
            address: {
                houseName: req.body.housename,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pincode,
                country: req.body.country
            },
            primary: 0
        })
        await newAddress.save()



        res.redirect("/userDetails");

    }
    catch (e) {
        console.log("error while saving data to odrder DB ORDER CONTROLER controller" + e)
        res.status(500).send("internal server error");
    }


}





module.exports = { showPage, addAddress,showEditPage,editProfile,fetchAddress,showSavedAddressEditPage,editSavedAddressFuntion }