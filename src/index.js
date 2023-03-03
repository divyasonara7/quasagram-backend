/* 
dependances 
*/
const express = require('express')
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const busboy = require('busboy');
const { getStorage } = require('firebase-admin/storage');
  let path = require('path')
  let os = require('os')
  let fs = require('fs')
  let UUID = require('uuid-v4')

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
  credential: cert(serviceAccount),
  storageBucket: 'quasagram-82914.appspot.com'
});

const db = getFirestore();
const bucket = getStorage().bucket();




/* 
endpoint- posts
*/

app.get('/', (request, response) => {
  response.send("welcom to quasagram!")
})

app.get('/posts', (request, response) => {

  response.set('Access-Control-Allow-Origin','*');
  let posts = [];
    db.collection('posts').orderBy('date','desc').get().then( snapshot => {
    snapshot.forEach((doc) => {
      posts.push(doc.data());
      });
      response.send(posts)
    });
})


/* 
endpoint- create post
*/

app.post('/createPost', (request, response) => {
  response.set('Access-Control-Allow-Origin','*'); 
  let uuid = UUID() 
  let fields = {}
  let fileData = {}

  const bb = busboy({ headers: request.headers });
    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      
      //tmp/54534553.png
     let filepath =  path.join(os.tmpdir(),filename)
     file.pipe(fs.createWriteStream(filepath))
     fileData = {filepath , mimeType}
    });
    bb.on('field', (name, val, info) => {
      console.log(`Field [${name}]: value: %j`, val);
      fields[name] = val
    });
    bb.on('close', () => {
      bucket.upload(
        fileData.filepath,
        {
          uploadType: 'media',
          metadata: {
            metadata: {
              contentType: fileData.mimetype,
              firebaseStorageDownloadTokens: uuid
            }
          }
        },
        (err, uploadedFile) => {
          if (!err) {
            createDocument(uploadedFile)
          }
        }
      )

    function createDocument(uploadedFile) {
        db.collection('posts').doc(fields.id).set({
          id: fields.id,
          caption: fields.caption,
          location: fields.location,
          date: parseInt(fields.date),
          imageUrl: `https://firebasestorage.googleapis.com/v0/b/${ bucket.name }/o/${ uploadedFile.name }?alt=media&token=${ uuid }`
        }).then(() => {
          response.send('Post added: ' + fields.id)
        })
      }
    });
    request.pipe(bb);
})



/* 
Config- listen
*/
app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`)
})