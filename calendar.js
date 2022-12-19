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
    `;


    // Função que retorna a data atual do calendário 
    function getCurrentDate(element, asString) {
        if (element) {
            if (asString) {
                return element.textContent = weekdays[date.getDay()] + ', ' + date.getDate() + " of " + months[date.getMonth()]+ " " + date.getFullYear();
            }
            return element.value = date.toISOString().substr(0, 10);
        }
        return date;
    }


    

    // Altera a data atráves do formulário
    function setDate(form) {
        let newDate = new Date(form.date.value);
        date = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate() + 1);
        generateCalendar();
        return false;
    }

    // Método Muda o mês e o ano do topo do calendário
    function changeHeader(dateHeader) {
        const month = document.getElementById("month-header");
        if (month.childNodes[0]) {
            month.removeChild(month.childNodes[0]);
        }
        const headerMonth = document.createElement("h1");
        const textMonth = document.createTextNode(months[dateHeader.getMonth()].substring(0, 3) + " " + dateHeader.getFullYear());
        headerMonth.appendChild(textMonth);
        month.appendChild(headerMonth);
    }

    // Função para mudar a cor do botão do dia que está ativo
    function changeActive() {
        let btnList = document.querySelectorAll('button.active');
        btnList.forEach(btn => {
            btn.classList.remove('active');
        });
        btnList = document.getElementsByClassName('btn-day');
        for (let i = 0; i < btnList.length; i++) {
            const btn = btnList[i];
            if (btn.textContent === (date.getDate()).toString()) {
                btn.classList.add('active');
            }
        }
    }

    // Função que pega a data atual
    function resetDate() {
        date = new Date();
        generateCalendar();
    }

    // Muda a data pelo numero do botão clicado
    function changeDate(button) {
        let newDay = parseInt(button.textContent);
        date = new Date(date.getFullYear(), date.getMonth(), newDay);
        generateCalendar();
    }

    // Funções de avançar e retroceder mês e dia
    function nextMonth() {
        date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        generateCalendar(date);
    }

    function prevMonth() {
        date = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        generateCalendar(date);
    }


    function prevDay() {
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
        generateCalendar();
    }

    function nextDay() {
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        generateCalendar();
    }

    


    class Map extends HTMLElement
        {
            constructor() {
                super();

                this.appendChild(template.content.cloneNode(true));
                this._props = {};
                let that = this;
               
                let date = new Date();

                // Função principal que gera o calendário
    function generateCalendar() {

        // Pega um calendário e se já existir o remove
        const calendar = document.getElementById('calendar');
        if (calendar) {
            calendar.remove();
        }

        // Cria a tabela que será armazenada as datas
        const table = document.createElement("table");
        table.id = "calendar";

        // Cria os headers referentes aos dias da semana
        const trHeader = document.createElement('tr');
        trHeader.className = 'weekends';
        weekdays.map(week => {
            const th = document.createElement('th');
            const w = document.createTextNode(week.substring(0, 3));
            th.appendChild(w);
            trHeader.appendChild(th);
        });

        // Adiciona os headers na tabela
        table.appendChild(trHeader);

        //Pega o dia da semana do primeiro dia do mês
        const weekDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            1
        ).getDay();

        //Pega o ultimo dia do mês
        const lastDay = new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            0
        ).getDate();

        let tr = document.createElement("tr");
        let td = '';
        let empty = '';
        let btn = document.createElement('button');
        let week = 0;

        // Se o dia da semana do primeiro dia do mês for maior que 0(primeiro dia da semana);
        while (week < weekDay) {
            td = document.createElement("td");
            empty = document.createTextNode(' ');
            td.appendChild(empty);
            tr.appendChild(td);
            week++;
        }

        // Vai percorrer do 1º até o ultimo dia do mês
        for (let i = 1; i <= lastDay;) {
            // Enquanto o dia da semana for < 7, ele vai adicionar colunas na linha da semana
            while (week < 7) {
                td = document.createElement('td');
                let text = document.createTextNode(i);
                btn = document.createElement('button');
                btn.className = "btn-day";
                btn.addEventListener('click', function () { changeDate(this) });
                week++;



                // Controle para ele parar exatamente no ultimo dia
                if (i <= lastDay) {
                    i++;
                    btn.appendChild(text);
                    td.appendChild(btn)
                } else {
                    text = document.createTextNode(' ');
                    td.appendChild(text);
                }
                tr.appendChild(td);
            }
            // Adiciona a linha na tabela
            table.appendChild(tr);

            // Cria uma nova linha para ser usada
            tr = document.createElement("tr");

            // Reseta o contador de dias da semana
            week = 0;
        }
        // Adiciona a tabela a div que ela deve pertencer
        const content = document.getElementById('table');
        content.appendChild(table);
        changeActive();
        changeHeader(date);
        document.getElementById('date').textContent = date;
        getCurrentDate(document.getElementById("currentDate"), true);
        getCurrentDate(document.getElementById("date"), false);
    }

                document.onload = generateCalendar(date);

            } //end of constructor
        } //end of class

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
