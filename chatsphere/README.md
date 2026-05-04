# ChatSphere Login System

## Features Added

- **Login Modal**: Appears when the app loads, requiring authentication before accessing the main chat interface
- **Sign In Form**: Email and password authentication
- **Register Form**: New user registration with validation
- **Google Sign-In**: Integration with Google OAuth (requires configuration)
- **Profile Storage**: User data saved in browser localStorage
- **Session Management**: Automatic login state persistence

## User Profile Data Structure

Each user profile contains:
- `id`: Unique user identifier
- `name`: Full name
- `email`: Email address
- `password`: Hashed password (for email registration)
- `googleId`: Google user ID (for Google sign-in)
- `createdAt`: Registration timestamp
- `loginMethod`: 'email' or 'google'

## How to Use

1. **First Time Users**: Click "Register" tab to create a new account
2. **Existing Users**: Use "Sign In" tab with email/password
3. **Google Users**: Click the Google sign-in button
4. **Profile Access**: Click the profile icon in the sidebar to view your information
5. **Logout**: Click the logout button in the sidebar

## Google Sign-In Setup

To enable Google sign-in:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` in `chatsphere.html` with your actual client ID

## Security Notes

- Passwords are hashed using base64 encoding (demo purposes only)
- In production, use proper password hashing (bcrypt, argon2)
- User data is stored in localStorage (client-side only)
- For production, implement server-side authentication and database storage

## Browser Compatibility

- Modern browsers with ES6 support
- localStorage support required
- Google Sign-In requires internet connection