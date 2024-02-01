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
var otpSaved





//for render login page and checking session value is there in session storage
const login_page = (req, res) => {
    invalidUser = req.query.errUser;
    invalidPass = req.query.errPassword
    message = req.query.message
    console.log(req.session.isUserAuth + " session is there or not")
    if (req.session.isUserAuth) {
        res.redirect("/home")
    }
    else {

        res.render("userLogin", { invalidUser, invalidPass, message });
    }
}

const isUser = (req, res, next) => {
    if (req.session.isUserAuth) {
        next();
    }
    else {

        res.redirect("/?message=login again");
    }
}






//for rendering signup page
const signup_page = (req, res) => {
    var message = req.query.message
    res.render("userSignup", { message });

}






// adding user on signup post method
const verifyEmail = async (req, res) => {
    const userFound = await userModel.findOne({ username: req.body.username });
    const userEmail = await userModel.findOne({ email: req.body.email });
    console.log("database check")
    try {
        if (userFound) {

            console.log("user found")
            res.redirect("/signup?message=user already exist");
        }
        else if (userEmail) {
            console.log("email found")
            res.redirect("/signup?message=try another email");
        }
        else {
            req.session.content = req.body;

            const result = {
                id: req.body.id,
                name: req.body.username,
                email: req.body.email,
                phone: req.body.phone
            }

            const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
            req.session.otpExpired = false;
            // time intervel
            req.session.otp = OTP;
            otpSaved = 785247
            setTimeout(() => {
                otpSaved = 896314;
            }, 60000)

            console.log(req.session.otp + " in otp generator function")

            sendEmail(result.email, result.name, OTP)
            res.redirect("/adduser/verify_page")
            console.log("database check2")

        }
    }
    catch (e) {
        console.log(e.message);
        res.redirect("/error?message=something went wrong while signing up")
    }

}

const resendOtp = async (req, res) => {
    if (req.session.content) {

        const result = {
            id: req.session.content.id,
            name: req.session.content.username,
            email: req.session.content.email,
            phone: req.session.content.phone
        }
        // const token=await jwt.sign(result,secret,{
        //     expiresIn:86400,
        // })
        // added secret
        // var speakeasy = require("speakeasy");
        // var secret = speakeasy.generateSecret({ length: 20 });
        // req.session.secret = secret;
        // Get the current time in seconds
        // var currentTime = Math.floor(Date.now() / 1000);

        // Calculate the timestamp for 60 seconds in the future
        // var futureTimestamp = currentTime + 60;

        // Generate OTP for the future timestamp
        // var OTP = speakeasy.totp({
        //     secret: secret.base32,
        //     encoding: 'base32',
        //     time: futureTimestamp,
        //     window: 6

        // });
        // added secret

        const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
       
        // time intervel
        otpSaved = 785247
        setTimeout(() => {
            otpSaved = 896314;
        }, 60000)
        req.session.otp = OTP;
        console.log(req.session.otp + " in otp generator function")

        sendEmail(result.email, result.name, OTP)
        res.redirect("/adduser/verify_page")
        console.log("database check resend")
    }
    else {
        res.redirect("/signup?message=signup again");
    }
}


const homePage = async (req, res) => {
    const count = await cartModel.find({ username: req.session.username }).count();
    const allProduct = await tab.allProducts();
    const categoryName = await tab.categoryName();

    // const category = await categoryModel.find({})
    // console.log(category)
    var username = req.session.username
    res.render("index", { username, allProduct, categoryName, count })
}


const homePageCategory = async (req, res) => {
    console.log("category clicked")
    const params = req.params.category
    console.log(params + " category name is this")
    const count = await cartModel.find({ username: req.session.username }).count();
    const categoryName = await tab.categoryName();
    const category = await tab.category(params);
    var username = req.session.username
    res.render("index", { username, category, categoryName, count })
}



const verify_page = async (req, res) => {
    if (req.session) {
        message = req.query.message;
        res.render("emailVerify_page", { message })
    }
    else {
        res.status(404)
    }
}






const addUser = async (req, res) => {

    var tokenCheck = req.body.otp;
    var tokenLink = req.query.token
    console.log(req.session.otp + " in adduser function")
    console.log(req.body.otp + " typed otp")

    try {
        if (req.session.content) {


               if (tokenCheck == req.session.otp || tokenLink == req.session.otp) {

                if (otpSaved === 785247) {
                    console.log(req.session.otpExpired + "value of set timer")
                    const hashPassword = await bcrypt.hash(req.session.content.password, 10);
                    const email = req.session.content.email;
                    const newUser = new userModel({
                        username: req.session.content.username,
                        email: req.session.content.email,
                        password: hashPassword,
                        phone: req.session.content.phone,
                        isAdmin: 0,
                        userBlock: 0
                    })

                    await newUser.save();
                    res.redirect("/?message=user created ,please login")
                }
                else {
                    console.log("otp expired in add user" + " " + req.session.otpExpired)
                    res.redirect("/adduser/verify_page?message=otp expired")
                }
            }
            else {
                res.redirect("/adduser/verify_page?message=wrong otp")
            }
        }
        else {
            res.redirect("/signup?message=signup again")
        }


    } catch (error) {

        // For security proposes, error will always be 'Invalid or expired token'
        console.error(error)

        // But you can dig it up by checking `.parent` Error
        console.error(error.parent);

    }


}













//user login authentication and adding a session value for that user
const checkUserIn = async (req, res) => {
    try {
        const checkUser = await userModel.findOne({ username: req.body.username });
        if (checkUser) {
            const checkPass = await bcrypt.compare(req.body.password, checkUser.password);
            if (checkPass) {
                if (checkUser.userBlock == 0) {
                    req.session.isUserAuth = true;
                    req.session.email = checkUser.email;
                    req.session.username = checkUser.username
                    console.log(req.session.username + "session storage")
                    console.log(checkUser.username + "db storage")
                    // res.send("hiii its home")
                    res.redirect(`/home`)
                }
                else {
                    res.redirect("/?errUser=Admin blocked this user")
                }

            } else {
                res.redirect("/?errPassword=invalid password")
            }
        }
        else {
            res.redirect("/?errUser=invalid username")
        }

    }
    catch (e) {
        console.log("e.message")
        res.redirect("/?error?message=something went wrong while signing up")
    }
}


const productDetails = async (req, res) => {
    try {
        const username = req.session.username
        const product = await productsModel.find({ productname: req.params.productname })
        if (product) {
            console.log("found product")
            console.log(product)
            res.render("shopdetails", { product, username })

        }
    }
    catch (e) {
        console.log("error in user control productdetails function" + e)
    }
}






const checkUserOut = (req, res) => {
    req.session.isUserAuth = false;
    console.log("session end ,sign out")
    res.redirect('/?message=sign out successfully')
}

// const checkUserOut = async (req, res) => {
//     await req.session.destroy()
//     console.log("session end ,sign out")
//     res.redirect('/?message=sign out successfully')
// }

// const checkUserOut_live = async (req, res) => {
//     console.log("live session area")
//     if (req.session) {
//         await req.session.destroy()
//         res.redirect('/admin/listusers')
//     } else {
//         // res.status(401).send('Unauthorized');
//         console.log("no sessions found")
//         res.redirect('/admin/listusers')
//     }
// }
const checkUserOut_live = async (req, res) => {
    console.log("Blocking user");

    // Check if req.session is defined before attempting to access properties

    // Check if the user is already logged in
    if (req.session.isUserAuth !== undefined) {
        // Perform actions related to blocking the user

        // Destroy the session
        req.session.isUserAuth = false;
        console.log("User session destroyed");
    } else {
        console.log("User is not logged in");
    }


    // Redirect to a suitable location

};






module.exports = { login_page, signup_page, addUser, resendOtp, checkUserIn, isUser, verify_page, homePageCategory, checkUserOut, checkUserOut_live, homePage, verifyEmail, productDetails }