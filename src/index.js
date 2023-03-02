/* 
dependances 
*/
const express = require('express')
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

/* 
Config - express 
*/

const app = express()
const port = 3000


/* 
Config- firebase
*/
const serviceAccount = require('../serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();




/* 
Config- posts
*/

app.get('/', (request, response) => {
  response.send("welcom to quasagram!")
})

app.get('/posts', (request, response) => {
  let posts = [];
db.collection('posts').get().then( snapshot => {
    snapshot.forEach((doc) => {
      console.log("document",doc.data());
      posts.push(doc.data());
      });
      response.send(posts)
    });
})




/* 
Config- listen
*/
app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`)
})