# FraudGuard — AI Fraud Detection (Microservices on AWS)

A high-performance fraud detection system built with a microservices architecture, AWS integration, and real-time AI-powered scoring.

**Live Demo:** [https://xxxxxx.cloudfront.net](https://xxxxxx.cloudfront.net)

## Architecture

![Architecture Diagram](https://placehold.co/800x400/1A1D27/FFFFFF?text=FraudGuard+Microservices+Architecture)

## Screenshots

<p align="center">
  <img src="./screenshots/dashboard.png" width="30%" alt="Dashboard" />
  <img src="./screenshots/feed.png" width="30%" alt="Transaction Feed" />
  <img src="./screenshots/detail.png" width="30%" alt="Transaction Detail" />
</p>

## Services

| Service Name | Tech Stack | Port | Purpose |
|--------------|------------|------|---------|
| Auth Service | Node, Express, MongoDB | 3001 | User registration, login, JWT auth |
| Transaction Service | Node, Express, MongoDB | 3002 | CRUD for transactions, pushes to SQS |
| AI Scoring Service | Node, Gemini API | 3003 | Async worker, scores transactions via AI |
| Notification Service | Node, Express, MongoDB | 3004 | Audit logs and real-time notifications |

## AWS Architecture

- **Amazon ECS (Fargate):** Container orchestration for the 4 microservices
- **Amazon SQS:** Message queuing for asynchronous communication between services
- **Application Load Balancer (ALB):** Routes traffic to appropriate ECS tasks
- **Amazon ECR:** Private container registry for Docker images
- **Amazon S3 & CloudFront:** Hosting and CDN for the React frontend
- **AWS Secrets Manager:** Secure storage of environment variables

## Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React.js, Tailwind CSS, Redux Toolkit, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Cloud** | AWS (ECS, SQS, S3, CloudFront, ALB), Docker |
| **AI** | Google Gemini API |
| **CI/CD** | GitHub Actions |

## Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/FraudGuard.git
   cd FraudGuard
   ```

2. **Set up Environment Variables**
   Create a `.env` file in each service directory (`auth-service`, `transaction-service`, `ai-scoring-service`, `notification-service`) with the required keys (see below).

3. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: `http://localhost:5173`
   - APIs: `http://localhost:3001` to `3004`

## Environment Variables Needed

**Auth Service:** `PORT`, `MONGO_URI`, `JWT_SECRET`
**Transaction Service:** `PORT`, `MONGO_URI`, `SQS_QUEUE_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
**AI Scoring Service:** `PORT`, `MONGO_URI`, `SQS_QUEUE_URL`, `GEMINI_API_KEY`
**Notification Service:** `PORT`, `MONGO_URI`, `SQS_QUEUE_URL`

## CI/CD Pipeline

The project uses **GitHub Actions** for automated deployments:
- **Backend Services:** Any push modifying the `services/` folder triggers a build and push to AWS ECR, followed by an ECS task update.
- **Frontend:** Pushes to the `client/` folder trigger an optimized build, syncs with the S3 bucket, and invalidates the CloudFront cache.

## Future Improvements

- Add WebSocket support for real-time dashboard updates
- Implement a caching layer with Redis to optimize frequent queries
- Add multi-factor authentication (MFA) for analyst accounts
- Introduce an automated retry mechanism for failed AI scoring attempts

## Author

**[Your Name]**
[LinkedIn](https://linkedin.com/in/yourprofile) | [GitHub](https://github.com/yourusername)
