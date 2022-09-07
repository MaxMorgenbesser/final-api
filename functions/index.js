import functions from "firebase-functions";
import express from "express";
import cors from "cors";

import { credentials } from "./src/credentials.js";
import { MongoClient, ObjectId } from "mongodb";
import pdf from "./pdf-parse/index.js";
import { authcreds } from "./firebaseauth.js";
import { getAuth } from "firebase-admin/auth";
// import {verifyIdToken} from 'firebase-admin/auth'
import { initializeApp, cert, getApps } from "firebase-admin/app";
// import {getFirestore } from "firebase-admin/firestore"

export function authConnect() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(authcreds),
    });
  }
  return getAuth();
}

authConnect();

const app = express();
app.use(express.json());
app.use(cors());

//connect to firebase

// connects to mongo
const client = new MongoClient(credentials);
const db = client.db("final");
const collection = db.collection("resumes");

const getresumes = async (req, res) => {
  const token = req.headers.authorization;
  const auth = await authConnect();
  auth.verifyIdToken(token).then((decodedToken) => {
    const uid = decodedToken.uid;
    console.log(uid);
    if (uid) {
      collection.find({}).toArray((err, resumes) => {
        res.send(resumes);
      });
    }
  });
};

app.get("/getresumes", getresumes);

app.post("/addresume", async (req, res) => {
  const token = req.headers.authorization;
  const auth = await authConnect();
  auth.verifyIdToken(token).then((decodedToken) => {
    const uid = decodedToken.uid;
    console.log(uid);
    if (uid) {
      let newRes = req.body;
      let filebase = req.body.filebase64;
      let Fbase64 = filebase.replace("data:application/pdf;base64,", "");
      let buf = new Buffer.from(Fbase64, "base64");
      pdf(buf)
        .then(function (data) {
          let text = data.text;
          collection.insertOne({ newRes, words: text });
          res.send({ text });
        })
        .catch((err) => console.log(err));
    }
  });
});

app.put("/:id", async (req, res) => {
  const token = req.headers.authorization;
  const auth = await authConnect();
  auth.verifyIdToken(token).then(async (decodedToken) => {
    const uid = decodedToken.uid;
    console.log(uid);
    if (uid) {
      await collection.findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $inc: req.body }
      );
      res.send({ updated: true });
    }
  });
});

// app.put("/userinfo/:id", async (req, res) => {
//   await collection.findOneAndUpdate(
//     { _id: new ObjectId(req.params.id) },
//     { $push: req.body }
//   );

//   res.send({ SentUserInfo: true });
// });
export const api = functions.https.onRequest(app);

// api name: https://final-api-mam.web.app/

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
