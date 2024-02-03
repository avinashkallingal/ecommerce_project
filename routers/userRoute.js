const express = require("express")
const userControl = require("../controlers/userControler")
const tab = require("../controlers/tabSelection")
const session = require("express-session")
const path=require('path')
const productsModel = require("../models/productModel")
const cartControl = require('../controlers/cartControler')
const checkoutControl = require('../controlers/checkoutControler')
const orderControl = require('../controlers/userOrderControler')
const userDetailsControl = require('../controlers/userDetailsControler')
const addressControl = require('../controlers/userAddressControler')
const adminOrderControl = require('../controlers/adminOrderControler')



const router = express.Router();



router.get("/",userControl.login_page)
router.post("/user_signin", userControl.checkUserIn)
router.get("/signup", userControl.signup_page)
router.post("/adduser/verifyemail", userControl.verifyEmail)
// router.post("/adduser/verifyemail", userControl.verifyEmail)
router.get("/adduser/verify_page",userControl.verify_page)
router.get("/adduser/resndOtp", userControl.resendOtp)
router.all("/adduser/save", userControl.addUser)

//forgot password
router.get("/forgetPassword", userControl.showEmailInput)
router.post("/forgetPassword/verifyEmail", userControl.forgetPasswordVerifyEmail)
router.get("/forgetPassword/verifyPage", userControl.optPage)
router.post("/forgetPassword/otpVerify", userControl.otpVerify)
router.get("/forgetPassword/changePasswordPage", userControl.showPasswordChangePage)
router.get("/forgetPassword/resendOtp", userControl.forgetResendOtp)
router.post("/forgetPassword/updatePassword", userControl.updatePassword)

//password changing from userprofile button
router.get("/userProfile/changePassword/page", userControl.showPasswordChangeUserProfile)
router.post("/userProfile/changePassword/change", userControl.changePasswordUserProfile)







router.get("/signout",userControl.checkUserOut)






router.get("/home",userControl.isUser, userControl.homePage)
router.get("/home/:category",userControl.isUser, userControl.homePageCategory)





// router.get("/home/vegitable",userControl.isUser, userControl.home_page_vegitable)
// router.get("/home/fruit",userControl.isUser, userControl.home_page_fruit)
// router.get("/home/bread",userControl.isUser, userControl.home_page_bread)




//router to show product details
router.get('/productdetails/:productname',userControl.isUser,userControl.productDetails)

//router to show cart
router.get("/cart",userControl.isUser, cartControl.showCart)


//router to submit to cart
router.post("/addToCart/:productId",userControl.isUser, cartControl.addCart)
router.get("/addToCart/:productId",userControl.isUser,cartControl.addCartSigleProduct)
router.get("/shop/addToCart/:productId",userControl.isUser,cartControl.addCartSigleProductShop)


//Rrouter for updating quantity value backup
// router.get("/updateQuantityMinus/:productId",userControl.isUser,cartControl.updateQuantityMinus)
// router.get("/updateQuantityPlus/:productId",userControl.isUser,cartControl.updateQuantityPlus)

//Rrouter for updating quantity value fetch api test
router.post("/updateQuantityMinus",userControl.isUser,cartControl.updateQuantityMinus)
router.get("/updateQuantityPlus",userControl.isUser,cartControl.updateQuantityPlus)

//router for delete cart elements
router.get("/cartElementDelete/:productId",userControl.isUser,cartControl.deleteCartElemet)

//router to show checkout page
router.get("/checkout",userControl.isUser,checkoutControl.showCheckout)

//router to add data to order DB
router.post("/confirmpage",userControl.isUser,orderControl.orderConfirmPage)
router.get("/addtoorder",userControl.isUser,orderControl.addOrder)

//router for showing user details page
router.get("/userDetails",userControl.isUser,userDetailsControl.showPage)

//router for edit address
router.get("/profileEditPage",userControl.isUser,addressControl.showEditPage)

router.post("/editProfileDetails",userControl.isUser,addressControl.editProfile)




//roured for add address page showing
router.get("/addAddressPage",userControl.isUser,addressControl.showPage)
router.post("/addAddress",userControl.isUser,addressControl.addAddress)
router.post("/fetchAddress",addressControl.fetchAddress)

router.get("/savedAddressEdit/:id",userControl.isUser,addressControl.showSavedAddressEditPage)
router.post("/editSavedAddress/:id",userControl.isUser,addressControl.editSavedAddressFuntion)



//router for user order history page
router.get("/orderHistory",userControl.isUser,orderControl.showOrderPage)
router.get("/orderDetails",userControl.isUser,orderControl.orderDetails)




//router for cancel order
router.get('/cancelOrderuser',userControl.isUser,orderControl.cancelOrder)


//router to show shop page
router.get('/shopPage',userControl.shopDetails)
router.get("/shopCategory/:category", userControl.shopPageCategory)
router.post("/shopSearch", userControl.searchProducts)

router.get('/page',userControl.page)













module.exports = router