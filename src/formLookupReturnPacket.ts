import * as PermitTypes from './permitTypes.mjs'
import { DatabaseResponse } from './BfsLibrary/httpWrapper.js'
import * as LibDateTime from './BfsLibrary/dateTime.mjs'

/* 
Returning a well formed object, without error codes, is enough for the OneBlink UI's Data lookup element
to register this as valid.
return {} 

If we wanted to return values to other elements we'd do something like the following
return { 
  "TempPicDataTarget": JSON.stringify(submission),
  "OtherElement": "Some Value"
}  
**/
export function getPacket(permitCaseDetail: PermitTypes.PermitCaseDetail, statusCode: DatabaseResponse["statusCode"]) {

  //## Initialize 

  const latestApplicationStatus = permitCaseDetail.ApplicationStatusHistory[0].ApplicationStatus
  const newParagraph = '<p><br /></p>'

  // Null can be assigned to a OneBlink text element.
  let approvedStatusText = null
  let notApprovedStatusText = null
  var applicationStatusHistoryText = null
  var applicationDetailsText = ''
  

  let foundInDatabase = false
  if (statusCode == 200) {
    foundInDatabase = true

    //## StatusText
    // const statusText = `<p>${JSON.stringify(permitCaseDetail)}</p>`
    // const statusTextStyle = 
    // `
    // background-color: var(--nsw-status-warning-orange-bg);
    // padding: 1.5rem 1em;
    // border-left: 4px solid var(--nsw-status-warning-orange);
    // `
    // let statusText = `<div style='${statusTextStyle}'>`
    let statusText = ''
    let statusTextLead = ''
    

    let latestApplicationStatusText = ''

    if (latestApplicationStatus == "Approved") {
      statusTextLead += "<p>The permit's latest application status is <strong>approved</strong>.</p>"
    } else {
      statusTextLead += "<p>The permit's latest application status is <strong>not approved</strong>.</p>"
    }

    latestApplicationStatusText =
      `${latestApplicationStatus}
    at ${LibDateTime.getNswDateTimeAsAustralianGovernmentTextualStyle(new Date(permitCaseDetail.ApplicationStatusHistory[0].DateTime))}`

    let consignmentsText = ''
    permitCaseDetail.Consignments.forEach((element: PermitTypes.Consignment) => {
      consignmentsText +=
        `${element.MaterialType}, ${element.Quantity} ${element.QuantityUnit}<br />`
    })

    statusText = statusTextLead

    applicationDetailsText +=
      `<table>
        <tbody>
          <tr>
            <th>Latest application statuszzz:</th>
            <td>${latestApplicationStatusText}</td>
          </tr>
          <tr>
            <th>Instrument:</th>
            <td>${permitCaseDetail.Instrument}</td>
          </tr>
          <tr>
            <th>Approved start date:</th>
            <td>todo</td>
          </tr>
          <tr>
            <th>Approved end date:</th>
            <td>todo</td>
          </tr>
          <tr>
            <th>Pickup(s), in no particular order:</th>
            <td>${consignmentsText}</td>
          </tr>
        </tbody>
      </table>`
    // ${newParagraph}
    // <p>Complete the validity check below ...</p>
    // statusText += "</div>"

    //## Application Status History

    let applicationStatusHistoryTableRows = ''

    permitCaseDetail.ApplicationStatusHistory.forEach((element: PermitTypes.ApplicationStatusHistory, index) => {
      applicationStatusHistoryTableRows +=
        `<tr>
        <td>${element.ApplicationStatus}</td>
        <td>${LibDateTime.getNswDateTimeAsAustralianGovernmentTextualStyle(new Date(element.DateTime))}</td>
        <td>${index == 0 ? 'The latest (this applies to the permit overall)' : ''}</td>
      </tr>`
    })

    applicationStatusHistoryText = 
      `<table>
      <thead>
        <tr>
          <td>Status</td>
          <td>Datetime</td>
          <td>Designation</td>
        </tr>
      </thead>
      <tbody>
        ${applicationStatusHistoryTableRows}
      </tbody>
    </table>`

    if (latestApplicationStatus == "Approved") {
      approvedStatusText = statusText
    } else {
      notApprovedStatusText = statusText
    }

  } // if (statusCode == 200)

  console.log("Returning some data")

  // The value side must be a string, except for switches which can be a boolean
  return {
    "FoundInDatabase": `${foundInDatabase}`,
    "ApprovedStatusText": approvedStatusText,
    "NotApprovedStatusText": notApprovedStatusText,
    "ApplicationDetailsText": applicationDetailsText,
    "ApplicationStatusHistory": applicationStatusHistoryText,
    "ApiCodeVersionText": process.env.API_CODE_VERSION
  }
}