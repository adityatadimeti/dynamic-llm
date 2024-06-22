// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyClajj4XkhqtSupIsR9l4kyk_CmPvlxfHc",
  authDomain: "dllm-5d11e.firebaseapp.com",
  databaseURL: "https://dllm-5d11e-default-rtdb.firebaseio.com",
  projectId: "dllm-5d11e",
  storageBucket: "dllm-5d11e.appspot.com",
  messagingSenderId: "54956603307",
  appId: "1:54956603307:web:cb2727520b9bd41df6c4ee",
  measurementId: "G-1DXJ8RX9S3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
