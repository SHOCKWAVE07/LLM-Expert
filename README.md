# Radiology Forensic Expert

 Anti-Gravity: Medical Image Authenticity Verifier. This tool uses **Gemini 1.5 Pro** vision capabilities to distinguish between real radiological scans and AI-generated counterparts.

## Setup

1.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

2.  Run the application:
    ```bash
    streamlit run app.py
    ```

3.  Use the application:
    -   Enter your Google Gemini API Key in the sidebar.
    -   Upload a Reference Image (Real).
    -   Upload Test Image A and Test Image B.
    -   Click "Run Forensic Analysis".
