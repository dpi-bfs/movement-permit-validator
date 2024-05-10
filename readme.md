## Movement Permit Validation

### Basics

This validates a movement permit with respect to any pest or disease requiring a movement permit. 

Given a submissionId, this is passed on to a Power Automate flow - BfsPermitsApi - that returns data from the Max NSW Permits database as a JSON Packet. This code processes that JSON Packet into a format for consumption by the OneBlink form.

### Prefill URL

A movement permit QR code will resolve to a url with query parameters like the following ...

https://nswfoodauthority-dpi-forms-dev.cdn.oneblink.io/forms/18978?preFillData={"PermitSubmissionId":"4acd559a-6940-43f9-b427-1c8c6df95306"}

https://nswfoodauthority-dpi-forms-dev.cdn.oneblink.io/forms/18978?preFillData=%7B%22PermitSubmissionId%22%3A%224acd559a-6940-43f9-b427-1c8c6df95306%22%7D


### Testing SubmissionIds

#### Power Automate Testing

In Postman:
POST to
https://prod-13.australiasoutheast.logic.azure.com:443/workflows/1cf5dada88e34458a27b6470b8f1e2db/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=73svUT62sB12JwB5Q_K8XRz0BFh8lpIDMiwh6SnT_7w

Body:

    {
        "SubmissionId": "4acd559a-6940-43f9-b427-1c8c6df95306"
    }

Approved  SubmissionId: 4acd559a-6940-43f9-b427-1c8c6df95306
Withdrawn SubmissionId: 4fb7f766-5787-465e-890b-f2287b19da59

#### OneBlink API local testing

* In Visual Studio Code ensure you add the following folder to your workspace ...

    ...Code\Typescript\BfsLibrary

    The package.json is setup to watch changes in that folder and copy files across

* Start the API, serving it locally

    npx oneblink api serve

* In Postman POST some data:

  + Browser
    - Load the form https://nswfoodauthority-dpi-forms-dev.cdn.oneblink.io/forms/18978?preFillData={%22PermitSubmissionId%22:%224acd559a-6940-43f9-b427-1c8c6df95306%22}
    - Open the Dev Panel > Network > XHR >  POST https://nswfoodauthority-movement-permit-validation-dev.api.oneblink.io/permit-status
    - Right click > Copy Value > Copy Post Data
  
  + Postman
    - New 
    - POST: http://localhost:3000/permit-status
    - Body > raw > JSON
    - Paste your "Copy Post Data"
    - Beautify
    - [Send]
    - Observe data that the API returns to the OneBlink Form.

### (Deprecated) Working with Typescript/library (now "Typescript/BfsLibrary")

* In MovementPermitValidator we have package.json

    "config": {
      "externalLibraryPath": "../../../Typescript/library/",
      "externalLibraryFileList": " dateTime.* httpWrapper.* http.*"
    },
    "scripts": {
      "print": "echo %npm_package_config_externalLibraryPath%",
      "watch-typescript": "npx tsc --watch",
      "mirror-library-files": "robocopy %npm_package_config_externalLibraryPath% src/lib %npm_package_config_externalLibraryFileList% /MIR /lev:1",
      "watch-library-files": "chokidar %npm_package_config_externalLibraryPath%*.{ts,mts} -c \"npm run mirror-library-files\" --initial",
      "clean": "rimraf out src/lib",
      "watch": "npm-run-all clean --parallel watch-library-files watch-typescript",
      "start": "node ./out/index.js"
    },

* Open a terminal instance in MovementPermitValidation root; then   
    npm run watch

* Open a terminal instance in Library root; then   
    npm run watch

* Update library code in the /Typescript/library/, not MovementPermitValidator

### Working with Typescript/BfsLibrary

Typescript/BfsLibrary has been added as a Git submodule to MovementPermitValidation.

* At Typescript/BfsLibrary:
  - Work on code.
  - In your Git client for Typescript/BfsLibrary make a commit

* MovementPermitValidator SmartGit. 
  - MovementPermitValidator/src/BfsLibrary > Right Click > [Pull ...] > [Pull]
  - MovementPermitValidator/ observe that among the changes is "BfsLibrary" Modified
  - [Commit]

### Developer Key/Deployment Keys

We use the "Movement Permit Validation" developer key. Privileges for "Forms" and "APIs" (deployment keys). OneBlink Console > Developer Tools > Developer Keys > "Movement Permit Validation"

"Deployment Keys" are the values found for the "Movement Permit Validation" developer key, and in virtue of "APIs" privileges being set. These values are also stored in .blinkmrc.json.

Set from a Windows Terminal running powershell like this ...

$ENV:ONEBLINK_ACCESS_KEY="TheKeyId"
$ENV:ONEBLINK_SECRET_KEY="TheKeySecret"

See "Use deployment keys" John Bentley's Sda\Info\OneBlink\OneBlink-ApiNotes.md

### Update Code Quick Reference

* Develop using a custom watch command. Rename this terminal process "Watch"

      npm run watch

* In another terminal ....

* Check for updates

      npx ncu --upgrade

* Update packages

      npm install

* Set Deployment Keys.

      $ENV:ONEBLINK_ACCESS_KEY="TheKeyId"
      $ENV:ONEBLINK_SECRET_KEY="TheKeySecret"      

* In another terminal process Deploy

      npx oneblink api deploy --env dev;Get-Date

See also, for a general guide to OneBlink's API and CLI see John Bentley's Sda\Info\OneBlink\OneBlinkApiNotes.md