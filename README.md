# Setup Guide for TicTacToe Project for Learn.xyz

## Prerequisites

- Node.js and npm (Node Package Manager) installed.
- Expo CLI installed.
- An iOS device with Expo Go app for iOS or an Android device with Expo Go app for Android.

## Initial Configuration

Clone the Repository: Clone the TicTacToe repository to your local machine using git clone https://github.com/shumannxu/TicTacToe.git

Obtain Firebase Configuration:

Create the firebaseConfig.js file in the root directory within your project.

```javascript
// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAf4bSW9N9bXyvcPJ5Js9F87_VO8nzNsns",
  authDomain: "tictactoe-41a13.firebaseapp.com",
  projectId: "tictactoe-41a13",
  storageBucket: "tictactoe-41a13.appspot.com",
  messagingSenderId: "803313088510",
  appId: "1:803313088510:web:45a683be932ab993dc32af",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firestore = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { app, firestore, auth };
```

### Install Dependencies:

- Navigate to the project's root directory in your terminal.
- Run npm install to install all required packages.

## Running the App

Start the Development Server:

- Execute npx expo start to run a local version of the app.
- This will open a new tab in your default web browser with the Expo Developer Tools.
- Running on a Device:

- Open the Expo Go app on your iOS or Android device.
- Scan the QR code displayed in the Expo Developer Tools in your browser.
- The app should start building and will eventually be served to your device.

## Tic Tac Toe (How to Play)

- Click 'Create Game' on one device
- Then click "Join Game' on another device
- Play
