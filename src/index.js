const express = require('express')
const app = express()
const port = 3000

app.get('/', (request, response) => {

  response.send("welcom to quasagram!")
})


app.get('/posts', (request, response) => {
  let posts = [
    {
      caption: 'Golden gate Bridge',
      location: 'Rajkot',
    },
    {
      caption: 'River front',
      location: 'Ahemdabad',
    }
  ];
  response.send(posts)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})