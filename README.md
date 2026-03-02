# AWA - Ilves Drive

Cloud drive -style project where users can register/login and make text documents with full seperate front-end and back-end.

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on `mongodb://127.0.0.1:27017/testdb`


``` Bash
git https://github.com/HenriIlves/AWA---Ilves-Drive.git
cd AWA---Ilves-Drive
```

``` Bash
cd server
npm install
npm run start
```

*another terminal

``` Bash
cd client
npm install
npm run dev
```

The client runs at `http://localhost:5173` and the server at `http://localhost:3000`.


## Design choices

**Client:** React 19 + Vite (TypeScript), Material UI, React Router v7, i18next for EN/FI translations

**Server:** Node.js + Express 5 (TypeScript), MongoDB + Mongoose, JWT authentication (1h expiry), multer for file uploads

Authentication tokens are stored in `localStorage` and sent as `Authorization: Bearer <token>` headers. Profile pictures are stored on the server under `uploads/profile-pictures/`.

---

## User manual

### Register and login

Non-authenticated users can create a new account or login. For creating a user, the user needs email, username and password. For login, email and password. Email must be in email format. Username must be at least 3 characters long. Password must be at least 8 characters long, with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.

### Creating a document

Authenticated users can create a new document by pressing the "New Document" button in the top right of the dashboard. On mobile, a floating "+" button appears at the bottom right corner instead. Fill in the title and content and press "Create Document" to save. Both title and content are required.

### Viewing a document

Click on any document in the list to open it. The document is shown in a read-only A4-style view with the title and content. The toolbar at the top shows the document name and provides access to edit, share, and download actions.

### Editing a document

Document creators and users with editing permission can edit the title and content of a document by pressing the edit button when viewing it. The same validation rules apply as in document creation. Only one user can edit a document at a time. If another user is currently editing, the edit button will show a warning instead of opening the editor. When an editor closes the tab or navigates away, the lock is released.

### Sharing a document

Document owners can share a document with other users via the share button in the document toolbar. Enter the username of the user to share with and choose whether they get view or edit permission. The shared documents show then in the shared users list of documents.

Owners can also enable a public read-only link, which lets anyone view the document without logging in. The link can be copied directly from the share dialog. After the link is copied the user needs to exit the sharing window by pressing cancel.

### Delete a document

Deletion of the document is only permitted to document creators. Deletion happens in the home screen by pressing the delete icon in the document list.

### Settings

The settings panel is accessible via the gear icon in the header. For logged-in users it is inside the profile menu at the top right. From there you can toggle between light and dark mode, and switch the interface language between English (EN) and Finnish (FI). The selected theme and language are remembered between sessions.

---

## Features

Mandatory requirements:
- Backend implemented with Node.js and Express
- UI is in English with added translation to Finnish
- Database is utilized by MongoDB
- Authentication
    - Users can register, login and logout
    - JWT authorization
- Features
    - Authenticated users can
        - Add/remove/edit/view documents
        - Give editing/view permission to existing users
        - Give view permission to anyone with a link
        - Two users cannot edit the document at the same time
        - Logout
    - Non-authenticated users can
        - Register and login
        - View documents set visible for non-authenticated users
- Responsive design for mobile and desktop made with Material UI
- Documentation



| Feature Description | Points |
| ----------- | ----------- |
| Basic Features | 25 |
| Utilization of a frontside framework (React) | 3 |
| The drive shows besides the name of the document also the creation and last updated timestamp | 1 |
| Sort documents by name, creation/ last edited timestamps | 1 |
| Users are able to select a profile picture for themselves, stored in the server | 2 |
| The application has dark and bright modes | 1 |
| Translation of the whole UI in two or more languages | 2 |
| Pagination in the document listing | 2 |
| **Total** | **37** |



## Declaration of AI usage

Claude (claude.ai) was used for:
- Implementation ideas for different features
- Fixing bugs
- Helped with translations

All AI made content was checked and validated for correctness.
