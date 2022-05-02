require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const favicon = require("serve-favicon");
const date = require(__dirname + "/date.js");


const app = express();

app.set('view engine', 'ejs');

app.use(favicon(__dirname + "/public/img/favicon.png"));

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.URL);

const itemsSchema = mongoose.Schema({
  name:String
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"Welcome to your to do list!"
});

const item2 = new Item({
  name:"Hit the + button to add a new item."
});

const item3 = new Item({
  name:"<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if (err){
      console.log(err);
    }else{
      if (foundItems.length===0){
        Item.insertMany(defaultItems,function(err){
          if (!err){
            console.log("Items added!");
          }
        });
        res.redirect("/");
      }else{
        const day = date.getDate();
        res.render("list", {listTitle: day, newListItems: foundItems});
      }     
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item({
    name:itemName,
  });

  item.save();
 
  res.redirect("/");
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId,function(err){
    if (!err){
      console.log("Item deleted!");
    }
    res.redirect("/");
  });  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
