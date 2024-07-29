// Import the functions you need from the SDKs you need
const fbApp = require("firebase/app");
const path=require('path');
const fs = require('fs');

const fstorage = require("firebase/storage");
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = fbApp.initializeApp(firebaseConfig);
const st = fstorage.getStorage();


const readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject('Error reading file');
      } else {
        resolve(data);
      }
    });
  });
};

const uploadToStorage = async (storageRef, data, file) => {
  await fstorage.uploadBytesResumable(storageRef, data, {
    contentType: file.mimetype,
    name: file.originalname
  });
};

const getDownloadURL = async (storageRef) => {
  const url = await fstorage.getDownloadURL(storageRef);
  return url;
};

const uploadImage = async (file) => {
  const filePath = path.join(__dirname, 'uploads', file.filename);
  const storageRef = fstorage.ref(st, 'images/' + file.filename);

  try {
    const data = await readFile(filePath);
    await uploadToStorage(storageRef, data, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {uploadImage}