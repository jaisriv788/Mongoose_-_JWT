const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = express();
const port = 3000;
const secretKey = "H3lLow";

app.use(express.json());

mongoose.connect("mongodb://localhost:27017/jwt", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  email: String,
});

const User = mongoose.model("user", userSchema);

function jwtAuthentication(req, res, next) {
  const token = req.headers.authorization;
  if (!token) res.status(401);
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403);
    }
    next();
  });
}

app.post("/signup", async (req, res) => {
  const { name, password, email } = req.body;
  const user = await User.findOne({ name, email });
  if (!user) {
    const newUser = await new User({ name, password, email }).save();
    return res.json({ newUser });
  }
  res.status(403).json({ message: "User Already exist" });
});

app.post("/signin", async (req, res) => {
  const { password, email } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) {
    return res.status(403).json({ message: "Wrong credentials!" });
  }
  const token = jwt.sign({ email, role: "user" }, secretKey, {
    expiresIn: "1h",
  });
  res.json({ message: "signin Successfull", token });
});

app.get("/get", jwtAuthentication, async (req, res) => {
  const users = await User.find();
  res.json({ users });
});

app.listen(port, () => {
  console.log(`Port: ${port}`);
});
