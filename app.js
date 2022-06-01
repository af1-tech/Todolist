require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const favicon = require("serve-favicon");
const date = require(__dirname + "/date.js");


const app = express();

app.set('view engine', 'ejs');

app.use(favicon(__dirname + "/public/img/favicon.png"));

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.URL, {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];


const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

let listSelected = "";

app.get("/", function(req, res) {
 List.find({},function(err,foundList){
   if(!err){
     if(foundList.length===0){
       const list = new List({
        name: "Today",
        items: defaultItems
      });
        list.save();
        res.redirect("/");
     }else{  
        res.render("list", {listTitle: foundList,listTitles: "",newListItems:[],ids:""});    
     }
   }
 });
});
 
 app.post("/addList",function(req,res){
  const nameList =  _.capitalize(req.body.newList);
  const list = new List({
    name: nameList,
    items: defaultItems
  });
  list.save();
  res.redirect("/");
 });
 
 
 app.post("/selectlist",function(req,res){ 
  listSelected = req.body.listRadio;

  List.find({},function(err,foundListe){
    if(!err){     
      List.findOne({_id:listSelected}, function(err, foundList){ 
        if(!err){
         res.render("list", {listTitle: foundListe,listTitles: foundList.name,newListItems: foundList.items,ids:listSelected});
        }
      }); 
    }
  });
  
});

app.post("/deletelist",function(req,res){ 
  listSelected = req.body.deleteList;
  
  List.deleteOne({_id:listSelected}, function(err, foundList){ 
    if(!err){
      List.find({},function(err,foundListe){
        if(!err){     
         res.render("list", {listTitle: foundListe,listTitles: "",newListItems:[],ids:""});
        }
      }); 
    }
  });
  
});
  

app.post("/addItem", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      List.find({},function(err,foundListe){
        if(!err){     
          List.findOne({_id:listSelected}, function(err, foundList){ 
            if(!err){
             res.render("list", {listTitle: foundListe,listTitles: foundList.name,newListItems: foundList.items,ids:listSelected});
            }
          }); 
        }
      });
    });
 
});

app.post("/deleteItem", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        List.find({},function(err,foundListe){
          if(!err){     
            List.findOne({_id:listSelected}, function(err, foundList){ 
              if(!err){
               res.render("list", {listTitle: foundListe,listTitles: foundList.name,newListItems: foundList.items,ids:listSelected});
              }
            }); 
          }
        });
      }
    });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
