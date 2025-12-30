import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7D70inSnZ2_fhm9qAmpCO8PUxH8tNSJc",
  authDomain: "signin-229d5.firebaseapp.com",
  projectId: "signin-229d5",
  storageBucket: "signin-229d5.firebasestorage.app",
  messagingSenderId: "946493095215",
  appId: "1:946493095215:web:907b27c89c779bb19435da"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
