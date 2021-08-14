//Setting Variables
var is_24_hour_format = true;
var is_celsius = true;
var confirm_on_delete = false;


//Variables for event copying

var event_copied = false;
var copied_event_name = "";
var copied_event_length = 0;
var copied_event_color = "";
var copied_event_notes = "";
// Here get the Div that you want to follow the mouse
var moving_id = 'div_moving';
var div_moving = document.getElementById('div_moving');


//logic for double-click adding events
var selected_id = null;


//logic for changing event information
var old_event_name = "";
var old_event_length = 0;
var old_event_hour = 0;
var old_event_day = 0;
var old_event_color = "";
var old_event_notes = "";

// Here add the ID of the parent element
var parent_div = 'main_table';

var initial_alert_request = new XMLHttpRequest();
initial_alert_request.open('POST', '/alert');
initial_alert_request.addEventListener('load', function(event){
    if(event.target.status === 200){
        alert("To quickly create events, double an hour slot! See more info by clicking the '?' button on the top");
    }
});
initial_alert_request.send();

var settings_request = new XMLHttpRequest();
settings_request.open('GET', '/getSettings');
settings_request.addEventListener('load', function(event){
    if(event.target.status === 200){
        var settings = JSON.parse(settings_request.responseText);
        is_24_hour_format = settings["twentyFourHourFormat"];
        console.log(settings["twentyFourHourFormat"]);
        is_celsius = settings["tempCelsius"];
        confirm_on_delete = settings["confirmDelete"];

        if(!is_24_hour_format){
            changeTo12Hour();
        } else {
            changeTo24Hour();
        }
        getWeather();
    }
});
settings_request.send();

var post_request = new XMLHttpRequest();
post_request.open('POST', '/getJSON');
let data = Object;
let events = [];
let hours = [...Array(7)].map(e => Array(24).fill(0));
post_request.addEventListener('load', function(event){
    if(event.target.status === 200){
        data = JSON.parse(post_request.responseText);
    allocateHours(data);
    for(i = 0; i < data.Events.length; i++){
        const event = {};
        Object.defineProperties(event, {
            day: {value: data.Events[i].day},
            hour: {value: data.Events[i].hour},
            length: {value: data.Events[i].length},
            name: {value: data.Events[i].name},
            color: {value: data.Events[i].color},
            notes: {value: data.Events[i].notes},
            index: {value: i}
        });
        events.push(event);
        createEventElement(event);
    }
    }
});

function createEventElement(event){
    var id = event.day.toString() + "-" + event.hour.toString();
    var textNode = document.createTextNode(event.name);
    document.getElementById(id).setAttribute('rowspan', event.length.toString());
    document.getElementById(id).setAttribute('data-taken', 'true');
    document.getElementById(id).setAttribute('style', ('background-color: ' + event.color));
    document.getElementById(id).appendChild(textNode);
    document.getElementById(id).appendChild(createButton('fas fa-trash fa-2xs', 'deleteEvent(events[' + event.index + '])'));
    document.getElementById(id).appendChild(createButton('fas fa-copy fa-2xs', 'createEventCopy(events[' + event.index + '])'));
    document.getElementById(id).appendChild(createButton('fas fa-edit', 'openEventDetails(events[' + event.index + '])'));
    for(j = 1; j < data.Events[i].length; j++){
        var num = event.hour + j;
        var id_delete = event.day.toString() + "-" + num.toString();
        document.getElementById(id_delete).remove();
    }
}

function allocateHours(data){
    for(i = 0; i < data.Events.length; i++){
        for(j = 0; j < data.Events[i].length; j++){
            hours[data.Events[i].day][data.Events[i].hour + j] = 1;
        }
    }
}

function createButton(icon, callback){
    var button = document.createElement("button");
    button.setAttribute('onclick', callback)
    var bIcon = document.createElement("i");
    bIcon.setAttribute('class', icon);
    button.append(bIcon);
    return button;
}

post_request.send();

function celsiusToFahrenheit(celsius){
    return ((celsius * 1.8) + 32);
}

function changeTo12Hour(){
    for(i = 0; i < 24; i++){
        if(i == 0){
            document.getElementById('label-0').innerText = "12AM";
        } else if(i < 12) {
            document.getElementById('label-' + i.toString()).innerText = i.toString() + "AM";
        } else if(i == 12){
            document.getElementById('label-12').innerText = "12PM";
        } else {
            document.getElementById('label-' + i.toString()).innerText = (i - 12).toString() + "PM";
        }
    }
}

function changeTo24Hour(){
    for(i = 0; i < 24; i++){
        document.getElementById('label-' + i.toString()).innerText = i.toString();
    }
}

function setWeather(day, temp, weather){
    switch(weather){
        case "Clear Sky":
            document.getElementById(day + "-icon").setAttribute("class", "fas fa-sun");
            break;
        case "Cloudy":
            document.getElementById(day + "-icon").setAttribute("class", "fas fa-cloud");
            break;
        case "Rain":
            document.getElementById(day + "-icon").setAttribute("class", "fas fa-cloud-rain");
            break;
        case "Snow":
            document.getElementById(day + "-icon").setAttribute("class", "fas fa-snowflake");
            break;
        case "Scattered clouds":
            document.getElementById(day + "-icon").setAttribute("class", "fas fa-cloud-sun");
            break;
         case "Few clouds":
            document.getElementById(day + "-icon").setAttribute("class", "fas fa-cloud-sun");
            break;
        case "Broken clouds":
            document.getElementById(day + "-icon").setAttribute("class", "fas fa-cloud-sun");
            break;
        case "Fog":
            document.getElementById(day + "-icon").setAttribute("class", "fas fa-smog");
            break;
        case "Thunderstorm":
            document.getElementById(day + "-icon").setAttribute("class", "fas fa-bolt");
            break;
        default:
            document.getElementById(day + "-icon").setAttribute("class", "fas fa-question");
            break;
    }
    document.getElementById(day + "-temp").innerText = is_celsius ? temp.toString() :  Math.round(celsiusToFahrenheit(temp).toString());

}

var lat = "";
var lon = "";

function getWeather(){
    if (!navigator.geolocation) {
        alert("Geolocation is not supported in this browser.");
    } else {
        navigator.geolocation.getCurrentPosition(
        //success callback
        (position) => {
            latn = position.coords.latitude.toString();
            lonn = position.coords.longitude.toString();
            var get_weather_request = new XMLHttpRequest();
            get_weather_request.open('POST', '/getWeather');
            get_weather_request.setRequestHeader('Content-Type', 'application/json');
            var reqBody = JSON.stringify({
                lat: latn,
                lon: lonn
            });
            console.log(reqBody);
            get_weather_request.addEventListener('load', function(event){
                if(event.target.status === 200){
                    var wData = JSON.parse(get_weather_request.responseText);
                    console.log(wData);
                    }else{
                        alert(event.target.response);
                    }

                console.log(wData);
                let today = new Date();
                var num_of_week = today.getDay();
                setWeather(dayIntToDayName(num_of_week), wData[0].temperature, wData[0].weather);
                setWeather(dayIntToDayName((num_of_week + 1) % 7), wData[1].temperature, wData[1].weather);
                setWeather(dayIntToDayName((num_of_week + 2) % 7), wData[2].temperature, wData[2].weather);
                setWeather(dayIntToDayName((num_of_week + 3) % 7), wData[3].temperature, wData[3].weather);
                setWeather(dayIntToDayName((num_of_week + 4) % 7), wData[4].temperature, wData[4].weather);
                setWeather(dayIntToDayName((num_of_week + 5) % 7), wData[5].temperature, wData[5].weather);
                setWeather(dayIntToDayName((num_of_week + 6) % 7), wData[6].temperature, wData[6].weather);
            });

            get_weather_request.send(reqBody);
        }
        );
    }
}

function dayIntToDayName(num){
    switch(num){
        case 0:
            return "Sunday";
        case 1:
            return "Monday";
        case 2:
            return "Tuesday";
        case 3:
            return "Wednesday";
        case 4:
            return "Thursday";
        case 5:
            return "Friday";
        case 6:
            return "Saturday";
        default:
            return -1; 
    }
}


function deleteEvent(event){
    if(confirm_on_delete && window.confirm("Do you want to delete event?") || !confirm_on_delete){
        console.log("event delete called");
        var post_request = new XMLHttpRequest();
        var URL = "/deleteEvent";
        post_request.open('DELETE', URL);
        var reqBody = JSON.stringify({
            event_name: event.name,
            day: parseInt(event.day),
            hour: parseInt(event.hour),
            length: parseInt(event.length),
            color: event.color,
            notes:  event.notes
        });

        post_request.setRequestHeader('Content-Type', 'application/json');
        post_request.addEventListener('load', function(event){
            if(event.target.status === 200){
                location.reload();
            }else{
                alert(event.target.response);
            }
        });
        post_request.send(reqBody);
    }
}

function openEventDetails(event){
    old_event_name = event.name;
    old_event_day = event.day;
    old_event_hour = event.hour;
    old_event_length = event.length;
    old_event_color = event.color;
    old_event_notes = event.notes;

    document.getElementById('change-event-day-input').selectedIndex = event.day;
    document.getElementById('change-event-hour-input').value = event.hour;
    document.getElementById('change-event-name-input').value = event.name;
    document.getElementById('change-event-length-input').value = event.length;
    var colors = document.getElementsByClassName('change-event-color-radio');
    for(i = 0; i < colors.length; i++){
        colors[i].checked = false;
    }
    var checkColor = 'change-event-color-' + event.color;
    document.getElementById(checkColor).checked = true;
    document.getElementById('change-event-desc-input').value = event.notes;
    

    document.getElementById("change-event-modal").style.display = 'flex';
}

document.getElementById("change-event-button").onclick = function(){
    getEventChangeInput();
    document.getElementById("change-event-modal").style.display = 'none';
}


function getEventChangeInput(){
    var colors = document.getElementsByClassName('change-event-color-radio');
    var icolor = "";
    for(i = 0; i < colors.length; i++){
        if(colors[i].checked){
            icolor = colors[i].value;
        }
    }
    const event = {};
    Object.defineProperties(event, {
        day: {value: parseDay(document.getElementById('change-event-day-input').value)},
        hour: {value: parseInt(document.getElementById('change-event-hour-input').value)},
        length: {value: parseInt(document.getElementById('change-event-length-input').value)},
        name: {value: document.getElementById('change-event-name-input').value},
        color: {value: icolor},
        notes: {value: document.getElementById('change-event-desc-input').value}
    });

    changeEvent(event);
}

function changeEvent(event){
    var post_request = new XMLHttpRequest();
    var URL = "/changeEvent";
    post_request.open('POST', URL);
    var reqBody = JSON.stringify({
        event_name: event.name,
        day: parseInt(event.day),
        hour: parseInt(event.hour),
        length: parseInt(event.length),
        color: event.color,
        notes: event.notes,
        old_event_name: old_event_name,
        old_event_day: old_event_day,
        old_event_hour: old_event_hour,
        old_event_length: old_event_length,
        old_event_color: old_event_color,
        old_event_notes: old_event_notes
    });

    post_request.setRequestHeader('Content-Type', 'application/json');
    post_request.addEventListener('load', function(event){
        if(event.target.status === 200){
            location.reload();
        }else{
            alert(event.target.response);
        }
    });
    post_request.send(reqBody);
}

function createEventCopy(event){
    copied_event_name = event.name;
    copied_event_length = event.length;
    copied_event_color = event.color;
    copied_event_notes = event.notes;
    event_copied = true;
    if(document.getElementById(moving_id)){
        document.getElementById(moving_id).remove();
    }
    document.getElementById("add-event").style.display = 'none';
    document.getElementById("tutorial").style.display = 'none';
    document.getElementById("setting").style.display = 'none';
    document.getElementById("cancel_copy").style.display = '';
    var div_moving = document.createElement("div");
    div_moving.setAttribute('id', moving_id);
    var init_height =  document.getElementById("0-0").offsetHeight;
    var init_width = document.getElementById("0-0").offsetWidth;
    div_moving.setAttribute('style', 
    'height: ' + init_height * event.length + 'px; '
    +'background-color: ' + event.color + '; '
    +'width: ' + init_width +'px;');
    div_moving.innerText = event.name;
    document.getElementById(parent_div).appendChild(div_moving);
}

function createEvent(event){
    if(event.name && (event.day != -1) && (event.hour != -1) && event.length){
        if(event.hour + event.length <= 24){
            var free = true;
            for(i = 0; i < event.length; i++){
                if(hours[event.day][event.hour + i] == 1){
                    free = false;
                    break;
                }
            }
            if(free){
                var post_request = new XMLHttpRequest();
                var URL = "/addEvent";
                post_request.open('POST', URL);
                var reqBody = JSON.stringify({
                    event_name: event.name,
                    day: parseInt(event.day),
                    hour: parseInt(event.hour),
                    length: parseInt(event.length),
                    color: event.color,
                    notes: event.notes
                });

                post_request.setRequestHeader('Content-Type', 'application/json');
                post_request.addEventListener('load', function(event){
                    if(event.target.status === 200){
                        location.reload();
                    }else{
                        alert(event.target.response);
                    }
                });
                post_request.send(reqBody);
            }else{
                alert("Event conflict!");
            }
        }else{
            alert("Event too long, would span multiple days. Create separate events instead.");
        }
    }else{
        alert("Not all parameters for event provided")
    }
}

function parseDay(day){
    switch(day){
        case "Mon":
            return 0;
        case "Tues":
            return 1;
        case "Weds":
            return 2;
        case "Thurs":
            return 3;
        case "Fri":
            return 4;
        case "Sat":
            return 5;
        case "Sun":
            return 6;
        default:
            return -1; 
    }
}

document.getElementById('add-event').onclick = function() {
    console.log("add-event button clicked");
    document.getElementById('add-event-modal').style.display = 'flex';
}

document.getElementById('modal-close-button').onclick = function() {
    document.getElementById('add-event-modal').style.display = 'none';
}

document.getElementById('change-modal-close-button').onclick = function(){
    document.getElementById('change-event-modal').style.display = 'none';
}

document.getElementById('setting').onclick = function(){
    setSetting('temperature-units-radio', is_celsius, 'temperature-units-');
    setSetting('confirm-on-delete-radio', confirm_on_delete, 'delete-confirm-');
    setSetting('time-format-radio', is_24_hour_format, 'time-format-');
    document.getElementById('settings-modal').style.display = 'flex';
}

function setSetting(radio_class_name, setting, base_radio_id){
    var options = document.getElementsByClassName(radio_class_name);
    for(i = 0; i < options; i++){
        options[i].checked = false;
    }
    document.getElementById(base_radio_id + (setting ? "true" : "false")).checked = true;
}

document.getElementById('settings-modal-close-button').onclick = function(){
    document.getElementById('settings-modal').style.display = 'none';
}

document.getElementById('settings-confirm-button').onclick = function(){
    document.getElementById('settings-modal').style.display = 'none';
    is_celsius = document.getElementsByClassName('temperature-units-radio')[0].checked;
    confirm_on_delete = document.getElementsByClassName('confirm-on-delete-radio')[1].checked;
    is_24_hour_format = document.getElementsByClassName('time-format-radio')[0].checked;
    console.log("event delete called");
    var post_request = new XMLHttpRequest();
    var URL = "/changeSettings";
    post_request.open('POST', URL);
    var reqBody = JSON.stringify({
        confirmDelete: confirm_on_delete,
        tempCelsius: is_celsius,
        twentyFourHourFormat: is_24_hour_format
    });

    post_request.setRequestHeader('Content-Type', 'application/json');
    post_request.addEventListener('load', function(event){
        if(event.target.status === 200){
            location.reload();
        }else{
            alert(event.target.response);
        }
    });
    post_request.send(reqBody);
}

document.getElementById("cancel_copy").onclick = function(){
    document.getElementById("add-event").style.display = '';
    document.getElementById("tutorial").style.display = '';
    document.getElementById("setting").style.display = '';
    document.getElementById("cancel_copy").style.display = 'none';
    if(document.getElementById(moving_id)){
        document.getElementById(moving_id).remove();
    }
    event_copied = false;
}


document.getElementById('add-new-event-button').onclick = function() {
    var colors = document.getElementsByClassName('new-event-color-radio');
    var icolor = "";
    for(i = 0; i < colors.length; i++){
        if(colors[i].checked){
            icolor = colors[i].value;
        }
    }
    const event = {};
    Object.defineProperties(event, {
        day: {value: parseDay(document.getElementById('new-event-day-input').value)},
        hour: {value: parseInt(document.getElementById('new-event-hour-input').value)},
        length: {value: parseInt(document.getElementById('new-event-length-input').value)},
        name: {value: document.getElementById('new-event-name-input').value},
        color: {value: icolor},
        notes: {value: document.getElementById('new-event-desc-input').value},
    });
    createEvent(event);
}

// from: ( https://coursesweb.net/ )
var movingDiv = {
  mouseXY: {}, 

  // (from: vishalsays.wordpress.com/ )
  getXYpos: function(elm) {
    x = elm.offsetLeft; 
    y = elm.offsetTop;
    elm = elm.offsetParent; 
    while(elm != null) {
      x = parseInt(x) + parseInt(elm.offsetLeft);
      y = parseInt(y) + parseInt(elm.offsetTop);
      elm = elm.offsetParent;
    }
    return {'xp':x, 'yp':y};
  },
  getCoords: function(e) {
    x = e.pageX;
    y = e.pageY;
    return {'xp':x, 'yp':y};
  }
};


// registers 'mousemove' event to parent_div
document.getElementById(parent_div).addEventListener('mousemove', function(e){
    div_moving = document.getElementById('div_moving');
    if(!div_moving){
        return;
    }
  mouseXY = movingDiv.getCoords(e);
  div_moving.style.left = mouseXY.xp + 3 + 'px';
  div_moving.style.top = mouseXY.yp - 3 + 'px';
});


var cells = document.getElementsByClassName("hour_cell");
for(let item of cells){
    item.addEventListener('mousedown', function(e){
        if(event_copied){
            event_copied = false;
            const event = {};
            Object.defineProperties(event, {
                day: {value: parseInt(item.getAttribute('data-day'))},
                hour: {value: parseInt(item.getAttribute('data-hour'))},
                length: {value: parseInt(copied_event_length)},
                name: {value: copied_event_name},
                color: {value: copied_event_color},
                notes: {value: copied_event_notes},
            });
            createEvent(event);
        }
        if(item.getAttribute('data-taken')){
            return;
        }
        //this assumes that there has been a '+' element added
        if(item.hasChildNodes()){
            item.removeChild(item.firstChild);
            document.getElementById('new-event-day-input').selectedIndex = item.getAttribute('data-day');
            document.getElementById('new-event-hour-input').value = item.getAttribute('data-hour');
            document.getElementById('add-event-modal').style.display = 'flex';
        }
        if(selected_id && document.getElementById(selected_id).childNodes[0]){
            var selected_element = document.getElementById(selected_id);
            selected_element.removeChild(selected_element.childNodes[0]);
            selected_id = null;
        }
        selected_id = item.getAttribute('id');
        var plus_symbol = document.createElement("i");
        plus_symbol.setAttribute('class', 'fas fa-plus');
        item.appendChild(plus_symbol);
    });
}

function changeTutorialPages(page_ID){
    var pages = document.getElementsByClassName("tutorial-page");
    for(i = 0; i < pages.length; i++){
        pages[i].style.display = 'none';
    }
    document.getElementById(page_ID).style.display = '';
}

document.getElementById("tutorial").onclick = function(){
    document.getElementById("tutorial-modal").style.display = 'flex';
}

document.getElementById("tutorial-close-button").onclick = function(){
    document.getElementById("tutorial-modal").style.display = 'none';
}

document.getElementById("tutorial-create-events").onclick = function(){
    changeTutorialPages("tutorial-create-events-page");
}

document.getElementById("tutorial-system-benefits").onclick = function(){
    changeTutorialPages("tutorial-system-benefits-page");
}

document.getElementById("tutorial-settings").onclick = function(){
    changeTutorialPages("tutorial-settings-page");
}
