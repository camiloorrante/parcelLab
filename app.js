var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var LineByLineReader = require('line-by-line');
var ParcelLabAPI = require('parcellab-api');
var parcelLabAPI = new ParcelLabAPI(112, 'S5blCN9s4kJJd5NvMmNFzTTbdCYWwr');


app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'jade');
app.set('views', './views'); 
app.get('/', function(req, res) {
    res.render('index');
});

app.post('/upload', function(req, res){

  var form = new formidable.IncomingForm();
  form.multiples = true;
  form.uploadDir = path.join(__dirname, '/uploads');

  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
        readFile(path.join(form.uploadDir, file.name));

  });

  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  form.on('end', function() {
    res.end('success');
  });

  form.parse(req);

  function readFile(pathToFile){
        lr = new LineByLineReader(pathToFile);
        var cont = 0;
        
        lr.on('line',function(line){
          var array = line.split(',');
          var payload = {
                courier: array[1],
                tracking_number: array[2]
              };
          cont++;
          if( cont > 0){
            parcelLabAPI.createTracking(payload, function (err, res) {
              console.log({
                error: err,
                result: res
              });
            });
          }
        });
  }
});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
