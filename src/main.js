const express = require("express")
const path = require("path")
const axios = require('axios')
const https = require('https')
const app = express()

const dotenv = require('dotenv')

// Load ENV data
dotenv.config()

const EXPRESS_PORT = process.env.EXPRESS_PORT || 5001
const AXIOS_CONFIG = {headers:{'Content-Type': 'application/json', 'X-API-Key': process.env.API_CONTROLLER_KEY}}

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

// Result Page
app.get("/result", function (req, res) {    
    res.status(200).sendFile(path.join(__dirname, '..', '/public/run_result.html'))
})

// List all connections Page
app.get("/con-all", function (req, res) {    
    res.status(200).sendFile(path.join(__dirname, '..', '/public/con-all.html'))
})

// Create a new connection Page
app.get("/con-new", function (req, res) {    
    res.status(200).sendFile(path.join(__dirname, '..', '/public/con-new.html'))
})

// Display public invitation Page
app.get("/con-inv", function (req, res) {    
    res.status(200).sendFile(path.join(__dirname, '..', '/public/con-inv.html'))
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

    axios.get(`${process.env.API_CONTROLLER}/connections`, AXIOS_CONFIG)
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

    axios.delete(`${process.env.API_CONTROLLER}/connections/${connection_id}`, AXIOS_CONFIG)
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
        axios.post(`${process.env.API_CONTROLLER}/connections/receive-invitation`, json_payload, AXIOS_CONFIG)
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

// Get agent server status
app.get("/status", function (req, res) {

    axios.get(`${process.env.API_CONTROLLER}/status`, AXIOS_CONFIG)
    .then(result => {
        console.log(result.data)
        res.status(200).send(result.data)
    })
    .catch(err => {
        console.log(err)
        res.status(500).send(err.message)
    })

})

// Get schema from ledger
app.get("/get-schema/:schema_id", function (req, res) {

    let schema_id = req.params.schema_id

    console.log("GET SCHEMA : ", schema_id)

    axios.get(`${process.env.API_CONTROLLER}/schemas/${schema_id}`, AXIOS_CONFIG)
    .then(result => {
        console.log(result.data)
        res.status(200).send(result.data)
    })
    .catch(err => {
        console.log(err)
        res.status(500).send(err.message)
    })

})

// Get Invitaton Link
app.get("/invitation", function (req, res) {

    const AXIOS_POST_CONFIG = {
        method: 'post',
        url: process.env.API_CONTROLLER + "/connections/create-invitation",
        headers:{ 'Content-Type': 'application/json',  'X-API-Key': process.env.API_CONTROLLER_KEY }
    }

    axios(AXIOS_POST_CONFIG)
    .then(result => {
        console.log(result.data);
        res.status(200).send(result.data)
    })
    .catch(err => {
        console.log(err)
        res.status(500).send(err.message)
    })

})

// Get Invitaton Link
app.post("/proof-request", function (req, res) {

    let proof_request_payload = req.body.proof_request_payload

    console.log("PROOF REQUEST PAYLOAD", proof_request_payload)

    const AXIOS_POST_CONFIG = {
        method: 'post',
        url: process.env.API_CONTROLLER + "/present-proof/send-request",
        headers:{ 'Content-Type': 'application/json',  'X-API-Key': process.env.API_CONTROLLER_KEY },
        data: proof_request_payload
    }

    axios(AXIOS_POST_CONFIG)
    .then(result => {
        console.log(result.data);
        res.status(200).send(result.data)
    })
    .catch(err => {
        console.log(err)
        res.status(500).send(err.message)
    })

})

// Retrive Presentaion Proof Record
app.get("/present-proof-record/:presentation_exchange_id", function (req, res) {

    let presentation_exchange_id = req.params.presentation_exchange_id

    console.log("PRESENTAION EXCHANGE ID : ", presentation_exchange_id)

    axios.get(`${process.env.API_CONTROLLER}/present-proof/records/${presentation_exchange_id}`, AXIOS_CONFIG)
    .then(result => {
        console.log(result.data)
        res.status(200).send(result.data)
    })
    .catch(err => {
        console.log(err)
        res.status(500).send(err.message)
    })

})

// Get Credentil Definition from Ledger, if new create one
app.post("/cred-def/", function (req, res) {

    //HOTFIX
    res.status(200).send('HOTFIX')

    // let credential_definition_payload = req.body.credential_definition_payload

    // console.log("GET CREDENTIAL DEFINITION: ", credential_definition_payload)

    // const AXIOS_POST_CONFIG = {
    //     method: 'post',
    //     url: process.env.API_CONTROLLER + "/credential-definitions",
    //     headers:{ 'Content-Type': 'application/json',  'X-API-Key': process.env.API_CONTROLLER_KEY },
    //     data: credential_definition_payload
    // }

    // axios(AXIOS_POST_CONFIG)
    // .then(result => {
    //     console.log(result.data);
    //     res.status(200).send(result.data)
    // })
    // .catch(err => {
    //     console.log(err)
    //     res.status(500).send(err.message)
    // })

})