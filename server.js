/******************************************************************************
***
* ITE5315 – Project
* I declare that this assignment is my own work in accordance with Humber Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
* 
* Group member Name: _____Purva and Jay___ Student IDs: ____N01452584 & N01425903___ Date: _____18-04-2022__
*
*
******************************************************************************
**/
var express  = require('express');
var mongoose = require('mongoose');
var app      = express();
var dbConn = require('./config/database');
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)
var MongoClient = require("mongodb").MongoClient;
var db = require('./functions/restaurantFunction');
require('dotenv').config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const auth = require("./middleware/authentication");
const User = require("./models/user");
const exphbs = require('express-handlebars');
var port     = process.env.PORT || 8000;

var path = require('path');//include path module using require method
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

//set the directory path and set the app to know html files

app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

var Restaurant = require("./models/restaurants");

var myobj = {
    // _id: "11222",    //uncomment while adding record.
    address : {
        building: "100118",
        coord:[-73.11,40.80],
        street:"mark avenue8",
        zipcode:"104562"
    },
    borough : "Rocks7",
    cuisine : "Bakery7",
    grades: [
        {
            date:"2014-03-03T00:00:00.000+00:00",
            grade:"A2",
            score:2
        }
    ],
    name: "Morris Bag Sho9",
    restaurant_id: "1001118"
};

db.connectToServer( function( err, client ) {
    if (err) console.log(err);
    
        db.initialize();
        // db.addNewRestaurant(myobj);
        // db.getAllRestaurants(2,3,"Bronx");
    //  db.getRestaurantById("1001118");
    //  db.updateRestaurantById(myobj,"1001118");
    //  db.deleteRestaurantById("1001111");

    app.get("/", (req,res) => {
        res.send("Welcome To Project By Purva Vaishnani and Jay Rudani.");
    })

    app.post("/register", async (req, res) => {
        try {
            // take user input in the variable
            const { first_name, email, password } = req.body;
    
            // Here we validate the user inputs
            if (!(email && password && first_name)) {
                res.status(400).send("All input is required");
            }
        
            //checking if user already exist based on the email
            const oldUser = await User.findOne({ email });
        
            if (oldUser) {  //if already exist then we send message to login
                return res.status(409).send("User Already Exist. Please Login");
            }
        
            //here we encrypt the user password
            encryptedPassword = await bcrypt.hash(password, 10);
        
            // if not registered then we create the new user in database
            const user = await User.create({
                first_name,
                email: email.toLowerCase(),
                password: encryptedPassword,
            });
        
            // Create token
            const token = jwt.sign(
            { user_id: user._id, email },
                process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
            );

            // save user token in the user object
            user.token = token;
            console.log(token);

            res.status(201).json(user);
        } catch (err) {
            console.log(err);
        }
        // Our register logic ends here
    });

    app.post("/login", async (req, res) => {
        try {
            const { email, password } = req.body;
        
            //here we validate what user has input
            if (!(email && password)) {
                res.status(400).send("All input is required");
            }
            // checking if user exist in our database
            const user = await User.findOne({ email });
        
            if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
                const token = jwt.sign(
                    { user_id: user._id, email },
                    process.env.TOKEN_KEY,
                    {
                    expiresIn: "2h",
                    }
                );
                user.token = token;
            
                // return the user object
                res.status(200).json(user);
            }
            else{
                res.status(400).send("Invalid Credentials");
            }
        } catch (err) {
            console.log(err);
        }
    });
    
    app.get('/api/restaurants/insertData', function (req, res) {
        res.render('insertData', {title: 'Restaurants'});
    });
    
    app.post('/api/restaurants/insertData', function(req, res) {
        console.log(req.body);
        const borough = req.body.borough;
        const Page = req.body.page;
        const perPage = req.body.perPage;
        Restaurant.find({borough:borough},function (err, restaurants) {
        // if there is an error retrieving, send the error otherwise send data
        if (err)
            res.send(err)
        const BegIndex = (Page - 1) * perPage;
        const endIndex = Page * perPage;
        const result = restaurants.slice(BegIndex, endIndex);
        // res.json(result); // return all restaurants in JSON format
        res.render('form', { data: result }); // return all books in JSON format
        }).lean();
    });

    app.post('/api/restaurants', function(req, res) {
        Restaurant.create({
            _id: req.body._id,    //uncomment while adding record.
            address : req.body.address,
            borough : req.body.borough,
            cuisine : req.body.cuisine,
            grades: req.body.grades,
            name: req.body.name,
            restaurant_id: req.body.restaurant_id
        }, function(err, restaurant) {
            if (err)
                console.log(err);
        
            // get and return all the restaurants after newly created restaurant record
            Restaurant.find(function(err, restaurants) {
                if (err)
                    console.log(err);
                res.json(restaurants);
            });
        });
    });

    app.get('/api/restaurants',auth , function(req, res) {
        const borough = req.body.borough;
        const Page = req.body.Page;
        const perPage = req.body.perPage;
        Restaurant.find({borough:borough},function (err, restaurants) {
        // if there is an error retrieving, send the error otherwise send data
        if (err)
            res.send(err)
        const BegIndex = (Page - 1) * perPage;
        const endIndex = Page * perPage;
        const result = restaurants.slice(BegIndex, endIndex);
        // res.json(result); // return all restaurants in JSON format
        res.render('form', { data: result }); // return all books in JSON format
        }).lean();
    });

    app.get('/api/restaurants/:restaurant_id', function(req, res) {
        console.log(req.params);
        let id = req.params.restaurant_id;
        Restaurant.findById(id, function(err, restaurant) {
            if (err)
                console.log(err)
            res.json(restaurant);
        });
    });
    
    app.put('/api/restaurants/:restaurant_id', function(req, res) {
        // create mongose method to update an existing record into collection
    
        let id = req.params.restaurant_id;
        var data = {
            borough : req.body.borough,
            cuisine : req.body.cuisine,
            name: req.body.name,
            restaurant_id: req.body.restaurant_id
        }
    
        // save the user
        Restaurant.findByIdAndUpdate(id, data, function(err, restaurant) {
        if (err) throw err;
    
        res.send('Successfully! Restaurant updated - '+restaurant.name);
        });
    });


    app.delete('/api/restaurants/:restaurant_id', function(req, res) {
        console.log(req.params.restaurant_id);
        let id = req.params.restaurant_id;
        Restaurant.remove({
            restaurant_id : id
        }, function(err) {
            if (err)
                res.send(err);
            else
                res.send('Successfully! Restaurant has been Deleted.');	
        });
    });
});

app.listen(process.env.PORT);
console.log("App listening on port : " + port);