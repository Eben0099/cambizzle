# Backend Requirements: Admin Role Management & CMS

This document outlines the API endpoints and data structures required to support the new Admin Role Management and Content Management System (CMS) features.

## 1. User Role Management

### Update User Role
Allows an administrator to promote another user to 'Admin' or demote them to 'User'.

- **Endpoint**: `PUT /admin/users/{userId}/role`
- **Authentication**: Bearer Token (Admin only)
- **Request Body**:
```json
{
  "role_id": "1" // "1" for Admin, "2" for User
}
```
- **Response**:
```json
{
  "status": "success",
  "message": "User role updated successfully",
  "data": {
    "user_id": "123",
    "new_role": "1"
  }
}
```

---

## 2. Content Management System (CMS)

### Get All Settings
Fetches all editable content for the application.

- **Endpoint**: `GET /admin/settings`
- **Authentication**: Bearer Token (Admin only)
- **Response**:
```json
{
  "status": "success",
  "data": {
    "sections": {
      "terms": [
        { "title": "Introduction", "content": "Welcome to..." },
        { "title": "Eligibility", "content": "You must be..." }
      ],
      "about_us": [
        { "title": "Who We Are", "content": "Cambizzle is..." }
      ],
      "safety_tips": [
        { "title": "Personal Safety", "content": "Meet in..." }
      ]
    },
    "faqs": [
      {
        "id": 1,
        "question": "How to buy?",
        "answer": "Click on..."
      }
    ],
    "contact": {
      "support_phone": "+237...",
      "support_email": "support@cambizzle.com",
      "whatsapp_number": "+237..."
    },
    "social_links": {
      "facebook": "https://facebook.com/...",
      "twitter": "https://twitter.com/...",
      "instagram": "https://instagram.com/..."
    }
  }
}
```

### Update Settings
Updates specific sections of the settings.

- **Endpoint**: `PUT /admin/settings`
- **Authentication**: Bearer Token (Admin only)
- **Request Body**: (Partial updates should be supported)
```json
{
  "sections": {
    "terms": [
      { "title": "Updated Section", "content": "New content..." }
    ]
  },
  "contact": {
    "support_phone": "..."
  }
}
```
- **Response**: Standard success/error response.

---

## 3. Public Endpoints (Optional but Recommended)
Public endpoints to fetch the content for the frontend pages.

- `GET /settings/terms`
- `GET /settings/about`
- `GET /settings/safety-tips`
- `GET /settings/faqs`
- `GET /settings/contact-info`
