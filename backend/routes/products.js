const express = require("express");

const multer = require("multer");
const router = express.Router();

const Product = require("../models/product");
const checkAuth = require('../middleware/check-auth');

const MIME_TYPE_MAP = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/svg": "svg"
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLocaleLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  }
});

// ADD PRODUCTS

router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const product = new Product({
      name: req.body.name,
      image: url + "/images/" + req.file.filename,
      price: req.body.price,
      description: req.body.description,
      creator: req.userData.userId
    });
    console.log(req.userData);
    product.save().then(createdProduct => {
      res.status(201).json({
        message: "product added successfully...",
        product: {
          ...createdProduct,
          id: createdProduct._id
        }
      });
    }).catch(error => {
      res.status(500).json({
        message: "Creating a post failed!!"
      })
    });
  }
);
// UPDATE PRODUCT EDIT
router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    let image = req.body.image;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      image: url + "/images/" + req.file.filename;
    }
    const product = new Product({
      _id: req.body.id,
      name: req.body.name,
      image: image,
      price: req.body.price,
      description: req.body.description,
      creator: req.userData.userId
    });
    Product.updateOne(
      { _id: req.params.id, creator: req.userData.userId },
      product
    ).then(result => {
      if (result.nModified > 0) {
        res.status(200).json({ message: "Update successful!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    }).catch(error => {
      res.status(500).json({
        message: "Couldnot update!!"
      })
    });
  }
);

// FETCH PRODUCTS

router.get("", (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const productQuery = Product.find();
  let fetchedProduct;
  if (pageSize && currentPage) {
    productQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  productQuery
    .then(documents => {
      fetchedProduct = documents;
      return Product.countDocuments();
    })
    .then(count => {
      res.status(200).json({
        message: "product fetched successfully",
        products: fetchedProduct,
        maxProduct: count
      });
    }).catch(error => {
      res.status(500).json({
        message: "product fetching failed!!"
      })
    });;
});

router.get("/:id", (req, res, next) => {
  Product.findById(req.params.id).then(product => {
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "product not found!" });
    }
  }).catch(error => {
    res.status(500).json({
      message: "product fetching failed!!"
    })
  });
});

// DELETE PRODUCTS

router.delete("/:id",checkAuth, (req, res, next) => {
  Product.deleteOne({ _id: req.params.id , creator: req.userData.userId })
  .then(result => {
    console.log("delete:" + result);
    if (result.n > 0) {
      res.status(200).json({ message: "Delete successful!" });
    } else {
      res.status(401).json({ message: "Not authorized!" });
    }
  }).catch(error => {
    res.status(500).json({
      message: "product fetching failed!!"
    })
  });
});

module.exports = router;








// const express = require("express");
// const multer = require("multer");

// const ProductController = require("../controllers/products");

// const checkAuth = require("../middleware/check-auth");
// const router = express.Router();

// const MIME_TYPE_MAP = {
//   "image/jpeg": "jpg",
//   "image/jpg": "jpg",
//   "image/png": "png",
//   "image/svg": "svg"
// };

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const isValid = MIME_TYPE_MAP[file.mimetype];
//     let error = new Error("Invalid mime type");
//     if (isValid) {
//       error = null;
//     }
//     cb(error, "backend/images");
//   },
//   filename: (req, file, cb) => {
//     const name = file.originalname
//       .toLocaleLowerCase()
//       .split(" ")
//       .join("-");
//     const ext = MIME_TYPE_MAP[file.mimetype];
//     cb(null, name + "-" + Date.now() + "." + ext);
//   }
// });

// // ADD PRODUCTS

// router.post(
//   "",
//   checkAuth,
//   multer({ storage: storage }).single("image"),
//   ProductController.createProduct
// );
// // UPDATE PRODUCT EDIT
// router.put(
//   "/:id",
//   checkAuth,
//   multer({ storage: storage }).single("image"),
//   ProductController.updateProduct
// );

// // FETCH PRODUCTS
// router.get("", ProductController.getProducts);
// //FETCH SINGLE PRODUCT
// router.get("/:id", ProductController.getProduct);
// // DELETE PRODUCTS
// router.delete("/:id", checkAuth, ProductController.deleteProduct);

// module.exports = router;
