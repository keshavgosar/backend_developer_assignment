# Task Manager API - Backend Developer Assignment

A scalable REST API built with Node.js, Express, and MongoDB. It features JWT-based authentication, role-based access control (User vs. Admin), and full CRUD functionality for a secondary entity (Tasks). A lightweight Vanilla JS frontend is included to demonstrate the API functionality.

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/keshavgosar/backend_developer_assignment.git
   cd <repo-folder>
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory of the project and add the following variables. (Do not skip this step, or the app will crash):
   ```env
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/intern_assignment
   JWT_SECRET=your_super_secret_jwt_key
   ```
   *(Note to reviewer: The `MONGO_URI` assumes a local MongoDB instance is running on the default port. You can replace this with a MongoDB Atlas string if you prefer testing on the cloud).*

4. **Run the Server**
   ```bash
   node index.js
   ```
   *The server will start on `http://localhost:3000`*

5. **Access the Frontend UI**
   Open your browser and navigate to `http://localhost:3000`. You can register, login, and manage tasks directly from the UI to test the APIs.

---

## API Documentation (Endpoints)

Base URL: `/api/v1`

### Authentication
*   **POST** `/auth/register` - Register a new user. 
    *   *Body:* `{ "username": "test", "password": "123", "role": "user" }` *(role is optional, defaults to 'user', can be 'admin')*
*   **POST** `/auth/login` - Login and receive JWT.
    *   *Body:* `{ "username": "test", "password": "123" }`

### Tasks (Requires JWT in `Authorization: Bearer <token>` header)
*   **POST** `/tasks` - Create a new task.
    *   *Body:* `{ "title": "Buy Milk", "description": "From the store" }`
*   **GET** `/tasks` - Get all tasks for the logged-in user.
*   **PUT** `/tasks/:id` - Update a specific task.
    *   *Body:* `{ "title": "Updated Title" }`
*   **DELETE** `/tasks/:id` - Delete a specific task.

### Admin Only (Requires Admin JWT)
*   **GET** `/tasks/all` - Fetch ALL tasks across all users.

---

## Scalability & Security Note

### Security Practices Implemented:
*   **Password Hashing:** Used `bcryptjs` to ensure plain-text passwords are never stored in the database.
*   **Stateless Authentication:** Used `jsonwebtoken` (JWT) for secure, stateless API validation.
*   **Role-Based Access Control (RBAC):** Middleware built to differentiate and protect routes based on user vs. admin roles.
*   **Data Isolation:** MongoDB queries are scoped to `req.user.id` so users cannot read/modify/delete other users' tasks.
*   **Environment Protection:** `.env` file is ignored via `.gitignore` to prevent secret leakage.

### Future Scalability Considerations:
If this project were to scale to millions of users, I would implement the following:
1.  **Microservices Architecture:** Split the monolithic Express app into an `Auth Service` and a `Task Service` to scale them independently.
2.  **Caching (Redis):** Cache frequently accessed queries (like an Admin dashboard overview) in Redis to reduce database load.
3.  **Database Indexing:** Ensure proper indexing on fields like `username` and `owner` in MongoDB to maintain rapid read speeds as the collection grows.
4.  **Load Balancing & Deployment:** Containerize the application using **Docker** and deploy it behind a load balancer (like NGINX or AWS ALB) to distribute incoming traffic across multiple Node.js instances.
5.  **Rate Limiting & Security Headers:** Implement `express-rate-limit` and `helmet` to protect the API from DDoS attacks or brute-force login attempts.