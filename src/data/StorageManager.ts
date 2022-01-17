import firebase from "firebase";
import config from "./FirebaseConfig";

require("firebase/firestore");

// Initialize Cloud Firestore through Firebase
firebase.initializeApp(config);
  
var db = firebase.firestore();

export default db;