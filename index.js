const express = require("express");
const path = require('path')
const { connectToMongoDB } = require("./connection");
const {restrictToLoggedinUserOnly,checkAuth} = require('./middleware/auth') 
const URL = require("./models/url");
const cookieParser= require('cookie-parser')
const urlRoute = require("./routes/url");
const staticRoute = require('./routes/staticRouter')

const userRoute = require('./routes/user')
const env=require('dotenv').config();
const app = express();
const PORT = env.parsed.PORT;
connectToMongoDB(env.parsed.DB_LOCAL_URL).then(() =>
  console.log("Mongodb connected")
);

app.set('view engine','ejs')
app.set("views", path.resolve("./views"))

app.use(express.json());
app.use(express.urlencoded({ extended: false}))
app.use(cookieParser())


app.use("/url", restrictToLoggedinUserOnly, urlRoute);
app.use("/user", userRoute);
app.use("/",checkAuth, staticRoute)

app.get("/:shortId", async (req, res) => {
  try {
    const shortId = req.params.shortId;
    
    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      },
      { new: true } // This ensures the updated document is returned
    );

    // Check if entry is null
    if (!entry) {
      return res.status(404).send("Short URL not found");
    }

    res.redirect(entry.redirectUrl);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});



app.listen(env.parsed.PORT, () => console.log(`server started at PORT: ${PORT}`));
