# MoodTune Vision

A browser app that detects mood from facial features (eye amplitude, estimated eye wavelength, mouth curvature), then recommends songs based on selected language.

## Run on localhost

1. Make sure you have Node.js 18+ installed.
2. From this folder, run:

```bash
npm start
```

3. Open:

- `http://127.0.0.1:3000`

## Notes

- Allow **camera permission** in the browser.
- The app loads `face-api.js` and model files from CDN, so internet is required.
- YouTube embeds may be restricted in some environments.
