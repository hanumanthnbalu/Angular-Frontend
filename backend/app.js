const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const productRoutes = require("./routes/products");
const userRoutes = require("./routes/user");

const app = express();

// CONNECT TO MONGODB

mongoose
  .connect("mongodb+srv://hnbalu:hnbalu123@cluster0-vfjwq.mongodb.net/HNBALU", {
    useNewUrlParser: true
  })
  .then(() => {
    console.log("Connected to MongoDB!!");
  })
  .catch(() => {
    console.log("Error to connect mongodb!");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("backend/images")));

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization "
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST,DELETE, OPTIONS, PATCH"
  );
  next();
});

app.use("/api/products", productRoutes);
app.use("/api/user", userRoutes);

module.exports = app;
