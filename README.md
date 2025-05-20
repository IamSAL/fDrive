# Mock API Service

This project provides a RESTful API to create, manage, and retrieve mock endpoints. It can be used for simulating APIs during development or testing.

## 📚 API Overview

- **Base Path**: `/`
- **Version**: 1.0
- **OpenAPI**: 3.0.0
- **Tag**: Mock APIs

## 📦 Endpoints

### 1. Create a Mock API

- **POST** `/mock`
- **Description**: Create a new mock API.
- **Request Body**:
    - Content-Type: `application/json`
    - Schema: `MockEndpoint`
- **Response**: `201 Created`  
  Returns the created mock endpoint.

---

### 2. List All Mock APIs

- **GET** `/mock`
- **Description**: List all existing mock APIs.
- **Query Parameters**:
    - `project` (optional): Filter by project name.
- **Response**: `200 OK`  
  Returns an array of `MockEndpoint` objects.

---

### 3. Append a Response to an Existing Mock

- **POST** `/mock/append/response`
- **Description**: Append a new mock response to an existing endpoint.
- **Request Body**:
    - Schema: `AppendResponseDto`
- **Response**: `200 OK`  
  Updated `MockEndpoint`.

---

### 4. Get All Mock API Paths

- **GET** `/mock/path`
- **Description**: Retrieve all mock endpoint paths.
- **Query Parameters**:
    - `project` (optional): Filter by project.
- **Response**: `200 OK`  
  Returns an array of `MockEndpointPath`.

---

### 5. Get Mock API Details by ID

- **GET** `/mock/{id}`
- **Description**: Retrieve full details for a specific mock API.
- **Path Parameter**:
    - `id`: ID of the mock endpoint.
- **Response**: `200 OK`  
  Returns an array of `MockEndpoint` (typically one item).

---

### 6. Delete a Mock API

- **DELETE** `/mock/{id}`
- **Description**: Delete a mock endpoint by ID.
- **Path Parameter**:
    - `id`: ID of the mock to delete.
- **Response**: `200 OK`  
  Returns a boolean indicating success.

---

## 🧩 Schema Definitions

### 🔹 MockEndpoint

```json
{
  "id": "string",
  "project": "string",
  "method": "GET | POST | PUT | DELETE",
  "path": "string",
  "responses": [MockResponse]
}

```

### 🔹 MockResponse

```json
{
    "request": { "userId": 12345 },
    "responseHeader": { "project-name": "KP" },
    "response": { "message": "Success" },
    "statusCode": 200,
    "delay": 0
}

```


### 🔹 AppendResponseDto

```json
{
  "apiPath": "/api/user",
  "project": "KP",
  "newResponse": MockResponse
}


```

### 🔹 MockEndpointPath

```json
{
  "id": "string",
  "path": "/api/user"
}

```

## 🚀 Getting Started
To use this API:
- Start the NestJS server.
- Visit Swagger UI (typically hosted at /api if configured).

### Use Postman or curl to test the endpoints.

```bash
curl -X POST http://localhost:3000/mock \
-H "Content-Type: application/json" \
-d '{
  "project": "KP",
  "method": "POST",
  "path": "/api/user",
  "responses": [{
    "response": {
      "message": "Mocked Response"
    },
    "statusCode": 200
  }]
}'
```

## 🛠 Tech Stack
- NestJS
- Swagger / OpenAPI 3.0
- TypeScript

## 📞 Contact
For any issues or feature requests, please contact the developer `sudipto.chowdhury@konasl.com` or `+8801753116311`