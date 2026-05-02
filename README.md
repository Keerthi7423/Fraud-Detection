# FraudGuard - Microservices Edition

A high-performance fraud detection system built with a microservices architecture, AWS integration, and AI-powered scoring.

## Architecture

- **API Gateway**: Entry point for all client requests.
- **Auth Service**: Manages user registration, login, and JWT-based authentication.
- **Transaction Service**: Handles transaction CRUD operations and initiates scoring.
- **AI Scoring Service**: Processes transactions asynchronously using Google Gemini AI.
- **Notification Service**: Logs audit trails and sends alerts.

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Redux Toolkit.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas.
- **Infrastructure**: AWS (ECS, SQS, S3, CloudFront), Docker.

## Setup

Refer to the documentation in the `docs/` folder for day-by-day implementation details.
