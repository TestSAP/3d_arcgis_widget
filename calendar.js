(function (){
    let template = document.createElement("template");

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];    

    template.innerHTML = `
    <link rel="stylesheet" href="./style.css">

    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800&display=swap" rel="stylesheet">

    <body>
        <div class="container">
            <div class="calendar-assets">
                <h1 id="currentDate"></h1>
                <div class="field">
                    <label for="date">Search by Date</label>
                    <form class="form-input" id="date-search" onsubmit="return setDate(this)">
                        <input type="date" class="text-field" name="date" id="date" required>
                        <button type="submit" class="btn btn-small" title="Pesquisar"><i class="fas fa-search"></i></button>
                    </form>
                </div>
                <div class="day-assets">
                    <button class="btn" onclick="prevDay()" title="Dia anterior">Prev<i class="fas fa-chevron-left"></i> </button>
                    <button class="btn" onclick="resetDate()" title="Dia atual"><i class="fas fa-calendar-day"></i> Date</button>
                    <button class="btn" onclick="nextDay()" title="Próximo dia">Next<i class="fas fa-chevron-right"></i> </button>
                </div>
            </div>
            <div class="calendar" id="table">
                <div class="header">
                    <!-- Aqui é onde ficará o h1 com o mês e o ano -->
                    <div class="month" id="month-header">

                    </div>
                    <div class="buttons">
                        <button class="icon" onclick="prevMonth()" title="Mês anterior"><<i class="fas fa-chevron-left"></i></button>
                        <button class="icon" onclick="nextMonth()" title="Próximo mês">><i class="fas fa-chevron-right "></i></button>
                    </div>
                </div>
            </div>
        </div>
    </body>
    
    <script  src="script.js"></script>

    `;
    
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
