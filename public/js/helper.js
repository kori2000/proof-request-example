/**
 * GLOBAL PARAMETERS
 * 
 */
let ST_CONNECTION = ''
let ST_SCHEMA_ID = ''
let ST_CRED_DEF_ID = ''
let ST_ATTRIBUTE = []

/**
 * Display Connection Table
 * @param {status} isVisible 
 */
function toggleConTable(isVisible) {
  let red_spinner = document.getElementById('red_spinner')
  let con_table = document.getElementById('con_table')

  if (isVisible) {
    con_table.style.visibility = "visible"
    red_spinner.style.visibility = "hidden"
  } else {
    con_table.style.visibility = "hidden"
    red_spinner.style.visibility = "visible"
  }

}

// fade out
function fadeOut(el){
  el.style.opacity = 1;

  (function fade() {
    if ((el.style.opacity -= .1) < 0) {
      el.style.display = "none";
    } else {
      requestAnimationFrame(fade);
    }
  })();
}
// fade in
function fadeIn(el){
  el.style.opacity = 0;
  el.style.display = "block";

  (function fade() {
    var val = parseFloat(el.style.opacity);
    if (!((val += .1) > 1)) {
      el.style.opacity = val;
      requestAnimationFrame(fade);
    } 
  })();
}

/**
 * Display Info Box: Deleted Connection ID
 * @param {} connection_id 
 */
function showDelConBox(connection_id) {
  let del_con_box = document.getElementById("del_con_box")
  let del_con_id = document.getElementById("del_con_id")

  del_con_box.style.visibility = "visible"

  del_con_id.innerHTML = connection_id

  fadeIn(del_con_box)

  setTimeout(function() {
    fadeOut(del_con_box)
  }, 3000)
}

function showDelConBoxFail(connection_id) {
  let del_con_box = document.getElementById("del_con_box_err")
  let del_con_id = document.getElementById("del_con_id_err")

  del_con_box.style.visibility = "visible"

  del_con_id.innerHTML = connection_id

  fadeIn(del_con_box)

  setTimeout(function() {
    fadeOut(del_con_box)
  }, 3000)
}

/**
 * Format Date to local string
 * @param {date} local_date 
 */
function formatLocaleDate(local_date) {
  let d = new Date(local_date)
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short' }).format(d)
}


/**
 * Retrive all connections
 */
function listDeviceConnections() {

  toggleConTable(false)
    
  fetch('/connections').then( res => res.json()).then( jsonData => {

    console.log(jsonData)

    let con_table = document.getElementById('con_table')
    
    let connectionList = jsonData.results
    for (let index = 0; index < connectionList.length; index++) {
      const element = connectionList[index]
    
      // Add on bottom of table
      let con_row = con_table.insertRow(-1)

      let cell = con_row.insertCell(0)
      cell.innerHTML = `<b>${index}</b>`

      cell = con_row.insertCell(1)
      cell.innerHTML = element.their_label

      cell = con_row.insertCell(2)
      cell.innerHTML = `<span ${element.their_did != null ? ' class="badge bg-light text-dark" style="text-transform: uppercase;"' : ''}>${element.their_did}</span>`

      cell = con_row.insertCell(3)
      cell.innerHTML = element.their_role
      
      cell = con_row.insertCell(4)
      cell.innerHTML = `<span class="badge bg-light text-dark">${formatLocaleDate(element.created_at)}</span>`

      cell = con_row.insertCell(5)
      cell.innerHTML = `<i>${element.rfc23_state}</i>`

      cell = con_row.insertCell(6)
      cell.innerHTML = `<span class="badge ${element.state === 'active' ? 'bg-success text-light' : 'bg-warning text-light'}">${element.state}</span>`

      cell = con_row.insertCell(7)
      cell.innerHTML = `<code class='small'>${element.connection_id}</code>`

      cell = con_row.insertCell(8)
      cell.innerHTML = `<button class="btn btn-link" style="text-decoration: none" onclick="delete_selected_conn_id('${element.connection_id}')">⛔</button>`
    }    

    toggleConTable(true)

  })

}

/**
 * Delete selected connection
 */
function delete_connection() {
  
  // Replace tags againts injections
  let connection_id = document.getElementById("connection_id")
  let conn_id_value = connection_id.value.replace(/(<([^>]+)>)/gi, "")
    
  fetch(`/delete-connection/${conn_id_value}`).then( res => {

    if (res.status == 200) {
      connection_id.value = ""
      showDelConBox(conn_id_value)
      
    } else {
      showDelConBoxFail(conn_id_value)
    }

  })

}
/**
 * Delete selected connection
 * @param {} connection_id 
 */
function delete_selected_conn_id(connection_id) {
  if ( confirm(`Are you sure you want to delete the connection [${connection_id}]?`) ) {

    // Delete
    fetch(`/delete-connection/${connection_id}`).then( res => {
  
      if (res.status == 200) {
        window.location.reload()
        //showDelConBox(conn_id_value)
        
      } else {
        alert("🍕, Something went wrong ")
      }

  
    })

  } else {
    // Do nothing!
  }
}

/**
 * Create a new connection
 */
function create_connection() {

  let invitation_link = document.getElementById("invitaion_link")
  let inv_link_value = invitation_link.value

  let post_data = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: "POST",
    body: JSON.stringify({link: inv_link_value})
  }

  let connection_id = ''

  fetch(`/create-connection/`, post_data).then( res => res.json()).then( jsonData => {

    console.log(jsonData)

    connection_id = jsonData.connection_id

    if (connection_id != null) {
      invitation_link.value = ""
      showDelConBox(connection_id)
      let last_conn = document.getElementById("last_conn")
      last_conn.style.visibility = "visible"
      let last_conn_id = document.getElementById("last_conn_id")
      last_conn_id.innerHTML = connection_id
      fadeIn(last_conn)
      
    } else {
      showDelConBoxFail(connection_id)
    }

  }).catch(err => {
    showDelConBoxFail(connection_id)
    console.log(err)
  })

}

/**
 * Return controller cloud agent status
 */
function getServerStatus() {

  let agent_label = document.getElementById("agent_label")
  let agent_status = document.getElementById("agent_status")

  fetch(`/status`).then( res => res.json()).then( jsonData => {
    agent_label.innerHTML = `${jsonData.label} v${jsonData.version}`
    agent_status.innerHTML = "CONNECTED"
    agent_status.className = "badge badge-success"
    // console.log(jsonData)
  }).catch(err => {
    agent_label.innerHTML = "NO AGENT"
    agent_status.innerHTML = "OFFLINE"
    agent_status.className = "badge badge-danger"
  })

}

function syntaxHighlight(json) {
  if (typeof json != 'string') {
    json = JSON.stringify(json, undefined, '\t');
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var cls = 'number';
      if (/^"/.test(match)) {
          if (/:$/.test(match)) {
              cls = 'key';
          } else {
              cls = 'string';
          }
      } else if (/true|false/.test(match)) {
          cls = 'boolean';
      } else if (/null/.test(match)) {
          cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
  });
}

function createInvitation() {

  let invitation_link = document.getElementById("invitation_link")
  let invitaion_link_data = document.getElementById("invitaion_link_data")  

  fetch(`/invitation`).then( res => res.json()).then( jsonData => {    
    invitation_link.style.visibility = "visible"
    invitaion_link_data.innerHTML = syntaxHighlight(jsonData)

  }).catch(err => {
    invitaion_link_data.innerHTML = ""
  })

}

/**
 * Helper to create html element, displaying schema attributes
 * @param {*} _id 
 * @param {*} schema_attribute 
 * @returns 
 */
function addSchemaAttributes(_id, schema_attribute) {
  if (schema_attribute === 'Owner_Checksum') {
    return `<div class="form-check form-switch"><input disabled class="form-check-input" type="checkbox" id="sca_${_id}"><label class="form-check-label" for="sca_${_id}">${schema_attribute}
    <span class="badge rounded-pill bg-secondary text-light" style="text-transform: uppercase">Prediction: Issuer is</span> <img src="/img/db_logo.png" width="30"></label></div>`
  } else if (schema_attribute === 'Maintenance_Order') {
    return ""
  }
  return `<div class="form-check form-switch"><input class="form-check-input" type="checkbox" id="sca_${_id}" checked><label class="form-check-label" for="sca_${_id}">${schema_attribute}</label></div>`
}
/**
 * Read Schema Attributes from Leder
 * @param {*} schemaID 
 */
function readSchema(schemaID, credDefID) {

  let html_schema_attributes = document.getElementById("schema_attributes")
  html_schema_attributes.innerHTML = ''
  
  let red_spinner = document.getElementById('red_spinner')  
  red_spinner.style.visibility = "visible"
      
  fetch(`/get-schema/${schemaID}`).then( res => res.json()).then( jsonData => {

    console.log(jsonData)
        
    let schema_attributes = jsonData.schema.attrNames
    
    for (let index = 0; index < schema_attributes.length; index++) {
      const element = schema_attributes[index]

      html_schema_attributes.innerHTML += addSchemaAttributes(index, element)
    }

    let schema_selecetd_name = document.getElementById("schema_selecetd_name")
    schema_selecetd_name.innerHTML = `<span class="badge bg-info text-white" style="text-transform: uppercase">${jsonData.schema.name} Version ${jsonData.schema.ver}</span> <span class="badge rounded-pill bg-light text-dark"><a href="https://idunion.esatus.com/tx/IDunion_Test/domain/${jsonData.schema.seqNo}" target="_blank">View on Blockchain</a></span>`

     // Set Global Parameter
    ST_SCHEMA_ID = schemaID
    ST_CRED_DEF_ID = credDefID
    
    red_spinner.style.visibility = "hidden"
    
  }).catch(err => {
    console.log(err)
    red_spinner.style.visibility = "hidden"
  })

}

/**
 * Set connection html value into DropDownList
 * @param {*} sel_label 
 * @param {*} sel_connection_id 
 */
function setSelectConnection(sel_label, sel_date, sel_connection_id) {
  let selected_connection = document.getElementById("selected_connection")
  selected_connection.innerHTML = `<span class="badge bg-info text-white" style="text-transform: uppercase">${sel_label}</span> <span class="badge bg-light text-dark">${sel_date}</span> | <a href="/con-all" target="_blank"><code>${sel_connection_id}</code></a>`
  
  // Set Global Parameter
  ST_CONNECTION = sel_connection_id
}

/**
 * Retrive active connection for proof request
 */
function retriveListDDLconnections() {

  fetch('/connections').then( res => res.json()).then( jsonData => {
    
    //console.log(jsonData.results)

    let ddl_conn_items = document.getElementById("ddl_conn_items")

    let connectionList = jsonData.results
    for (let index = 0; index < connectionList.length; index++) {
      const element = connectionList[index]

      if(element.state === "active") {
        ddl_conn_items.innerHTML += `<li><button onclick="setSelectConnection('${element.their_label}', '${formatLocaleDate(element.created_at)}', '${element.connection_id}')" class="dropdown-item" type="button"><span class="badge bg-info text-white" style="text-transform: uppercase">${element.their_label}</span> <span class="badge active bg-light text-dark">${formatLocaleDate(element.created_at)}</span> <span class="badge active bg-light text-dark"><code>${element.connection_id}</code></span></button></li>`  
      }

    }

  })

}

/**
 * Init Proof Request - Check Parameter Settings
 */
function initProofRequest() {

  // CHECK PARAMETER
  if (ST_CONNECTION == '' || ST_SCHEMA_ID == '') {

    let select_items_err_box = document.getElementById("select_items_err_box")
    select_items_err_box.style.visibility = "visible"
    fadeIn(select_items_err_box)^
    setTimeout(function() { fadeOut(select_items_err_box) }, 3000)

  } else {

    //SCHEMA ATTRIBUTES
    let schema_attributes = document.querySelector('#schema_attributes')
    var sel_attr = schema_attributes.querySelectorAll('input[type="checkbox"]')
    var sel_attr_label = schema_attributes.querySelectorAll('label')

    for (let index = 0; index < sel_attr.length; index++) {
      let cb = sel_attr[index]
      let lb = sel_attr_label[index]
      
      if (cb.checked) {
        ST_ATTRIBUTE.push(lb.innerHTML) 
      }

    }

    sessionStorage.clear()
    sessionStorage.setItem("ST_CONN", ST_CONNECTION)
    sessionStorage.setItem("ST_SCHM", ST_SCHEMA_ID)
    sessionStorage.setItem("ST_CRED", ST_CRED_DEF_ID)
    sessionStorage.setItem("ST_ATTR", ST_ATTRIBUTE)

    console.log("SEL CONNECTION..........: ", ST_CONNECTION)
    console.log("SEL SCHEMA..............: ", ST_SCHEMA_ID)
    console.log("SEL CREDENTIOAL DEF ID..: ", ST_CRED_DEF_ID)
    console.log("SEL ATTRIBUTES..........: ", ST_ATTRIBUTE)

    ST_CONNECTION = ''
    ST_SCHEMA_ID = ''
    ST_CRED_DEF_ID = ''
    ST_ATTRIBUTE = ''

    // PARAMETER READY. PROCEED TO PROOF REQUEST
    window.location.href = '/result'
  }

}

/**
 * Submit attributs to Proof Request Payload
 * @param {*} single_attribute 
 * @param {*} cred_def 
 * @returns 
 */
function addReqAttribute(single_attribute, cred_def) {
  return {
    name: single_attribute,
    restrictions: [
      {
        cred_def_id: cred_def
      }
    ]
  }
}

/**
 * Prepare JSON Payload for Proof Request
 * @param {*} st_connection_id 
 * @param {*} st_attributes 
 * @param {*} cred_def 
 * @returns 
 */
function setUpPRJSON(st_connection_id, st_attributes, cred_def) {

  let payload_set = ''

  //HOTFIX: Special Request Predicion for Schema
  if (cred_def === 'Q49cJNv53MY5tnRh855m7L:3:CL:6271:Version 1.0') {

    payload_set = {
      comment: "RailChain - Maintenance Demonstration",
      connection_id: st_connection_id,
        proof_request: {
          name: "RailChain - Proof Request",
          version: "1.0",
          nonce: "1",
          requested_attributes: {
            
          },
        requested_predicates: {
          Owner_Checksum: {
            name: "Maintenance_Order",
            p_type: "<=",
            p_value: 999,
            restrictions: [
              {
                cred_def_id: cred_def
              }
            ]
          }
        }
      }
    }

  } else {

    payload_set = {
      comment: "RailChain - Maintenance Demonstration",
      connection_id: st_connection_id,
        proof_request: {
          name: "RailChain - Proof Request",
          version: "1.0",
          nonce: "1",
          requested_attributes: {
            
          },
        requested_predicates: {
          Owner_Checksum: {
            name: "Owner_Checksum",
            p_type: "<=",
            p_value: 999,
            restrictions: [
              {
                cred_def_id: cred_def
              }
            ]
          }
        }
      }
    }
  }


  // ADD PROOF REQUEST ATTRIBUTES
  for (let index = 0; index < st_attributes.length; index++) {
    let attr = st_attributes[index]
    payload_set.proof_request.requested_attributes[attr] = addReqAttribute(attr, cred_def)

  }

  return payload_set
}

function setUpCredentialDefinitionJSON(selected_schema_id) {
  return {
    revocation_registry_size : 1000,
    schema_id: selected_schema_id,
    support_revocation: false,
    tag: "Version 1.0"
  }
}

function updateProgressBarValue(p_value) {
  let p_bar = document.getElementById("p_bar")

  p_bar.style.width = p_value + "%"
  p_bar.innerHTML = `${p_value}%`

  if (p_value == 100) {
    p_bar.classList.remove("progress-bar-animated")
    p_bar.classList.add("progress-bar")
  }
}
function updateProgressInfoBox(p_message) {
  let p_status = document.getElementById("p_status")
  p_status.innerHTML += p_message 
}
function prepareAttribEntry(a_label, a_value, a_proof) {
  return `<h6><span class="badge bg-secondary text-light">${a_label}</span><span class="badge bg-light text-dark">${a_value}</span> <span class="badge bg-success"><code style="font-size:11px;color:#fff">${a_proof}</code></span></h6>`
}

/**
 * Run Proof Request
 */
function runProofRequest() {

  let local_st_connection = sessionStorage.getItem("ST_CONN")
  let local_st_schema_id =  sessionStorage.getItem("ST_SCHM")
  let local_st_cred_defi =  sessionStorage.getItem("ST_CRED")
  let local_st_attribute =  sessionStorage.getItem("ST_ATTR").split(",")
  sessionStorage.clear()

  console.log("SEL CONNECTION..: ", local_st_connection)
  console.log("SEL SCHEMA......: ", local_st_schema_id)
  console.log("SEL ATTRIBUTES..: ", local_st_attribute)
  
  updateProgressInfoBox("Preparing Parameter for Proof Request...................................DONE<br>")
  updateProgressBarValue(22)

  /**
   * -------------------------------------------
   *  Retrive Credential Definition
   * -------------------------------------------
   */
  let post_data_cd = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: "POST",
    body: JSON.stringify({ credential_definition_payload: setUpCredentialDefinitionJSON(local_st_schema_id) })
  }
  fetch(`/cred-def/`, post_data_cd).then( res => res.json()).then( jsonData => {
    
    // ###### Credential Definition ID ######
    /**
     * HOTFIX: Because the credential was created with the issuer's cred def ID, 
     * it must match exactly when requested. 
     * You cannot use your own one for this purpose.
     */

    //let cred_def_id = jsonData.credential_definition_id
    cred_def_id = local_st_cred_defi // HOTFIX

    console.log("CREDENTIAL DEFINITION ID..:", cred_def_id)

    /**
     * -------------------------------------------
     *  Prepeare Proof Request and await a new
     *  Presentaion Exchange ID
     * -------------------------------------------
     */

    // ###### Proof Request Payload ######
    let pr_data = setUpPRJSON(local_st_connection, local_st_attribute, cred_def_id)
    
    updateProgressInfoBox("Received acknowledgement from Ledger to proceed with selected Schema....DONE<br>")
    updateProgressBarValue(47)

    // updateProgressInfoBox("----------------------------------------------------------------------------<br>")
    // updateProgressInfoBox("PAYLOAD<br>")
    // updateProgressInfoBox(`${syntaxHighlight(pr_data)}<br>`)
    // updateProgressInfoBox("----------------------------------------------------------------------------<br>")
  
    let post_data_pr = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({proof_request_payload: pr_data})
    }
    fetch(`/proof-request/`, post_data_pr).then( res => res.json()).then( jsonData => {

      // ###### Presentaion Exchange ID ######
      let presentation_exchange_id = jsonData.presentation_exchange_id

      console.log("PRESENTATION EXCHANGE ID..:", presentation_exchange_id)

      if (presentation_exchange_id) {

        updateProgressInfoBox("Sending Proof Record to Device..........................................DONE<br>")
        updateProgressBarValue(63)

        /**
         * -------------------------------------------
         *  Request Proof Presentation with Results
         * -------------------------------------------
         */        
        setTimeout(function() {

          updateProgressInfoBox("Proof Request successfully committed to Device. Awaiting Proof Result...DONE<br>")
          updateProgressBarValue(72)
          
          // WAIT 3 SECONDS, LET ACA-PY TIME TO PROCESS THE REQUEST          
          fetch(`/present-proof-record/${presentation_exchange_id}`).then( res => res.json()).then( jsonData => {

            jsonData
            console.log("PROOF RECORD..............:", jsonData.state)
                        
            updateProgressInfoBox("Received Proof Record from Device.......................................DONE<br>")
            updateProgressBarValue(100)

            // Result ------------------------------------

            let proof_result_state = jsonData.state
            console.log(proof_result_state)

            let cert_result = document.getElementById("cert_result")
            let result_header = document.getElementById("result_header")
            let result_attr = document.getElementById("result_attr")
            let card_result_box = document.getElementById("card_result_box")
            let maintenance_order = document.getElementById("maintenance_order")
            
            if (proof_result_state === 'verified') {
              cert_result.src = "img/cert_approved.png"

              let header_info = `<h5 class="card-title">Proof Request was successful</h5><p class="card-text">Request accepted, device ready for maintenance operation<hr>`
              result_header.innerHTML = `${header_info}<span class="badge bg-info text-white" style="text-transform: uppercase">${jsonData.presentation.identifiers[0].schema_id}</span> <span class="badge rounded-pill bg-light text-dark">${jsonData.presentation.identifiers[0].cred_def_id}</span>`
              
              maintenance_order.style.visibility = "visible"

              let revealed_attrs = jsonData.presentation.requested_proof.revealed_attrs
  
              for (const [key, value] of Object.entries(revealed_attrs)) {
                console.log(`${key}: ${value.raw}`);
                result_attr.innerHTML += prepareAttribEntry(key, value.raw, value.encoded)
              }

            } else {
              cert_result.src = "img/cert_declined.png"

              result_header.innerHTML = `<h5 class="card-title">Proof Request was not successful</h5><p class="card-text">Request declined, maintenance operation rejected from device.</p><br>🙉 Have a nice day</p>`

              maintenance_order.innerHTML = ""
            }

            card_result_box.style.visibility = "visible"

          })
        }, 3000)
      }

    })

  })
  
}