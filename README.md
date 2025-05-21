# API Request Response Mocker

A service to manage mock endpoints (GET, POST, PUT, DELETE). This allows dynamic creation, retrieval, updating, and deletion of mock APIs, along with the ability to append new responses.

---

## 📘 API Overview

**Base URL**: _`/` (assumed)_

**Version**: 1.0

---

## 📚 Endpoints

### 🔹 Create a Mock API

**POST** `/mock`

- **Summary**: Create a new mock API
- **Request Body**: [CreateMockApiDto](#createmockapidto)
- **Responses**:
  - `201`: Mock API created – returns [MockEndpoint](#mockendpoint)
  - `400`: Validation error

---

### 🔹 Update a Mock API

**PUT** `/mock`

- **Summary**: Update an existing mock API
- **Request Body**: [UpdateMockRequestDto](#updatemockrequestdto)
- **Responses**:
  - `200`: Mock API updated – returns [MockEndpoint](#mockendpoint)
  - `400`: Validation error

---

### 🔹 List All Mock APIs

**GET** `/mock`

- **Summary**: List all mock APIs
- **Query Parameters**:
  - `project` (optional): Filter by project name
- **Responses**:
  - `200`: List of mock APIs – returns array of [MockEndpoint](#mockendpoint)

---

### 🔹 Append a New Response

**POST** `/mock/add/response`

- **Summary**: Append new responses to an existing mock API
- **Request Body**: [AppendResponseDto](#appendresponsedto)
- **Responses**:
  - `200`: Response appended – returns [MockEndpoint](#mockendpoint)
  - `400`: Validation error

---

### 🔹 List All Mock API Paths

**GET** `/mock/path`

- **Summary**: List all mock API paths only
- **Query Parameters**:
  - `project` (optional): Filter by project name
- **Responses**:
  - `200`: Array of paths – returns [MockEndpointPathResponseDto](#mockendpointpathresponsedto)

---

### 🔹 Get Mock API Details by ID

**GET** `/mock/{id}`

- **Summary**: Get mock API details by ID
- **Path Parameter**:
  - `id` (string) – ID of the mock API
- **Responses**:
  - `200`: Array of [MockEndpoint](#mockendpoint)
  - `400`: Validation error

---

### 🔹 Delete a Mock API by ID

**DELETE** `/mock/{id}`

- **Summary**: Delete a mock API by ID
- **Path Parameter**:
  - `id` (string) – ID of the mock API
- **Responses**:
  - `200`: Boolean (true/false)
  - `400`: Validation error

---

## 🧱 Schemas

### CreateMockApiDto

```json
{
  "project": "KP",
  "path": "/api/user",
  "method": "POST",
  "responses": [
    {
      "request": { "userId": 5000050535 },
      "responseHeader": { "project-name": "KP" },
      "response": { "message": "Success" },
      "statusCode": 200,
      "delay": 0
    }
  ]
}
```

### UpdateMockRequestDto
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "project": "KP",
  "method": "POST",
  "path": "/api/user",
  "responses": [
    {
      "request": { "userId": 5000050535 },
      "responseHeader": { "project-name": "KP" },
      "response": { "message": "Success" },
      "statusCode": 200,
      "delay": 0
    }
  ]
}

```

### AppendResponseDto
```json
{
  "apiPath": "/api/user",
  "project": "KP",
  "newResponse": {
    "request": { "userId": 5000050535 },
    "responseHeader": { "project-name": "KP" },
    "response": { "message": "Success" },
    "statusCode": 200,
    "delay": 0
  }
}
```

### MockEndpoint
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "project": "KP",
  "method": "POST",
  "path": "/api/user",
  "responses": [
    {
      "request": { "userId": 5000050535 },
      "responseHeader": { "project-name": "KP" },
      "response": { "message": "Success" },
      "statusCode": 200,
      "delay": 0
    }
  ]
}

```

### MockResponse
```json
{
  "request": { "userId": 5000050535 },
  "responseHeader": { "project-name": "KP" },
  "response": { "message": "Success" },
  "statusCode": 200,
  "delay": 0
}
```

### MockEndpointPathResponseDto

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "path": "/api/user"
}

```

## 🛠 Tech Stack
- NestJS
- Swagger / OpenAPI 3.0
- TypeScript

## 📞 Contact
For any issues or feature requests, please contact the developer `sudipto.chowdhury@konasl.com` or `+8801753116311`