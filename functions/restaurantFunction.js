const { default: mongoose } = require('mongoose');
var db = require('./../config/database');
require('dotenv').config();

const MongoClient = require( 'mongodb' ).MongoClient;

var _db;

    module.exports = {
        connectToServer: function( callback ) {
            mongoose.connect(process.env.DB_CONN_STRING);
            MongoClient.connect( process.env.DB_CONN_STRING,  { useNewUrlParser: true }, function( err, client ) {
                _db  = client.db('sample_restaurants');
                return callback( err );
            });
          },
          initialize: function() {
            console.log("DB Initialized");
            return _db;
          },
        addNewRestaurant: function(data){
            _db.collection("restaurants").insertOne(data, function(err, result) {
                if (err) 
                    throw err;
                console.log("1 Record has been Inserted.");
            });
        },
        getAllRestaurants: function(page, perPage, inputBorough){
            var skipPage = (page-1)*perPage;
            var query = {}; 
            if (inputBorough)
                query = {borough: inputBorough};
            result = _db.collection("restaurants").find(query).sort({"restaurant_id":1}).skip(skipPage).limit(perPage).toArray(function(err, result) {
                if (err) throw err;
                console.log(result);
            });;
        },
        getRestaurantById: function(Id){
            result = _db.collection("restaurants").find({restaurant_id: Id}).toArray(function(err, result) {
                if (err) throw err;
                console.log(result);
            });;
        },
        updateRestaurantById: function(data,Id){
            var myquery = { restaurant_id: Id };
            result = _db.collection("restaurants").updateOne(myquery, {$set : data}, function(err, result) {
                if (err) throw err;
                console.log("1 Record Updated.");
            });
        },
        deleteRestaurantById: function(Id){
            var myquery = { restaurant_id: Id };
            result = _db.collection("restaurants").deleteOne(myquery, function(err, result) {
                if (err) throw err;
                console.log("1 Record Deleted.");
            });
        },
    };    
