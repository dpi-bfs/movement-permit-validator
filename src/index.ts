import { OneBlinkAPIHostingRequest } from '@oneblink/cli'
import Boom from '@hapi/boom'
// import * as Globals from './globals.js'
import * as HttpWrapper from './BfsLibrary/httpWrapper.js'
import * as PermitTypes from './permitTypes.mjs'
import * as FormLookupReturnPacket from './formLookupReturnPacket.js'

export async function post(
  request: OneBlinkAPIHostingRequest<{
    definition: Record<string, any>
    element: Record<string, any>
    submission: Record<string, string>
  }>,
) {

  console.log("hello world");
  const triggerElementName = request.body.element.name;
  console.log("triggerElementName", triggerElementName);
  
  if (!request || !request.body || !request.body.submission) {
    throw Boom.badRequest('submission missing')
  }
  const { submission } = request.body

  const PermitSubmissionId = submission["PermitSubmissionId"]
  console.log("PermitSubmissionId", PermitSubmissionId);

  if (!PermitSubmissionId) {
    throw Boom.badRequest(`"PermitSubmissionId isn't giving us a value: ${PermitSubmissionId}`)
  }

  try {
    const data = { submissionID: PermitSubmissionId };
    const url = process.env.POWER_AUTOMATE_HTTP_POST_URL!;

    const permitCaseResponse: HttpWrapper.DatabaseResponse = await HttpWrapper.postData(data, url)
    if (!permitCaseResponse) {
      throw Boom.badRequest('Could not get a permitCaseResponse in time. Please try again.')
    } 

      // Returning a well formed object, without error codes, is enough for the OneBlink UI's Data lookup element
      // to register this as valid.
      // return {} 

      // If we wanted to return values to other elements we'd do something like the following
      // return { 
      //   "TempPicDataTarget": JSON.stringify(submission),
      //   "OtherElement": "Some Value"
      // } 
      console.log("permitCaseResponse", permitCaseResponse);

      const permitCaseDetail: PermitTypes.PermitCaseDetail = JSON.parse(permitCaseResponse.body)

      return FormLookupReturnPacket.getPacket(permitCaseDetail, permitCaseResponse.statusCode)  
  } catch (e) {
    if (e instanceof Boom.Boom && e.output && e.output.statusCode === 404) {
      
      // As this gets inserted into a <p>, use:
      // <br /><br /> if you want paragraphs; and
      // <br /> if you want an end of line
      
      // const invalidMessage = 
      // `Invalid Property Identification Code (PIC). Was not found in the National Livestock Identification System (NLIS) PIC Register.`
      const invalidMessage = "404 error"
      throw Boom.badRequest(invalidMessage)

    } else if (e.output.statusCode === 502 && e.message.includes("The server did not receive a response from an upstream server")) {
      throw Boom.badRequest(`The movement permit code (PermitSubmissionID), ${PermitSubmissionId}, could not be found in the database.`)


    } else {
      console.error(e);
      throw Boom.badImplementation('uncaught error');
    }
  }
}