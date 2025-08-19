
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCvz-lYXdSpThSpGfY-OH7lh6DYbfRocDM",
    authDomain: "clubnexus-ac8pt.firebaseapp.com",
    projectId: "clubnexus-ac8pt",
    storageBucket: "clubnexus-ac8pt.appspot.com",
    messagingSenderId: "162067765873",
    appId: "1:162067765873:web:67266b9a82889b130519d0",
    measurementId: "G-MG5N1BYQLN"
};

// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize App Check before other services
if (typeof window !== 'undefined') {
    // Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
    // key is the counterpart to the secret key you set in the Firebase console.
    initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6Ldv2wYqAAAAAN_rI9jCIxmAAtpL216p5X0iN-P2'),
        isTokenAutoRefreshEnabled: true
    });
}

let analytics: Analytics | undefined;
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, db, auth, analytics };


