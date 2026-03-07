# Podcast Content Repurposer

Transform podcast episodes into multiple content formats

## 🎯 Features

- Audio transcription
- Content generation
- Social media posts
- Blog posts

## 💰 Pricing Plans

- **Basic**: $14/month - Essential features for individuals
- **Pro**: $39/month - Advanced features for professionals
- **Enterprise**: $89/month - Custom features and support

## 🚀 Quick Start

### Docker Deployment (Recommended)

```bash
# Clone and setup
git clone https://github.com/yourusername/podcast-repurposer.git
cd podcast-repurposer

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Deploy
docker-compose up -d

# Access the application
# Web Interface: http://localhost
# API: http://localhost/api
# Health: http://localhost/api/health
```

### Manual Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Setup database
createdb podcast_repurposer

# Configure environment
export DATABASE_URL="postgresql://user:password@localhost/podcast_repurposer"
export SECRET_KEY="your-secret-key"

# Run the application
python app/main.py
```

## 📚 API Documentation

### Authentication

All API requests require an API key:

```bash
# Register
curl -X POST http://localhost/api/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "John Doe", "password": "password123"}'

# Login
curl -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Main Endpoints

```bash
# Health check
curl http://localhost/api/health

# Get user data
curl -X GET http://localhost/api/user \
  -H "X-API-Key: your-api-key"

# Create resource
curl -X POST http://localhost/api/resource \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name": "Example Resource"}'
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `sqlite:///app.db` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379/0` |
| `SECRET_KEY` | Flask secret key | Required |
| `STRIPE_API_KEY` | Stripe billing | Required |
| `PORT` | Application port | `5000` |

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d

# Or deploy script
./deploy.sh production v1.0.0
```

## 📊 Monitoring

### Health Checks
- Application: `GET /api/health`
- Database: `GET /api/health/db`
- Redis: `GET /api/health/redis`

### Metrics
- Available at `GET /api/metrics`
- Compatible with Prometheus

## 🔒 Security

- API key authentication
- Password hashing with bcrypt
- HTTPS enforcement in production
- Rate limiting
- Input validation

## 💳 Billing

Integrated with Stripe for subscription management:
- Automatic plan upgrades/downgrades
- Usage tracking
- Webhook processing
- Customer portal

## 🤝 Support

- **Documentation**: Complete API and user guides
- **Email**: support@podcastrepurposer.com
- **Status**: status.podcastrepurposer.com

## 📈 Market Size

4M+ podcast creators

## 🛠 Tech Stack

- Python
- Whisper
- OpenAI API
- PostgreSQL

---

Made with ❤️ for Content & Media professionals
