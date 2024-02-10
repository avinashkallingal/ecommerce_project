const express = require("express")
const adminControl = require("../controlers/adminControler")
const addProducts = require("../controlers/addProductsControler.js")
const upload=require("../controlers/multerControler.js")
const multer = require('multer');
const adminOrderControl = require("../controlers/adminOrderControler.js")
const couponControler = require("../controlers/couponControler.js")
const salesReport = require("../controlers/salesReportControler.js")



const session = require("express-session")
const path=require('path')
const router = express.Router();

router.get("/",adminControl.adminLogin)
router.post("/verify",adminControl.adminCheck)
router.get("/home/:username",adminControl.isAdmin,adminControl.home_page)
router.get("/home",adminControl.isAdmin,adminControl.home_page)
router.get("/logout",adminControl.checkUserOut)


//show products
router.get("/productlist",adminControl.isAdmin,adminControl.showProducts)

//update product
router.post("/edit_products/:id",adminControl.isAdmin,upload.array('image',4),adminControl.editProduct)

//add product
router.get("/add_products",adminControl.isAdmin,addProducts.showProducts)//router for showing add product page
router.post("/add_products/save",adminControl.isAdmin,upload.array('image',4),addProducts.addProducts)//router for saving products ,used multer as middleware for adding multiple(4) images


//unlist the product
router.get('/unlist/:id',adminControl.isAdmin,adminControl.unlistProduct)


//list users
router.get('/listusers',adminControl.isAdmin,adminControl.listusers)

//list category
router.get('/listcategory',adminControl.isAdmin,adminControl.listCategory)

//add category
router.post('/addCategory',adminControl.isAdmin,adminControl.addCategory)

//edit category
router.post('/editCategory/:id',adminControl.isAdmin,adminControl.editCategory)

//unlist category
router.get('/unlistCategory/:id',adminControl.isAdmin,adminControl.unlistCategory)



//block users
router.get('/block/:id',adminControl.isAdmin,adminControl.blockuser)


//list orders
router.get('/orderlist',adminControl.isAdmin,adminOrderControl.listOrders)
router.get('/statusUpdate',adminControl.isAdmin,adminOrderControl.updateStatus)
router.post('/cancelOrder',adminControl.isAdmin,adminOrderControl.cancelOrder)
router.get("/orderDetailsAdmin",adminControl.isAdmin,adminOrderControl.orderDetailsAdmin)


//coupon
router.get("/listCoupon",adminControl.isAdmin,couponControler.showPage)
router.post("/addCoupon",adminControl.isAdmin,couponControler.addCoupon)
router.get("/deleteCoupon/:name",adminControl.isAdmin,couponControler.deleteCoupon)
router.post("/editCoupon/:name",adminControl.isAdmin,couponControler.editCoupon)

//sales report
router.post("/home/salesReport",adminControl.isAdmin,salesReport.salesReport)







module.exports = router;