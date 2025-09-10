# Rail AI MVP - Front Cab Safety System

A polished UI-only demo of a railway front-cab safety monitoring system with AI-powered detection capabilities.

## Features

### 🚄 Dashboard
- Real-time KPI cards showing critical alerts, detected events, and system status
- Live video feed placeholder with overlay detection chips
- Recent events grid with confidence scores and timestamps

### 🔍 Review
- Event video playback with ROI (Region of Interest) overlays
- Interactive FPS slider with real-time badge updates
- Scrollable event list with detailed information
- Event filtering and selection

### 📤 Uploads
- Drag & drop file upload interface
- Support for MP4, JSONL, and CSV files
- Upload queue management
- Batch processing status tracking with progress indicators

### 🧠 Models
- AI model management with enable/disable toggles
- Model performance metrics (mAP scores)
- Model size and quality indicators
- Performance visualization placeholder

### ⚙️ Settings
- Alert notification preferences
- Privacy and security controls
- System information and about section
- Settings persistence (mock)

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling
- **Class Variance Authority** for component styling

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard with KPIs and video feed
│   ├── Review.tsx       # Event review and analysis
│   ├── Uploads.tsx      # File upload management
│   ├── Models.tsx       # AI model configuration
│   ├── Settings.tsx     # System settings and preferences
│   └── Layout.tsx       # Main app layout and navigation
├── data/
│   └── mockData.ts      # Mock data for events, models, and uploads
├── lib/
│   └── utils.ts         # Utility functions
└── App.tsx              # Main application component
```

## Mock Data

The application includes realistic mock data for:
- **Events**: Safety incidents with timestamps, confidence scores, and descriptions
- **Models**: AI models with performance metrics and status
- **Upload Batches**: File upload history with various formats and statuses

## Design Features

- **Responsive Design**: Works on desktop and tablet devices
- **Accessible UI**: Proper contrast ratios and keyboard navigation
- **Modern Styling**: Clean cards, soft shadows, and breathable spacing
- **Interactive Elements**: Hover states, toggles, and smooth transitions
- **Professional Color Scheme**: Railway safety-appropriate blue and gray palette

## Demo Notes

This is a UI-only demonstration with no real backend integration:
- All data is hardcoded mock data
- File uploads are simulated (no actual file processing)
- Model toggles and settings are for demonstration only
- No real ML inference or video processing capabilities

## Browser Support

Modern browsers supporting ES2020+ features:
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+