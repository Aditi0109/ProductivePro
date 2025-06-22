# replit.md

## Overview

ProductivePro is a comprehensive productivity application that combines Pomodoro timer functionality, website blocking capabilities, and productivity insights. The application features a modern web-based frontend with a Node.js/Express backend, utilizing PostgreSQL with Drizzle ORM for data persistence. The system is designed to help users maintain focus through various productivity techniques and provides intelligent insights about their work patterns.

## System Architecture

### Frontend Architecture
- **Technology**: Vanilla JavaScript with Tailwind CSS for styling
- **Structure**: Single-page application with multiple interactive components
- **Styling**: Tailwind CSS with custom CSS for animations and enhanced UI effects
- **Icons**: Feather Icons and custom SVG icon library
- **Fonts**: Inter font family for consistent typography

### Backend Architecture
- **Framework**: Express.js (Node.js)
- **Database**: PostgreSQL with Neon serverless configuration
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Session-based authentication with express-session
- **Security**: Helmet.js for security headers, bcryptjs for password hashing
- **Real-time**: WebSocket support via 'ws' library

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon (serverless)
- **Session Storage**: Database-backed sessions using connect-pg-simple
- **Development Mode**: In-memory storage for demo functionality
- **Schema Management**: Drizzle Kit for migrations and schema management

## Key Components

### 1. Pomodoro Timer System
- **Purpose**: Implements the Pomodoro Technique for time management
- **Features**: Work sessions, short breaks, long breaks with customizable durations
- **Data Tracking**: Session completion rates, duration tracking, user productivity metrics

### 2. Website Blocking System
- **Blacklist Mode**: Blocks specified distracting websites during focus sessions
- **Whitelist Mode**: Only allows access to approved productive websites
- **Category-based Blocking**: Sites organized by categories (social_media, entertainment, work)
- **Real-time Enforcement**: Active blocking during scheduled focus periods

### 3. Schedule Management
- **Automated Blocking**: Time-based activation of blocking rules
- **Flexible Scheduling**: Day-of-week and time-range configurations
- **Multiple Profiles**: Different blocking strategies for different time periods

### 4. Insights Dashboard
- **Usage Analytics**: Tracks productive vs distracted time
- **Session Analytics**: Pomodoro session completion rates and patterns
- **Productivity Metrics**: Daily, weekly, and monthly productivity trends
- **Visual Reporting**: Charts and graphs for productivity insights

### 5. FocusFuel System
- **Hourly Motivation**: Automated delivery of inspirational quotes every hour
- **API Integration**: Uses Quotable.io API with fallback to curated local quotes
- **Persistent Display**: Shows current quote with countdown to next quote
- **Interactive Popup**: Displays quotes as non-intrusive notifications

### 6. SnapStudy PDF Flashcard Generator
- **PDF Upload**: Drag-and-drop or click-to-browse PDF document upload
- **AI-Generated Flashcards**: Converts PDF content into study flashcards (demo uses mock data)
- **Customizable Options**: Adjustable flashcard count and difficulty levels
- **Interactive Study Mode**: Full-screen flashcard interface with flip functionality
- **Progress Tracking**: Navigation between cards with answer reveal system

## Data Flow

### User Authentication Flow
1. User registration/login via local authentication or OAuth
2. Session creation and management via express-session
3. User profile data stored in PostgreSQL users table
4. Session persistence across browser sessions

### Productivity Session Flow
1. User initiates Pomodoro session through frontend
2. Session data sent to backend API endpoints
3. Real-time session tracking stored in pomodoroSessions table
4. Completion status and metrics updated in database
5. Analytics aggregated for insights dashboard

### Website Blocking Flow
1. User configures blocked/whitelisted sites via interface
2. Site rules stored in respective database tables
3. Browser extension or system-level blocking enforces rules
4. Schedule-based activation through blockingSchedules table
5. Usage tracking for compliance monitoring

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm & drizzle-kit**: Type-safe ORM and migration tools
- **express**: Web application framework
- **bcryptjs**: Password hashing and authentication
- **jsonwebtoken**: JWT token management
- **passport & passport-local**: Authentication middleware
- **cors**: Cross-origin resource sharing
- **helmet**: Security middleware
- **ws**: WebSocket implementation

### Frontend Dependencies
- **Tailwind CSS**: Utility-first CSS framework (CDN)
- **Feather Icons**: Icon library (CDN)
- **Inter Font**: Typography via Google Fonts
- **Custom CSS**: Enhanced animations and styling

### Development Tools
- **dotenv**: Environment variable management
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Environment Configuration
- **Development**: Local Node.js server on port 5000
- **Production**: Configurable deployment with environment variables
- **Database**: Neon serverless PostgreSQL with connection pooling
- **Static Assets**: Served directly by Express in development

### Security Considerations
- **Session Security**: Secure session management with database persistence
- **Password Security**: bcryptjs hashing with salt rounds
- **CORS Policy**: Configured for controlled cross-origin access
- **Helmet Integration**: Security headers for production deployment

### Scalability Features
- **Connection Pooling**: Neon serverless with automatic scaling
- **Session Storage**: Database-backed for horizontal scaling
- **Stateless API**: RESTful design for load balancing compatibility

## Changelog

```
Changelog:
- June 22, 2025. Initial setup
- June 22, 2025. Migration from Replit Agent to standard Replit environment
  * Removed smart nudges system and replaced with FocusFuel hourly motivational quotes
  * Removed live leaderboard feature as requested
  * Implemented SnapStudy PDF to flashcard generator with interactive study mode
  * Removed "Start Free Trial", "Watch Demo", and "Get Started" buttons from UI
  * Added new navigation section for SnapStudy feature
  * Updated API endpoints to support new features
  * Fixed JavaScript syntax errors and improved code structure
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```