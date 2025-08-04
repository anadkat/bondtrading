from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
import httpx
import asyncio
import json
import random
import time
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from pydantic import BaseModel
from enum import Enum

# Simple Bond model for Vercel deployment
class Bond(BaseModel):
    id: str
    isin: str
    cusip: Optional[str] = None
    issuer: str
    description: str
    bond_type: str = "corporate"
    sector: Optional[str] = None
    rating: Optional[str] = None
    coupon: Optional[str] = None
    maturity_date: Optional[datetime] = None
    currency: str = "USD"
    par_value: Optional[str] = None
    last_price: Optional[str] = None
    ytm: Optional[str] = None
    ytw: Optional[str] = None
    status: str = "outstanding"
    updated_at: Optional[datetime] = None

    @classmethod
    def from_moment_api(cls, data: Dict[str, Any]) -> "Bond":
        return cls(
            id=data.get("id", ""),
            isin=data.get("isin", ""),
            cusip=data.get("cusip"),
            issuer=data.get("issuer", "Unknown Issuer"),
            description=data.get("description", ""),
            bond_type=data.get("asset_class", "corporate").lower(),
            sector=data.get("sector"),
            rating=data.get("rating"),
            coupon=str(data.get("coupon")) if data.get("coupon") else None,
            maturity_date=datetime.fromisoformat(data["maturity_date"].replace("Z", "+00:00")) if data.get("maturity_date") else None,
            currency=data.get("currency", "USD"),
            par_value=str(data.get("par_value")) if data.get("par_value") else None,
            last_price=str(data.get("last_price")) if data.get("last_price") else None,
            ytm=str(data.get("yield_to_maturity")) if data.get("yield_to_maturity") else None,
            ytw=str(data.get("yield_to_worst")) if data.get("yield_to_worst") else None,
            status=data.get("status", "outstanding"),
            updated_at=datetime.now()
        )

# Simple storage
class BondStorage:
    def __init__(self):
        self.bonds: Dict[str, Bond] = {}
    
    def add_bond(self, bond: Bond) -> None:
        self.bonds[bond.id] = bond
    
    def get_bond(self, bond_id: str) -> Optional[Bond]:
        return self.bonds.get(bond_id)
    
    def get_all_bonds(self) -> List[Bond]:
        return list(self.bonds.values())
    
    def search_bonds(self, filters: Dict[str, Any]) -> List[Bond]:
        bonds = list(self.bonds.values())
        
        if 'bond_type' in filters:
            bonds = [b for b in bonds if b.bond_type == filters['bond_type']]
        
        if 'rating' in filters:
            bonds = [b for b in bonds if b.rating == filters['rating']]
        
        if 'sector' in filters:
            bonds = [b for b in bonds if b.sector == filters['sector']]
        
        if 'currency' in filters:
            bonds = [b for b in bonds if b.currency == filters['currency']]
        
        return bonds

# Moment API Service
class MomentAPIService:
    def __init__(self):
        self.base_url = "https://paper.moment-api.com"
        self.api_key = "msk_papr.5dde1e4b.qcUk-rVwMth7b7woezLIk_lAtLwL_Kg0"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def get_instruments(self, status: str = "outstanding", limit: int = 100) -> List[Dict[str, Any]]:
        try:
            params = f"?status={status}&limit={limit}"
            url = f"{self.base_url}/v1/data/instrument/{params}"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers)
                
                if response.status_code != 200:
                    return []
                
                data = response.json()
                
                if isinstance(data, dict) and "data" in data:
                    return data["data"]
                elif isinstance(data, list):
                    return data
                else:
                    return []
                    
        except Exception as e:
            return []

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