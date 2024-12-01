import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, query } from "firebase/firestore";
import fs from 'fs';
import dotEnv from 'dotenv';

dotEnv.config();

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    projectId: process.env.FB_PROJECT_ID,
    storageBucket: process.env.FB_STORAGE_BUCKET,
    messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
    appId: process.env.FB_APP_ID,
    measurementId: process.env.FB_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const demographQuery = query(collection(db, 'demographics'))
const snapshot = await getDocs(demographQuery)

const data = [];
snapshot.forEach(doc => {
    data.push(doc.data());
})
const allKeys = Array.from(new Set(data.flatMap(elem => Object.keys(elem))));


function toCSV(list, keys) {
    const fields = []
    for (const item of list) {
        fields.push(keys.map(key => item[key]).join(','))
    }
    return fields.join("\n")
}
const csvFormat = allKeys.join(',') + "\n" + toCSV(data, allKeys) + "\n";

fs.mkdirSync('./.output', { recursive: true });
fs.writeFileSync('./.output/demographicsICHack24.csv', csvFormat);

process.exit(0);