const express = require("express")
const path = require("path")
const axios = require('axios')
const https = require('https')
const app = express()

const dotenv = require('dotenv')

// Load ENV data
dotenv.config()

const EXPRESS_PORT = process.env.EXPRESS_PORT || 5001
const AXIOS_CONFIG = {headers:{'Content-Type': 'application/json', 'X-API-Key': process.env.API_KEY}}

app.listen(EXPRESS_PORT, function () {
    console.log(`Express API on.........PORT : ${EXPRESS_PORT}`)
})

// Public Static File Folder
let public_folder = path.join(__dirname, '..', '/public/')
app.use(express.static(public_folder))
app.use(express.json())

/**
 * --------------------------------------------------
 * Static Pages
 * --------------------------------------------------
 */

// Main Page
app.get("/", function (req, res) {    
    res.status(200).sendFile(path.join(__dirname, '..', '/public/index.html'))
})

// Demonstration Page
app.get("/run", function (req, res) {    
    res.status(200).sendFile(path.join(__dirname, '..', '/public/run.html'))
})

// List all connections Page
app.get("/con-all", function (req, res) {    
    res.status(200).sendFile(path.join(__dirname, '..', '/public/con-all.html'))
})

// Create a new connection Page
app.get("/con-new", function (req, res) {    
    res.status(200).sendFile(path.join(__dirname, '..', '/public/con-new.html'))
})

// Delete connection Page
app.get("/con-del", function (req, res) {    
    res.status(200).sendFile(path.join(__dirname, '..', '/public/con-del.html'))
})

/**
 * --------------------------------------------------
 * API ROUTES
 * --------------------------------------------------
 */

// Get connections
app.get("/connections", function (req, res) {

    axios.get(`${process.env.API_PARTNER}/connections`, AXIOS_CONFIG)
    .then(result => {
        //console.log(result.data)
        res.status(200).send(result.data)
    })
    .catch(err => {
        console.log(err)
        res.status(500).send(err.message)
    })

})

// Delete connections
app.get("/delete-connection/:connection_id", function (req, res) {

    let connection_id = req.params.connection_id

    console.log("DELETE ", connection_id);

    axios.delete(`${process.env.API_PARTNER}/connections/${connection_id}`, AXIOS_CONFIG)
    .then(result => {
        console.log(result.data)
        res.status(200).send(result.data)
    })
    .catch(err => {
        console.log(err)
        res.status(500).send(err.message)
    })

})

// Create connection
app.post("/create-connection/", function (req, res) {

    let invitaion_link = req.body.link
    console.log("INVITATION_LINK ", invitaion_link)
    
    // RETRIVE AGENT INVITATION JSON PAYLOAD
    axios.get(invitaion_link).then(result => {

        let json_payload = result.data.invitation
        console.log(json_payload)

        // COMMIT INVITAION PAYLOAD TO AGENT FOR ESTABLISHING A NEW CONNECTION
        axios.post(`${process.env.API_PARTNER}/connections/receive-invitation`, json_payload, AXIOS_CONFIG)
        .then(result => {
            console.log(result.data)
            res.status(200).send(result.data)
        })
        .catch(err => {
            console.log(err)
            res.status(500).send(err.message)
        })

    }).catch(err => {
        console.log("PAYLOAD FAILER", err)
        res.status(500).send(err.message)
    })

})

// Get connections
app.get("/get-schema/:schema_id", function (req, res) {

    let schema_id = req.params.schema_id

    axios.get(`${process.env.API_PARTNER}/schemas/${schema_id}`, AXIOS_CONFIG)
    .then(result => {
        //console.log(result.data)
        res.status(200).send(result.data)
    })
    .catch(err => {
        console.log(err)
        res.status(500).send(err.message)
    })

})