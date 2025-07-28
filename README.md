# HireVue Simulator

A comprehensive interview simulation platform with real-time speech analysis and feedback using Next.js frontend and FastAPI backend.

## Project Structure

```
hirevue-simulator/
├── src/                    # Next.js frontend application
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   └── ...
├── fast-api/              # FastAPI backend application
│   ├── main.py           # Main FastAPI application
│   ├── models/           # ML models and analysis functions
│   └── ...
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

## Frontend Setup (Next.js)

### 1. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set up environment variables

Create a `.env.local` file in the `src` directory:

```bash
cp .env.example .env.local
```

Update the environment variables as needed:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

## Backend Setup (FastAPI)

### 1. Navigate to the backend directory

```bash
cd fast-api
```

### 2. Create a virtual environment (recommended)

```bash
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the FastAPI server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at [http://localhost:8000](http://localhost:8000).

### 5. Access the API documentation

- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Available Endpoints

### Backend API Endpoints

- `GET /` - Health check
- `POST /transcribe` - Transcribe audio file
- `POST /analyse` - Analyse transcription (sequential)

## Development

### Running Both Servers

1. **Terminal 1 - Backend:**

```bash
cd fast-api
source venv/bin/activate  # or activate your virtual environment
uvicorn main:app --reload
```

2. **Terminal 2 - Frontend:**

```bash
npm run dev
```

### Testing the Application

1. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)
2. The frontend will communicate with the backend API running on port 8000
3. You can test the API endpoints directly using the Swagger UI at [http://localhost:8000/docs](http://localhost:8000/docs)
