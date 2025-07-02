# Custom HA Calendar Card

A custom Lovelace card for Home Assistant that visually replicates Google Calendar's 7-day timeline view with hourly slots.

## Features

- 📅 7-day week view with hourly grid
- 🎨 Supports multiple calendar entities with custom colors
- ⚡ Fetches Home Assistant calendar events via WebSocket
- 🧩 Compatible with Lovelace manual YAML configuration

## Installation

1. Copy `google-style-calendar-card.js` **and** `google-style-calendar-card-editor.js` to `/config/www/custom-ha-calendar-card/` in your Home Assistant.
2. Add the following to your Lovelace resources:

```yaml
- url: /local/custom-ha-calendar-card/google-style-calendar-card.js
  type: module
- url: /local/custom-ha-calendar-card/google-style-calendar-card-editor.js
  type: module
```

3. Add the card manually to your dashboard using YAML:

```yaml
type: 'custom:google-style-calendar-card'
calendars:
  - entity: calendar.family
    color: '#2196F3'
  - entity: calendar.work
    color: '#4CAF50'
```

## HACS Support (Optional)
This repo includes `hacs.json`, so you can add it as a custom repository to HACS.
