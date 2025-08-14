# Portfolio Backend API

This is the backend API for a portfolio application, built with Node.js and Express. It provides various endpoints for managing portfolio content, user authentication, and image handling.

[![Node.js](https://img.shields.io/badge/Node.js-v12.0.0+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Sequelize](https://img.shields.io/badge/Sequelize-v6.25.3-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)](https://sequelize.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-Secured-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud-Storage-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/)
[![Passport](https://img.shields.io/badge/Passport-Auth-34E27A?style=for-the-badge&logo=passport&logoColor=white)](http://www.passportjs.org/)

## 🛠 Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Database
- **Sequelize** - ORM for database management
- **Passport.js** - Authentication middleware
- **Google Cloud Storage** - Image storage
- **Docker** - Containerization
- **JWT** - Authentication tokens
- **Multer** - File upload handling

## 📋 Prerequisites

- Node.js (>= 12.0.0)
- PostgreSQL
- Google Cloud Storage account (for image storage)
- Docker (optional)

## 🚀 Getting Started

### Installation

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd portfolio-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=8080
   CLIENT_URL=http://localhost:3000
   DATABASE_URL=your_postgres_connection_string
   GOOGLE_CLOUD_PROJECT_ID=your_project_id
   GOOGLE_CLOUD_STORAGE_BUCKET=your_bucket_name
   JWT_SECRET=your_jwt_secret
   ```

### Running the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Using Docker:

```bash
docker build -t portfolio-backend .
docker run -p 8080:8080 portfolio-backend
```

## 🔑 API Endpoints

- `GET /` - Root route, displays API welcome message
- `/api` - Main API routes
- `/pictures` - Image handling routes

For detailed API documentation, please refer to the API documentation (TODO).

## 🗄️ Project Structure

```
portfolio-backend/
├── app.js              # Application entry point
├── config/             # Configuration files
├── middleware/         # Custom middleware
├── models/            # Database models
├── routes/            # API routes
├── Dockerfile         # Docker configuration
└── package.json       # Project dependencies
```

## 🔒 Security Features

- CORS configuration
- JWT authentication
- Session management
- Google OAuth integration
- Secure password hashing (bcrypt)

## 🛡️ Environment Variables

| Variable                    | Description                      |
| --------------------------- | -------------------------------- |
| PORT                        | Server port (default: 8080)      |
| CLIENT_URL                  | Frontend application URL         |
| DATABASE_URL                | PostgreSQL connection string     |
| JWT_SECRET                  | Secret for JWT signing           |
| GOOGLE_CLOUD_PROJECT_ID     | Google Cloud project ID          |
| GOOGLE_CLOUD_STORAGE_BUCKET | Google Cloud storage bucket name |

## 🔄 Database

The application uses PostgreSQL with Sequelize ORM. Database configuration can be found in the `config` directory.

## 🚧 Improvements

1. Add comprehensive API documentation using Swagger/OpenAPI
2. Implement rate limiting for API endpoints
3. Add automated testing suite
4. Implement caching mechanism
5. Add logging service for production
6. Implement CI/CD pipeline
7. Add health check endpoints
8. Implement request validation middleware
9. Add database migrations
10. Implement API versioning

## 📦 Dependencies

### Main Dependencies

- express: ^4.18.2
- sequelize: ^6.25.3
- passport: ^0.6.0
- @google-cloud/storage: ^6.6.0
- jsonwebtoken: ^8.5.1
- bcryptjs: ^2.4.3
- multer: ^1.4.5-lts.1

### Development Dependencies

- nodemon: ^2.0.19

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

ISC License

## 👤 Author

Kasoma Ibrahim

---

<div align="center">
  <img src="https://nodejs.org/static/images/logo.svg" width="50" alt="Node.js">
  <img src="https://expressjs.com/images/express-facebook-share.png" width="50" alt="Express.js">
  <img src="https://www.postgresql.org/media/img/about/press/elephant.png" width="50" alt="PostgreSQL">
  <img src="https://sequelize.org/img/logo.svg" width="50" alt="Sequelize">
  <img src="https://www.docker.com/sites/default/files/d8/2019-07/vertical-logo-monochromatic.png" width="50" alt="Docker">
</div>
