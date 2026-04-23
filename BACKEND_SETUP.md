# Backend Setup Instructions

## 🚀 How to Run the Backend

### Step 1: Install Backend Dependencies

Open a **new terminal** in your project directory and run:

```bash
npm install express multer tesseract.js cors --save
```

Or if you prefer to use the package-backend.json file:

```bash
npm install --prefix . express multer tesseract.js cors
```

### Step 2: Start the Backend Server

Run the following command:

```bash
node server.js
```

You should see:

```
✅ Backend server running on http://localhost:3000

Available endpoints:
  - POST http://localhost:3000/validate-health
  - POST http://localhost:3000/validate-vehicle
  - POST http://localhost:3000/validate-life
  - POST http://localhost:3000/validate-home
```

### Step 3: Run Your Frontend (in a separate terminal)

In a **different terminal**, run:

```bash
npm run dev
```

This will start your Vite frontend on `http://localhost:5173` (or another port).

---

## 📝 Notes

- **Backend runs on**: `http://localhost:3000`
- **Frontend runs on**: `http://localhost:5173` (default Vite port)
- Both must be running simultaneously for the app to work
- The backend uses Tesseract.js for OCR processing of insurance documents
- Uploaded files are temporarily stored in the `uploads/` folder

---

## 🔧 Troubleshooting

### Port 3000 already in use?
If you get an error that port 3000 is already in use, either:
1. Stop the other process using port 3000
2. Or change the port in `server.js` (line 9): `const port = 3001;`

### CORS errors?
The backend has CORS enabled by default. Make sure both servers are running.

### Module not found errors?
Run `npm install express multer tesseract.js cors` again to ensure all dependencies are installed.

---

## 🎯 Testing the Backend

You can test if the backend is working by visiting:
- `http://localhost:3000` in your browser

You should see a JSON response with available endpoints.
