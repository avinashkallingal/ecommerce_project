const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const bcrypt = require("bcrypt")
const userControl = require("../controlers/userControler")
var mongoose = require("mongoose");
const fs = require("fs");
const categoryModel = require("../models/categoryModel");
const orderModel = require("../models/orderModel");
const puppeteer = require("puppeteer");
const path = require("path");
const os = require('node:os');
const couponModel = require("../models/couponModel");



const garphDataFetchDaily = async (req, res) => {
    const data = await orderModel.aggregate([
        {
            $group: {
                _id: "$orderDate",
                productCount: { $sum: "$quantity" }
            }
        },
        {
            $project: {
                _id: 0,
                orderDate: "$_id",
                productCount: 1
            }
        }
    ]);
    console.log(data + " this is back end graph fetch data")
    res.header("Content-Type", "application/json").json(data);

}

const garphDataFetchYearly = async (req, res) => {
    const data = await orderModel.aggregate([
        {
            $group: {
                _id: { $year: "$date" },
                productCount: { $sum: "$quantity" }
            }
        }
    ]);
    console.log(data + " this is back end graph fetch data")
    res.header("Content-Type", "application/json").json(data);

}



const garphDataFetchWeekly = async (req, res) => {
    const data = await orderModel.aggregate([
        {
            $group: {
                _id: { $week: "$date" },
                productCount: { $sum: "$quantity" }
            }
        }
    ]);

    console.log(data + " this is back end graph fetch data")
    res.header("Content-Type", "application/json").json(data);

}


const salesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        console.log(req.body);


        const Product = await orderModel.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
                    },
                },
            },
            {
                $group: {
                    _id: "$product",
                    totalOrders: { $sum: 1 }
                }
            }
        ]);
        console.log(Product)


        const status = await orderModel.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
                    }
                },
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);


        // order Details Analytics
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
    for (value of coupons) {
        const couponSum = await couponModel.findOne({ name: value.coupon }, { _id: 0, discount: 1 })
        couponSum1 = couponSum1 + couponSum.discount
    }


    //minusing  total discount from total price
    const totalfinalAfterDiscount = (totalPrice[0].price) - couponSum1


  
        // order Details Analytics

        const htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Sales Report</title>
                    <style>
                        body {
                            margin-left: 20px;
                        }
                    </style>
                </head>
                <body>
                    <h2 align="center"> Sales Report</h2>
                    Start Date: ${startDate}<br>
                    End Date: ${endDate}<br> 
                    <center>
                    <h3>Total Sales</h3>
                        <table style="border-collapse: collapse;">
                            <thead>
                                <tr>
                                    <th style="border: 1px solid #000; padding: 8px;">Sl N0</th>
                                    <th style="border: 1px solid #000; padding: 8px;">Product</th>
                                    <th style="border: 1px solid #000; padding: 8px;">Total Orders</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Product
                .map(
                    (item, index) => `
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 8px;">${index + 1
                        }</td>
                                        <td style="border: 1px solid #000; padding: 8px;">${item._id
                        }</td>
                                        <td style="border: 1px solid #000; padding: 8px;">${item.totalOrders
                        }</td>
                                    </tr>`
                )
            }
                                    
                            </tbody>
                        </table>
                    </center>

                    <center>
                    <h3>Order Status</h3>
                        <table style="border-collapse: collapse;">
                            <thead>
                                <tr>
                                    <th style="border: 1px solid #000; padding: 8px;">Sl N0</th>
                                    <th style="border: 1px solid #000; padding: 8px;">Status</th>
                                    <th style="border: 1px solid #000; padding: 8px;">Total Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${status
                .map(
                    (item, index) => `
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 8px;">${index + 1
                        }</td>
                                        <td style="border: 1px solid #000; padding: 8px;">${item._id[0]
                        }</td>
                                        <td style="border: 1px solid #000; padding: 8px;">${item.count
                        }</td>
                                    </tr>`
                )
            }
                                    
                            </tbody>
                        </table>
                    </center>







                    <center>
                    <h3>Total Order Summary</h3>
                        <table style="border-collapse: collapse;">
                            <thead>
                                <tr>
                                <th style="border: 1px solid #000; padding: 8px;">Sl.No</th>
                                    <th style="border: 1px solid #000; padding: 8px;">Details</th>
                                    <th style="border: 1px solid #000; padding: 8px;">Value</th>
                                    
                                </tr>
                            </thead>
                            <tbody>
                               
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 8px;">1</td>
                                        <td style="border: 1px solid #000; padding: 8px;">Total User Count</td>
                                        <td style="border: 1px solid #000; padding: 8px;">${usersCount}</td>
                                    </tr>

                                    <tr>
                                        <td style="border: 1px solid #000; padding: 8px;">2</td>
                                        <td style="border: 1px solid #000; padding: 8px;">Total Order Count</td>
                                        <td style="border: 1px solid #000; padding: 8px;">${orderCount}</td>
                                    </tr>

                                    <tr>
                                        <td style="border: 1px solid #000; padding: 8px;">3</td>
                                        <td style="border: 1px solid #000; padding: 8px;">Total Order Price</td>
                                        <td style="border: 1px solid #000; padding: 8px;">${totalfinalAfterDiscount} Rs</td>
                                    
                                    </tr>

                                    <tr>
                                        <td style="border: 1px solid #000; padding: 8px;">4</td>
                                        <td style="border: 1px solid #000; padding: 8px;">Total Discount Added</td>
                                        <td style="border: 1px solid #000; padding: 8px;">${couponSum1}</td>
                                        
                                    </tr>
               
                                    
                            </tbody>
                        </table>
                    </center>


                

                  





                    
                    
                </body>
                </html>
            `;

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent);


        const pdfBuffer = await page.pdf();

        await browser.close();

        const downloadsPath = path.join(os.homedir(), "Downloads");
        const pdfFilePath = path.join(downloadsPath, "sales.pdf");


        fs.writeFileSync(pdfFilePath, pdfBuffer);

        res.setHeader("Content-Length", pdfBuffer.length);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=sales.pdf");
        res.status(200).end(pdfBuffer);
    } catch (err) {
        console.log(err);
        res.redirect('/admin/error')
    }
    console.log("hiiiii sales report")
}
module.exports = { salesReport, garphDataFetchDaily, garphDataFetchYearly, garphDataFetchWeekly }