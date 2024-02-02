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


const forgetPasswordVerifyEmail = async (req, res) => {

    const userFound = await userModel.findOne({ email: req.body.email });
    console.log(userFound + " email matched")
    console.log(req.body.email + " email given by user")
    console.log("database check")
    try {
        if (!userFound) {
            console.log("email not found")
            res.redirect("/forgetPassword?message=This email not found in the registry");
        }
        else {
            req.session.userContent = req.body;
            req.session.user = userFound.username;

            const result = {

                name: userFound.username,
                email: req.body.email,

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
            res.redirect("/forgetPassword/verifyPage")
            console.log("database check2")

        }
    }
    catch (e) {
        console.log(e.message);
        res.redirect("/error?message=something went wrong while verify email")
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



const forgetResendOtp = async (req, res) => {
    if (req.session.userContent) {

        const result = {
            name: req.session.userContent.username,
            email: req.session.userContent.email

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
        res.redirect("/forgetPassword?message=enter email again");
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

const page = async (req, res) => {
    try {
        console.log(req.query)
        let current = req.query.current
        if (req.query.nxt) {
            current++
        } else {
            current--
        }
        console.log(current, 'current vale')
        if (req.query.cat == 'all') {
            res.redirect(`/shopPage?current=${current}`)
        } else {
            res.redirect(`/shopCategory/${req.query.cat}?current=${current}`)
        }
    } catch (e) {
        console.log(e.message)
    }
}


const shopDetails = async (req, res) => {
    const current = req.query.current || 0
    const count = await cartModel.find({ username: req.session.username }).count();
    const allProductCount = await productsModel.find({ display: 1 }).count()
    const allProduct = await tab.allProducts(current);
    const categoryName = await tab.categoryName();
    const cat = "all"
    let counts
    if (allProductCount % 2 == 0) {
        counts = Math.floor(allProductCount / 2) - 1
    }else {
        counts = Math.floor(allProductCount / 2)
    }
    let prev
    if (current == 0) {
        prev = 0
    } else {
        prev = 1
    }
    let nxt
    if (current == counts) {
        nxt = 0
    } else {
        nxt = 1
    }


    // const category = await categoryModel.find({})
    // console.log(category)
    var username = req.session.username
    res.render("shop", { username, allProduct, categoryName, count, prev, nxt, current, cat })
}




const shopPageCategory = async (req, res) => {
    console.log("shop category clicked")
    const current = req.query.current || 0
    const params = req.params.category
    // console.log(params + " category name is this")
    const count = await cartModel.find({ username: req.session.username }).count();
    const categoryName = await tab.categoryName();
    const allProduct = await tab.category(params, current);
    const categoryNameCount = await productsModel.find({ $and: [{ display: 1 }, { category: params }] }).count()
    var username = req.session.username
    let counts
    if (categoryNameCount % 2 == 0) {
        counts = Math.floor(categoryNameCount / 2) - 1
    }else {
        counts = Math.floor(categoryNameCount / 2)
    }

    console.log(counts)
    console.log(current)
    let prev
    if (current == 0) {
        prev = 0
    } else {
        prev = 1
    }
    let nxt
    if (current == counts) {
        nxt = 0
    } else {
        nxt = 1
    }
    const cat = params
    res.render("shop", { username, allProduct, categoryName, count, prev, nxt, cat, current })
}


const searchProducts = async (req, res) => {
    console.log("search clicked")
    try {
        welcome = req.session.name

        console.log(req.body + "body contents")
        console.log(req.body.search)
        if (req.body.search) {
            console.log("1")
            search = req.body.search
            console.log("2")
            console.log(search)

            const regex = new RegExp(search, 'i')
            console.log(regex)
            console.log("3")
            const allProduct = await productsModel.find({ productname: { $regex: regex } })
            const username = req.session.username
            console.log(welcome)

            const count = await cartModel.find({ username: req.session.username }).count();

            const categoryName = await tab.categoryName();
            res.render("shop", { username, allProduct, categoryName, count })
        } else {
            console.log(req.session.name)
            console.log("found")
            res.redirect("/shopDetails")

        }
    } catch (e) {
        console.log(e.message)
        //res.redirect("admin/error?message=something went wrong")
    }
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

const forgetPasswordVerifyPage = async (req, res) => {
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
const showEmailInput = async (req, res) => {
    const message = req.query.message
    res.render("emailInput", { message })
}


const optPage = async (req, res) => {
    const message = req.query.message
    res.render("forgotPasswordOtpPage", { message })
}


const otpVerify = async (req, res) => {
    var tokenCheck = req.body.otp;
    var tokenLink = req.query.token
    console.log(req.session.otp + " in adduser function")
    console.log(req.body.otp + " typed otp")

    try {
        if (req.session.userContent) {


            if (tokenCheck == req.session.otp || tokenLink == req.session.otp) {

                if (otpSaved === 785247) {
                    console.log(req.session.otpExpired + "value of set timer")
                    // const hashPassword = await bcrypt.hash(req.session.content.password, 10);
                    const email = req.session.userContent.email;
                    const username = req.session.userContent.username;
                    const userData = await userModel.find({ email: email })
                    if (userData) {
                        res.redirect("/forgetPassword/changePasswordPage")

                    }

                }
                else {
                    console.log("otp expired in add user" + " " + req.session.otpExpired)
                    res.redirect("/forgetPassword/verifyPage?message=otp expired")
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


const showPasswordChangePage = async (req, res) => {
    res.render("changePassword")
}



const updatePassword = async (req, res) => {
    try {
        const userName = req.session.user
        await userModel.findOne({ username: userName });
        if (userName) {
            const hashPassword = await bcrypt.hash(req.body.password, 10)
            await userModel.updateOne({ username: userName }, { password: hashPassword });
            res.redirect("/?message=password changed successfully,please login")

        }
        else {
            console.log("username not found in update password function")
        }
    }
    catch (e) {
        res.send("internal server error")
        console.log("error in password update" + e)
    }


}






module.exports = { login_page, signup_page, addUser, showEmailInput, optPage, updatePassword, forgetResendOtp, showPasswordChangePage, forgetPasswordVerifyEmail, otpVerify, resendOtp, checkUserIn, shopPageCategory, searchProducts, isUser, shopDetails, verify_page, homePageCategory, checkUserOut, checkUserOut_live, homePage, verifyEmail, productDetails, page }