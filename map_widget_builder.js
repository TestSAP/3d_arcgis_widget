(function () {
    let tmpl = document.createElement("template");
    tmpl.innerHTML = `
      <style>
          fieldset {
              margin-bottom: 10px;
              padding: 4px;
              border: 1px solid #afafaf;
              border-radius: 3px;
          }
          table {
              width: 100%;
              padding : 20px;
          }
          input, textarea, select {
              font-family: "72",Arial,Helvetica,sans-serif;
              width: 100%;
              padding: 5px;
              box-sizing: border-box;
              border: 1px solid #bfbfbf;
          }
          input[type=checkbox] {
              width: inherit;
              margin: 6px 3px 6px 5px;
              vertical-align: middle;
          }
          
      </style>
      <form id="form" autocomplete="off">
        <fieldset> 
          <legend>Modification Panel</legend>
          <table>
            <tr>
                <td><label for="layerURL">Layer URL:</label></td>
                <td><input id="layerURL" name="layerURL" type="text"></td>
            </tr>
            <tr>
              <td><label for="degrees">Degrees:</label></td>
              <td><input id="degrees" name="degrees" type="number"></td>
            </tr>
            <tr>
              <td><label for="center">Center:</label></td>
              <td><input id="center" name="center" type="text"></td>
            </tr>
            <tr>
              <td><label for="zoom">Zoom:</label></td>
              <td><input id="zoom" name="zoom" type="number"></td>
            </tr>
          </table>
        </fieldset>
        <button type="submit" hidden>Submit</button>
      </form>
    `;

    class restAPIAps extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ mode: "open" });
            this._shadowRoot.appendChild(tmpl.content.cloneNode(true));

            let form = this._shadowRoot.getElementById("form");
            form.addEventListener("submit", this._submit.bind(this));
            form.addEventListener("change", this._change.bind(this));
        }

        connectedCallback() {
        }

        _submit(e) {
            e.preventDefault();
            let properties = {};
            for (let name of restAPIAps.observedAttributes) {
                properties[name] = this[name];
            }
            console.log(properties);
            this._firePropertiesChanged(properties);
            return false;
        }
        _change(e) {
            this._changeProperty(e.target.name);
        }
        _changeProperty(name) {
            let properties = {};
            properties[name] = this[name];
            this._firePropertiesChanged(properties);
        }

        _firePropertiesChanged(properties) {
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: properties
                }
            }));
        }
        
        get layerURL() {
            return this.getValue("layerURL");
        }
        set layerURL(value) {
            this.setValue("layerURL", value);    
        }

        get degrees() {
            return this.getValue("degrees");
        }
        set degrees(value) {
            this.setValue("degrees", value);    
        }

        get center() {
            return this.getValue("center");
        }
        set center(value) {
            this.setValue("center", value);    
        }

        get zoom() {
            return this.getValue("zoom");
        }
        set zoom(value) {
            this.setValue("zoom", value);    
        }
        
        getValue(id) {
            return this._shadowRoot.getElementById(id).value;
        }
        setValue(id, value) {
          console.log(id +":" + value);
            this._shadowRoot.getElementById(id).value = value;
        }

        static get observedAttributes() {
            return [
              "layerURL",
              "degrees",
              "center",
              "zoom"
            ];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue != newValue) {
                this[name] = newValue;
            }
        }
    }
    customElements.define("com-sap-custom-geomap-builder", restAPIAps);
})();