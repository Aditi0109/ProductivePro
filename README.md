# ProductivityPro

A comprehensive productivity application with Pomodoro timer, task management, music player, and AI-powered flashcard generation.

## Features

- **Pomodoro Timer** - Focus sessions with break tracking
- **FlowBeats Music Player** - Background study music from lofi.cafe
- **TaskPlanner** - Task management with time slots and priorities
- **SnapStudy** - PDF to flashcard conversion
- **Usage Insights** - Productivity analytics
- **FocusFuel** - Motivational quotes

## Local Development Setup

### Prerequisites

1. **Node.js** (version 14 or higher)
2. **Python** (version 3.7 or higher) - for PDF processing

### Installation Steps

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Install Python dependencies for PDF processing:**
   ```bash
   # On Windows:
   pip install pdfplumber pypdf2 trafilatura
   
   # On macOS/Linux:
   pip3 install pdfplumber pypdf2 trafilatura
   ```

3. **Run the setup script:**
   ```bash
   node setup-local.js
   ```

4. **Start the application:**
   ```bash
   npm start
   ```

5. **Open your browser and go to:**
   ```
   http://localhost:5000
   ```

### Troubleshooting PDF Features

If PDF flashcard generation isn't working:

1. **Check Python installation:**
   ```bash
   python --version
   # or
   python3 --version
   ```

2. **Manually install Python packages:**
   ```bash
   pip install pdfplumber pypdf2
   # or on some systems:
   pip3 install pdfplumber pypdf2
   ```

3. **Test PDF processing directly:**
   ```bash
   python server/pdf_processor.py uploads/test.pdf
   ```

### Environment Variables (Optional)

Create a `.env` file in the root directory for optional features:

```env
# For AI-powered flashcards (optional)
OPENAI_API_KEY=your_openai_api_key_here

# For Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Project Structure

```
├── server/
│   ├── index.js          # Main server file
│   ├── pdf_processor.py  # PDF text extraction
│   └── db.ts            # Database configuration
├── uploads/             # PDF upload directory
├── index.html          # Main page
├── interactive-script.js # Frontend functionality
├── styles.css          # Styling
└── package.json        # Dependencies
```

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/snapstudy/upload` - Upload PDF for flashcards
- `POST /api/snapstudy/generate` - Generate flashcards
- `GET /api/flowbeats/current` - Get current music info

## Development vs Production

- **Development**: Uses in-memory storage for simplicity
- **Production**: Can be configured with PostgreSQL database
- **PDF Processing**: Works offline with text analysis, enhanced with OpenAI API if configured

## Support

If you encounter issues:
1. Ensure all dependencies are installed
2. Check that Python and required packages are available
3. Verify the uploads directory exists and is writable
4. Check browser console for error messages