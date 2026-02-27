# 🚨 DisasterIQ Platform (DDA)

Disaster Damage Assessment (DDA) is a full-stack, real-time, AI-powered platform for field assessors and command centers to report, analyze, and respond to structural damage and hazards in disaster zones. 

This repository contains:
- **Frontend**: A Next.js (React) application with interactive dashboards, live maps, and field reporting tools.
- **Backend**: A Node.js/TypeScript API featuring native PyTorch/ONNX AI classification, WebSocket broadcasting, and a PostgreSQL database.

---

## 🚀 Getting Started

To run the complete platform locally, you need to start both the backend infrastructure and the frontend server.

### 1. Start the Backend Infrastructure (Docker)
Ensure you have Docker Desktop running. Open a terminal in the root folder (`hack/`) and run:
```bash
docker-compose up --build -d
```
*This spins up PostgreSQL, Redis, and the Node.js Backend API on `http://localhost:4000`.*
*Note: The first run downloads the AI classification model (~170MB) which takes a minute or two.*

**Seed the Database:**
To populate the database with mock historical data, zones, and users, run:
```bash
docker-compose exec app npm run seed:demo
```

### 2. Start the Frontend (Next.js)
Open a **new** terminal window, navigate into the `frontend` directory, install dependencies (if you haven't), and start the development server:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will now be available at `http://localhost:3000`.*

---

## 🛠️ User Flow: How to Upload a Report & Use the AI

Now that both halves are running and talking to each other, follow these steps to test the real-time AI and WebSocket features:

### Step 1: Log In
Go to `http://localhost:3000/login` and sign in. You can use any of the demo emails listed on the screen. The password for all forms is `password123`.
- Example login: `assessor@demo.com`

### Step 2: Start a New Assessment
Once logged into the Dashboard, click the **"New Report"** button in the top right, or navigate your sidebar to the Report module.

### Step 3: Complete the Field Data
- **Location:** The app relies on your browser's Geolocation API. Make sure you allow location access to automatically pull lat/lng coordinates.
- **Structure & Damage:** Click the relevant buttons to identify the structure (e.g., Residential) and the type of incident (e.g., Earthquake).

### Step 4: Upload Photo for AI Classification (The Magic!)
On the "Photos" step:
1. Click the dashed box area to browse your computer, and **select a photo of disaster damage** (like a flooded street, fire, or broken building).
2. Click the **"Run AI Analysis"** button.
3. The image goes to the Node.js backend where the PyTorch model evaluates it. It will return exactly what it detects and adjust your "Severity" rating (Critical, High, Moderate, Low) automatically based on the AI's math!

### Step 5: Submit and Watch Live
Proceed to the end and click **Submit Report**.
- Because WebSockets are configured, the backend will blast a `"newAssessment"` event across the network securely.
- If you have another browser tab open to the Dashboard, you will see the charts, stats, and live map update instantly without a page refresh!

---

## 🛑 Stopping the Platform

- **Frontend:** Hit `Ctrl + C` in the frontend terminal.
- **Backend:** Run `docker-compose down` in the root terminal to wipe the active containers (data stays saved in the database storage volume).
