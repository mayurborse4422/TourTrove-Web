const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
     title : { type : String, required : true},
     duration : {type : String, required : true},
     price : {type : Number, required : true},
     state : {type : String, required : true},
     type : {type : String, required : true},
     country : {type : String, required : true},
     image : {url : String, filename : String},
     startingpoint : {type : String, required : true},
     overview : {type : String, required : true}
});

module.exports = mongoose.model("indianpackage",packageSchema);