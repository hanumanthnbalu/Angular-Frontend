
const Product = require("../models/product");

exports.createProduct =  (req, res, next) => {
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
};


exports.updateProduct =  (req, res, next) => {
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
};

exports.getroducts = (req, res, next) => {
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
    });
};

exports.getProduct = (req, res, next) => {
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
};

exports.deleteProduct = (req, res, next) => {
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
};
