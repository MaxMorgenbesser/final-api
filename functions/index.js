import functions from 'firebase-functions'
import express from 'express'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors())


app.get('/',(req,res)=>{
    res.send('it works')
} )


export const api = functions.https.onRequest(app)

// api name: https://final-api-mam.web.app/

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
