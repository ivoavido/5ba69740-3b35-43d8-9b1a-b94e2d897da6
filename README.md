## Description

Services Endpoint.

For this specific endpoint two entities were defined service and version, which have a one to many relationship between them. These tables have been defined by creating their models and delegating their creation to the typeorm library, which creates the tables at start-up if they do not exist.

The UUID format has been chosen as the identifier for entities, except for versions, which do not display their id and it is numeric. A version can be identified by the pair service uuid and version number.

In order to complete the task two GET endpoints were created. The first provides a list of services with uuid, name, description and version counter. Together with the list, a ‘meta’ object is returned which contains all the useful information for pagination. In order to support pagination, the request accepts as queries params 'page' to specify the page number and 'size' to indicate the page size. As far as sorting is concerned, it is possible to provide the order parameter (ASC|DESC) which will apply the sorting to the name field. the possibility of specifying the field on which to do the sorting (sort_field) has also been provided, but currently it only makes sense for name. It is also possible to filter the list by providing the search parameter to filter on the name field or description by specify search_field. For the second task, it is possible to retrieve the list of versions for a specific service using the /services/:uuid?versions=true endpoint. The 'versions' parameter was added to simulate an optimization  in order to avoid a join between tables.

The service exposes the APIs to be able to populate/manage the database. In particular, it was decided to implement two creation APIs, the first for creating services and the second for adding versions to a service. APIs are not bulk and the current implementation only allow the creation of one service/version at a time.
Alongside the creation endpoints, the delete endpoints for services and versions was also provided. Deleting a service automatically deletes all versions associated with it. It is possible to delete a version by specifying the service uuid and version number.

A "patch" endpoint has been implemented supporting name and description. With regard to versions, since there are no relationships or particular fields, the delete and create endpoints are sufficient.

Along with authorization control via a jwt, a role concept, read and write, was also introduced. POST/PATCH/DELETE calls can only be executed by users with the write role. Authorization and role check have been implemented with two middlewares.

E2E tests were chosen in order to test whether the behaviour of the entire flow was as desired. Implemented tests do not cover all functionalities.

The entire project is to be considered a base to be improved later by extending logging, testing and comprehensive controls.

## Environment variables

Use the `.env` file to configure the system

```
SERVER_PORT=3000
DB_USER=kong
DB_PASSWORD=uY/B4A03Ox35
DB_SCHEMA=kongdb
DB_PORT=5432
DB_HOST=localhost
DB_SYNC=false
JWT_SECRET=qwertyuiopasdfghjklzxcvbnm123456

```

## Projects commands

```bash

# install dependencies
$ npm install

# development
$ npm run start

# run e2e tests
$ npm run test:e2e
```

## Endpoints

| **Method** | **Path** | **params** | **Description** |
|--------------|--------------|--------------|--------------|
| GET | /services | search, page, size, order, field | Retrieve a list of services  |
| GET | /services/:uuid  | versions | Retrieve a specific service with/without versions  |
| POST | /services  | | Create a new service  |
| PATCH | /services/:uuid  | | Patch name or description of a service  |
| DELETE | /services/:uuid | | Delete a service  |
| POST | /services/:uuid/versions | | Create a new version for a specific service  |
| DELETE | /services/:uuid/verisons | | Delete a service version  |

For the full endpoints specification check the file `swagger.yaml`

## Authorization

All endpoints require authentication. Basic authentication is implemented and can be provided using the "Authorization" header with Bearer and a jwt token.

`Authorization: Bearer JWT_TOKEN`

Use this example JWT tokens to get authorized in the system.

```bash
# Read and Write user

eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJLb25nIiwiaWF0IjoxNzI1NzgzNzA3LCJleHAiOjE3NTczMTk3MDcsImF1ZCI6IiIsInN1YiI6ImJhNWUxMzA4LWRkN2MtNGIxMS1hNGFiLWIyMzA1ZjNiNTEwMyIsImdpdmVubmFtZSI6IkpvaG4iLCJzdXJuYW1lIjoiRG9lIiwiZW1haWwiOiJqZG9lQGtvbmcuY29tIiwicm9sZXMiOlsicmVhZCIsIndyaXRlIl0sIm9yZ2FuaXphdGlvbl91dWlkIjoiN2M2NzFmM2ItM2IxZC00OWI0LWI4N2ItNjZiZDhlMmRlYjRlIn0.wPV70J-kkA4-a189xoNuIjU5HxtiMs5DEpBZMCGWiyA

# Read only user

eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJLb25nIiwiaWF0IjoxNzI1NzgzNzA3LCJleHAiOjE3NTczMTk3MDcsImF1ZCI6IiIsInN1YiI6ImJhNWUxMzA4LWRkN2MtNGIxMS1hNGFiLWIyMzA1ZjNiNTEwMyIsImdpdmVubmFtZSI6IkpvaG4iLCJzdXJuYW1lIjoiRG9lIiwiZW1haWwiOiJqZG9lQGtvbmcuY29tIiwicm9sZXMiOiJyZWFkIiwib3JnYW5pemF0aW9uX3V1aWQiOiI3YzY3MWYzYi0zYjFkLTQ5YjQtYjg3Yi02NmJkOGUyZGViNGUifQ.QQ4EGvFPUijOxO-osJw-OdoWYPBEBTrHJJ0Sk9nDXxc
```

These tokens are generated with the the jwt_secret provided in the `.env` file.

## Testing

e2e testing has been provided for the services endpoint. In order to run tests please wipe your database tables and set `JWT_SECRET` to `qwertyuiopasdfghjklzxcvbnm123456`