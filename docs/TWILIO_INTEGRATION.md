# Twilio WhatsApp/SMS Integration - Frontend Documentation

## Overview

This document describes the API endpoints and integration patterns for WhatsApp/SMS notifications and OTP verification in the Cambizzle platform.

---

## Table of Contents

1. [OTP Verification Flow](#1-otp-verification-flow)
2. [Notification System](#2-notification-system)
3. [API Endpoints](#3-api-endpoints)
4. [Error Codes](#4-error-codes)
5. [User Preferences](#5-user-preferences)
6. [Testing](#6-testing)
7. [WhatsApp Message Templates](#7-whatsapp-message-templates)
8. [Frontend Implementation Examples](#8-frontend-implementation-examples)
9. [SQL Queries (Reference)](#9-sql-queries-reference)
10. [Configuration Reference](#10-configuration-reference)
11. [Cron Jobs](#11-cron-jobs)
12. [Troubleshooting](#12-troubleshooting)
13. [Admin Ads Management](#13-admin-ads-management)

---

## 1. OTP Verification Flow

### 1.1 Registration with OTP

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │   Backend   │     │   Twilio    │     │    User     │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │ POST /auth/otp/send                   │                   │
       │ {phone, purpose}  │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │ Send WhatsApp/SMS │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │                   │ Deliver OTP code  │
       │                   │                   │──────────────────>│
       │                   │                   │                   │
       │ 200 OK            │                   │                   │
       │ {success, expires}│                   │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
       │ POST /auth/otp/verify                 │                   │
       │ {phone, code}     │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │ 200 OK            │                   │                   │
       │ {success: true}   │                   │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
       │ POST /auth/register                   │                   │
       │ {phone, password, │                   │                   │
       │  firstName, etc}  │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │ 201 Created       │                   │                   │
       │ {user, token}     │                   │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
```

### 1.2 Password Reset with OTP

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │   Backend   │     │   Twilio    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ POST /auth/password/request-otp       │
       │ {phone}           │                   │
       │──────────────────>│                   │
       │                   │                   │
       │                   │ Send OTP          │
       │                   │──────────────────>│
       │                   │                   │
       │ 200 OK            │                   │
       │ {success, expires}│                   │
       │<──────────────────│                   │
       │                   │                   │
       │ POST /auth/password/reset-with-otp    │
       │ {phone, code,     │                   │
       │  newPassword}     │                   │
       │──────────────────>│                   │
       │                   │                   │
       │ 200 OK            │                   │
       │ {success: true}   │                   │
       │<──────────────────│                   │
       │                   │                   │
```

---

## 2. Notification System

### 2.1 Automatic Notifications

Notifications are sent automatically when these events occur:

| Event | Recipient | Trigger |
|-------|-----------|---------|
| Ad Favorited | Ad owner | User favorites an ad |
| Feedback Received | Ad owner | User leaves a review |
| Ad Approved | Ad owner | Admin approves ad |
| Ad Rejected | Ad owner | Admin rejects ad |
| Identity Verified | User | Admin verifies identity |
| Identity Rejected | User | Admin rejects identity |

### 2.2 Notification Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │   Backend   │     │  Queue DB   │     │ Cron Worker │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │ POST /favorite/ads/123               │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │ Insert notification                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │ 200 OK            │                   │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
       │                   │                   │ (Every minute)    │
       │                   │                   │<──────────────────│
       │                   │                   │                   │
       │                   │                   │ Process & send    │
       │                   │                   │──────────────────>│
       │                   │                   │    Twilio API     │
       │                   │                   │                   │
```

---

## 3. API Endpoints

### 3.1 OTP Endpoints

#### Send OTP for Registration

```http
POST /api/auth/otp/send
Content-Type: application/json

{
  "phone": "+237612345678",
  "purpose": "registration"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Verification code sent",
  "data": {
    "channel": "whatsapp",
    "expires_in_minutes": 10
  }
}
```

**Response (Rate Limited):**
```json
{
  "success": false,
  "message": "Please wait before requesting a new code",
  "data": {
    "retry_after": 180
  }
}
```

**Response (Phone Already Registered):**
```json
{
  "success": false,
  "message": "An account with this phone number already exists",
  "code": "PHONE_EXISTS"
}
```

---

#### Verify OTP

```http
POST /api/auth/otp/verify
Content-Type: application/json

{
  "phone": "+237612345678",
  "code": "123456",
  "purpose": "registration"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Verification successful"
}
```

**Response (Invalid Code):**
```json
{
  "success": false,
  "message": "Invalid verification code",
  "data": {
    "attempts_remaining": 2
  }
}
```

**Response (Expired):**
```json
{
  "success": false,
  "message": "Verification code has expired. Please request a new one."
}
```

**Response (Too Many Attempts):**
```json
{
  "success": false,
  "message": "Too many failed attempts. Please request a new code.",
  "data": {
    "attempts_remaining": 0
  }
}
```

---

#### Send OTP for Password Reset

```http
POST /api/auth/password/request-otp
Content-Type: application/json

{
  "phone": "+237612345678"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Verification code sent",
  "data": {
    "channel": "whatsapp",
    "expires_in_minutes": 10
  }
}
```

**Response (Phone Not Found):**
```json
{
  "success": false,
  "message": "No account found with this phone number",
  "code": "ACCOUNT_NOT_FOUND"
}
```

---

#### Reset Password with OTP

```http
POST /api/auth/password/reset-with-otp
Content-Type: application/json

{
  "phone": "+237612345678",
  "code": "123456",
  "new_password": "newSecurePassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Response (Invalid OTP):**
```json
{
  "success": false,
  "message": "Invalid verification code",
  "data": {
    "attempts_remaining": 2
  }
}
```

---

### 3.2 User Notification Preferences

#### Get Notification Preferences

```http
GET /api/users/me/notifications
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "whatsapp_notifications_enabled": true
  }
}
```

---

#### Update Notification Preferences

```http
PUT /api/users/me/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "whatsapp_notifications_enabled": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification preferences updated",
  "data": {
    "whatsapp_notifications_enabled": false
  }
}
```

---

### 3.3 Admin Notification Stats (Admin Only)

#### Get Notification Statistics

```http
GET /api/admin/notifications/stats?period=today
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pending": 5,
    "sent": 120,
    "failed": 3,
    "by_type": [
      {"type": "ad_favorited", "count": 45},
      {"type": "feedback_received", "count": 30},
      {"type": "ad_approved", "count": 25},
      {"type": "ad_rejected", "count": 10},
      {"type": "identity_verified", "count": 8},
      {"type": "identity_rejected", "count": 2}
    ],
    "by_channel": [
      {"channel_used": "whatsapp", "count": 110},
      {"channel_used": "sms", "count": 13}
    ]
  }
}
```

---

#### Get Budget Status

```http
GET /api/admin/notifications/budget
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "budget_usd": 20.00,
    "spent_usd": 8.45,
    "remaining_usd": 11.55,
    "percentage_used": 42.25,
    "is_exceeded": false
  }
}
```

---

## 4. Error Codes

### 4.1 OTP Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `PHONE_EXISTS` | 400 | Phone number already registered |
| `ACCOUNT_NOT_FOUND` | 404 | No account with this phone |
| `OTP_EXPIRED` | 400 | OTP code has expired |
| `OTP_INVALID` | 400 | Invalid OTP code |
| `OTP_BLOCKED` | 429 | Too many failed attempts |
| `OTP_RATE_LIMITED` | 429 | Must wait before resending |
| `OTP_SEND_FAILED` | 500 | Failed to send OTP |

### 4.2 Notification Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NOTIFICATIONS_DISABLED` | 400 | User has disabled notifications |
| `INVALID_PHONE` | 400 | Phone number format invalid |
| `BUDGET_EXCEEDED` | 503 | Monthly budget limit reached |

---

## 5. User Preferences

### 5.1 Notification Opt-out

Users can disable WhatsApp notifications in their profile settings:

```javascript
// Frontend implementation example
async function updateNotificationPreferences(enabled) {
  const response = await fetch('/api/users/me/notifications', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      whatsapp_notifications_enabled: enabled
    })
  });
  return response.json();
}
```

### 5.2 UI Recommendations

- Add a toggle switch in user settings: "Receive WhatsApp notifications"
- Default: ON (enabled)
- Show a confirmation when disabling: "You will no longer receive WhatsApp notifications about your ads"

---

## 6. Testing

### 6.1 Test Phone Numbers

For development/testing, use these patterns:
- `+237600000001` - Always succeeds (WhatsApp)
- `+237600000002` - Falls back to SMS
- `+237600000003` - Always fails (for error handling tests)

### 6.2 Test OTP Codes

In development environment (`CI_ENVIRONMENT=development`):
- Use code `000000` to always succeed
- Use code `999999` to always fail

### 6.3 Postman Collection

Import the following endpoints for testing:

```json
{
  "info": {
    "name": "Cambizzle OTP & Notifications",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Send Registration OTP",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/auth/otp/send",
        "body": {
          "mode": "raw",
          "raw": "{\"phone\": \"+237612345678\", \"purpose\": \"registration\"}"
        }
      }
    },
    {
      "name": "Verify OTP",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/auth/otp/verify",
        "body": {
          "mode": "raw",
          "raw": "{\"phone\": \"+237612345678\", \"code\": \"123456\", \"purpose\": \"registration\"}"
        }
      }
    },
    {
      "name": "Request Password Reset OTP",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/auth/password/request-otp",
        "body": {
          "mode": "raw",
          "raw": "{\"phone\": \"+237612345678\"}"
        }
      }
    },
    {
      "name": "Reset Password with OTP",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/auth/password/reset-with-otp",
        "body": {
          "mode": "raw",
          "raw": "{\"phone\": \"+237612345678\", \"code\": \"123456\", \"new_password\": \"newPassword123\"}"
        }
      }
    }
  ]
}
```

---

## 7. WhatsApp Message Templates

These templates must be approved by Meta before use:

### 7.1 OTP Template

```
Template Name: cambizzle_otp
Category: AUTHENTICATION

Body:
Your Cambizzle verification code is: {{1}}
Valid for {{2}} minutes. Do not share this code.
```

### 7.2 Ad Favorited Template

```
Template Name: cambizzle_ad_favorited
Category: UTILITY

Body:
{{1}} added your ad "{{2}}" to their favorites on Cambizzle.
```

### 7.3 Feedback Received Template

```
Template Name: cambizzle_feedback_received
Category: UTILITY

Header: New Review Received
Body:
{{1}} left a {{3}}-star review on your ad "{{2}}".
Log in to Cambizzle to see the full review.
```

### 7.4 Ad Approved Template

```
Template Name: cambizzle_ad_approved
Category: UTILITY

Header: Ad Approved
Body:
Great news! Your ad "{{1}}" has been approved and is now live on Cambizzle.
```

### 7.5 Ad Rejected Template

```
Template Name: cambizzle_ad_rejected
Category: UTILITY

Header: Ad Review Update
Body:
Your ad "{{1}}" was not approved.
Reason: {{2}}
Please edit your ad and resubmit for review.
```

### 7.6 Identity Verified Template

```
Template Name: cambizzle_identity_verified
Category: UTILITY

Header: Identity Verified
Body:
Congratulations {{1}}! Your identity has been verified on Cambizzle.
You now have access to all seller features.
```

### 7.7 Identity Rejected Template

```
Template Name: cambizzle_identity_rejected
Category: UTILITY

Header: Verification Update
Body:
Your identity verification was not approved.
Reason: {{1}}
Please submit valid documents to try again.
```

---

## 8. Frontend Implementation Examples

### 8.1 React - OTP Input Component

```tsx
import React, { useState, useEffect } from 'react';

interface OTPInputProps {
  phone: string;
  purpose: 'registration' | 'password_reset';
  onVerified: () => void;
  onError: (error: string) => void;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  phone,
  purpose,
  onVerified,
  onError
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const sendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose })
      });
      const data = await response.json();

      if (data.success) {
        setResendTimer(300); // 5 minutes
      } else if (data.data?.retry_after) {
        setResendTimer(data.data.retry_after);
        onError(data.message);
      } else {
        onError(data.message);
      }
    } catch (err) {
      onError('Failed to send verification code');
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (code.length !== 6) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, purpose })
      });
      const data = await response.json();

      if (data.success) {
        onVerified();
      } else {
        if (data.data?.attempts_remaining !== undefined) {
          setAttemptsRemaining(data.data.attempts_remaining);
        }
        onError(data.message);
        setCode('');
      }
    } catch (err) {
      onError('Verification failed');
    }
    setLoading(false);
  };

  return (
    <div className="otp-input">
      <p>Enter the 6-digit code sent to {phone}</p>

      <input
        type="text"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        placeholder="000000"
        disabled={loading}
      />

      <p className="attempts">
        {attemptsRemaining} attempts remaining
      </p>

      <button onClick={verifyOTP} disabled={loading || code.length !== 6}>
        {loading ? 'Verifying...' : 'Verify'}
      </button>

      <button
        onClick={sendOTP}
        disabled={loading || resendTimer > 0}
        className="resend"
      >
        {resendTimer > 0
          ? `Resend in ${Math.floor(resendTimer / 60)}:${(resendTimer % 60).toString().padStart(2, '0')}`
          : 'Resend Code'
        }
      </button>
    </div>
  );
};
```

### 8.2 React - Notification Settings Toggle

```tsx
import React, { useState, useEffect } from 'react';

export const NotificationSettings: React.FC = () => {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    const response = await fetch('/api/users/me/notifications', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    if (data.success) {
      setEnabled(data.data.whatsapp_notifications_enabled);
    }
  };

  const updatePreferences = async (newValue: boolean) => {
    setLoading(true);
    const response = await fetch('/api/users/me/notifications', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ whatsapp_notifications_enabled: newValue })
    });
    const data = await response.json();
    if (data.success) {
      setEnabled(newValue);
    }
    setLoading(false);
  };

  return (
    <div className="notification-settings">
      <h3>Notification Preferences</h3>

      <label className="toggle">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => updatePreferences(e.target.checked)}
          disabled={loading}
        />
        <span>Receive WhatsApp notifications</span>
      </label>

      <p className="description">
        Get notified when someone favorites your ads, leaves reviews,
        or when your ads are approved/rejected.
      </p>
    </div>
  );
};
```

---

## 9. SQL Queries (Reference)

### 9.1 Database Schema

```sql
-- Notifications queue
CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    type VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    template_sid VARCHAR(50),
    template_vars TEXT,
    sms_body VARCHAR(320),
    status ENUM('pending','processing','sent','delivered','failed') DEFAULT 'pending',
    attempts TINYINT UNSIGNED DEFAULT 0,
    last_attempt_at DATETIME,
    next_retry_at DATETIME,
    twilio_sid VARCHAR(50),
    channel_used ENUM('whatsapp','sms'),
    sent_at DATETIME,
    delivered_at DATETIME,
    error_message VARCHAR(255),
    related_type VARCHAR(20),
    related_id INT UNSIGNED,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    INDEX(status, next_retry_at),
    INDEX(user_id),
    INDEX(created_at)
);

-- Budget tracking
CREATE TABLE notification_costs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10,6) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    month_year VARCHAR(7) NOT NULL,
    recorded_at DATETIME NOT NULL,
    INDEX(month_year)
);

-- OTP attempts
CREATE TABLE otp_attempts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    purpose ENUM('registration','password_reset') NOT NULL,
    otp_code VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    attempts_count TINYINT UNSIGNED DEFAULT 0,
    last_attempt_at DATETIME,
    status ENUM('pending','verified','blocked','expired') DEFAULT 'pending',
    twilio_sid VARCHAR(50),
    channel_used ENUM('whatsapp','sms'),
    sent_at DATETIME,
    verified_at DATETIME,
    error_message VARCHAR(255),
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    INDEX(phone, purpose, status),
    INDEX(expires_at)
);

-- User preference (added to users table)
ALTER TABLE users ADD COLUMN whatsapp_notifications_enabled TINYINT(1) DEFAULT 1;
```

---

## 10. Configuration Reference

### 10.1 Environment Variables

```env
# Twilio Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_SMS_FROM=+14155238886

# Feature Flags
TWILIO_ENABLED=true
TWILIO_WHATSAPP_ENABLED=true
TWILIO_SMS_FALLBACK_ENABLED=true

# Budget & Limits
TWILIO_MONTHLY_BUDGET=20.00
TWILIO_DEFAULT_COUNTRY_CODE=237

# WhatsApp Template SIDs (from Twilio Console)
TWILIO_TPL_AD_FAVORITED=HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TPL_FEEDBACK=HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TPL_AD_APPROVED=HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TPL_AD_REJECTED=HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TPL_IDENTITY_VERIFIED=HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TPL_IDENTITY_REJECTED=HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TPL_OTP=HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 10.2 OTP Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Code Length | 6 digits | OTP code length |
| Validity | 10 minutes | Time before expiration |
| Max Attempts | 3 | Failed verifications before block |
| Resend Delay | 5 minutes | Minimum wait between sends |

### 10.3 Notification Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Max Retries | 3 | Delivery attempts before marking failed |
| Retry Delay | 60s × attempt | Exponential backoff |
| Monthly Budget | $20 USD | Spending limit |
| Queue Batch Size | 50 | Notifications per cron run |

---

## 11. Cron Jobs

```bash
# Process notification queue every minute
* * * * * cd /path/to/cambizzle-api && php spark notifications:process --limit=50 >> /var/log/cambizzle-notifications.log 2>&1

# Clean up expired OTP attempts daily at 3am
0 3 * * * cd /path/to/cambizzle-api && php spark otp:cleanup --days=7 >> /var/log/cambizzle-otp.log 2>&1
```

---

## 12. Troubleshooting

### 12.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| OTP not received | WhatsApp not installed | SMS fallback will be used |
| "Rate limited" error | Resending too fast | Wait for timer to expire |
| "Budget exceeded" | Monthly limit reached | Increase budget or wait |
| Notifications not sending | Cron not running | Check cron job status |

### 12.2 Debug Commands

```bash
# Check notification queue status
php spark notifications:process --limit=0

# View pending notifications count
php spark db:table notifications | grep pending

# Check OTP stats
php spark otp:cleanup --days=0
```

---

## 13. Admin Ads Management

### 13.1 List All Ads (with Category/Subcategory filtering)

```http
GET /api/admin/ads
Authorization: Bearer <admin_token>
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `per_page` | int | Items per page (default: 20) |
| `page` | int | Page number (default: 1) |
| `moderation_status` | string | Filter by status: `pending`, `approved`, `rejected` |
| `category_id` | int | Filter by category ID |
| `subcategory_id` | int | Filter by subcategory ID |
| `search` | string | Search in title/description |

**Response:**

```json
{
  "success": true,
  "data": {
    "ads": [
      {
        "id": 123,
        "title": "iPhone 15 Pro",
        "description": "Like new condition",
        "price": 850000,
        "moderation_status": "pending",
        "created_at": "2026-02-14 10:30:00",
        "subcategory_id": 5,
        "category": {
          "id": 4,
          "name": "Electronics",
          "slug": "electronics"
        },
        "subcategory": {
          "id": 5,
          "name": "Smartphones",
          "slug": "smartphones"
        },
        "user": {
          "first_name": "John",
          "last_name": "Doe",
          "email": "john@example.com"
        },
        "location_name": "Douala",
        "photos": [
          {"id": 1, "url": "/uploads/ads/photo1.jpg", "is_primary": 1}
        ]
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 150,
      "total_pages": 8
    },
    "filters": {
      "categories": [
        {
          "id": 4,
          "name": "Electronics",
          "slug": "electronics",
          "subcategories": [
            {"id": 5, "name": "Smartphones", "slug": "smartphones"},
            {"id": 6, "name": "Laptops", "slug": "laptops"}
          ]
        },
        {
          "id": 2,
          "name": "Vehicles",
          "slug": "vehicles",
          "subcategories": [
            {"id": 10, "name": "Cars", "slug": "cars"},
            {"id": 11, "name": "Motorcycles", "slug": "motorcycles"}
          ]
        }
      ]
    }
  }
}
```

---

### 13.2 List Pending Ads (with Category/Subcategory filtering)

```http
GET /api/admin/ads/pending
Authorization: Bearer <admin_token>
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `per_page` | int | Items per page (default: 20) |
| `page` | int | Page number (default: 1) |
| `category_id` | int | Filter by category ID |
| `subcategory_id` | int | Filter by subcategory ID |
| `search` | string | Search in title/description |

**Response:** Same format as `/api/admin/ads`, but only returns ads with `moderation_status = "pending"`.

---

### 13.3 Frontend Implementation - Category/Subcategory Filter

```tsx
import React, { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  subcategories: { id: number; name: string; slug: string }[];
}

interface AdminAdsFilters {
  category_id?: number;
  subcategory_id?: number;
  moderation_status?: string;
  search?: string;
}

export const AdminAdsFilter: React.FC<{
  categories: Category[];
  onFilterChange: (filters: AdminAdsFilters) => void;
}> = ({ categories, onFilterChange }) => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState('');

  const subcategories = selectedCategory
    ? categories.find(c => c.id === selectedCategory)?.subcategories || []
    : [];

  useEffect(() => {
    const filters: AdminAdsFilters = {};
    if (selectedCategory) filters.category_id = selectedCategory;
    if (selectedSubcategory) filters.subcategory_id = selectedSubcategory;
    if (status) filters.moderation_status = status;
    if (search) filters.search = search;
    onFilterChange(filters);
  }, [selectedCategory, selectedSubcategory, status, search]);

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null); // Reset subcategory when category changes
  };

  return (
    <div className="admin-ads-filter">
      <select
        value={selectedCategory || ''}
        onChange={(e) => handleCategoryChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">All Categories</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <select
        value={selectedSubcategory || ''}
        onChange={(e) => setSelectedSubcategory(e.target.value ? Number(e.target.value) : null)}
        disabled={!selectedCategory}
      >
        <option value="">All Subcategories</option>
        {subcategories.map(sub => (
          <option key={sub.id} value={sub.id}>{sub.name}</option>
        ))}
      </select>

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      <input
        type="text"
        placeholder="Search ads..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};
```

---

### 13.4 Usage Example - Fetching Admin Ads

```typescript
async function fetchAdminAds(filters: AdminAdsFilters, page = 1) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('per_page', '20');

  if (filters.category_id) params.set('category_id', String(filters.category_id));
  if (filters.subcategory_id) params.set('subcategory_id', String(filters.subcategory_id));
  if (filters.moderation_status) params.set('moderation_status', filters.moderation_status);
  if (filters.search) params.set('search', filters.search);

  const response = await fetch(`/api/admin/ads?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${getAdminToken()}` }
  });

  return response.json();
}

// Example: Get all pending ads in "Electronics" category
const result = await fetchAdminAds({
  moderation_status: 'pending',
  category_id: 4
});

console.log(result.data.ads);         // Array of ads
console.log(result.data.pagination);  // Pagination info
console.log(result.data.filters);     // Available categories for dropdown
```

---

## Contact

For API issues, contact the backend team.
For Twilio configuration issues, check the Twilio Console.
