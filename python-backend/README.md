# Bond Screener Python API

A professional bond screening and trading API built with FastAPI, integrating with Moment's paper trading environment.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd python-backend
pip install -r requirements.txt
```

### 2. Run the Server
```bash
python run.py
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📊 Features

### ✅ Core Functionality
- **Real API Integration** - 100+ bonds from Moment's paper environment
- **Advanced Filtering** - By sector, rating, yield, maturity, bond type
- **Mock Trading** - Realistic order submission and tracking
- **Real-time Quotes** - Live market data from Moment API
- **Portfolio Tracking** - Order history and position management

### 🔧 Technical Stack
- **FastAPI** - Modern, fast web framework
- **Pydantic** - Data validation and serialization
- **httpx** - Async HTTP client for API calls
- **Uvicorn** - ASGI server with auto-reload

## 📡 API Endpoints

### Bonds
- `GET /api/bonds` - Get filtered bond list
- `GET /api/bonds/{bond_id}` - Get bond details
- `GET /api/bonds/{bond_id}/quote` - Get real-time quote

### Trading
- `POST /api/orders` - Submit buy/sell order
- `GET /api/orders` - Get order history
- `GET /api/orders/{order_id}` - Get order details

### Portfolio
- `GET /api/portfolio` - Get portfolio summary
- `POST /api/sync-bonds` - Sync bonds from Moment API

## 🎯 Demo Features

Since the API key has reference data access only (not trading), the backend implements:

- **Mock Order Submission** - Realistic order flow with delays
- **Order Status Simulation** - Orders transition from pending to filled
- **Sample Order History** - Pre-populated demo orders

This provides a complete trading experience for demonstration purposes.

## 🔧 Configuration

The API automatically configures itself with:
- **Moment API Base URL**: `https://paper.moment-api.com`
- **API Key**: Embedded for demo (in production, use environment variables)
- **CORS**: Enabled for frontend integration

## 📱 Frontend Integration

The API is designed to work with the existing React frontend. Update the frontend's API base URL to `http://localhost:8000` to connect to the Python backend.

## 🧪 Testing

```bash
# Test the API directly
curl http://localhost:8000/api/bonds

# View interactive documentation
open http://localhost:8000/docs
```

## 📦 Project Structure

```
python-backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic data models
│   ├── storage.py           # In-memory data storage
│   └── services/
│       └── moment_api.py    # Moment API integration
├── requirements.txt         # Python dependencies
├── run.py                  # Server startup script
└── README.md               # This file
```

## 🎯 Production Notes

For production deployment:
- Use a proper database (PostgreSQL, MongoDB)
- Implement proper authentication/authorization
- Add comprehensive error handling and logging
- Use environment variables for configuration
- Implement rate limiting and caching