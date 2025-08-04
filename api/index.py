from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
from typing import Optional, List
from contextlib import asynccontextmanager

# Add the python-backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'python-backend'))

from app.models import Bond, Order, OrderRequest, OrderResponse, HistoricalPrices, OrderBook
from app.services.moment_api import MomentAPIService
from app.storage import BondStorage

# Global storage instance
bond_storage = BondStorage()
moment_api = MomentAPIService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load bonds from Moment API
    try:
        bonds = await moment_api.get_instruments(status="outstanding", limit=100)
        
        for bond_data in bonds:
            bond = Bond.from_moment_api(bond_data)
            bond_storage.add_bond(bond)
        
    except Exception as e:
        pass
    
    yield
    
    # Shutdown
    pass

app = FastAPI(
    title="Bond Screener API",
    description="A professional bond screening and trading API using Moment's paper environment",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Vercel deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
@app.get("/api/bonds", response_model=List[Bond])
async def get_bonds(
    bond_type: Optional[str] = Query(None),
    rating: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    currency: Optional[str] = Query(None),
    min_yield: Optional[float] = Query(None),
    max_yield: Optional[float] = Query(None),
    min_maturity: Optional[int] = Query(None),
    max_maturity: Optional[int] = Query(None)
):
    """Get filtered list of bonds"""
    filters = {
        'bond_type': bond_type,
        'rating': rating,
        'sector': sector,
        'currency': currency,
        'min_yield': min_yield,
        'max_yield': max_yield,
        'min_maturity': min_maturity,
        'max_maturity': max_maturity
    }
    
    # Remove None values
    filters = {k: v for k, v in filters.items() if v is not None}
    
    return bond_storage.search_bonds(filters)

@app.get("/api/bonds/{bond_id}", response_model=Bond)
async def get_bond(bond_id: str):
    """Get individual bond details"""
    bond = bond_storage.get_bond(bond_id)
    if not bond:
        raise HTTPException(status_code=404, detail="Bond not found")
    return bond

@app.get("/api/bonds/{bond_id}/quote")
async def get_bond_quote(bond_id: str):
    """Get real-time quote for a bond"""
    try:
        quote = await moment_api.get_quote(bond_id)
        return quote
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Quote not available: {str(e)}")

@app.get("/api/bonds/{bond_id}/prices", response_model=HistoricalPrices)
async def get_bond_historical_prices(
    bond_id: str,
    start: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end: str = Query(..., description="End date (YYYY-MM-DD)"),
    frequency: str = Query("1day", description="Frequency: 1day, 15min, or 1min")
):
    """Get historical pricing data for a bond"""
    try:
        prices = await moment_api.get_historical_prices(bond_id, start, end, frequency)
        return prices
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Historical prices not available: {str(e)}")

@app.get("/api/bonds/{bond_id}/order-book", response_model=OrderBook)
async def get_bond_order_book(bond_id: str):
    """Get full order book for a bond"""
    try:
        order_book = await moment_api.get_order_book(bond_id)
        return order_book
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Order book not available: {str(e)}")

@app.post("/api/orders", response_model=OrderResponse)
async def submit_order(order_request: OrderRequest):
    """Submit a buy/sell order"""
    try:
        # Mock order submission (API key lacks trading permissions)
        order_response = await moment_api.submit_mock_order(order_request)
        
        # Store order locally
        order = Order(
            id=order_response.order_id,
            bond_id=order_request.instrument_id,
            user_id="demo_user",
            action=order_request.side,
            quantity=order_request.quantity,
            price=order_request.price,
            order_type=order_request.order_type,
            status=order_response.status,
            created_at=order_response.created_at,
            updated_at=order_response.updated_at
        )
        bond_storage.add_order(order)
        
        return order_response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/orders", response_model=List[Order])
async def get_orders(status: Optional[str] = Query(None)):
    """Get user orders"""
    return bond_storage.get_orders(status=status)

@app.get("/api/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    """Get specific order details"""
    order = bond_storage.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.post("/api/sync-bonds")
async def sync_bonds():
    """Manually sync bonds from Moment API"""
    try:
        bonds = await moment_api.get_instruments(status="outstanding", limit=100)
        synced_count = 0
        
        for bond_data in bonds:
            bond = Bond.from_moment_api(bond_data)
            if not bond_storage.get_bond(bond.id):
                bond_storage.add_bond(bond)
                synced_count += 1
        
        total_bonds = len(bond_storage.get_all_bonds())
        return {"synced_count": synced_count, "total_bonds": total_bonds}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "bonds_loaded": len(bond_storage.get_all_bonds())}