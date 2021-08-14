var fs = require('fs');
var path = require('path');
var express = require('express');
var data 	= require('./eventData.json');
var settings = require('./settings.json');
var first = require('./first.json')
var app = express();
const fetch = require('node-fetch');
var exphbs = require('express-handlebars');
const { type } = require('os');
const { EDESTADDRREQ } = require('constants');


var port = process.env.PORT || 3000;

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.static('public'));

app.post('/alert', function(req, res, next){
    var first_time = first.first;
    if(first_time){
        fs.writeFile(
            __dirname + '/first.json',
            JSON.stringify({first: false}, null, 2),
            function(err, data){
                if(err){
                    res.status(500).send("err");
                }else{
                    res.status(200).send("Init");
                }
            }
        )
    } else {
    res.status(201).send("Nope");
    }
});

app.get('/getSettings', function (req, res, next){
    settings = require('./settings.json');
    res.status(200).send(JSON.stringify(settings));
});

app.post('/changeSettings', function(req, res, next){
    var settings = {"confirmDelete": req.body.confirmDelete, 
    "tempCelsius": req.body.tempCelsius, 
    "twentyFourHourFormat": req.body.twentyFourHourFormat}
    fs.writeFile(
        __dirname + '/settings.json',
        JSON.stringify(settings, null, 2),
        function(err, data){
            if(err){
                console.log("change settings error: ", err);
                res.status(500).send("Change settings failed");
            } else {
                res.status(200).send("Settings changed");
            }
        }
    )
});

app.post('/addEvent', function (req, res, next){
    console.log("req.body:", req.body);
    if(req.body && req.body.event_name && req.body.length && req.body.color){
        data["Events"].push ({
            name: req.body.event_name,
            day: req.body.day,
            hour: req.body.hour,
            length: req.body.length,
            color: req.body.color,
            notes: req.body.notes
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

app.post('/changeEvent', function (req, res, next){
    console.log("req.body:", req.body);
    if(req.body && req.body.event_name && req.body.old_event_color && req.body.color){
        var oldEvent = {name: req.body.old_event_name, 
            day: req.body.old_event_day, 
            hour: req.body.old_event_hour, 
            length: req.body.old_event_length, 
            color: req.body.old_event_color,
            notes: req.body.old_event_notes}
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
            color: req.body.color,
            notes: req.body.notes
        });
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
        var Event = {name: req.body.event_name, 
            day: req.body.day,
            hour: req.body.hour, 
            length: req.body.length, 
            color: req.body.color, 
            notes: req.body.notes}
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

app.post('/getWeather', function(req, res, next){
    console.log(req.body);
    fetch('http://localhost:3001/weather/lat/' + req.body.lat + '/lon/' + req.body.lon
    ).then(
        res => res.json()
    ).then(
       json => res.status(200).send(JSON.stringify(json))
    ).catch(
        err => console.log(err)
    );
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
