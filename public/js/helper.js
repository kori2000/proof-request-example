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
      const element = connectionList[index];
    
      // Add on bottom of table
      let con_row = con_table.insertRow(-1)

      let cell = con_row.insertCell(0)
      cell.innerHTML = `<b>${index}</b>`

      cell = con_row.insertCell(1)
      cell.innerHTML = element.their_label

      cell = con_row.insertCell(2)
      cell.innerHTML = `<span ${element.their_did != null ? ' class="badge bg-dark text-light"' : ''}>${element.their_did}</span>`

      cell = con_row.insertCell(3)
      cell.innerHTML = element.their_role
      
      cell = con_row.insertCell(4)
      cell.innerHTML = formatLocaleDate(element.created_at)

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

function readSchema(schemaID) {
  
  console.log("SCHEMA ID: ", schemaID)
  alert("hi")

  fetch(`/get-schema/${schemaID}`).then( res => res.json()).then( jsonData => {

    console.log(jsonData)

  }).catch(err => {
    console.log(err)
  })

}