# Radiology Forensic Expert

**LLM Medical Image Authenticity Verifier**

This tool uses **Gemini 2.5 Pro/Flash** vision capabilities to distinguish between real radiological scans and AI-generated counterparts. It is a client-side React application that connects directly to the Gemini API.

## Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the application locally:
    ```bash
    npm run dev
    ```
    Open the link provided (usually `http://localhost:5173`).

## Deployment

This app is configured for **Netlify**.
- Connect your repository to Netlify.
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/dist`

## Usage

-   Enter your **Google Gemini API Key** in the sidebar.
-   Upload a **Reference Image** (Real).
-   Upload **Test Image A** and **Test Image B**.
-   Click **"Run Forensic Analysis"**.
