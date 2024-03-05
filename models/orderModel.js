const mongoose=require("mongoose");
const express=require("express")
const Schema = mongoose.Schema;

mongoose.connect("mongodb://0.0.0.0:27017/frutable")
.then(()=>{console.log("connection established with mongodb on collection order")})
.catch((e)=>{console.log(e)})


//copy
const orderSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    orderId:{
        type:String,
        required:true
    },
    items: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'products',
        },
        quantity: {
            type: Number,
            required: true,
        }

    }],
      wallet: {
        type: Number,
    },
   address: {
        type: Array,
        required: true
    },
    payment: {
        type: String,
        required: true
    },
    date:{
        type:Date,
        required:true
    },
    totalPrice:{
        type:Number,
        required:false
    },
    status:{
        type:Array,
        required:true
    },
    adminCancel:{
        type:Number,
        required:true
    },
    reason:{
        type:String,
        required:false
    }
})

//copy
// const orderSchema = new mongoose.Schema({
//     username:{
//         type:String,
//         required:true
//     },
//     name:{
//         type:String,
//         required:true
//     },
//     date:{
//         type:Date,
//         required:true
//     },
//     orderDate:{
//         type:String,
//         required:true
//     },
//     orderTime:{
//         type:String,
//         required:true
//     },
//     price:{
//         type:Number,
//         required:true
//     },
//     totalPrice:{
//         type:Number,
//         required:false
//     },
//     orderId:{
//         type:String,
//         required:true
//     },
//     status:{
//         type:Array,
//         required:true
//     },
//     payment:{
//         type:String,
//         required:true
//     },
//     coupon:{
//         type:String,
//         required:false
//     },
//     adminCancel:{
//         type:Number,
//         required:true
//     },
//     product:{
//         type:String,
//         required:true
//     },
//     quantity:{
//         type:Number,
//         required:true
//     },
//     image:{
//         type:Array,
//         required:true
//         },
//     address:{
//         houseName:{
//             type:String,
//             required:true
//         },
//         city:{
//             type:String,
//             required:true
//         },
//         state:{
//             type:String,
//             required:true
//         },
//         pincode:{
//             type:Number,
//             required:true
//         },
//         country:{
//             type:String,
//             required:true
//         },
//         phone:{
//             type:Number,
//             required:true
//         }
//     },
//     reason:{
//         type:String,
//         required:false
//     }
// })
module.exports=mongoose.model("orders",orderSchema);