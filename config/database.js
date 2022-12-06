

// Import mongoose
var mongoose = require('mongoose');

// Import the schema created in the restaurant
var resSchema = require("../models/restaurant")

module.exports = {
    // Database object is created and exported from the file as an object containing DB
    DB: class RestaurantDB {
        constructor() {
            // We don't have a `Restaurant` object until initialize() is complete
            this.Restaurant = null;
        }

        // Initialize function is created with 1 parameter connectionString
        async initialize(connectionString) {
            const db = await mongoose.connect(
                connectionString
            );

            // Once the db is connected then we are setting the restaurant varuable with the model in the databases
            this.Restaurant = db.model("restaurant", resSchema)


        }

        // This function is executed when the user sends a POST request to /api/restaurants
        async addNewRestaurant(data) {
            //  New data pushed
            const newRestaurant = new this.Restaurant(data);
            // Data is saved in the database
            await newRestaurant.save();
            // New restaurant is returned
            return newRestaurant;
        }

        // Get all the restaurant info using with page query parameters, Executed when sent a GET request at /api/restaurants
        getAllRestaurants(page, perPage, borough) {
            let findBy = borough ? { borough } : {};
            // If the page paramerters are provided find and return the information as per the parameters
            if (+page && +perPage) {
                return this.Restaurant.find(findBy).sort({ restaurant_id: +1 }).skip((page - 1) * +perPage).limit(+perPage).exec();
            }
            // If the page info is not available then reject with an error
            return Promise.reject(new Error('page and perPage query parameters must be valid numbers'));
        }
        // Return a restaurant info by finding one with the provided id, Executed when GET request is sent at /api/restaurants/:_id
        getRestaurantById(id) {
            return this.Restaurant.findOne({ _id: id }).exec();
        }
        // Update a restaurant by passing new data and also the id of the restaurant that needs to be updated, Executed when PUT request is sent at /api/restaurants/:_id
        updateRestaurantById(data, id) {
            return this.Restaurant.updateOne({ _id: id }, { $set: data }).exec();
        }
        //  Delete a restaurants data whose id is provided, Executed when DELETE request is sent at /api/restaurants/:_id
        deleteRestaurantById(id) {
            return this.Restaurant.deleteOne({ _id: id }).exec();
        }
    }
};