/**
 * Source: "John Bentley's \OneDrive - DPIE\Documents\Sda\Code\Typescript\library\"
 * Warning: Don't edit outside of that location.
 * Author: John Bentley
 */
import AbortController from 'abort-controller'

import * as Http from './http.js'
export { DatabaseResponse } from './http.js'

export async function postData(data: object, url: string): Promise<Http.DatabaseResponse> {

  const abortController = new AbortController()
  let timeoutId: NodeJS.Timeout

  const spatialPromise = new Promise<Http.DatabaseResponse>((resolve, reject) => {
    Http.sendRequest(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
      signal: abortController.signal,
    }).then((response: Http.DatabaseResponse) => {
      console.log('Response from database: ', response)
      timeoutId && clearTimeout(timeoutId)
      resolve(response)
    }, reject)
  })

  const timeoutPromise = new Promise<Http.DatabaseResponse>((resolve) => {
    timeoutId = setTimeout(() => {
      console.log('Database timed out, returning 200')
      abortController.abort()
      const abortPacket: Http.DatabaseResponse = { body: "Aborted", statusCode: 400}
      resolve(abortPacket)
    }, 24000)
  })
  
  return await Promise.race([spatialPromise, timeoutPromise])
}