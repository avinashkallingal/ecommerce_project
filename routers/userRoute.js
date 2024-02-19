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
const payment=require('../controlers/paymentControler')
const couponControler = require("../controlers/couponControler.js")



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
router.get("/userProfile/changePassword/page",userControl.isUser,userControl.showPasswordChangeUserProfile)
router.post("/userProfile/changePassword/change",userControl.isUser,userControl.changePasswordUserProfile)







router.get("/signout",userControl.checkUserOut)






router.get("/home",userControl.isUser, userControl.homePage)
// router.get("/home/:category",userControl.isUser, userControl.homePageCategory)

//for guest user
router.get("/guest", userControl.homePageGuest)
router.get("/home/:category", userControl.homePageCategory)





// router.get("/home/vegitable",userControl.isUser, userControl.home_page_vegitable)
// router.get("/home/fruit",userControl.isUser, userControl.home_page_fruit)
// router.get("/home/bread",userControl.isUser, userControl.home_page_bread)




//show product details
router.get('/productdetails/:productname',userControl.productDetails)

//show cart
router.get("/cart",userControl.isUser, cartControl.showCart)


//submit to cart
router.post("/addToCart/:productId",userControl.isUser, cartControl.addCart)
router.get("/addToCart/:productId",userControl.isUser,cartControl.addCartSigleProduct)
router.get("/shop/addToCart/:productId",userControl.isUser,cartControl.addCartSigleProductShop)

//wishlist
router.get('/wishlist',userControl.showWishlist)
router.get('/wishlist/add/:productId',userControl.addToWishlist)
router.get("/wishlist/delete/:productId",userControl.isUser,cartControl.deleteWishlistElement)
router.get("/wishlist/addToCart/:productId",userControl.isUser,cartControl.wishlistAddCartSigleProduct)




//updating quantity value backup
// router.get("/updateQuantityMinus/:productId",userControl.isUser,cartControl.updateQuantityMinus)
// router.get("/updateQuantityPlus/:productId",userControl.isUser,cartControl.updateQuantityPlus)

//fetch updating quantity value fetch api test
router.post("/updateQuantityMinus",userControl.isUser,cartControl.updateQuantityMinus)
router.get("/updateQuantityPlus",userControl.isUser,cartControl.updateQuantityPlus)

//delete cart elements
router.get("/cartElementDelete/:productId",userControl.isUser,cartControl.deleteCartElemet)

//show checkout page
router.get("/checkout",userControl.isUser,checkoutControl.showCheckout)

//add data to order DB
router.post("/confirmpage",userControl.isUser,orderControl.orderConfirmPage)
router.get("/addtoorder",userControl.isUser,orderControl.addOrder)

//showing user details page
router.get("/userDetails",userControl.isUser,userDetailsControl.showPage)

//for edit address
router.get("/profileEditPage",userControl.isUser,addressControl.showEditPage)

router.post("/editProfileDetails",userControl.isUser,addressControl.editProfile)




//add address page showing
router.get("/addAddressPage",userControl.isUser,addressControl.showPage)
router.post("/addAddress",userControl.isUser,addressControl.addAddress)
router.post("/fetchAddress",addressControl.fetchAddress)

router.get("/savedAddressEdit/:id",userControl.isUser,addressControl.showSavedAddressEditPage)
router.post("/editSavedAddress/:id",userControl.isUser,addressControl.editSavedAddressFuntion)



//user order history page
router.get("/orderHistory",userControl.isUser,orderControl.showOrderPage)
router.get("/orderDetails",userControl.isUser,orderControl.orderDetails)

//cancel order
router.post('/cancelOrderuser',userControl.isUser,orderControl.cancelOrder)
router.post("/createOrder",payment.createOrder )

//return Order
router.post('/returnOrder',userControl.isUser,orderControl.returnOrder)


//show shop page
router.get('/shopPage',userControl.shopDetails)
router.get("/shopCategory/:category", userControl.shopPageCategory)
router.post("/shopSearch", userControl.searchProducts)

//sorting
router.get('/sort/:option',userControl.sort)


//pagination
router.get('/page',userControl.page)

//coupons
router.post("/coupon",userControl.isUser,couponControler.couponOperation)


//wallet
router.get('/wallet',userControl.isUser,userControl.showWallet)
router.post('/applyWallet',userControl.isUser,userControl.applyWallet)
//router.post('/reloadFetchWallet',userControl.isUser,userControl.applyWallet)




















module.exports = router