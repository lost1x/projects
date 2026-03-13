# Feature 1: User Accounts & Profile System - Setup Guide

**Status:** Ready for Implementation  
**Version:** 1.0  
**Date:** March 2026

---

## 📋 Setup Checklist

- [x] Create MySQL database and tables (infinityfree: if0_41020389_spaarow_hub)
- [x] Configure PHP credentials in `asset/php/config.php`
- [ ] Test API endpoints
- [ ] Test registration and login flow
- [ ] Deploy to production

---

## 🗄️ Part 1: Database Setup

### Step 1: Run Database Setup SQL

Your database `if0_41020389_spaarow_hub` is already created on infinityfree.com.

Run the SQL from `database_setup.sql` in your phpMyAdmin panel:

1. Log into your infinityfree control panel
2. Go to phpMyAdmin
3. Select database `if0_41020389_spaarow_hub`
4. Import or run the `database_setup.sql` file

---

## 🔧 Part 2: Configure PHP

The `asset/php/config.php` has been updated with your infinityfree database credentials:

```php
define('DB_HOST', 'sql112.infinityfree.com');
define('DB_USER', 'if0_41020389_spaarow_hub');
define('DB_PASS', 'Tye858k24');
define('DB_NAME', 'if0_41020389_spaarow_hub');
```

**Note:** Keep your password secure and don't commit it to version control.

---

## 📁 File Structure

Your project should now have this structure:

```
sp-hub/
├── asset/
│   ├── css/
│   │   └── main.css (updated with auth styles)
│   ├── js/
│   │   ├── auth.js (new - authentication module)
│   │   ├── profile.js (new - profile management)
│   │   ├── hub.js
│   │   ├── navigation.js
│   │   └── image-slideshow.js
│   └── php/
│       ├── config.php (new - database config)
│       ├── register.php (new - user registration)
│       ├── login.php (new - user login)
│       ├── logout.php (new - user logout)
│       ├── profile.php (new - profile management)
│       ├── readings.php (new - reading history)
│       └── preferences.php (new - user preferences)
├── logs/ (new - for error logging)
├── index.html (updated with auth modal)
├── asset/pages/profile.html (new - user profile page)
├── FEATURE_1_IMPLEMENTATION.md
└── SETUP_GUIDE.md (this file)
```

---

## 🧪 Testing the APIs

### Create a Test User

Use curl or Postman to test the registration endpoint:

```bash
curl -X POST http://localhost/spaarow-hub/asset/php/register.php \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123",
    "password_confirm": "TestPassword123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "display_name": "testuser"
  },
  "token": "a1b2c3d4e5f6g7h8i9j0..."
}
```

### Test Login

```bash
curl -X POST http://localhost/spaarow-hub/asset/php/login.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### Test Protected Endpoint (Get Profile)

```bash
curl -X GET http://localhost/spaarow-hub/asset/php/profile.php \
  -H "Authorization: Bearer your_token_here"
```

---

## 🚀 Deployment Checklist

Before going live:

- [ ] Change `JWT_SECRET` in config.php to a strong random string
- [ ] Update database credentials in config.php
- [ ] Test all endpoints on production server
- [ ] Verify HTTPS is enabled (important for authentication)
- [ ] Set proper file permissions (644 for PHP files)
- [ ] Enable error logging to file instead of display
- [ ] Backup your database!
- [ ] Test registration → login → profile → save reading flow

---

## 🔐 Security Reminders

1. **Never commit credentials** to git
2. **Use strong passwords** - change default JWT_SECRET
3. **Enable HTTPS** - don't transmit tokens over HTTP
4. **Validate input** - all PHP files already do this
5. **Keep PHP updated** - security patches are important
6. **Monitor error logs** - check `/logs/error.log` regularly

---

## 📞 Troubleshooting

### "Database connection failed"
- Check credentials in config.php
- Verify database server is running
- Check if database `spaarow_hub` exists

### "Method not allowed" error
- Make sure you're using the correct HTTP method (POST, GET, PUT, DELETE)
- CORS headers are set correctly in config.php

### 404 errors
- Check file paths in auth.js (should point to `asset/php/`)
- Verify PHP files exist in correct directory structure

### Token issues
- Tokens expire after 7 days
- Clear localStorage and re-login if expired
- Check that Authorization header is `Bearer <token>`

### CORS errors
- Verify CORS headers are set in config.php
- Check that fetch requests use correct paths
- Browser console will show specific CORS issues

---

## 📊 Database Maintenance

###  Cleanup Expired Sessions (Optional)

Run periodically to clean up old sessions:

```sql
DELETE FROM user_sessions WHERE expires_at < NOW();
```

### Verify Table Status

```sql
SELECT TABLE_NAME, ENGINE, ROW_FORMAT, TABLE_ROWS 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'spaarow_hub';
```

---

## 🎯 Next Steps After Setup

1. ✅ Users can register and create accounts
2. ✅ Users can login and get auth tokens
3. ✅ Users can view and update their profiles
4. ✅ Readings are saved to user accounts
5. Next: Add email verification (optional)
6. Next: Add password reset feature (optional)
7. Next: Add admin dashboard (optional)

---

## 📝 API Documentation

### Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/asset/php/register.php` | ❌ | Register new user |
| POST | `/asset/php/login.php` | ❌ | Login user |
| POST | `/asset/php/logout.php` | ✅ | Logout user |
| GET | `/asset/php/profile.php` | ✅ | Get user profile |
| PUT | `/asset/php/profile.php` | ✅ | Update profile |
| POST | `/asset/php/readings.php` | ✅ | Save reading |
| GET | `/asset/php/readings.php` | ✅ | Get reading history |
| DELETE | `/asset/php/readings.php` | ✅ | Delete reading |
| GET | `/asset/php/preferences.php` | ✅ | Get preferences |
| PUT | `/asset/php/preferences.php` | ✅ | Update preferences |

---

## 💡 Tips & Best Practices

1. **Use localStorage wisely** - tokens last 7 days
2. **Sync readings regularly** - when user logs in, local readings transfer to account
3. **Fallback to localStorage** - if user not logged in, readings save locally
4. **Clear sensitive data** - on logout, tokens are removed from browser
5. **Monitor performance** - check database indexes on reading_history table

---

**Setup Complete! Your authentication system is ready to go.** 🚀
