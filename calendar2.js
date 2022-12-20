(function() {
    let template = document.createElement("template");

    template.innerHTML = `
    <link rel="stylesheet" href="./style.css">

        <div class="wrapper">
        <h1>Events for this Month.</h1>
        <div id="calendar"></div>
        <div id="calendar_data">
        <h3>No Events</h3>
        <dl>
            <dt><dfn>Title:</dfn></dt><dd>No Events for this Day</dd>
            <dt><dfn>Hour:</dfn></dt><dd>No provide</dd>
            <dt><dfn>Venue:</dfn></dt><dd>No provide</dd>
            <dt><dfn>Location:</dfn></dt><dd>No provide</dd>
            <dt><dfn>Description:</dfn></dt><dd>No provide</dd>
            <dt><dfn>More Info:</dfn></dt><dd><a href="#" title="More info">Here</a><dt></dd>
        </dl>
        </div>
        <div class="clearfix"></div>
        <div id="json">
        <pre><code>{
            "9/12/2014": {
                "type":"Conference",
                "title": "International Conference",
                "venue":"Hyatt Regency Hotel",
                "location": "Calgary Alberta , Canada",
                "time": "10:00 AM",
                "desc": "Lorem ipsum dolor sit amet...",
                "more": "http://www.example.com"
            }
        }</code></pre>
        </div>
        </div>
    `;

    class Map extends HTMLElement
        {
            constructor() {
                super();

                this.appendChild(template.content.cloneNode(true));
                this._props = {};
                let that = this;

                // Start
            _('#calendar').innerHTML = calendar();

            // short queySelector
            function _(s) {
            return document.querySelector(s);
            };

            // show info
            function showInfo(event) {
            // link 
            var url = 'https://dl.dropboxusercontent.com/u/23834858/api/calendar.json';
            // get json
            getjson(url, function(obj) {
                for (key in obj) {
                // if has envent add class
                if(_('[data-id="' + key + '"]')){
                    _('[data-id="' + key + '"]').classList.add('event');        
                }
                if (event === key) {
                    // template info
                    var data = '<h3>' + obj[key].type + '</h3>' +
                        '<dl>' +
                        '<dt><dfn>Title:</dfn></dt><dd>' + obj[key].title + '</dd>' +
                        '<dt><dfn>Hour:</dfn></dt><dd>' + obj[key].time + '</dd>' +
                        '<dt><dfn>Venue:</dfn></dt><dd>' + obj[key].venue + '</dd>' +
                        '<dt><dfn>Location:</dfn></dt><dd>' + obj[key].location + '</dd>' +
                        '<dt><dfn>Description:</dfn></dt><dd>' + obj[key].desc + '</dd>' +
                        '<dt><dfn>More Info:</dfn></dt><dd><a href="' + obj[key].more +
                        '" title="More info">Here</a><dt></dd>' +
                        '</dl>';
                    return _('#calendar_data').innerHTML = data;
                }
                }
            });
            }

            // simple calendar
            function calendar() {
            // show info on init
            showInfo();

            // vars
            var day_of_week = new Array(
                'Sun', 'Mon', 'Tue',
                'Wed', 'Thu', 'Fri', 'Sat'),
                month_of_year = new Array(
                'January', 'February', 'March',
                'April', 'May', 'June', 'July',
                'August', 'September', 'October',
                'November', 'December'),
                
                Calendar = new Date(),
                year = Calendar.getYear(),
                month = Calendar.getMonth(),
                today = Calendar.getDate(),
                weekday = Calendar.getDay(),
                html = '';

            // start in 1 and this month
            Calendar.setDate(1);
            Calendar.setMonth(month);

            // template calendar
            html = '<table>';
            // head
            html += '<thead>';
            html += '<tr class="head_cal"><th colspan="7">' + month_of_year[month] + '</th></tr>';
            html += '<tr class="subhead_cal"><th colspan="7">' + Calendar.getFullYear() + '</th></tr>';
            html += '<tr class="week_cal">';
            for (index = 0; index < 7; index++) {
                if (weekday == index) {
                html += '<th class="week_event">' + day_of_week[index] + '</th>';
                } else {
                html += '<th>' + day_of_week[index] + '</th>';
                }
            }
            html += '</tr>';
            html += '</thead>';

            // body
            html += '<tbody class="days_cal">';
            html += '</tr>';
            // white zone
            for (index = 0; index < Calendar.getDay(); index++) {
                html += '<td class="white_cal"> </td>';
            }
            
            for (index = 0; index < 31; index++) {
                if (Calendar.getDate() > index) {

                week_day = Calendar.getDay();
                
                if (week_day === 0) {
                    html += '</tr>';
                }
                if (week_day !== 7) {
                    // this day
                    var day = Calendar.getDate();
                    var info = (Calendar.getMonth() + 1) + '/' + day + '/' + Calendar.getFullYear();

                    if (today === Calendar.getDate()) {
                    html += '<td><a class="today_cal" href="#" data-id="' + info + '" onclick="showInfo(\'' + info + '\')">' +
                        day + '</a></td>';

                    showInfo(info);
                    
                    } else {
                    html += '<td><a href="#" data-id="' + info + '" onclick="showInfo(\'' + info + '\')">' +
                        day + '</a></td>';
                    }

                }
                if (week_day == 7) {
                    html += '</tr>';
                }
                }
                Calendar.setDate(Calendar.getDate() + 1);
            } // end for loop
            return html;
            }


            //   Get Json data  
            function getjson(url, callback) {
            var self = this,
                ajax = new XMLHttpRequest();
            ajax.open('GET', url, true);
            ajax.onreadystatechange = function() {
                if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    var data = JSON.parse(ajax.responseText);
                    return callback(data);
                } else {
                    console.log(ajax.status);
                }
                }
            };
            ajax.send();
            }

            }//end of constructor
        }//end of class

        let scriptSrc = "https://js.arcgis.com/4.18/"
        let onScriptLoaded = function() {
            customElements.define("com-sap-custom-geomap", Map);
        }

        //SHARED FUNCTION: reuse between widgets
        //function(src, callback) {
        let customElementScripts = window.sessionStorage.getItem("customElementScripts") || [];
        let scriptStatus = customElementScripts.find(function(element) {
            return element.src == scriptSrc;
        });

        if (scriptStatus) {
            if(scriptStatus.status == "ready") {
                onScriptLoaded();
            } else {
                scriptStatus.callbacks.push(onScriptLoaded);
            }
        } else {
            let scriptObject = {
                "src": scriptSrc,
                "status": "loading",
                "callbacks": [onScriptLoaded]
            }
            customElementScripts.push(scriptObject);
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = scriptSrc;
            script.onload = function(){
                scriptObject.status = "ready";
                scriptObject.callbacks.forEach((callbackFn) => callbackFn.call());
            };
            document.head.appendChild(script);
        }

//END SHARED FUNCTION
})();
