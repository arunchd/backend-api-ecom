//install three packages express, mongoose, nodemon, cors, jsonwebtoken
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;

require("./db/config.js");
const User = require("./db/User");
const Product = require("./db/product");

const Jwt = require("jsonwebtoken");
const jwtKey = "e-comm";

const app = express();
//middleware
app.use(express.json());
//Cors
app.use(cors());
//signup Api
app.post("/signup", async (req, res) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  //res.send(result);
  if (user) {
    Jwt.sign({ result }, jwtKey, /* { expiresIn: "2h" }, */ (error, token) => {
      if (error) {
        res.send({
          result: "something went wrong, Please try after sometimes",
        });
      }
      res.send({ result, auth: token });
    });
  } else {
    res.send({ result: " no user found..." });
  }
});

//Login Api
app.post("/login", async (req, res) => {
  console.log(req.body);
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (error, token) => {
        if (error) {
          res.send({
            result: "something went wrong, Please try after sometimes",
          });
        }
        res.send({ user, auth: token });
      });
    } else {
      res.send({ result: " no user found..." });
    }
  } else {
    res.send({ result: " no user found..." });
  }
});
//add product
app.post("/add-product", verifyToken, async (req, res) => {
  let product = new Product(req.body);
  let result = await product.save();
  res.send(result);
});
//get products list
app.get("/products", verifyToken, async (req, res) => {
  let products = await Product.find();
  if (products.length > 0) {
    res.send(products);
  } else {
    res.send({ result: "no product found" });
  }
});
//delete product
app.delete("/product/:id", verifyToken, async (req, res) => {
  const result = await Product.deleteOne({ _id: req.params.id });
  res.send(result);
});
//get product id for update product
app.get("/product/:id", verifyToken, async (req, res) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    res.send({ result: "no record found" });
  }
});
//update Product
app.put("/product/:id", verifyToken, async (req, res) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    {
      $set: req.body,
    }
  );
  res.send(result);
});
//Search Api for Product
app.get("/search/:key", verifyToken, async (req, res) => {
  let result = await Product.find({
    $or: [
      { title: { $regex: req.params.key } },
      { brand: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
    ],
  });
  res.send(result);
});
//Middleware for verifyToken
function verifyToken(req, res, next) {
  //const token = req.headers["authorization"];
  let token = req.headers["authorization"];
  if (token) {
    token = token.split(" ")[1];
    //console.log("Middleware called", token);
    Jwt.verify(token, jwtKey, (err, valid) => {
      if (err) {
        //res.setHeader('Content-Type', 'text/plain');

        res.status(401).send({ result: "please provide valid token with header" });
      } else {
        next();
      }
    })
  } else {
    res.status(403).send({ result: "please add token with header" });
  }
  //console.log("Middleware called", token);
  //next();
}

/* const mongoose = require('mongoose');
const app = express();
const connectDb = async () =>{
    mongoose.connect('mongodb://localhost:27017/e-comm');
    const productSchema = new mongoose.Schema({});
    const product = mongoose.model('product', productSchema);
    const data = await product.find();
    console.log("data", data);
}
connectDb();
const data =`
    <h1 style="display:flex; justify-content:center; font-size:50px;">App is working fine</h2>
`;
app.get('/', (req, res)=> {
    res.send(data);
}); */

app.listen(port);
