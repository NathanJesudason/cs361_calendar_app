var postRequest = new XMLHttpRequest();
postRequest.open('POST', '/getJSON');
let data = "";
let hours = [...Array(7)].map(e => Array(24).fill(0));
postRequest.addEventListener('load', function(event){
    if(event.target.status === 200){
        data = JSON.parse(postRequest.responseText);
        console.log(data);
        console.log(data.Events);
    }else{
        alert(event.target.response);
    }

    for(i = 0; i < data.Events.length; i++){
        for(j = 0; j < data.Events[i].length; j++){
            hours[data.Events[i].day][data.Events[i].hour + j] = 1;
        }
    }

    var day = -1;
    var hour = -1;
    var length = -1;
    var name = "";
    var color = "";
    console.log(data.Events);
    for(i = 0; i < data.Events.length; i++){
        day = data.Events[i].day;
        hour = data.Events[i].hour;
        length = data.Events[i].length;
        name = data.Events[i].name;
        color = data.Events[i].color;
        var id = day.toString() + "-" + hour.toString();
        var textNode = document.createTextNode(name);
        document.getElementById(id).setAttribute('rowspan', length.toString());
        document.getElementById(id).setAttribute('style', ('background-color: ' + color));
        var button = document.createElement("button");
        button.setAttribute('onclick', 'deleteEvent("' + name + '", ' + day + ', ' + hour + ', ' + length + ', "' + color +'")');
        var icon = document.createElement("i");
        icon.setAttribute('class', 'fas fa-trash');
        button.appendChild(icon);
        document.getElementById(id).appendChild(textNode);
        document.getElementById(id).appendChild(button);
        for(j = 1; j < data.Events[i].length; j++){
            var num = hour + j;
            var idToDelete = day.toString() + "-" + num.toString();
            console.log(idToDelete);
            document.getElementById(idToDelete).remove();
        }
    }
});

function setWeather(day, temp, weather){
    switch(weather){
        case "Sunny":
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
        case "Partly Cloudy":
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

    document.getElementById(day + "-temp").innerText = temp.toString();

}
var getWeatherRequest = new XMLHttpRequest();
getWeatherRequest.open('GET', '/getWeather');
getWeatherRequest.addEventListener('load', function(event){
    if(event.target.status === 200){
       var wData = JSON.parse(getWeatherRequest.responseText);
        console.log(wData);
    }else{
        alert(event.target.response);
    }

    setWeather("Monday", wData.Monday.Temperature, wData.Monday.Weather);
    setWeather("Tuesday", wData.Tuesday.Temperature, wData.Tuesday.Weather);
    setWeather("Wednesday", wData.Wednesday.Temperature, wData.Wednesday.Weather);
    setWeather("Thursday", wData.Thursday.Temperature, wData.Thursday.Weather);
    setWeather("Friday", wData.Friday.Temperature, wData.Friday.Weather);
    setWeather("Saturday", wData.Saturday.Temperature, wData.Saturday.Weather);
    setWeather("Sunday", wData.Sunday.Temperature, wData.Sunday.Weather);
});
postRequest.send();
getWeatherRequest.send();


function deleteEvent(iname, iday, ihour, ilength, icolor){
    console.log("event delete called");
    var postRequest = new XMLHttpRequest();
    var URL = "/deleteEvent";
    postRequest.open('DELETE', URL);
    var reqBody = JSON.stringify({
        event_name: iname,
        day: parseInt(iday),
        hour: parseInt(ihour),
        length: parseInt(ilength),
        color: icolor
    });

    postRequest.setRequestHeader('Content-Type', 'application/json');
    postRequest.addEventListener('load', function(event){
        if(event.target.status === 200){
            location.reload();
        }else{
            alert(event.target.response);
        }
    });
    postRequest.send(reqBody);
}
/* var hours = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
];

for(i = 0; i < 7; i++){
    for(j = 0; j < 24; i++){
        hours[i][j] = 0;
    }
} */


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


document.getElementById('add-new-event-button').onclick = function() {
    var iname = document.getElementById('new-event-name-input').value;
    var iday = parseDay(document.getElementById('new-event-day-input').value);
    var ihour = parseInt(document.getElementById('new-event-hour-input').value);
    var ilength = parseInt(document.getElementById('new-event-length-input').value);
    var colors = document.getElementsByClassName('new-event-color-radio');
    var icolor = "";
    for(i = 0; i < colors.length; i++){
        if(colors[i].checked){
            icolor = colors[i].value;
        }
    }


    if(iname && (iday != -1) && ihour && ilength){
        if(ihour + ilength <= 24){
            var free = true;
            for(i = 0; i < ilength; i++){
                if(hours[iday][ihour + i] == 1){
                    free = false;
                    break;
                }
            }
            if(free){
                var postRequest = new XMLHttpRequest();
                var URL = "/addEvent";
                postRequest.open('POST', URL);
                var reqBody = JSON.stringify({
                    event_name: iname,
                    day: iday,
                    hour: ihour,
                    length: ilength,
                    color: icolor
                });

                postRequest.setRequestHeader('Content-Type', 'application/json');
                postRequest.addEventListener('load', function(event){
                    if(event.target.status === 200){
                        location.reload();
                    }else{
                        alert(event.target.response);
                    }
                });
                postRequest.send(reqBody);
            }else{
                alert("Event conflict!");
            }
        }
    }
    //document.getElementById('add-event-modal').style.display = 'none';
}

document.getElementById('body').onload = function(){

}




/*
document.getElementById('modal-close-button').onclick = function() {
    document.getElementById('add-class-modal').style.display = 'none';
}

document.getElementById('add-new-class-button').onclick = function(){
    var name_input = document.getElementById('new-class-name-input');
    var name = name_input.value;
    if(name){
        var cards = document.querySelectorAll("#class-card");
        var NewName = true;
        for(var i = 0; i < cards.length; i++){
            if(cards[i].getAttribute('data-name') == name){
                NewName = false;
            }
        }
        if(NewName){
            addClass(name);
            document.getElementById('add-class-modal').style.display = 'none';
            name_input.value = "";
        }
    }
}
//var more_menus = document.querySelectorAll(".more-options-menu");
var menus = document.querySelectorAll(".more-options");
//menus.forEach
for(var i = 0; i < menus.length; i++){
    //console.log(menus[i].parentElement.lastElementChild);
    menus[i].onclick = function(){
        //should grab more options menu
        if(this.parentElement.lastElementChild.hasAttribute('hidden')){
            this.parentElement.lastElementChild.removeAttribute('hidden');
        }else{
            this.parentElement.lastElementChild.setAttribute('hidden', "");
        }
    }
}

var deleteClassButtons = document.querySelectorAll(".delete-class");
for(var i = 0; i < deleteClassButtons.length; i++){
    deleteClassButtons[i].onclick = function(){
        removeClass(event);
    }
}


function addClass(name){
    var postRequest = new XMLHttpRequest();
    var URL = "/addClass";
    postRequest.open('POST', URL);
    var reqBody = JSON.stringify({
        class_name: name
    });

    postRequest.setRequestHeader('Content-Type', 'application/json');
    postRequest.addEventListener('load', function (event){
        if (event.target.status === 200) {
            location.reload();
        }else{
            alert("Error adding event to server: " + event.target.response);
        }
    });
    postRequest.send(reqBody);

}*/