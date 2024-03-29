const multer = require("multer")
const path = require("path")

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/")
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname)
    cb(null, Date.now() + ext)
  }
})

var upload = multer({storage: storage});
  // ,
  // fileFilter: function (req, file, callback) {
  //   if (
  //     file.mimetype == "image/png",
  //     file.mimetype == "image/jpg"
  //   ) {
  //     callback(null, true)
  //   } else {
  //     console.log("only png and jpg can supported")
  //   }
  // },
  // limits: {
  //   filesize: 1024 * 1020 * 3
  // }

module.exports=upload