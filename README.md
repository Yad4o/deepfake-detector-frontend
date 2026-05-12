# Deepfake Detector — Frontend

React 18 + TypeScript frontend for the [Deepfake Detection API](https://github.com/prajwal5065/deepfake-detection-api).

## Features

- Drag-and-drop image + video upload
- Live verdict badge (FAKE / REAL / UNCERTAIN) with confidence meter
- GradCAM heatmap display for explainability
- Frame-by-frame score bar chart for video analysis
- Detection history with filters (verdict, media type) and pagination
- Aggregate stats dashboard (total, fake rate, avg probability)
- Skeleton loaders, toast notifications, empty/error states

## Pages

| Route | Description |
|---|---|
| `/` | Upload and analyze |
| `/history` | Paginated detection log + stats |
| `/result/:id` | Full detail view with frame chart + GradCAM |

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/detect`, `/history`, and `/uploads` to the FastAPI backend at `http://localhost:8000`.

## Backend

Start the API first:

```bash
cd ../deepfake-detection-api
docker-compose up
# or: uvicorn app.main:app --reload
```

## Tech stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- react-dropzone
- react-router-dom v6
