# Todo List App with Calendar & User Profiles

A comprehensive, responsive todo list application built with Node.js and Express, featuring calendar scheduling, user profiles, photo attachments, and smart reminders.

## ✨ Features

### 📋 **Core Todo Management**
- ✅ Add new todos with rich content
- ✅ Mark todos as complete/incomplete
- ✅ Edit todo text inline
- ✅ Delete todos
- ✅ Filter todos (All, Active, Completed, Due Today, Overdue)
- ✅ Clear all completed todos
- ✅ Real-time todo counter

### 📅 **Calendar & Scheduling**
- ✅ Calendar view with monthly navigation
- ✅ Click on calendar dates to view todos for that day
- ✅ Visual indicators for overdue and due today todos
- ✅ Todo count badges on calendar dates
- ✅ Due date scheduling with date picker

### 👤 **User Profiles**
- ✅ Custom username input
- ✅ Profile photo upload and storage
- ✅ Persistent user data in localStorage

### 📸 **Photo Attachments**
- ✅ Upload photos to individual todos
- ✅ Photo preview in todo list
- ✅ Full-screen photo modal view
- ✅ Photos stored in localStorage as base64

### ⏰ **Smart Reminders**
- ✅ Set reminder date/time for todos
- ✅ Browser notifications for due reminders
- ✅ Visual reminder indicators
- ✅ Active reminder highlighting

### 💾 **Data Persistence**
- ✅ All data stored in localStorage
- ✅ Persistent between browser sessions
- ✅ No server dependency for data storage

### 🎨 **Modern Design**
- ✅ Beautiful blue-toned color scheme
- ✅ Smooth animations and transitions
- ✅ Responsive design for all devices
- ✅ Professional UI/UX

## 🚀 Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## 📱 How to Use

### **User Profile Setup**
1. Click on the avatar placeholder to upload your profile photo
2. Enter your username in the input field
3. Click "Save Profile" to store your information

### **Creating Todos**
1. Enter your todo text in the main input field
2. **Optional**: Set a due date using the date picker
3. **Optional**: Set a reminder time using the datetime picker
4. **Optional**: Click the camera button (📷) to attach a photo
5. Click "Add Todo" to save

### **List View Features**
- Filter todos by status or due date using the filter buttons
- Edit todos inline by clicking on the text
- Mark todos as complete using checkboxes
- View attached photos by clicking on them
- See reminder times and due dates with color coding

### **Calendar View Features**
- Navigate between months using arrow buttons
- See todo count badges on dates with scheduled todos
- Click on any date to view todos for that day
- Today's date is highlighted in blue-green
- Selected date is highlighted in blue

### **Reminders & Notifications**
- Set reminders using the datetime picker when creating todos
- Browser notifications will appear when reminders are due
- Active reminders are highlighted with a bell icon (🔔)
- Reminders automatically check every minute

## 🎯 **Color Coding**

- **Blue tones**: Primary interface elements
- **Red**: Overdue todos and delete actions
- **Orange**: Todos due today
- **Blue-green**: Today's date on calendar
- **Green**: Success states and completed actions

## ⌨️ **Keyboard Shortcuts**

- `Ctrl/Cmd + 1`: Switch to List View
- `Ctrl/Cmd + 2`: Switch to Calendar View
- `Enter`: Add todo (when input is focused)

## 🏗️ **Project Structure**

```
todo-app/
├── server.js          # Express server (minimal, mainly for static files)
├── package.json       # Project dependencies and scripts
├── README.md         # This file
└── public/           # Static files
    ├── index.html    # Main HTML page with all features
    ├── styles.css    # Modern CSS with blue theme
    └── script.js     # Frontend JavaScript with localStorage
```

## 💾 **Data Storage**

All data is stored locally in your browser using localStorage:
- **Todos**: Complete todo objects with text, dates, photos, reminders
- **User Profile**: Username and avatar photo
- **Photos**: Stored as base64 encoded strings

## 🔔 **Browser Permissions**

The app will request notification permissions to show reminder alerts. This is optional but recommended for the best experience.

## 🌐 **Technologies Used**

- **Backend**: Node.js, Express.js (minimal server for static files)
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Storage**: Browser localStorage (no database required)
- **Photos**: Base64 encoding for local storage
- **Notifications**: Browser Notification API
- **Date handling**: Native JavaScript Date API

## 🔮 **Future Enhancements**

- Cloud sync with user accounts
- Todo categories and tags
- Drag and drop reordering
- Dark mode toggle
- Export/import functionality
- Recurring todos
- Todo priorities and labels
- Collaborative todos
- Advanced search and filtering

## 📄 **License**

MIT License
