// google-style-calendar-card-editor.js

class GoogleStyleCalendarCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  getConfig() {
    return this._config;
  }

  render() {
    if (!this.shadowRoot) return;

    const config = this._config || { calendars: [] };

    this.shadowRoot.innerHTML = `
      <style>
        .editor {
          padding: 16px;
        }
        .editor label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
        }
        .calendar-entry {
          margin-bottom: 16px;
        }
        input[type="text"], input[type="color"] {
          width: calc(100% - 12px);
          padding: 6px;
          margin-top: 4px;
          box-sizing: border-box;
        }
      </style>
      <div class="editor">
        <label>Calendars</label>
        ${config.calendars.map((cal, i) => `
          <div class="calendar-entry" data-index="${i}">
            <input type="text" name="entity" placeholder="calendar.entity_id" value="${cal.entity || ''}" />
            <input type="color" name="color" value="${cal.color || '#2196F3'}" />
          </div>
        `).join('')}
        <button id="add">Add Calendar</button>
      </div>
    `;

    this.shadowRoot.getElementById('add')?.addEventListener('click', () => {
      config.calendars.push({ entity: '', color: '#2196F3' });
      this.setConfig(config);
      this._fireChange();
    });

    this.shadowRoot.querySelectorAll('.calendar-entry input').forEach((input) => {
      input.addEventListener('change', (e) => {
        const div = input.closest('.calendar-entry');
        const index = parseInt(div.dataset.index);
        const name = input.name;
        config.calendars[index][name] = input.value;
        this.setConfig(config);
        this._fireChange();
      });
    });
  }

  _fireChange() {
    const event = new Event('config-changed', {
      bubbles: true,
      composed: true,
    });
    event.detail = { config: this._config };
    this.dispatchEvent(event);
  }
}

customElements.define('google-style-calendar-card-editor', GoogleStyleCalendarCardEditor);
