if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require('mongoose');
const session = require("express-session");
const MongoStore = require("connect-mongo")
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const indianpackage = require("./models/indiapackage.js");
const abroadpackage = require("./models/abroadpackage.js");
const booking = require("./models/booking.js");
const customize = require("./models/customize.js");
const path = require("path");
const bodyParser = require('body-parser');
const ejsMate = require("ejs-Mate");
const methodOverride = require("method-override");
const multer  = require('multer');
const {storage} = require("./cloudConfig.js");
const upload = multer({ storage });
let mongourl = process.env.ATLASDB_URL;
async function main() {
  await mongoose.connect(mongourl);
}
main().then(() => {
    console.log("DB connected successfully");
})

const store = MongoStore.create({
    mongoUrl: mongourl,
    crypto: {
       secret: process.env.SECRET, 
    },
    touchAfter: 24 * 3600,
});
app.use(
    session({
       store,
       secret: process.env.SECRET,
       resave:false, 
       saveUninitialized:true,
       cookie:{
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
          maxage: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
       },
    })
);
app.use(flash());
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view-engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json());
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.use(express.json());
app.use(cors());

app.use((req,res,next) => {
    res.locals.currUser = req.user;
    req.session.currUser = req.user;
    next();
});

app.get("/customize", (req,res) => {
    res.render("customize.ejs");
});

app.post("/customize", async (req,res) => {
    console.log(req.body.customize);
    const newcustomize = new customize(req.body.customize);
    await newcustomize.save();
    res.redirect("/");
});

app.get("/about", (req,res) => {
    res.render("aboutus.ejs");
});

app.get("/services", (req,res) => {
    res.render("services.ejs");
});

app.get("/privacypolicy", (req,res) => {
    res.render("privacypolicy.ejs");
});

saveRedirecturl = (req,res,next) => {
    if(req.session.redirectUrl){
       res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

app.get("/login", (req,res) => {
    res.render("login.ejs",{ msg: req.flash("error") });
})

app.post("/login", saveRedirecturl,passport.authenticate("local",{
    failureRedirect: "/login",
    failureFlash: true,    
}),async (req,res) => {
    req.flash("success","Welcome To TourTrove! Logged In Successfully");
    let urlredirect = res.locals.redirectUrl || "/";
    res.redirect(urlredirect);
})

app.get("/signup", (req,res) => {
    res.render("signup.ejs", { msg: req.flash("error") });
})

app.post("/signup", async (req, res) => {
    let { newemail, newusername, password } = req.body;
    let newUser = new User({
        email: newemail,
        username: newusername,
    });

    try {
        let registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return res.redirect("/");
            }
            req.flash("success", "Welcome To TourTrove! Signed Up Successfully");
            res.redirect("/");
        });
    } catch (error) {
        req.flash("error", "An error occurred. Please try again later.");
        res.redirect("/signup");
    }
});


app.get("/logout", (req,res,next) => {
    req.logout((err) => {
        if(err){
          return res.redirect("/");
        }
    req.flash("success","Logged Out");
    res.redirect("/");
});
});

app.get("/favicon.ico", (req,res) => {
    res.redirect("/");
});

app.post("/search", async(req,res) => {
    let  {searchDestination}  = req.body;
    const result1 = await indianpackage.find({title: {$regex: `${searchDestination}`, $options: "i"}});
    const result2 = await indianpackage.find({state: {$regex: `${searchDestination}`, $options: "i"}});
    const result3 = await indianpackage.find({country: {$regex: `${searchDestination}`, $options: "i"}});
    const result4 = await abroadpackage.find({country: {$regex: `${searchDestination}`, $options: "i"}});
    const result5 = await abroadpackage.find({title: {$regex: `${searchDestination}`, $options: "i"}});
    let finalresult = result1.concat(result2).concat(result3).concat(result4).concat(result5);
    const results = [];
    const idSet = new Set();
    for (const obj of finalresult) {
        if (!idSet.has(obj.title)) {
            idSet.add(obj.title);
            results.push(obj);
        }
    }
    if(results == ""){
        res.render("searcherror.ejs");
    }
    else{
       res.render("showsearch.ejs",{results});
    }
});

app.get("/newpackage", (req,res) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be Logged In");
        return res.redirect("/login");
    }
    res.render("newpackage.ejs");
});

app.post("/", upload.single('package[image]'), async(req,res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    if(req.body.package.type == "Indian"){
       const newpackage = new indianpackage(req.body.package);
       newpackage.image = {url,filename};
       await newpackage.save();
    }
    if(req.body.package.type == "Abroad"){
        const newpackage = new abroadpackage(req.body.package);
        newpackage.image = {url,filename};
        await newpackage.save();
    }
    req.flash("success","New Package Added Successfully");
    res.redirect("/");
})

app.get("/:id", async(req,res) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be Logged In");
        return res.redirect("/login");
    }
    let {id} = req.params;
    const indpackage = await indianpackage.findById(id);
    const abrpackage = await abroadpackage.findById(id);
    if(indpackage){
        const package = indpackage;
        res.render("showpackage.ejs", {package});
    }
    else{
        const package = abrpackage;
        res.render("showpackage.ejs", {package});
    }
});

app.post("/bookingform/:id", async (req,res) => {
    let { id } = req.params;
    req.body.booking.packageid = id.toString();
    req.body.booking.user = req.body.booking.email;
    const newbooking = new booking(req.body.booking);
    await newbooking.save();
    req.flash("success","Package Booked Successfully");
    res.redirect("/");
})

app.get("/edit/:id" , async(req,res) => {
    let {id} = req.params;
    let result1 = await indianpackage.findById(id);
    let result2 = await abroadpackage.findById(id);
    if(result1 == null){
        const result = result2;
        res.render("edit.ejs", {result});
    }
    if(result2 == null){
        const result = result1;
        res.render("edit.ejs", {result});
    }
});

app.put("/edit/:id" , async (req,res) => {
     let {id} = req.params;
     let result1 = await indianpackage.findById(id);
    let result2 = await abroadpackage.findById(id);
    if(result1 == null){
        req.body.package.image = {
            url: result2.image.url,
            filename: result2.image.filename
        };
        const result = await abroadpackage.findByIdAndUpdate(id,{...req.body.package});
    }
    if(result2 == null){
        req.body.package.image = {
            url: result1.image.url,
            filename: result1.image.filename
        };
        const result = await indianpackage.findByIdAndUpdate(id,{...req.body.package});
    }
    res.redirect(`/${id}`);
})

app.delete("/delete/:id" , async (req,res) => {
    let {id} = req.params;
    let result1 = await indianpackage.findById(id);
    let result2 = await abroadpackage.findById(id);
    if(result1 == null){
        await abroadpackage.findByIdAndDelete(id);
    }
    if(result2 == null){
        await indianpackage.findByIdAndDelete(id);
    }
    res.redirect("/");
});


app.get("/", async (req,res) => {
    const indpackage = await indianpackage.find({});
    const abrpackage = await abroadpackage.find({});
    res.locals.msg = req.flash("success");
    res.render('Home.ejs', {indpackage,abrpackage});
});

app.listen(8080, (req,res) => {
    console.log('listening to port 8080');
});

