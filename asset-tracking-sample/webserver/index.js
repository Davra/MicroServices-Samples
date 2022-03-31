
   
"use strict";

/******************************************************************************
 This is a simple express js microservice which serves-out static content from 
 the public subfolder. All static content be they html files, images etc should
 be placed in public or subfolders for the public dir
 e.g. a common structure looks as follows:
 public
      |_ index.html
      |_ css
           |_style.css
      |_ imgs
           |_ logo.png
      |_ js
          |_ index.js
*/

const express = require('express');
const app = express();

app.use(express.static('public'));


const SERVER_PORT = 8080;
app.listen(SERVER_PORT, function () {
  console.log('davra.com node microservice listening on port ' + SERVER_PORT + '!');
});