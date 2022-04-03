'use strict';
require('dotenv').config();
const express     = require('express');
const bodyParser  = require('body-parser');
const expect      = require('chai').expect;

const myDB        = require('./connection');
const apiRoutes   = require('./routes/api.js');
const runner      = require('./test-runner');

let app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

myDB(async client => {
  const myDatabase = await client.db('issueTracker').collection('issues');

  // // Logging - Request
  // app.use(function (req, res, next) {
  //   console.log(req.originalUrl + " " + req.method);
  //   console.log(req.body);
  //   next();
  // })
  
  // // Logging - Response
  // app.use((req, res, next) => {
  //   let send = res.send;
  //   res.send = c => {
  //       console.log(`Code: ${res.statusCode}`);
  //       console.log("Body: ", c);
  //       res.send = send;
  //       return res.send(c);
  //   }
  //   next();
  // });
  
  //Routing for API 
  apiRoutes(app, myDatabase); 
  
  app.route('/:project/')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/issue.html');
    });
  
  app.route('/')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/index.html');
    });

  //404 Not Found Middleware
  app.use(function(req, res, next) {
    res.status(404)
      .type('text')
      .send('Not Found');
  });
  
}).catch((e) => {
  app.route('/').get((req, res) => {
    res.send({ error: e.message });
  });
}); 

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app;
