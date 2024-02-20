const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const bcrypt = require("bcrypt")
const userControl = require("../controlers/userControler")
var mongoose = require("mongoose");
const fs = require("fs");
const categoryModel = require("../models/categoryModel");
const orderModel = require("../models/orderModel");
const couponModel = require("../models/couponModel");




const adminLogin = (req, res) => {
    if (req.session.isAdminAuth) {
        username = req.session.username
        res.redirect(`/admin/home/${username}`);
        // res.redirect(`/home`)
    }
    else {
        const errorMessage = req.query.errorMessage
        const errUser = req.query.errUser
        const errPassword = req.query.errPassword
        res.render("login", { errorMessage, errUser, errPassword });
    }

}


const isAdmin = (req, res, next) => {
    if (req.session.isAdminAuth) {
        next();
    }
    else {

        res.redirect("/admin/?errorMessage=login again");
    }
}



const home_page = async (req, res) => {
    var username = req.params.username

    //users count
    const usersCount = await userModel.find().count();



    //for total product count
    const ordersCount = await orderModel.aggregate([{
        $group: {
            _id: "null",
            order: { $sum: "$quantity" }
        }
    },
    {
        $project: {
            _id: 0,
            order: 1
        }
    }
    ])

    //taking value from object
    const orderCount = ordersCount[0].order


    //total price calculation
    const totalPrice = await orderModel.aggregate([
        {
            $group: {
                _id: null,
                price: { $sum: { $multiply: ["$price", "$quantity"] } }
            }
        },
        {
            $project: {
                _id: 0
            }
        }
    ])



//Total DISCOUNT finding 
    const coupons = await orderModel.aggregate([
        { $match: { coupon: { $exists: true } } }, // Filter documents where the coupon field is present
        { $group: { _id: { orderId: "$orderId", coupon: "$coupon" } } }, // Group by orderId and coupon
        {
            $group: {
                _id: "$_id.orderId", // Group by orderId
                coupon: { $addToSet: "$_id.coupon" } // Add unique coupon values to an array
            }
        }
    ])
    let couponSum1 = 0
    console.log(coupons+" coupon from aggregation")
    // for (value of coupons) {
    //     const couponSum = await couponModel.findOne({ name: value.coupon }, { _id: 0, discount: 1 })
    //     couponSum1 = couponSum1 + couponSum.discount || 0

    // }
    //copy
    for (const value of coupons) {
        for (const coupon of value.coupon) {
            const couponSum = await couponModel.findOne({ name: coupon }, { _id: 0, discount: 1 });
            if (couponSum) {
                couponSum1 += couponSum.discount;
            }
        }
    }
    //copy
console.log(couponSum1+" this is fthe for of function")

   // minusing  total discount from total price
    const totalfinalAfterDiscount = (totalPrice[0].price) - couponSum1||0



    res.render("admin_index", { username, usersCount, orderCount, totalfinalAfterDiscount, couponSum1 })
}

const adminCheck = async (req, res) => {
    try {
        var name = req.body.username
        var password = req.body.password
        const adminFound = await userModel.findOne({ username: req.body.username });
        console.log(adminFound)
        if (adminFound) {
            // const passCheck = await bcrypt.compare(adminFound.password, req.body.password);
            const checkPass = await bcrypt.compare(req.body.password, adminFound.password);
            console.log("password match " + checkPass)
            if (checkPass) {
                if (adminFound.isAdmin) {
                    req.session.isAdminAuth = true;
                    req.session.email = adminFound.email;
                    req.session.username = adminFound.username
                    console.log(req.session.username + "session storage")
                    console.log(adminFound.username + "db storage")
                    // res.send("hiii its home")
                    res.redirect(`/admin/home/${req.session.username}`)

                }
                else {
                    res.redirect("/admin/?errorMessage=authetication not permitted")
                }
            }
            else {
                res.redirect("/admin/?errPassword=invalid password")
            }
        }
        else {
            res.redirect("/admin/?errUser=invalid username")
        }
    }
    catch (e) {
        console.error(e.message);
        res.redirect("/?error?message=something went wrong while signing up")
    }
}


const showProducts = async (req, res) => {
    var products = await productModel.find();
    var categoryName = await categoryModel.find();
    console.log("product list got")
    console.log(categoryName)
    // console.log(products)

    res.render("listProducts", { products, categoryName })
}


const checkUserOut = async (req, res) => {
    await req.session.destroy()
    console.log("session end ,sign out")
    res.redirect('/admin/?message=sign out successfully')
}

const unlistProduct = async (req, res) => {
    try {
        console.log(req.params.id)
        let products = await productModel.find({ productname: req.params.id })
        let unlist = products[0].display
        if (unlist == 1) {
            unlist = 0
        } else {
            unlist = 1
        }
        await productModel.updateOne({ productname: req.params.id }, { display: unlist })
        res.redirect('/admin/productlist')

    } catch (e) {
        console.log('error in the unlistProduct in adminController : ' + e)
    }
}




const editProduct = async (req, res) => {
    console.log("edit product")
    console.log(req.body)
    console.log("edit product body")
    console.log(req.params.id)
    console.log(req.files)

    var id = new mongoose.Types.ObjectId(req.params.id);
    console.log(id)


    try {
        let imagePath = [];
        let len = req.files

        if (req.files.length != 0) {
            //  //copy
            // console.log("image is there")
            // const oldPath=await productModel.find({_id:id},{imagepath:1,_id:0})
            // console.log(oldPath)
            // const oldPath_new=Array.from(oldPath)
            // console.log(oldPath+"after conversion")
            // console.log(oldPath[0])
            // console.log(oldPath[1])          
            // const filePaths = oldPath_new;

            // filePaths.forEach(filePath => {
            //     fs.unlink(filePath, (err) => {
            //       if (err) {
            //         console.error(`Error deleting file ${filePath}:`, err);
            //       } else {
            //         console.log(`File ${filePath} deleted successfully.`);
            //       }
            //     });
            //   });
            //   console.log('File deleted successfully.');

            // //copy




            for (let i = 0; i < len.length; i++) {
                imagePath[i] = req.files[i].path.replace(/\\/g, "/").replace('public/', '/')
            }
            // imagePath[0] = req.files[0].path.replace(/\\/g, "/").replace('public/', '/')
            // imagePath[1] = req.files[1].path.replace(/\\/g, "/").replace('public/', '/')

            await productModel.updateOne({ _id: id },
                {
                    $set:
                    {
                        productname: req.body.name,
                        price: req.body.price,
                        category: req.body.category,
                        description: req.body.description,
                        stock: req.body.stock,
                        imagepath: imagePath
                    }
                }
            )
        } else {
            await productModel.updateOne({ _id: id },
                {
                    $set:
                    {
                        productname: req.body.name,
                        price: req.body.price,
                        category: req.body.category,
                        description: req.body.description,
                        stock: req.body.stock,
                    }
                }
            )
        }




        // imagePath[1] = req.files[1].path.replace(/\\/g, "/").replace('public/', '/')
        // imagePath[2] = req.files[2].path.replace(/\\/g, "/").replace('public/', '/')
        // imagePath[3] = req.files[3].path.replace(/\\/g, "/").replace('public/', '/')
        console.log("a data saved 2")
        console.log(imagePath)



        // copy

        res.redirect("/admin/productlist")
    }
    catch (e) {
        console.log("error while product update in admin controller" + e)
    }
}


const listusers = async (req, res) => {
    const users = await userModel.find();

    res.render("list_users", { users })
}


const listCategory = async (req, res) => {
    const message = req.query.message
    const category = await categoryModel.find()
    res.render("category", { category, message })
}


const addCategory = async (req, res, next) => {
    console.log("hi this is add category")
    try {

        console.log(req.body)
        const data = req.body;
        console.log(data.category)
        const category = await categoryModel.findOne({ category: { $regex: new RegExp(`^${data.category}$`, 'i') } });
        console.log(category + "found category")
        if (category) {


            console.log("cstegory alredy present")
            res.redirect(`/admin/listcategory?message=Category already there`)
        }
        else {


            const newCategory = new categoryModel({

                category: data.category,
                list: 1

            })

            await newCategory.save()
            console.log("a data saved 3")
            res.redirect("/admin/listcategory")
        }
    }

    catch (e) {
        console.log("problem with the category details in admin control" + e)
    }


}



const editCategory = async (req, res) => {
    console.log("edit category")
    console.log(req.body)
    console.log("edit category body")
    console.log(req.params.id)
    console.log(req.files)

    var id = new mongoose.Types.ObjectId(req.params.id);
    console.log(id)

    try {

        await categoryModel.updateOne({ _id: id },
            {
                $set:
                {
                    category: req.body.category

                }
            }
        )

        console.log(req.body.category)
        res.redirect("/admin/listcategory")
    }
    catch (e) {
        console.log("error while category update in admin controller" + e)
    }
}


const unlistCategory = async (req, res) => {
    try {
        console.log(req.params.id)

        var id = new mongoose.Types.ObjectId(req.params.id);
        let category = await categoryModel.find({ _id: id })
        console.log(category)
        let unlist = category[0].list
        if (unlist == 1) {
            unlist = 0
        } else {
            unlist = 1
        }
        await categoryModel.updateOne({ _id: id }, { list: unlist })
        res.redirect('/admin/listcategory')

    } catch (e) {
        console.log('error in the unlistcategory in adminController : ' + e)
    }
}



const blockuser = async (req, res) => {
    try {

        console.log(req.params.id)
        let users = await userModel.find({ username: req.params.id })
        let block = users[0].userBlock
        if (block == 0) {
            block = 1
        } else {
            block = 0
        }
        await userModel.updateOne({ username: req.params.id }, { userBlock: block })
        req.session.isUserAuth = false;
        // userControl.checkUserOut_live();
        res.redirect('/admin/listusers')

    } catch (e) {
        console.log('error in the blockProduct in adminController : ' + e)
    }

}




module.exports = { adminLogin, adminCheck, home_page, checkUserOut, isAdmin, showProducts, unlistProduct, editProduct, listusers, listCategory, addCategory, editCategory, unlistCategory, blockuser }