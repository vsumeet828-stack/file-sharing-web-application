# DropX Workspace Setup Guide

Follow these steps to set up the DropX project in your local VS Code environment.

## 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Firebase CLI** (`npm install -g firebase-tools`)
- **VS Code** with the following extensions recommended:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense

## 2. Setting Up the Project

1. **Download the Source**: Export the project from AI Studio (ZIP) and extract it to your desired folder.
2. **Open in VS Code**: Open the folder in VS Code.
3. **Install Dependencies**:
   ```bash
   npm install
   ```

## 3. Environment Configuration

Create a `.env` file in the root directory and populate it with your keys. Use `.env.example` as a template.

**Crucial**: You need your Firebase project credentials from the [Firebase Console](https://console.firebase.google.com/).

## 4. Firebase Setup (Initial)

If you haven't linked your local environment to your Firebase project:
1. Run `firebase login`
2. Run `firebase init` (select Firestore and Storage if you plan to manage them via CLI). 
3. The project already contains `firestore.rules`. You can deploy them anytime using:
   ```bash
   firebase deploy --only firestore:rules
   ```

## 5. Running the Application

### Development Mode
Runs the frontend (Vite) and backend (Express) concurrently:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the app.

### Production Build
To test the production build locally:
```bash
npm run build
npm start
```

## 6. Project Structure

- `src/`: React frontend code.
- `server.ts`: Express backend entry point.
- `firestore.rules`: Security rules for your database.
- `firebase-blueprint.json`: Data model documentation.
- `package.json`: Project dependencies and scripts.

## 7. Troubleshooting Build Errors

If you see resolution errors related to `motion/react` or `framer-motion`:
- Ensure you have only `motion` installed (Version 12+).
- Delete `node_modules` and `package-lock.json` and run `npm install` again.
- Make sure `vite.config.ts` is correctly configured to handle ESM dependencies.
