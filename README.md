# Time Logger

A mobile-first web application for tracking time spent on labour and reward activities. Built with Angular and Firebase.

## Features

- Google Authentication
- Labour Activities with customizable reward ratios
- Reward Activities with customizable cost per minute
- Real-time tracking of available reward minutes
- Activity management (add, edit, delete)
- Time logging with automatic reward calculation
- Recent activity history

## Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)
- Firebase account

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd time-logger
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project and enable:
   - Authentication (Google Sign-In)
   - Firestore Database

4. Update the Firebase configuration in `src/app/firebase.config.ts` with your project's credentials:
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

5. Start the development server:
```bash
ng serve
```

6. Open your browser and navigate to `http://localhost:4200`

## Usage

1. Sign in with your Google account
2. Navigate to the Activities page to manage your activities:
   - Add labour activities with reward ratios (e.g., 2:1 means 2 minutes of labour earns 1 reward minute)
   - Add reward activities with cost per minute (e.g., 2 means 2 reward minutes are spent per minute of activity)
3. Navigate to the Logger page to:
   - View your available reward minutes
   - Log time spent on activities
   - View your recent activity history

## Development

- `ng serve` - Start development server
- `ng build` - Build for production
- `ng test` - Run unit tests

## Technologies Used

- Angular 17
- Angular Material
- Firebase (Authentication & Firestore)
- RxJS
- TypeScript
