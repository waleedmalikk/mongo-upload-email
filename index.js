const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

const app = express();

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use(express.static("Images"));

app.set("view engine", "ejs");
mongoose.set("strictQuery", true);

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: String,
    img_obj: Object,
  },
  { timestamps: true }
);

const userModel = mongoose.model("user", userSchema, "users_data");

const uri =
  "mongodb+srv://waleedm:waleedm@mycluster.fun289f.mongodb.net/?retryWrites=true&w=majority";

async function connect() {
  try {
    await mongoose.connect(uri, { dbName: "users" });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("error:", error);
  }
}

async function create(name, url) {
  try {
    const user = new userModel({ name: name, img_obj: url });
    await user.save();
    console.log("user saved");
  } catch (error) {
    console.log("error:", error);
  }
}

async function retreive() {
  try {
    const data = await userModel.find();
    return data;
  } catch (error) {
    return error;
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.get("/upload", (req, res) => {
  res.render("upload");
});

app.post("/upload", upload.single("image"), (req, res) => {
  create(req.body.username, req.file);
  res.send("User Created!");
});

app.get("/user_data", async (req, res) => {
  const data = await retreive();
  res.json(data);
});

app.post("/send", async (req, res) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "waleedmalik0347@gmail.com",
      pass: "xqdzwdniqbuhrdlt",
    },
  });

  const mailOptions = {
    from: "hello@example.com",
    to: req.body.email,
    subject: "Subject",
    // text: "Email content",
    html: `<p> this is an email template. This has been sent to ${req.body.email} </p>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  res.send({ msg: "Email sent successfully." });
});

connect();
// Mailer();

app.listen(3000, () => console.log("3000 is the port"));
