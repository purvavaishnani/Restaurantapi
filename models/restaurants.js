var mongoose = require('mongoose');
var Schema = mongoose.Schema;
RestaurantSchema = new Schema({
    _id: String,
    address: [{ building: String, coord: Array, street: String, zipcode: String }],
    borough : String,
	cuisine : String,
    grade   : [{ date: Date, grade: String, score: Number }],
    name: String,
    restaurant_id: String
});
module.exports = mongoose.model('Restaurant', RestaurantSchema);