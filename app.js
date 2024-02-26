const express=require('express')
const session=require('express-session')
const path=require('path')
const app=express();
const Handlebars = require('hbs');
const moment = require('moment');



// app.set("view engine","hbs");
app.set('view engine', 'hbs');

app.use(express.json())
app.use(express.urlencoded({extended:true}));

app.use(session({
    secret: "user-key",
    resave: false,
    saveUninitialized: false
}));

app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next()
});

app.use(express.static(path.join(__dirname,"public")))


// Define the subTotal helper
Handlebars.registerHelper('subTotal', function (price, quantity) {
    return price * quantity;
  });

  //formating date
  Handlebars.registerHelper('formatDate', function(date, format) {
    // Use moment.js to format the date
    return moment(date).format(format);
});
//for cancel button disable
Handlebars.registerHelper("cancelCondition",(cond1,cond2)=>{
return (cond1||cond2=="Delivered Successfully"||cond2=="Requested to return"||cond2=="Return"||cond2=="Return Rejected"||cond2=="Payment failed")
})

Handlebars.registerHelper("checkFailedPayment",(cond2)=>{
  return (cond2=="Payment failed"||cond2=="Order Discard")
  })

  Handlebars.registerHelper("checkDiscardPayment",(cond2)=>{
    return (cond2=="Order Discard")
    })




Handlebars.registerHelper("ls",(a,b)=>{
  return (a>=b )
});
  
  // Now you can use 'subTotal' in your Handlebars templates

app.set('views',[
    path.join(__dirname,'views/user'),
    path.join(__dirname,'views/admin')
]) 
    



var userRoute=require("./routers/userRoute")
var adminRoute=require("./routers/adminRoute")

app.use("/",userRoute);
// app.set('views', path.join(__dirname, '/views/admin/'));

app.use("/admin",adminRoute);


app.listen(3000,()=>console.log("Server started"))
module.exports=app