# Social Media App

A backend for a social media platform inspired by Facebook and Instagram. It covers user accounts, posts with image uploads, real-time chat with online presence, push notifications, and a GraphQL API.

Built with **Node.js, TypeScript, Express, and MongoDB**.

## Features

### Authentication & Security
- Registration and login with JWT authentication
- Password hashing with bcrypt
- Authentication middleware protecting private routes
- Rate limiting, Helmet, and CORS configuration
- Request validation with Zod

### Users & Posts
- User profile management
- Create and manage posts with image uploads (Multer, with file-type validation)

### Real-time Chat
- One-to-one real-time messaging with Socket.IO
- Online presence (see who is currently online)

### Notifications
- Push notifications through Firebase Cloud Messaging (FCM)

### GraphQL
- GraphQL endpoint (graphql-http) for flexible data queries

## Tech Stack

| Area | Technology |
|---|---|
| Runtime / Language | Node.js, TypeScript |
| Framework | Express 5 |
| Database | MongoDB with Mongoose |
| Real-time | Socket.IO |
| Push notifications | Firebase Admin SDK (FCM) |
| API | REST and GraphQL |
| Auth | JSON Web Tokens, bcrypt |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |
| Uploads | Multer, file-type |
| Email | Nodemailer |

## Project Structure

```
.
├── chat.html            browser client for testing real-time chat
├── fcm-token.html       browser page for testing push notifications
└── src/
    ├── index.ts              application entry point
    ├── app.controller.ts     app bootstrap (middlewares, routes, DB, sockets)
    ├── DB/                   database connection and models
    ├── Middlewares/          authentication and validation
    ├── Modules/
    │   ├── Auth/             registration and login
    │   ├── User/             profile management
    │   ├── Post/             posts and image uploads
    │   ├── chat/             Socket.IO chat and presence
    │   ├── Notification/     push notifications (FCM)
    │   └── graphql/          GraphQL schema and resolvers
    ├── Utils/                helpers
    └── types/                shared TypeScript types
```

## Getting Started

### Prerequisites
- Node.js 20+
- A MongoDB instance (local or Atlas)
- A Firebase project with a service account (for push notifications)
- An email account for sending emails (Nodemailer)

### Installation

```bash
git clone https://github.com/Aya-Khader1/Social_Media_App.git
cd Social_Media_App
npm install
```

### Environment Variables

Create a `.env` file in the project root (never commit it):

```env
PORT=3000
MODE=DEVELOPMENT
APPLICATION_NAME=SOCIAL_MEDIA

# Database
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>

# Hashing
SALT=12

# Email (Nodemailer)
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# User tokens
ACCESS_USER_SIGNATURE=your_secret
REFRESH_USER_SIGNATURE=your_secret

# Admin tokens
ACCESS_ADMIN_SIGNATURE=your_secret
REFRESH_ADMIN_SIGNATURE=your_secret
ACCESS_TOKEN_EXPIRES_IN=86400
REFRESH_TOKEN_EXPIRES_IN=172800

# Encryption (must be 32 characters)
ENCRYPTION_SECRET_KEY=your_32_character_secret_key

# CORS
WHITELIST=http://127.0.0.1:4200,http://127.0.0.1:3000
```

Push notifications also need a Firebase service-account key (downloaded from the Firebase console). Keep that file out of version control.

### Run in Development

```bash
npm run dev
```

This compiles TypeScript in watch mode and restarts the server on changes.

### Testing Real-time Features

With the server running, open `chat.html` to try the chat and presence, and `fcm-token.html` to register a device token for push notifications.

## Author

**Ayah Khader**: Software Engineering student, backend developer
[GitHub](https://github.com/Aya-Khader1)
