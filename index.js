const express = require("express");
const mongoose = require("mongoose");
const shortId = require("shortid");
const path = require("path");
const URL = require("./models/url");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 8001;
// MongoDB connection
mongoose.connect("mongodb+srv://2k23csai2310628:kashish..bhadauriya@cluster0.39cze98.mongodb.net/short-url?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));


// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Show form and list
app.get("/", async (req, res) => {
  const urls = await URL.find({});
  res.render("home", { urls });
});

// Create new short URL
app.post("/url", async (req, res) => {
  const body = req.body;
  if (!body.url) return res.status(400).json({ error: "URL is required" });

  const shortIdValue = shortId.generate();
  await URL.create({
    shortId: shortIdValue,
    redirectURL: body.url,
    visitHistory: [],
  });

  res.redirect("/");
});

// Redirect to original URL
app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOne({ shortId });

  if (!entry) return res.status(404).send("URL not found");

  entry.visitHistory.push({ timestamp: Date.now() });
  await entry.save();

  res.redirect(entry.redirectURL);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});