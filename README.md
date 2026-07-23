# 🚀 Task Management API

A RESTful Task Management API built with **Node.js**, **Express.js**, **MongoDB**, and **JWT Authentication**. The API allows users to create projects, invite members, assign tasks, manage attachments, and control access using Role-Based Access Control (RBAC).

---

# 📌 Features

## 🔐 Authentication
- User Registration
- User Login
- JWT Authentication
- Refresh Token Authentication
- Logout
- Change Password
- Forgot Password
- Reset Password
- Email Verification

---

## 👤 User Management

- Get Current User
- Update Profile
- Update Avatar
- Change Password

---

## 📁 Project Management

- Create Project
- Get All Projects
- Get Single Project
- Update Project
- Delete Project

---

## 👥 Project Members

- Add Members to Project
- Remove Members
- Update Member Roles
- Get All Project Members

---

## ✅ Task Management

- Create Task
- Get All Tasks
- Get Task by ID
- Update Task
- Delete Task
- Assign Tasks
- Add Attachments
- Set Due Date
- Track Task Status

---

## 🔑 Authorization

Role-Based Access Control (RBAC) is implemented using middleware.

Available Roles:

- Admin
- Project Admin
- Member

Permissions are validated before allowing access to protected routes.

Example:

```javascript
router.put(
  "/:projectId",
  verifyJWT,
  validateProjectPermission(["ADMIN"]),
  UpdateProject
);
```

---

# 🛠️ Tech Stack

## Backend
- Node.js
- Express.js

## Database
- MongoDB
- Mongoose

## Authentication & Security
- JWT (JSON Web Token)
- bcrypt

## File Upload
- Multer
- Cloudinary

## Email Service
- Nodemailer
- Mailgen

## Validation
- Mongoose Validation

---

# 📂 Project Structure

```
src
│
├── controllers
├── models
├── routes
├── middlewares
├── utils
├── db
├── constants
├── validators
├── services
├── public
└── app.js
```

---

# 📦 Installation

Clone the repository

```bash
git clone <repository-url>
```

Move to the project directory

```bash
cd task-management-api
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
PORT=8000

MONGODB_URI=

ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=

REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASSWORD=

CORS_ORIGIN=http://localhost:3000
```

Run the development server

```bash
npm run dev
```

---

# 🔐 Authentication Flow

```
Register
     │
     ▼
Verify Email
     │
     ▼
Login
     │
     ▼
Receive Access Token & Refresh Token
     │
     ▼
Access Protected Routes
     │
     ▼
Refresh Token When Access Token Expires
```

---

# 📁 Project Workflow

```
Create Project
      │
      ▼
Add Members
      │
      ▼
Assign Roles
      │
      ▼
Create Tasks
      │
      ▼
Assign Tasks
      │
      ▼
Update Task Status
      │
      ▼
Complete Project
```

---

# 📋 Task Status

Supported Task Statuses:

- TODO
- IN_PROGRESS
- DONE

---

# 🔑 Role Permissions

| Action | Admin | Project Admin | Member |
|--------|:-----:|:-------------:|:------:|
| Create Project | ✅ | ❌ | ❌ |
| Update Project | ✅ | ✅ | ❌ |
| Delete Project | ✅ | ❌ | ❌ |
| Add Members | ✅ | ✅ | ❌ |
| Remove Members | ✅ | ✅ | ❌ |
| Create Task | ✅ | ✅ | ✅ |
| Assign Task | ✅ | ✅ | ❌ |
| Update Task | ✅ | ✅ | Assigned User |
| Delete Task | ✅ | ✅ | ❌ |

---

# 📚 API Endpoints

## Authentication

```http
POST   /api/v1/users/register
POST   /api/v1/users/login
POST   /api/v1/users/logout
POST   /api/v1/users/refresh-token
POST   /api/v1/users/change-password
POST   /api/v1/users/forgot-password
POST   /api/v1/users/reset-password
GET    /api/v1/users/current-user
```

---

## Projects

```http
POST    /api/v1/projects
GET     /api/v1/projects
GET     /api/v1/projects/:projectId
PUT     /api/v1/projects/:projectId
DELETE  /api/v1/projects/:projectId
```

---

## Project Members

```http
POST    /api/v1/projects/:projectId/members
GET     /api/v1/projects/:projectId/members
PUT     /api/v1/projects/:projectId/members/:memberId
DELETE  /api/v1/projects/:projectId/members/:memberId
```

---

## Tasks

```http
POST    /api/v1/tasks
GET     /api/v1/tasks
GET     /api/v1/tasks/:taskId
PUT     /api/v1/tasks/:taskId
DELETE  /api/v1/tasks/:taskId
```

---

# 🧱 Middleware

- verifyJWT
- asyncHandler
- validateProjectPermission
- multer
- errorHandler

---

# 🗄️ Database Collections

```
Users
Projects
ProjectMembers
Tasks
SubTasks
Attachments
```

---

# 🚀 Future Improvements

- Task Comments
- Activity Logs
- Notifications
- Labels & Tags
- Search Functionality
- Pagination
- Filtering & Sorting
- Task History
- Dashboard Analytics
- Real-Time Updates with Socket.io

---

# 🤝 Contributing

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push the branch.
5. Open a Pull Request.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Iash**
