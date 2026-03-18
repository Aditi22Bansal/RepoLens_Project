# RepoLens 🔍
**🚀 Live Demo: [https://frontend-eta-blond-85.vercel.app](https://frontend-eta-blond-85.vercel.app)**

### What it does exactly

1. **Accepts Input:** Takes a public GitHub repository URL (or `owner/name`) as input via the frontend.
2. **Fetches Data:** Uses the GitHub API to fetch the repository's file tree, commit history, and metadata.
3. **Detects Tech Stack:** Scans the file names and configurations (like `package.json` or `requirements.txt`) to identify the languages and frameworks used.
4. **Finds Hotspots:** Identifies the largest files in the repository to highlight complex or monolithic code areas.
5. **Scans for Secrets:** Checks file paths against known patterns (like `.env` or `id_rsa`) to flag potential security leaks.
6. **Calculates Health:** Analyzes commit frequency, issue resolution, and documentation presence to generate a 0-100 overall "Health Score" and a "Contribution Readiness" score.
7. **Visualizes Trends:** Displays the repository's recent commit activity on an interactive dashboard.

---

## � Quick Demo

<!-- Drag and drop your .gif or .mp4 file underneath this line in GitHub! -->
![RepoLens Demo Video](https://via.placeholder.com/800x400.png?text=RepoLens+Demo+Video+Goes+Here)

---

## �🌟 Key Features

### 📊 Comprehensive Health Scoring
RepoLens calculates a multi-dimensional health score (0-100) based on:
- **Maintenance:** Commit frequency, issue resolution rates, and recent activity.
- **Collaboration:** Number of contributors, fork counts, and PR activity.
- **Documentation:** Presence of README, CONTRIBUTING, and well-documented code.
- **Deployment:** Usage of CI/CD pipelines and containerization setups.

### 🛠️ Tech Stack Detection
Automatically identifies the languages, frameworks, and infrastructure tools used in a repository by analyzing the filesystem tree and configuration files:
- Detects broad ecosystems (Node.js, Python, TypeScript)
- Identifies specific frameworks (React, Next.js, Django, Vue)
- Recognizes DevOps and DB tooling (e.g., Prisma, GitHub Actions)

### 🏗️ Architecture & Hotspot Insights
Quickly understand the repository's topology:
- **Monolith Hotspots:** Identifies the largest files in the repository to single out potential architectural bottlenecks or monolithic components.
- **Structure Summarization:** Categorizes the project (e.g., Full-Stack, API-only, Client-only) based on directory naming conventions (`client`, `server`, `src`, `api`).

### 🛡️ Proactive Security Scanning
Analyzes the repository for potentially leaked secrets and sensitive data:
- Flags exposed environment variables (`.env`, `.env.local`).
- Detects leaked private keys (`.pem`, `id_rsa`).
- Warns about exposed credentials files (`credentials.json`, `.aws/credentials`).

### 🤝 Contribution Readiness
Evaluates how easy it is for an open-source contributor to get involved, giving a 0-100 score based on the repository's documentation and structure.

### 📈 Activity Visualization
Provides a visual breakdown of commit activity over time, helping you gauge if a project is actively maintained or abandoned.

---

## 💻 Tech Stack

### Frontend Architecture
- **Framework:** React 18 powered by Vite for lightning-fast HMR.
- **Styling:** Tailwind CSS for a modern, responsive, and highly customizable UI.
- **Routing:** React Router v7 for seamless client-side navigation.
- **Data Visualization:** Recharts for rendering beautiful commit activity and health distribution graphs.
- **Iconography:** Lucide React for consistent, crisp SVG icons.

### Backend Architecture
- **Server:** Node.js with Express v5 for high-performance REST APIs.
- **Database:** MongoDB (via Mongoose ODM) to cache repository metadata and store historical analysis reports.
- **External Integrations:** `@octokit/rest` for communicating with the GitHub API, handling rate limits, and fetching tree data.
- **Data Fetching:** Axios for generic HTTP requests.

---

## 🚀 Getting Started

Follow these steps to run RepoLens locally on your machine.

### Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [MongoDB](https://www.mongodb.com/) (Running locally or a MongoDB Atlas cluster URL)
- A [GitHub Personal Access Token](https://github.com/settings/tokens) (Required for making GitHub API calls without strict rate limiting)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/repolens.git
   cd repolens
   ```

2. **Setup the Backend**
   Navigate to the `backend` directory, install dependencies, and set up your environment variables.
   ```bash
   cd backend
   npm install
   ```
   
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/repolens
   GITHUB_TOKEN=your_personal_access_token_here
   ```

3. **Setup the Frontend**
   Open a new terminal, navigate to the `frontend` directory, and install its dependencies.
   ```bash
   cd frontend
   npm install
   ```

---

## 🏃‍♂️ Running the Application

To run the full stack locally, you need to start both the frontend and backend development servers.

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   *The server will start on `http://localhost:5000`.*

2. **Start the Frontend Application**
   ```bash
   cd frontend
   npm run dev
   ```
   *The UI will be accessible at `http://localhost:5173` (or the URL Vite provides).*

---

## 📖 Usage

1. Open your browser and navigate to `http://localhost:5173`.
2. Enter the **owner** and **repository name** of a public GitHub project (e.g., `facebook/react`).
3. RepoLens will fetch the project's data, run its AI-powered heuristics, and present a detailed analysis dashboard.
