const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, './dist/okayID')));

app.get('/*', function(req, res) {
    res.sendFile('index.html', {root: 'dist/okayID/'}
  );
  });
  
const port = process.env.PORT || 8080;
app.listen(port);