# Deploying to Netlify

Your project is configured with a `netlify.toml` file that makes deployment automated and easy.

## Option 1: Deploy via Git (Recommended)
If your project is on GitHub/GitLab/Bitbucket:
1.  Log in to [Netlify](https://app.netlify.com).
2.  Click **"Add new site"** -> **"Import an existing project"**.
3.  Connect your Git provider and select this repository.
4.  Netlify will detect the `netlify.toml` settings automatically:
    *   **Base directory:** `frontend`
    *   **Build command:** `npm run build`
    *   **Publish directory:** `dist`
5.  Click **Deploy**.

## Option 2: Deploy via Command Line (Netlify CLI)
This allows you to deploy directly from your terminal.

1.  **Install Netlify CLI** (if not already installed):
    ```bash
    npm install -g netlify-cli
    ```

2.  **Login to Netlify**:
    ```bash
    netlify login
    ```

3.  **Deploy**:
    Run this command from the root of your project (`C:\Users\user\Desktop\LLM-Expert`):
    ```bash
    netlify deploy
    ```
    *   It will ask for the **Publish directory**. Since you have a `netlify.toml`, it should default to `frontend/dist`. If not, specify `frontend/dist`.
    *   This creates a "Draft" deployment.

4.  **Deploy to Production**:
    ```bash
    netlify deploy --prod
    ```

## Option 3: Manual Drag & Drop
1.  Run the build command locally (you already did this!):
    ```bash
    cd frontend
    npm run build
    ```
2.  Locate the folder: `C:\Users\user\Desktop\LLM-Expert\frontend\dist`
3.  Go to [Netlify Drop](https://app.netlify.com/drop).
4.  Drag and drop the `dist` folder onto the page.
