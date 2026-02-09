# Torc Calculations and automations (Monday.com App)

This is a Monday.com Integration App that allows you to calculate formula results based on column changes and cast them to another column.

It is built with **Azure Functions (TypeScript)** for the backend and **React (Vite + TypeScript)** for the configuration frontend.

## Walkthrough & Setup

This guide explains how to run the app locally and configure it in Monday.com.

### Prerequisites
*   Node.js v20+
*   Monday.com Account (Developer Mode enabled)
*   `ngrok` (for tunneling)

### 1. Start the Backend (Azure Functions)
The backend runs on port **7071**.

```bash
cd backend
npm start
```

### 2. Start the Frontend (Config UI)
The frontend runs on port **5173** (usually).

```bash
cd frontend
npm run dev
```

### 3. Expose Local Server
Monday.com needs to access your local backend to send webhooks.

```bash
npx ngrok http 7071
```
*   Copy the HTTPS URL (e.g., `https://random-id.ngrok-free.app`).

### 4. Configure Monday.com App
1.  Go to **Developer Center** > **New App**.
2.  **Features** > **Create Feature** > **Integration**.
3.  **User Configuration URL**: Set this to your frontend URL (e.g., `https://random-frontend-id.ngrok-free.app` or just hardcode `http://localhost:5173` if testing locally with a tunnel for frontend too, but standard practice is hosting frontend).
    *   *For local dev, usually you just run the recipe logic.*
4.  **Workflow**:
    *   **Trigger**: "When a column changes" (Built-in).
    *   **Action**: "Run an action" (Custom).
    *   **Action URL**: `https://<your-ngrok-url>/api/mondayAction`.

### 5. Testing
1.  Add the integration to a board.
2.  Configure it: "When **Status** changes, perform formula **{Numbers} * 2** and cast to **Result**."
3.  Change the status column on an item.
4.  Watch the **Result** column update!
