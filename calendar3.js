(function () {
    let template = document.createElement("template");

    template.innerHTML = `
    <link rel="stylesheet" href="./style3.css">

    <div class="calendar">
    <div class="calendar__month">
        <div class="cal-month__previous"><</div>
        <div class="cal-month__current"></div>
        <div class="cal-month__next">></div>
    </div>
    <div class="calendar__head">
        <div class="cal-head__day"></div>
        <div class="cal-head__day"></div>
        <div class="cal-head__day"></div>
        <div class="cal-head__day"></div>
        <div class="cal-head__day"></div>
        <div class="cal-head__day"></div>
        <div class="cal-head__day"></div>
    </div>
    <div class="calendar__body">
        <div class="cal-body__week">
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        </div>
        <div class="cal-body__week">
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        </div>
        <div class="cal-body__week">
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        </div>
        <div class="cal-body__week">
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        </div>
        <div class="cal-body__week">
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        </div>
        <div class="cal-body__week">
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        <div class="cal-body__day"></div>
        </div>
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

                function init () {
                    moment.locale(window.navigator.userLanguage || window.navigator.language) 
                    
                    this.month = moment()
                    this.today = this.selected = this.month.clone()
                    this.weekDays = moment.weekdaysShort(true)
                    
                    this.headDivs.forEach((day, index) => {
                      day.innerText = this.weekDays[index]
                    })
                    
                    this.nextDiv.addEventListener('click', _ => { this.addMonth() })
                    this.prevDiv.addEventListener('click', _ => { this.removeMonth() })
                    
                    this.bodyDivs.forEach(day => {
                      day.addEventListener('click', e => {
                        const date = +e.target.innerHTML < 10 ? `0${e.target.innerHTML}` : e.target.innerHTML
                
                        if (e.target.classList.contains('cal-day__month--next')) {
                          this.selected = moment(`${this.month.add(1, 'month').format('YYYY-MM')}-${date}`)
                        } else if (e.target.classList.contains('cal-day__month--previous')) {
                          this.selected = moment(`${this.month.subtract(1, 'month').format('YYYY-MM')}-${date}`)
                        } else {
                          this.selected = moment(`${this.month.format('YYYY-MM')}-${date}`)
                        }
                
                        this.update()
                      })
                    })
                    
                    this.update()
                  }

                  function update () {
                    this.calendarDays = {
                      first: this.month.clone().startOf('month').startOf('week').date(),
                      last: this.month.clone().endOf('month').date()
                    }
                    
                    this.monthDays = {
                      lastPrevious: this.month.clone().subtract(1,'months').endOf('month').date(),
                      lastCurrent: this.month.clone().endOf('month').date()
                    }
                    
                    this.monthString = this.month.clone().format('MMMM YYYY')
                    
                    this.draw()
                  }
                  
                  function addMonth () {
                    this.month.add(1, 'month')
                    
                    this.update()
                  }
                  
                  function removeMonth () {
                    this.month.subtract(1, 'month')
                    
                    this.update()
                  }
                  
                  function draw () {
                    this.monthDiv.innerText = this.monthString
                  
                    let index = 0
                
                    if (this.calendarDays.first > 1) {
                      for (let day = this.calendarDays.first; day <= this.monthDays.lastPrevious; index ++) {
                        this.bodyDivs[index].innerText = day++
                
                        this.cleanCssClasses(false, index)
                
                        this.bodyDivs[index].classList.add('cal-day__month--previous')
                      } 
                    }
                
                    let isNextMonth = false
                    for (let day = 1; index <= this.bodyDivs.length - 1; index ++) {
                      if (day > this.monthDays.lastCurrent) {
                        day = 1
                        isNextMonth = true
                      }
                
                      this.cleanCssClasses(true, index)
                
                      if (!isNextMonth) {
                        if (day === this.today.date() && this.today.isSame(this.month, 'day')) {
                          this.bodyDivs[index].classList.add('cal-day__day--today') 
                        }
                
                        if (day === this.selected.date() && this.selected.isSame(this.month, 'month')) {
                          this.bodyDivs[index].classList.add('cal-day__day--selected') 
                        }
                
                        this.bodyDivs[index].classList.add('cal-day__month--current')
                      } else {
                        this.bodyDivs[index].classList.add('cal-day__month--next')
                      }
                
                      this.bodyDivs[index].innerText = day++
                    }
                  }
                  
                  function cleanCssClasses (selected, index) {
                    this.bodyDivs[index].classList.contains('cal-day__month--next') && 
                      this.bodyDivs[index].classList.remove('cal-day__month--next')
                    this.bodyDivs[index].classList.contains('cal-day__month--previous') && 
                      this.bodyDivs[index].classList.remove('cal-day__month--previous')
                    this.bodyDivs[index].classList.contains('cal-day__month--current') &&
                      this.bodyDivs[index].classList.remove('cal-day__month--current')
                    this.bodyDivs[index].classList.contains('cal-day__day--today') && 
                      this.bodyDivs[index].classList.remove('cal-day__day--today')
                    if (selected) {
                      this.bodyDivs[index].classList.contains('cal-day__day--selected') && 
                        this.bodyDivs[index].classList.remove('cal-day__day--selected') 
                    }
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