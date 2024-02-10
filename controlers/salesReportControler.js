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
                                        <td style="border: 1px solid #000; padding: 8px;">${item._id
                        }</td>
                                        <td style="border: 1px solid #000; padding: 8px;">${item.count
                        }</td>
                                    </tr>`
                )
            }
                                    
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
module.exports={salesReport}