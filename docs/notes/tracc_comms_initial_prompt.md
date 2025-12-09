I want to start building the infrastructure for Azure Communication Services so I can sent text messages out of this application when a healthcare user creates a new trip. The Azure account details in JSON are below. Is this enough detail for you to test the connection? If you can make a connection don't do anything or write any code. Just write a phased plan in /docs/tracccomms.md to scaffold in the necessary and then what needs to be done in the application to automatically send the text on trip creation. 

{
    "apiVersion": "2024-11-01",
    "id": "/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourceGroups/TraccEms-Dev-USCentral/providers/Microsoft.Web/serverFarms/ASP-TraccEmsDevUSCentral-aa72",
    "name": "ASP-TraccEmsDevUSCentral-aa72",
    "type": "microsoft.web/serverfarms",
    "sku": {
        "name": "B1",
        "tier": "Basic",
        "size": "B1",
        "family": "B",
        "capacity": 1
    },
    "kind": "linux",
    "location": "centralus",
    "tags": {},
    "properties": {
        "serverFarmId": 39068,
        "name": "ASP-TraccEmsDevUSCentral-aa72",
        "workerSize": "Small",
        "workerSizeId": 0,
        "workerTierName": null,
        "numberOfWorkers": 1,
        "currentWorkerSize": "Small",
        "currentWorkerSizeId": 0,
        "currentNumberOfWorkers": 1,
        "status": "Ready",
        "webSpace": "TraccEms-Dev-USCentral-CentralUSwebspace-Linux",
        "subscription": "fb5dde6b-779f-4ef5-b457-4b4d087a48ee",
        "adminSiteName": null,
        "hostingEnvironment": null,
        "hostingEnvironmentProfile": null,
        "maximumNumberOfWorkers": 3,
        "planName": "VirtualDedicatedPlan",
        "adminRuntimeSiteName": null,
        "computeMode": "Dedicated",
        "siteMode": null,
        "geoRegion": "Central US",
        "perSiteScaling": false,
        "elasticScaleEnabled": false,
        "maximumElasticWorkerCount": 1,
        "numberOfSites": 1,
        "hostingEnvironmentId": null,
        "isSpot": false,
        "spotExpirationTime": null,
        "freeOfferExpirationTime": "2025-12-05T19:55:51.493Z",
        "tags": {},
        "kind": "linux",
        "resourceGroup": "TraccEms-Dev-USCentral",
        "reserved": true,
        "isXenon": false,
        "hyperV": false,
        "mdmId": "waws-prod-dm1-263_39068",
        "targetWorkerCount": 0,
        "targetWorkerSizeId": 0,
        "targetWorkerSku": null,
        "provisioningState": "Succeeded",
        "webSiteId": null,
        "existingServerFarmIds": null,
        "kubeEnvironmentProfile": null,
        "zoneRedundant": false,
        "maximumNumberOfZones": 3,
        "currentNumberOfZonesUtilized": 1,
        "migrateToVMSS": null,
        "vnetConnectionsUsed": 0,
        "vnetConnectionsMax": 2,
        "createdTime": "2025-11-05T19:55:54.646Z",
        "asyncScalingEnabled": false,
        "isCustomMode": false,
        "powerState": "Running",
        "eligibleLogCategories": ""
    }
}

Here are the TraccComms resource details:


    "apiVersion": "2025-05-01",
    "id": "/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourceGroups/DefaultResourceGroup-EUS2/providers/Microsoft.Communication/CommunicationServices/TraccComms",
    "name": "TraccComms",
    "type": "microsoft.communication/communicationservices",
    "location": "global",
    "tags": {},
    "properties": {
        "provisioningState": "Succeeded",
        "hostName": "tracccomms.unitedstates.communication.azure.com",
        "immutableResourceId": "a6e443fe-ad27-460b-bf86-d191649c7dce",
        "dataLocation": "United States"
    },
    "systemData": {
        "createdBy": "chuck@traccems.com",
        "createdByType": "User",
        "createdAt": "2025-11-29T19:37:12.95Z",
        "lastModifiedBy": "chuck@traccems.com",
        "lastModifiedByType": "User",
        "lastModifiedAt": "2025-11-29T19:37:12.95Z"
    }
}


Toll Free Number
+18339675959

Endpoint
https://tracccomms.unitedstates.communication.azure.com/

Key
[REDACTED - Obtain from Azure Portal → Communication Services → Keys]

Connection String
endpoint=https://tracccomms.unitedstates.communication.azure.com/;accesskey=[YOUR_ACCESS_KEY_HERE] 