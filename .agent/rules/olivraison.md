---
trigger: always_on
---

Olivraison Server to server API
 1.0.0 
OAS 2.0
[ Base URL: partners.olivraison.com/ ]
Bienvenue à l'API OLIVRAISON, votre solution complète pour la gestion de la livraison.Pour accéder à notre API, vous aurez besoin d'un token d'authentification.Vous pouvez l'obtenir en envoyant une requête POST à l'endpoint /auth/login avec vos identifiants. Après avoir obtenu le token, assurez-vous de l'inclure dans l'en-tête 'Authorization' de chaque requête sous la forme 'Bearer [votre token]'.
Notre API renvoie des codes d'état HTTP appropriés et des messages descriptifs en cas d'erreur. Par exemple, une réponse à une requête non autorisée pourrait ressembler à : { 'code': '001', 'description': 'Missing request body' }.

Schemes

http
root


GET
/
The start endpoint

Parameters
Try it out
No parameters

Responses
Response content type

application/json
Code	Description
200	
Success !

Example Value
Model
"string"
405	
Invalid input

Server Auth


POST
/auth/login
Authenticate your server

Parameters
Try it out
Name	Description
Login *
object
(body)
Example Value
Model
{
  "apiKey": "string",
  "secretKey": "string"
}
Parameter content type

application/json
Responses
Response content type

application/json
Code	Description
200	
Success !

Example Value
Model
{
  "token": "string",
  "expiration": "string"
}
401	
Client not found

The list of status


GET
/status_list
the list of available status

Parameters
Try it out
Name	Description
authorization *
(header)
authorization
Responses
Response content type

application/json
Code	Description
200	
Success !

Example Value
Model
[
  "string"
]
401	
Client not authorized


GET
/status_list/v2
the list of available status

Parameters
Try it out
Name	Description
authorization *
(header)
authorization
Responses
Response content type

application/json
Code	Description
200	
Success !

Example Value
Model
[
  {
    "parcel_statut_code": "string",
    "parcel_statut_label": "string"
  }
]
401	
Client not authorized

The list of cities


GET
/cities
the list of cities

Parameters
Try it out
Name	Description
authorization *
(header)
authorization
Responses
Response content type

application/json
Code	Description
200	
Success !

Example Value
Model
[
  "string"
]
401	
Client not authorized

The list of products


GET
/products
the list of products

Parameters
Try it out
Name	Description
authorization *
(header)
authorization
Responses
Response content type

application/json
Code	Description
200	
Success !

Example Value
Model
[
  "string"
]
401	
Client not authorized

Package details


GET
/package
Get list of packages

Parameters
Try it out
Name	Description
authorization *
(header)
authorization
page
integer
(query)
Default value : 1

1
limit
integer
(query)
Default value : 10

10
Responses
Response content type

application/json
Code	Description
200	
Success !

Example Value
Model
{
  "data": [
    {
      "trackingID": "string",
      "status": "string",
      "price": 0
    }
  ],
  "pagination": {
    "total": 0,
    "page": 0,
    "limit": 0,
    "pages": 0
  }
}
401	
Client not authorized

404	
Customer not found


GET
/package/{trackingID}
package details

Parameters
Try it out
Name	Description
trackingID *
(path)
trackingID
authorization *
(header)
authorization
Responses
Response content type

application/json
Code	Description
200	
Success !

Example Value
Model
{
  "meta": {
    "createAt": "string",
    "updateAt": "string"
  },
  "paid": true,
  "invoice": true,
  "invoiceDriver": true,
  "pickup": true,
  "name": "string",
  "status": "string",
  "comment": "string",
  "COD": "string",
  "origin": {
    "name": "string",
    "streetAddress": "string",
    "city": "string",
    "phone": "string",
    "email": "string",
    "company": "string",
    "website": "string",
    "login": "string"
  },
  "destination": {
    "_id": "string",
    "name": "string",
    "streetAddress": "string",
    "city": "string",
    "phone": "string"
  },
  "history": [
    {
      "updateAt": "2026-02-12T10:50:05.419Z",
      "_id": "string",
      "user": "string",
      "status": "string"
    }
  ],
  "trackingID": "string",
  "returnRequested": true,
  "deliveryFees": 0,
  "returnedFees": 0,
  "canceledFees": 0
}
401	
Client not authorized


PUT
/package/{trackingID}
package details

Parameters
Try it out
Name	Description
trackingID *
(path)
trackingID
authorization *
(header)
authorization
Responses
Response content type

application/json
Code	Description
200	
Success !

Example Value
Model
{
  "_id": {
    "$oid": "string"
  },
  "meta": {
    "createAt": "string",
    "updateAt": "string"
  },
  "paid": true,
  "invoice": true,
  "invoiceDriver": true,
  "pickup": true,
  "name": "string",
  "status": "string",
  "comment": "string",
  "COD": "string",
  "origin": {
    "name": "string",
    "streetAddress": "string",
    "city": "string",
    "phone": "string",
    "email": "string",
    "company": "string",
    "website": "string",
    "login": "string"
  },
  "destination": {
    "_id": "string",
    "name": "string",
    "streetAddress": "string",
    "city": "string",
    "phone": "string"
  },
  "history": [
    {
      "updateAt": "2026-02-12T10:50:05.422Z",
      "_id": "string",
      "user": "string",
      "status": "string"
    }
  ],
  "trackingID": "string",
  "returnRequested": true
}
401	
Client not authorized

Create a package with status CONFIRMED


POST
/package
create a new packagewith status CONFIRMED

Parameters
Try it out
Name	Description
authorization *
(header)
authorization
Package details *
object
(body)
Example Value
Model
{
  "price": 0,
  "comment": "string",
  "description": "string",
  "inventory": true,
  "name": "string",
  "destination": {
    "name": "string",
    "phone": "string",
    "city": "string",
    "streetAddress": "string"
  },
  "pickup_address": {
    "streetAddress": "string",
    "city": "string",
    "phone": "string",
    "company": "string",
    "email": "string",
    "website": "string"
  }
}
Parameter content type

application/json
Responses
Response content type

application/json
Code	Description
200	
Success !

Example Value
Model
{
  "status": "string",
  "customer": "string",
  "trackingID": "string"
}
401	
Client not authorized

Create a package with status CREATED


POST
/package/new
create a new package with status CREATED

Parameters
Try it out
Name	Description
authorization *
(header)
authorization
Package details *
object
(body)
Example Value
Model
{
  "price": 0,
  "comment": "string",
  "description": "string",
  "inventory": true,
  "name": "string",
  "destination": {
    "name": "string",
    "phone": "string",
    "city": "string",
    "streetAddress": "string"
  },
  "pickup_address": {
    "streetAddress": "string",
    "city": "string",
    "phone": "string",
    "company": "string",
    "email": "string",
    "website": "string"
  }
}
Parameter content type

application/json
Responses
Response content type

application/json
Code	Description
200	
Success !

Example Value
Model
{
  "status": "string",
  "customer": "string",
  "trackingID": "string"
}
401	
Client not authorized

Delete Package


DELETE
/package/{trackingID}
delete package

Parameters
Try it out
Name	Description
trackingID *
(path)
trackingID
authorization *
(header)
authorization
Responses
Response content type

application/json
Code	Description
200	
Success !

Example Value
Model
{
  "message": "string",
  "trackingID": "string"
}
400	
No confirmed package found

401	
Client not authorized

Update a package status


POST
/package/status
update a package status

Parameters
Try it out
Name	Description
authorization *
(header)
authorization
Update status *
object
(body)
Example Value
Model
{
  "trackingID": "string",
  "status": "string",
  "reportedTo": "string"
}
Parameter content type

application/json
Responses
Response content type

application/json
Code	Description
200	
Success !

Example Value
Model
{
  "message": "string"
}
401	
Client not authorized

Update package details


POST
/package/update
update package details

Parameters
Try it out
Name	Description
authorization *
(header)
authorization
Update package *
object
(body)
Example Value
Model
{
  "customerId": "string",
  "name": "string",
  "status": "string",
  "comment": "string",
  "COD": "string",
  "origin": {
    "name": "string",
    "streetAddress": "string",
    "city": "string",
    "phone": "string",
    "email": "string",
    "company": "string",
    "website": "string",
    "login": "string"
  },
  "destination": {
    "_id": "string",
    "name": "string",
    "streetAddress": "string",
    "city": "string",
    "phone": "string"
  },
  "transport": {
    "pickupDriver": "string",
    "collectionDriver": "string",
    "endDriver": "string",
    "subDriver": "string",
    "subDriverName": "string",
    "transit": "string",
    "currentDriverName": "string",
    "currentDriverPhone": "string"
  },
  "customer": {
    "login": "string",
    "email": "string",
    "roles": [
      "string"
    ]
  },
  "support": {
    "name": "string",
    "phone": "string",
    "managerName": "string",
    "managerPhone": "string"
  },
  "fullfillment": {
    "id": "string",
    "name": "string",
    "price": 0,
    "quantity": 0,
    "reference": 0,
    "options": [
      {
        "name": "string",
        "values": [
          "string"
        ]
      }
    ]
  },
  "note": "string",
  "description": "string",
  "noOpen": true,
  "reportedTo": "string",
  "inventory": true,
  "exchange": true,
  "exchangePackage": "string"
}
Parameter content type

application/json
Responses
Response content type

application/json
Code	Description
200	
Success !

Example Value
Model
{
  "message": "string",
  "trackingID": "string"
}
401	
Client not authorized


POST
/pickup
update package details

Parameters
Try it out
Name	Description
authorization *
(header)
authorization
Update package *
object
(body)
Example Value
Model
{
  "packages": [
    "string"
  ]
}
Parameter content type

application/json
Responses
Response content type

application/json
Code	Description
200	
Success !

Example Value
Model
[
  {
    "packages": [
      {
        "trackingID": "string",
        "status": "string"
      }
    ],
    "stickerFilePath": "string",
    "sipFilePath": "string"
  }
]
401	
Client not authorized

Blacklisted destinations


GET
/package/blacklisted-destinations/{phoneNumber}
Check if a destination phone is blacklisted

Parameters
Try it out
Name	Description
phoneNumber *
(path)
phoneNumber
authorization *
(header)
authorization
Responses
Response content type

application/json
Code	Description
200	
Success !

Example Value
Model
{
  "phone": "string",
  "name": "string",
  "count": 0,
  "blacklisted": true
}
401	
Client not authorized

500	
Internal server error


POST
/package/blacklisted-destinations/bulk
Check a list of destination phones for blacklist status

Parameters
Try it out
Name	Description
authorization *
(header)
authorization
phones *
object
(body)
Example Value
Model
{
  "phones": [
    "string"
  ]
}
Parameter content type

application/json
Responses
Response content type

application/json
Code	Description
200	
Success !

Example Value
Model
{
  "results": [
    {
      "phone": "string",
      "name": "string",
      "count": 0,
      "blacklisted": true
    }
  ]
}
400	
Invalid request body

401	
Client not authorized

500	
Internal server error