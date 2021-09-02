const express = require("express")
const fs = require("fs")
const path = require("path")
const app = express()

const dotenv = require('dotenv')

// Load ENV data
dotenv.config()

const EXPRESS_PORT = process.env.EXPRESS_PORT || 5001

app.listen(EXPRESS_PORT, function () {
    console.log(`Express API on.........PORT : ${EXPRESS_PORT}`)
})

// Testing HTML Page
app.get("/", function (req, res) {
    res.sendFile(__dirname + "../public/index.html")
})