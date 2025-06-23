# 🔐 Google OAuth 2.0 Setup Guide

Enable Google Sign-In in your web application by configuring OAuth 2.0 credentials in the Google Cloud Console.

---

## ✅ Step-by-Step Instructions

### **Step 1: Create a Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown → **New Project**
3. Give your project a name and click **Create**
4. Once created, note your **Project ID**

---

### **Step 2: Enable OAuth APIs**

1. In the left sidebar, go to **APIs & Services → Library**
2. Search for and enable:

   * **Google Identity Services API**
   * (Optionally: Google People API, if you need user profile info)

---

### **Step 3: Configure OAuth Consent Screen**

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External** as the user type (for public apps)
3. Fill in:

   * App Name
   * User support email
   * Developer contact email
4. Add your domain(s) under **Authorized domains**
5. Save and continue through the scopes and test users setup
6. Click **Publish App** (optional for development; required for production)

---

### **Step 4: Create OAuth 2.0 Credentials**

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth 2.0 Client ID**
3. Choose **Web application** as the application type
4. Set a name (e.g., `ProductivityPro Web Client`)
5. Add:

   * **Authorized JavaScript origins** (e.g., `https://yourdomain.com`)
   * **Authorized redirect URIs** (e.g., `https://yourdomain.com/auth/google/callback`)
6. Click **Create**

> 📌 Note: Use exact URLs (no wildcards). Trailing slashes matter.

---

### **Step 5: Set Up Environment Variables**

Copy the generated **Client ID** and optionally **Client Secret**, then add them to your server or environment:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

### **Step 6: Implement Google Login in Your App**

Depending on your backend framework, use libraries such as:

* **Node.js (Express)**: `passport-google-oauth20`, `google-auth-library`
* **Python (Flask/Django)**: `Authlib`, `Flask-Dance`
* **Frontend (JS/React)**: Google Identity SDK (script-based)

Basic OAuth 2.0 flow:

* Frontend redirects to Google OAuth URL
* User logs in → Google redirects back to your **redirect URI**
* Your backend exchanges the code for tokens
* Use the ID token or access token to fetch user info

---

## 🔪 Testing

1. Start your application
2. Navigate to your login page
3. Click **Login with Google**
4. You should see the OAuth consent screen → approve access
5. Your app should receive user info or token

---

## ⚠️ Common Issues

### ❌ `redirect_uri_mismatch`

* Your redirect URI must **exactly** match what you added in Google Cloud Console

### ❌ `Access blocked: Authorization Error`

* Domain not listed in **Authorized JavaScript origins**
* Using wrong Client ID or redirect URI

### ⚠️ `This app isn’t verified`

* OK in development. Click **Advanced → Go to app (unsafe)** to proceed
* For production, submit for verification via Google Cloud Console
