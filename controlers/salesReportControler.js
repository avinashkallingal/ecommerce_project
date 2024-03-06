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
        },{
            $sort:{orderDate:1}
        }
    ]);
    console.log(data + " this is back end graph daily fetch data")
    res.header("Content-Type", "application/json").json(data);

}

const garphDataFetchYearly = async (req, res) => {
    const data = await orderModel.aggregate([
        {
            $group: {
                _id: { $year: "$date" },
                productCount: { $sum: "$quantity" }
            }
        },{
            $sort:{orderDate:1}
        }
    ]);
    console.log(data + " this is back end graph yearly fetch data")
    res.header("Content-Type", "application/json").json(data);

}



const garphDataFetchWeekly = async (req, res) => {
    const data = await orderModel.aggregate([
        {
            $group: {
                _id: { $week: "$date" },
                productCount: { $sum: "$quantity" }
            }
        },{
            $sort:{orderDate:1}
        }
    ]);

    console.log(data + " this is back end graph weekly fetch data")
    res.header("Content-Type", "application/json").json(data);

}




const garphDataFetchMonthly = async (req, res) => {
    const data = await orderModel.aggregate([
        {
            $group: {
                _id: { $month: "$date" },
                productCount: { $sum: "$quantity" }
            }
        },{
            $sort:{orderDate:1}
        }
    ]);

    console.log(data + " this is back end graph monthly fetch data")
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

        //top ten
        const topTen = await orderModel.aggregate([{
            $group: {
                _id: "$product",
                totalQuantity: { $sum: "$quantity" }
            }
        },
        {
            $sort: { totalQuantity: -1 }
        }, {
            $limit: 10
    
        },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "productname",
                as: "topten"
            }
        }
    
        ])

        //
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

                        <h1>eCommerce Sales Summary Report</h1>




<h2>Top Selling Products</h2>
<table>
    <thead>
        <tr>
            <th>Product Name</th>
         
        </tr>
    </thead>
    <tbody>
       



        ${topTen
            .map(
                (item, index) => `
                                <tr>
                                    <td style="border: 1px solid #000; padding: 8px;">${index + 1
                    }</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${item._id
                    }</td>
                                    
                                </tr>`
            )
        }
      



    </tbody>
</table>

<h2>Total Sales</h2>
<ul>
<li>Total Users: ${usersCount}</li>
    <li>Total Sales: ${totalfinalAfterDiscount}</li>
    <li>Total Discount ${couponSum1}</li>
 
    <li>Total Orders: ${orderCount}</li>

</ul>

                    </center>
                    <h2>Conclusion</h2>
<p>Overall, The top selling products were ${topTen
    .map(
        (item, index) => `
                        <span>
                            ${index + 1  }
                           ${item._id}
                            </span>
                        `
    )
}, indicating a trend . We have ${usersCount} customers, which can help inform our marketing and advertising strategies for the future through them.Our Total sale reached ${totalfinalAfterDiscount} /Rs </p>



                

                  





                    
                    
                </body>
                </html>
            `;

        const browser = await puppeteer.launch({
            executablePath:'/usr/bin/chromium-browser'
        });


        const page = await browser.newPage();
        await page.setContent(htmlContent);


        const pdfBuffer = await page.pdf();

        await browser.close();

        // const downloadsPath = path.join(os.homedir(), "Downloads");
        // const pdfFilePath = path.join(downloadsPath, "sales.pdf");


        // fs.writeFileSync(pdfFilePath, pdfBuffer);

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
module.exports = { salesReport, garphDataFetchDaily, garphDataFetchYearly, garphDataFetchWeekly,garphDataFetchMonthly }