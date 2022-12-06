// Import all required dependencies
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

const { engine } = require('express-handlebars')

// Enable handlebars engine for all files ending with .hbs
app.engine('.hbs', engine());
app.set('view engine', '.hbs');
app.set('views', './views');

const { DB: RestaurantDB } = require("./config/database");
const restaurant = require("./models/restaurant");
const connectionString = process.env.CONNECTION_STRING;


//to support CORS
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

const HTTP_PORT = process.env.PORT || 8080;

//Database credentials
const db = new RestaurantDB()


db.initialize(connectionString)
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`server listening on: ${HTTP_PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });
app.get("/", (req, res) => {
    res.json({ message: "API Listening" })
});

// Getting restaurant by page, PerPage & borough query
app.get("/api/restaurants", (req, res) => {
    if ((!req.query.page || !req.query.perPage))
        res.status(500).json({ message: "Missing query params" })
    else {
        db.getAllRestaurants(req.query.page, req.query.perPage, req.query.borough)
            .then((data) => {
                if (data.length === 0) res.status(204).json({ message: "No data is returned" });
                else res.status(201).json(data);
            })
            .catch((err) => { res.status(500).json({ error: err }) })
    }
});

// Getting restaurant by ID
app.get("/api/restaurants/:_id", (req, res) => {
    db.getRestaurantById(req.params._id)
        .then((data) => { res.status(201).json(data) })
        .catch((err) => { res.status(500).json({ error: err }) })
});

// Adding a new restaurant from req.body
app.post("/api/restaurants", (req, res) => {
    if (Object.keys(req.body).length === 0) res.status(500).json({ error: "Invalid" })
    else {
        db.addNewRestaurant(req.body)
            .then((data) => {
                res.status(201).json(data)
            })
            .catch((err) => { res.status(500).json({ error: err }) })
    }
});


// Updating restaurant with req.body and the ID
app.put("/api/restaurants/:restaurant_id", (req, res) => {
    // if (Object.keys(req.body).length === 0) 
    // res.status(500).json({ error: "Invalid body" })
    // else {
    db.updateRestaurantById(req.body, req.params._id)
        .then(() => { res.status(201).json({ message: `Successfuly updated restaurant ${req.params.restaurant_id}` }) })
        .catch((err) => { res.status(500).json({ error: err }) })
}
    //}
);

// Deleting restaurant by ID
app.delete("/api/restaurants/:_id", (req, res) => {
    db.deleteRestaurantById(req.params._id)
        .then(() => { res.status(201).json({ message: `Successfuly deleted restaurant ${req.params._id}` }) })
        .catch((err) => { res.status(500).json({ error: err }) })
});

app.get('/view-restaurants', async (req, res) => {
    const data = (await db.getAllRestaurants(req.query.page || 1, req.query.perPage || 10)).map((data, index) => ({ slNo: index + 1, id: data.restaurant_id, restaurant_name: data.name, cuisine: data.cuisine, borough: data.borough }))
    if (data) {
        res.render('home', {
            data,
        });
    }
})

