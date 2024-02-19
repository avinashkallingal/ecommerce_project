const product = require("../models/productModel")
const categoryModel = require("../models/categoryModel")



const allProducts = async (current) => {
    try {
        let productCount=6;
        const allProduct = await product.find({ display: 1 }).skip(current*productCount).limit(productCount);
        if (allProduct) {
            return allProduct
        } else {
            console.log("details not found!!")
        }
    } catch (error) {
        console.log(error.message)
        // res.redirect('/error?message= something went wrong!')
    }
}
const allProductsHome = async (current) => {
    try {
        const allProduct = await product.find({ display: 1 });
        if (allProduct) {
            return allProduct
        } else {
            console.log("details not found!!")
        }
    } catch (error) {
        console.log(error.message)
        // res.redirect('/error?message= something went wrong!')
    }
}



const category = async (params,current) => {
    try {
        let productCount=6;
        const categoryName = await product.find({ $and: [{ display: 1},{ category: params }]} ).skip(current*productCount).limit(productCount);
        // console.log(categoryName)
        if (categoryName) {
            return categoryName
        } else {
            console.log("details not found!!")
        }
    } catch (error) {
        console.log(error.message)
        // res.redirect('/error?message= something went wrong!')
    }
}




const categoryName = async (req, res) => {
    try {
        const category_name = await categoryModel.find({list: 1});
        // console.log(category_name)
        if (category_name) {
            return category_name
        } else {
            console.log("details not found!!")
        }
    } catch (error) {
        console.log(error.message)
        // res.redirect('/error?message= something went wrong!')
    }
}






const vegitables = async (req, res) => {
    try {
        const vegitable = await product.find({ $and: [{ display: 1},{ category: "Vegitable" }]} );
        console.log(vegitable)
        if (vegitable) {
            return vegitable
        } else {
            console.log("details not found!!")
        }
    } catch (error) {
        console.log(error.message)
        // res.redirect('/error?message= something went wrong!')
    }
}


const fruits = async (req, res) => {
    try {
        const fruit = await product.find({ category: "Fruit" });
        if (fruit) {
            return fruit
        } else {
            console.log("details not found!!")
        }
    } catch (error) {
        console.log(error.message)
        // res.redirect('/error?message= something went wrong!')
    }
}

const breads = async (req, res) => {
    try {
        const bread = await product.find({ category: "Bread" });
        if (bread) {
            return bread
        } else {
            console.log("details not found!!")
        }
    } catch (error) {
        console.log(error.message)
        // res.redirect('/error?message= something went wrong!')
    }
}


// const vegitables = async (req, res) => {
//     console.log("hi vegitable clicked")
//     const vegitable = await product.find({ category: "Vegitable" });
//     req.session.vegitable = vegitable;
//     res.redirect(`/home/${req.session.username}`)
// }

// const fruits = async (req, res) => {
//     console.log("hi fruits clicked")
//     const fruit = await product.find({ category: "Fruit" });
//     req.session.fruit = fruit;
//     res.redirect(`/home/${req.session.username}`)
// }

// const breads = async (req, res) => {
//     console.log("hi bread clicked")
//     const bread = await product.find({ category: "Bread" });
//     req.session.bread = bread;
//     res.redirect(`/home/${req.session.username}`)
// }


module.exports = { allProducts, vegitables, fruits, breads ,category,categoryName,allProductsHome}