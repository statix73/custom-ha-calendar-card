class GoogleStyleCalendarCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    this.hours = Array.from({ length: 13 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);
    this.config = { calendars: [] };
  }

  setConfig(config) {
    if (!config.calendars || !Array.isArray(config.calendars)) {
      throw new Error("You must define a list of calendars with entity and color");
    }
    this.config = config;
    this.render();
  }

  getCardSize() {
    return 10;
  }

  connectedCallback() {
    this._lastEventLoad = 0;
  }

  set hass(hass) {
    this._hass = hass;
    const now = Date.now();
    if (!this._lastEventLoad || now - this._lastEventLoad > 60 * 1000) {
      this._lastEventLoad = now;
      this.loadEvents();
    }
  }

  async loadEvents() {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const end = new Date(today.setDate(today.getDate() + 7)).toISOString();

    const calendarPromises = this.config.calendars.map(async (calendar) => {
      const result = await this._hass.callWS({
        type: "calendar/list_events",
        entity_id: calendar.entity,
        start_date: start,
        end_date: end
      });
      return result.map(e => ({ ...e, color: calendar.color, entity: calendar.entity }));
    });

    this.events = (await Promise.all(calendarPromises)).flat();
    this.render();
  }

  render() {
    if (!this.shadowRoot) return;

    const style = document.createElement('style');
    style.textContent = `
      .calendar-container {
        display: grid;
        grid-template-columns: 60px repeat(7, 1fr);
        grid-auto-rows: 40px;
        border: 1px solid #ccc;
        font-family: sans-serif;
        position: relative;
      }
      .hour-label {
        background: #f5f5f5;
        border-bottom: 1px solid #ddd;
        padding: 4px;
        font-size: 12px;
        text-align: right;
      }
      .day-header {
        background: #eee;
        text-align: center;
        font-weight: bold;
        border-left: 1px solid #ccc;
        border-bottom: 1px solid #ccc;
      }
      .cell {
        border-left: 1px solid #eee;
        border-bottom: 1px solid #eee;
        position: relative;
      }
      .event {
        position: absolute;
        font-size: 10px;
        padding: 2px;
        border-radius: 3px;
        color: white;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `;

    const container = document.createElement('div');
    container.classList.add('calendar-container');

    // Top row: empty + day headers
    container.appendChild(document.createElement('div'));
    this.weekdays.forEach(day => {
      const div = document.createElement('div');
      div.classList.add('day-header');
      div.textContent = day;
      container.appendChild(div);
    });

    // Hour rows
    this.hours.forEach(hour => {
      const hourLabel = document.createElement('div');
      hourLabel.classList.add('hour-label');
      hourLabel.textContent = hour;
      container.appendChild(hourLabel);

      this.weekdays.forEach(() => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        container.appendChild(cell);
      });
    });

    // Render events if any
    if (this.events) {
      const gridStart = new Date();
      gridStart.setHours(8, 0, 0, 0);

      this.events.forEach(event => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        const dayOffset = (start.getDay() + 6) % 7; // Adjust so Monday = 0
        const top = ((start.getHours() + start.getMinutes() / 60) - 8) * 40;
        const height = ((end - start) / 1000 / 60 / 60) * 40;

        const eventEl = document.createElement('div');
        eventEl.classList.add('event');
        eventEl.textContent = event.summary;
        eventEl.style.background = event.color || '#2196F3';
        eventEl.style.left = `calc(60px + ${dayOffset} * ((100% - 60px) / 7))`;
        eventEl.style.top = `${top}px`;
        eventEl.style.height = `${height}px`;
        eventEl.style.width = `calc((100% - 60px)/7 - 4px)`;
        container.appendChild(eventEl);
      });
    }

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);
  }
}

GoogleStyleCalendarCard.editor = 'google-style-calendar-card-editor';
customElements.define('google-style-calendar-card', GoogleStyleCalendarCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'google-style-calendar-card',
  name: 'Google Calendar Timeline Card',
  description: 'A 7-day calendar timeline with hourly slots and calendar entity support.'
});
