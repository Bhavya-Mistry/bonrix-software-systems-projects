# Windsurf - Multi-Task AI Assistant

Windsurf is a powerful multi-task AI assistant that can perform various intelligent functions using a language model backend of your choice. It supports dynamic task execution, credit-based billing, and user interaction through a modern React frontend.

## Features

- **Multiple LLM Providers**: OpenAI, Mistral AI, LLaMA
- **Various AI Tasks**: Resume Analysis, Object Detection, Invoice Extraction, Text Summarization, Sentiment Analysis, and Custom Prompts
- **Credit-Based System**: Pay-as-you-go model with transparent pricing
- **Modern UI**: React-based frontend with dark/light theme toggle

## Project Structure

```
windsurf/
├── frontend/                # React frontend
│   ├── public/              # Static files
│   └── src/                 # Source code
│       ├── components/      # Reusable UI components
│       ├── pages/           # Page components
│       ├── context/         # React context providers
│       └── utils/           # Utility functions
│
└── backend/                 # FastAPI backend
    ├── api/                 # API routes
    ├── models/              # Database models
    ├── services/            # Business logic services
    └── utils/               # Utility functions
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Set up environment variables in a `.env` file:
   ```
   DATABASE_URL=postgresql://user:password@localhost/windsurf
   JWT_SECRET_KEY=your_secret_key
   OPENAI_API_KEY=your_openai_key
   MISTRAL_API_KEY=your_mistral_key
   STRIPE_SECRET_KEY=your_stripe_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

6. Run database migrations:
   ```
   alembic upgrade head
   ```

7. Start the backend server:
   ```
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```
   npm start
   ```

## API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License

MIT
