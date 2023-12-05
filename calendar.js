
var getScriptPromisify = (src) => {
  return new Promise(resolve => {
    $.getScript(src, resolve)
  })
}

(function () {
  let template = document.createElement("template");
  template.innerHTML = `
          <input id="calendar" type="date"/>
      `;

  class DatePicker extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(template.content.cloneNode(true));

      this._calendar = this.shadowRoot.querySelector("#calendar");

      this._calendar.addEventListener("change", this._onChange.bind(this));
    }

   
    _onChange() {
      // Fires a custom event when date changes
      let dateSelectedEvent = new CustomEvent("dateSelected", {
        detail: {
          value: this._calendar.value
        }
      });
      this.dispatchEvent(dateSelectedEvent);
    }

  }

  customElements.define("com-sap-sample-datepicker", DatePicker);
})();