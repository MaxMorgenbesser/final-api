import functions from "firebase-functions";
import express from "express";
import cors from "cors";
import { credentials } from "./src/credentials.js";
import { MongoClient } from "mongodb";

const app = express();
app.use(express.json());
app.use(cors());

const client = new MongoClient(credentials);
const db = client.db("final");
const collection = db.collection("resumes");

app.get("/getresumes", (req, res) => {
  collection.find({}).toArray((err,resumes)=>{
    res.send(resumes)
  })
});


app.post("/addresume", async (req, res) => {
  let newRes = req.body;
  await collection.insertOne(newRes);
  res.send({"resume was added":true})
});


export const api = functions.https.onRequest(app);

// api name: https://final-api-mam.web.app/

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
