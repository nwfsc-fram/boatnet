# ashop-test

## Config file setup
Each app is controlled by a config file stored in pouch lookups in the boatnet-config-lookup view. To create another app follow the following format: 

### validAppViews
Specifies which pages the app is allowed to navigate to. To find which name to use, reference the router.ts file and use the name specified there. 

### navigationDrawerItems
This controls which menu items show up in the left menu bar. Each menu item has the format displayed below.
```
"to": "/comments", // this is the path variable specified in the rotuer.ts file
"icon": "note",  // name of icon selected from list: https://material.io/resources/icons/?style=baseline
"label": "Notes"
```
### Login 
Setup for login page.  
```
"appName": "ASHOP", // banner name
"statInfo": { // specify fields to show up in top left corner.
  "Last Software Update Date": "",
  "Last Data Sync": "",
  "Last Login Date": "",
  "Quasar Version": ""
}
```

### Different input fields to choose from for different detail pages: 
Date Time Formatter: 
```
"displayName": "Departure Date / Time",
"modelName": "departureDate",
"type": "dateTime",
"showDate": true,
"showTime": true,
"timeOnly": false,
"hourFormat": "12",
"maxDate": "today",
"manualInput": true,
"required": true,
"validations": "",
"tripPhase": "start"
```
Input field with optional list
```
"displayName": "Departure Port",
"modelName": "departurePort",
"type": "input",
"keyboardType": "compact",
"list": [
   "baby shark",
   "mama shark",
   "daddy shark",
   "nemo",
   "whale"
]
```

### Summary page
Which columns to show on summary page. 
```
"hauls": {
  "itemNumName": "haulNum", //either operationNum or haulNum
  "columns": [ //which columns to show in summary table. 
  {
    "name": "haulNum",
    "required": true,
    "label": "Haul #",
    "align": "left",
    "field": "haulNum",
    "sortable": true,
    "type": "number",
    "width": "10%"
  }]
}
```
