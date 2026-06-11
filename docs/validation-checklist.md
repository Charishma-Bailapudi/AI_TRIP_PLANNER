# Validation & Verification Checklist - AI Trip Planner

This document provides a technical validation checklist to verify the correct installation, compilation, linting, and bootstrapping of both the backend and frontend setup templates.

---

## 1. Backend Verification Checklist (`/server`)

### 1.1. Can TypeScript Compile?
*   **Command to Execute:**
    ```bash
    cd server
    npm run build
    ```
*   **Expected Output:**
    The command executes with zero terminal outputs and exits cleanly (exit code `0`). The compiler generates a compiled distribution directory `/server/dist/` mirroring the `/server/src/` folder tree.
*   **Pass Criteria:** Exit code `0`, no compilation errors in console, and `/server/dist/server.js` exists.
*   **Failure Troubleshooting Guide:**
    *   *Error: Cannot find module or type declarations:* Run `npm install` to ensure `@types/*` are populated.
    *   *Error: OutDir target is locked:* Verify permission access to write to `/server/dist/`.

---

### 1.2. Are Lint & Format Checks Passing?
*   **Command to Execute:**
    ```bash
    cd server
    npm run lint
    ```
*   **Expected Output:**
    No warnings or lint violations are reported in the console.
*   **Pass Criteria:** Exits with `0` and no lint errors.
*   **Failure Troubleshooting Guide:**
    *   *Error: No files matching the pattern 'src/**/*.ts' found (Windows Shell):* Update `package.json` to escape double quotes: `"lint": "eslint \"src/**/*.ts\""`.
    *   *Error: Prettier format violation:* Run `npm run format` to automatically format the code.

---

### 1.3. Are Environment Variables Loading?
*   **Command to Execute:**
    Create a local `/server/.env` file containing test variables, then trigger:
    ```bash
    cd server
    npm run dev
    ```
*   **Expected Output:**
    If configurations are missing or formatted incorrectly, the Zod parser prints validation errors and terminates immediately. If successful, logs indicate environment validation passed.
*   **Pass Criteria:** Server boots past the environment parsing stage.
*   **Failure Troubleshooting Guide:**
    *   *Error: ZodError - MONGODB_URI is required:* Ensure `.env` is located in the root of `/server/` (not `/server/src/`) and populated.
    *   *Error: ZodError - PORT is expected to be a number:* Ensure the `PORT` value contains only digit characters in the `.env` file.

---

### 1.4. Can MongoDB Connect?
*   **Command to Execute:**
    Ensure a local MongoDB server is active, then trigger:
    ```bash
    cd server
    npm run dev
    ```
*   **Expected Output:**
    Console prints Winston log:
    `[Timestamp] info: MongoDB connection established successfully.`
*   **Pass Criteria:** Connected event log prints.
*   **Failure Troubleshooting Guide:**
    *   *Error: MongoNetworkError - Failed to connect to [URI]:* Check if your local MongoDB server is active (`mongod` command or Service manager).
    *   *Error: Connection timeout:* Ensure your local network firewall is not blocking port `27017`.

---

### 1.5. Can Server Start?
*   **Command to Execute:**
    ```bash
    cd server
    npm run dev
    ```
*   **Expected Output:**
    ```
    [Timestamp] info: 🚀 Server starting...
    [Timestamp] info: MongoDB connection established successfully.
    [Timestamp] info: ⚡ Server listening at http://localhost:5000
    ```
*   **Pass Criteria:** Port `5000` is active and responsive to HTTP request triggers.
*   **Failure Troubleshooting Guide:**
    *   *Error: EADDRINUSE: port already in use :::5000:* Terminate any processes currently running on port 5000 (run `npx kill-port 5000` or search process ids).

---

## 2. Frontend Verification Checklist (`/client`)

### 2.1. Can TypeScript Compile?
*   **Command to Execute:**
    ```bash
    cd client
    npm run build
    ```
*   **Expected Output:**
    Vite asset optimization runs, showing 100% module transformation, and outputs build files into `/client/dist/`.
*   **Pass Criteria:** Exits with `0` and compiles the HTML/CSS/JS bundles.
*   **Failure Troubleshooting Guide:**
    *   *Error: Type 'X' is not assignable to type 'Y':* Open compilation logs, check the component file line referenced, and enforce strict type definition matching.

---

### 2.2. Can Application Start?
*   **Command to Execute:**
    ```bash
    cd client
    npm run dev
    ```
*   **Expected Output:**
    ```
      VITE v5.3.1  ready in X ms

      ➜  Local:   http://localhost:3000/
      ➜  Network: use --host to expose
      ➜  press h + enter for help
    ```
*   **Pass Criteria:** Client browser opens `http://localhost:3000/` and displays page elements.
*   **Failure Troubleshooting Guide:**
    *   *Error: Vite command not found:* Run `npm install` inside `/client` to fetch Vite dependencies.

---

### 2.3. Is Tailwind CSS Working?
*   **Command to Execute:**
    Open browser inspector on `http://localhost:3000/` and inspect element styles.
*   **Expected Output:**
    Element body reflects background color `#0b0f19` (class `bg-darkBg`) and text `#e5e7eb` (class `text-gray-200`).
*   **Pass Criteria:** Element styles list active utility parameters from `tailwind.config.js`.
*   **Failure Troubleshooting Guide:**
    *   *Error: Standard black/white colors render instead of dark slates:* Check that `@tailwind` directives exist at the top of `/client/src/styles/index.css` and the file is imported in `/client/src/App.tsx`.

---

### 2.4. Is React Router Working?
*   **Command to Execute:**
    Navigate browser URL path between `http://localhost:3000/login` and `http://localhost:3000/dashboard`.
*   **Expected Output:**
    *   Navigating to `/login` renders the Welcome back card.
    *   Navigating to `/dashboard` renders the My Saved Trips dashboard panel.
    *   Navigating to `/invalid-url` redirects back to `/dashboard`.
*   **Pass Criteria:** Page layouts swap dynamically without triggering server reload events.
*   **Failure Troubleshooting Guide:**
    *   *Error: Page Not Found on manual path entry refresh:* Ensure Vite dev server configuration is active (it handles fallback indexing routes).

---

### 2.5. Is React Query Configured?
*   **Command to Execute:**
    Open `/client/src/App.tsx` and inspect wrapper boundaries.
*   **Expected Output:**
    The root `<AppRoutes />` node is fully enclosed inside `<QueryClientProvider client={queryClient}>`.
*   **Pass Criteria:** Context contains the instantiated `QueryClient` provider configurations.
*   **Failure Troubleshooting Guide:**
    *   *Error: No QueryClient set, use QueryClientProvider:* Ensure the client instantiation is correctly passed as a prop inside `App.tsx`.
