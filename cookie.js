const express = require("express");
const app = express();
const HTTP_PORT = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const { application } = require("express");
app.get('/signin', (req,res) =>{
    res.cookie('session_id','12345');
    res.json({msg:'Logged'});});
    // setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, () => {
    console.log("Express http server listening on: " + HTTP_PORT);
  });