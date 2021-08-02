var fs = require('fs');
var path = require('path');
var express = require('express');
var data 	= require('./eventData.json');
var weather 	= require('./weatherData.json');
var app = express();
var exphbs = require('express-handlebars');
const { type } = require('os');
const { EDESTADDRREQ } = require('constants');
var port = process.env.PORT || 3000;

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.static('public'));

app.post('/addEvent', function (req, res, next){
    console.log("req.body:", req.body);
    if(req.body && req.body.event_name && req.body.length && req.body.color){
        data["Events"].push ({
            name: req.body.event_name,
            day: req.body.day,
            hour: req.body.hour,
            length: req.body.length,
            color: req.body.color
        });
        console.log("Updated Data: ", data);
        fs.writeFile(
            __dirname + '/eventData.json',
            JSON.stringify(data, null, 2),
            function(err, data) {
                if(err) {
                    console.log("add event write error: ", err);
                    res.status(500).send("Error saving new event");
                } else {
                    res.status(200).send("Event added.");
                }
            }
        );

    }else{
        res.status(400).send("Request body bad.");
    }
});

//Needs to be reworked, needs all old data
app.post('/changeEvent', function (req, res, next){
    console.log("req.body:", req.body);
    if(req.body && req.body.event_name && req.body.length && req.body.color && req.body.old_event_name){
        var oldEvent = {name: req.body.old_event_name, day: req.body.day, hour: req.body.hour, length: req.body.length}
        for(i = 0; i < Object.keys(data["Events"]).length; i++){
            if(JSON.stringify(data["Events"][i]) === JSON.stringify(oldEvent)){
                data["Events"].splice(i, 1);
                break;
            }
        }

        data["Events"].push ({
            name: req.body.event_name,
            day: req.body.day,
            hour: req.body.hour,
            length: req.body.length,
            color: req.body.color
        });
        /*if(data[req.body.old_event_name]){
            delete data[req.body.old_event_name];
        }
        if(!data[req.body.event_name]){
            data[req.body.event_name] ={
                day: req.body.day,
                hour: req.body.hour,
                length: req.body.length
            };*/
            console.log("Updated Data: ", data);
            fs.writeFile(
                __dirname + '/eventData.json',
                JSON.stringify(data, null, 2),
                function(err, data) {
                    if(err) {
                        console.log("change event write error: ", err);
                        res.status(500).send("Error changing event");
                    } else {
                        res.status(200).send("Event Changed.");
                    }
                }
            );
    }else{
        res.status(400).send("Request body bad.");
    }
});

app.delete('/deleteEvent', function (req, res, next){
    console.log("req.body:", req.body);
    if(req.body && req.body.event_name && req.body.length && req.body.color){
        var Event = {name: req.body.event_name, day: req.body.day, hour: req.body.hour, length: req.body.length, color: req.body.color}
        for(i = 0; i < Object.keys(data["Events"]).length; i++){
            if(JSON.stringify(data["Events"][i]) === JSON.stringify(Event)){
                data["Events"].splice(i, 1);
                break;
            }
        }
            console.log("Updated Data: ", data);
            fs.writeFile(
                __dirname + '/eventData.json',
                JSON.stringify(data, null, 2),
                function(err, data) {
                    if(err) {
                        console.log("change event write error: ", err);
                        res.status(500).send("Error changing event");
                    } else {
                        res.status(200).send("Event Changed.");
                    }
                }
            );
    }else{
        res.status(400).send("Request body bad.");
    }
});

app.post('/getJSON', function (req, res, next){
    res.status(200).send(JSON.stringify(data));
});

app.get('/getWeather', function(req, res, next){
    res.status(200).send(JSON.stringify(weather));
});

app.get('/', function(req, res, next) {
    res.status(200).render('homepage');
});

app.get('*', function (req, res) {
    var content = "<html> <body> <h1>404 not found</h1> </body> </html>";
    res.status(404).send(content);
});

app.listen(port, function () {
  console.log("== Server is listening on port", port);
});
