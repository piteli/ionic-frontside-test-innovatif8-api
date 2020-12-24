const express = require('express');
const path = require('path');
const axios = require('axios');
var bodyParser = require('body-parser');
const app = express();
var FormData = require('form-data');
var multer = require('multer');
var upload = multer();

app.use(express.static(path.join(__dirname, 'www')));

app.use(bodyParser.json({limit : '50mb'}));
app.use(bodyParser.urlencoded({
  extended: false,
  limit: '50mb'
}));
app.use(upload.array()); 

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.post('/api/okay/get-journey-id', async(req, res) => {
  const body = req.body;
  const username = body.username;
  const password = body.password;
  axios({url : 'https://ekycportaldemo.innov8tif.com/api/ekyc/journeyid', method : 'POST',
        data : JSON.stringify({username, password}), responseType : 'json', headers: {'Content-Type': 'application/json'}})
        .then((result) => {
          res.json(result.data);
        }).catch((err) => {
          console.log(err);
        });
})

app.post('/api/okay/id', async(req, res) => {
  const body = req.body;
  const payload = {
  "journeyId": body.journeyId,
  "base64ImageString": body.base64ImageString,
  "backImage": body.backImage,
  "imageEnabled":body.imageEnabled,
  "faceImageEnabled":body.faceImageEnabled,
  "cambodia":body.cambodia
  }
  console.log('API /api/ekyc/okayid is running');
  axios({url : 'https://ekycportaldemo.innov8tif.com/api/ekyc/okayid', method : 'POST',
  data : JSON.stringify(payload), maxContentLength: Infinity, maxBodyLength: Infinity, responseType : 'json', headers: {'Content-Type': 'application/json'}})
  .then((result) => {
    console.log(result.data.status);
    res.json(result.data);
  }).catch((err) => {
    console.log(err);
  });
})

app.post('/api/okay/face', (req, res) => {
  const body = req.body;
  let formData = new FormData();
  formData.append('journeyId', body.journeyId);
  formData.append('imageBestBase64', body.imageBestBase64);
  formData.append('imageIdCardBase64', body.imageIdCardBase64);
  formData.append('livenessDetection', body.livenessDetection);
  console.log('API /api/ekyc/okayface is running');
  axios({url : 'https://ekycportaldemo.innov8tif.com/api/ekyc/okayface', method : 'POST',
  data : formData, responseType : 'json', headers: {'Content-Type': `multipart/form-data;boundary=${formData.getBoundary()}`}})
  .then((result) => {
    console.log(result.data.status);
    res.json(result.data);
  }).catch((err) => {
    console.log(err);
  });
})

app.post('/api/okay/doc', async(req, res) => {
  const body = req.body;
  const payload = {
    "journeyId":body.journeyId,
    "type": body.type,
    "idImageBase64Image": body.idImageBase64Image,
    "version": body.version,
    "docType": body.docType
  }
  console.log('API /api/ekyc/okaydoc is running');
  axios({url : 'https://ekycportaldemo.innov8tif.com/api/ekyc/okaydoc', method : 'POST',
  data : JSON.stringify(payload), maxContentLength: Infinity, maxBodyLength: Infinity, responseType : 'json', headers: {'Content-Type': 'application/json'}})
  .then((result) => {
    console.log(result.data.status);
    res.json(result.data);
  }).catch((err) => {
    console.log(err);
  });
})

app.post('/api/okay/scorecard', async(req, res) => {
  const body = req.body;
  console.log('API /api/ekyc/scorecard is running');
  axios({url : 'https://ekycportaldemo.innov8tif.com/api/ekyc/scorecard?journeyId=' + body.journeyId, method : 'GET',
  responseType : 'json', headers: {'Content-Type': 'application/json'}})
  .then((result) => {
    console.log(result.data.status);
    res.json(result.data);
  }).catch((err) => {
    console.log(err);
  });
})

app.get('/*', function(req, res) {
    res.sendFile('index.html', {root: 'www/'}
  );
});
  
const port = process.env.PORT || 5000;
app.listen(port);