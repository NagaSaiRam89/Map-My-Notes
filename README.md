# Map My Notes 🧠

A modern web application that transforms linear notes into interactive concept maps, integrating spaced repetition and other learning science principles to help you learn, connect, and retain knowledge more effectively.

**Live Demo:** [https://map-my-notes.vercel.app/](https://map-my-notes.vercel.app/)

---

## The Problem

Traditional note-taking is often inefficient. Information is scattered across documents, making it hard to see the connections between ideas and even harder to remember what you've learned. Most tools are built for storing information, not for learning it.

## The Solution

Map My Notes solves this by creating a single, integrated environment that combines:
* **Visual Organization:** Turn your notes into visual knowledge networks.
* **Proven Learning Science:** Use spaced repetition to commit information to long-term memory.
* **Secure, Private Storage:** All your data is saved directly and securely in your own Google Drive.

---

## Key Features

* **📝 Notes Module:**
    * Create, edit, and manage your notes in a clean interface.
    * **OCR Integration:** Upload an image of handwritten notes, and the app will automatically extract the text.
    * **Keyword Tagging:** Select any text in a note and press `K` to tag it as a keyword.

* **🧠 Interactive Concept Map:**
    * Create and manage multiple concept maps.
    * Pull keywords directly from your notes to create visual nodes.
    * Create, edit, and delete nodes and the connections (edges) between them.
    * Click on any node to instantly open the related note.

* **💡 Spaced Repetition System:**
    * Create flashcards from your notes.
    * The app generates a daily review queue based on a spaced repetition algorithm.
    * Mark cards as "Remembered" or "Forgot" to automatically schedule their next review.

* **🌞 Daily Gratitude Journal:**
    * A simple feature to help build a consistent, positive daily habit.
    * Tracks your current and longest streaks.
    * Visualizes your activity on a calendar heatmap.

* **☁️ Google Drive Integration:**
    * Securely log in with your Google Account.
    * All your data (notes, maps, flashcards) is saved automatically to an organized folder in your own Google Drive.

---
```
## Screenshots

*(Note: Replace these placeholder links with direct links to your uploaded images on GitHub)*

| Notes Editor | Concept Map | Spaced Repetition | Daily Gratitude |
| :---: | :---: | :---: | :---: |
| ![Notes Editor](URL_TO_YOUR_NOTES_SCREENSHOT) | ![Concept Map](URL_TO_YOUR_MAP_SCREENSHOT) | ![Spaced Repetition](URL_TO_YOUR_SPACED_REP_SCREENSHOT) | ![Daily Gratitude](URL_TO_YOUR_GRATITUDE_SCREENSHOT) |
```

---

## Tech Stack

* **Frontend:** React.js (with Hooks & JSX)
* **Routing:** React Router DOM
* **Styling:** Tailwind CSS
* **Authentication:** Google OAuth 2.0 (`@react-oauth/google`)
* **Data Persistence:** Google Drive API v3
* **Concept Map Canvas:** `@xyflow/react` (React Flow)
* **OCR:** Tesseract.js
* **State Management:** React Context API & `useState`, `useEffect`

---

## Local Development Setup

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/map-my-notes.git](https://github.com/your-username/map-my-notes.git)
    cd map-my-notes
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Google Cloud credentials:**
    * Go to the [Google Cloud Console](https://console.cloud.google.com/).
    * Create a new project.
    * Go to "APIs & Services" > "Credentials" and create an "OAuth 2.0 Client ID" for a Web application.
    * Add `http://localhost:3000` to both "Authorized JavaScript origins" and "Authorized redirect URIs".
    * Copy your Client ID.

4.  **Add your Client ID to the project:**
    * Open `src/index.js`.
    * Replace the placeholder `clientId` in the `<GoogleOAuthProvider>` with your own.

5.  **Run the development server:**
    ```bash
    npm start
    ```
    The application will be available at `http://localhost:3000`.

---

## Future Plans

* **AI Integration:**
    * AI-powered note summarization.
    * Intelligent suggestions for linking concepts on the map.
    * Automatic flashcard generation from notes.
* **Real-time Collaboration:** Allow multiple users to edit a concept map together.
* **Public Sharing:** Add the ability to share a read-only version of a note or concept map via a public link.

---

## License

This project is licensed under the MIT License.
