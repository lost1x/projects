# PDF Data Extractor API Documentation

## Base URL
```
https://api.pdfextractor.com/v1
```

## Authentication
All endpoints require an API key in the `X-API-Key` header.

## Rate Limits
- Basic Plan: 100 requests/hour
- Pro Plan: 1000 requests/hour
- Enterprise Plan: Unlimited

## Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user

### User Management
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `GET /user/usage` - Get usage statistics

### Core Features
- `GET /resources` - List resources
- `POST /resources` - Create resource
- `GET /resources/{id}` - Get resource
- `PUT /resources/{id}` - Update resource
- `DELETE /resources/{id}` - Delete resource

### Analytics
- `GET /analytics/overview` - Get overview analytics
- `GET /analytics/usage` - Get usage analytics
- `GET /analytics/performance` - Get performance metrics

### Billing
- `GET /billing/plans` - Get available plans
- `POST /billing/subscribe` - Subscribe to plan
- `GET /billing/subscription` - Get current subscription
- `POST /billing/cancel` - Cancel subscription

## Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

## Webhooks
Stripe webhooks are sent to `/webhooks/stripe`
