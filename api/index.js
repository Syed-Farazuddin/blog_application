const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const salt = bcrypt.genSaltSync(10);
const secret = "4joefna98h239rhsaef";
const cookieParser = require("cookie-parser");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

const mongodb = "mongodb://127.0.0.1:27017/blogProject";

mongoose.connect(mongodb).then(() => {
  console.log("connected to server");
});

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json("Server home page");
});

app.post("/register", async (req, res) => {
  console.log(req.body);
  try {
    const password = req.body.password;
    const userDoc = await User.create({
      email: req.body.email,
      username: req.body.username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(400).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    jwt.sign({ _id: userDoc._id }, secret, (err, token) => {
      if (err) {
        throw err;
      } else {
        res.cookie("token", token).json("Cookie value updated");
      }
    });
    // res.cookie("token", token).json("Cookie value successfulled updated ");
  } else {
    res.status(400).json("Wrong Credentials");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  // res.json("The token is  : " + token);
  jwt.verify(token, secret, (err, info) => {
    if (err) throw err;
    res.json(info);
  });
  // res.json(decode);
});

app.listen(3333, () => {
  console.log("Server started at port 3333");
});
