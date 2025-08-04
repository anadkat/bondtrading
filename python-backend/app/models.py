from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class OrderSide(str, Enum):
    BUY = "buy"
    SELL = "sell"

class OrderType(str, Enum):
    MARKET = "market"
    LIMIT = "limit"

class OrderStatus(str, Enum):
    PENDING = "pending"
    FILLED = "filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"

class Bond(BaseModel):
    id: str
    isin: str
    cusip: Optional[str] = None
    issuer: str
    description: str
    bond_type: str = Field(alias="bondType")
    sector: Optional[str] = None
    rating: Optional[str] = None
    coupon: Optional[str] = None
    maturity_date: Optional[datetime] = Field(alias="maturityDate")
    currency: str
    par_value: Optional[str] = Field(alias="parValue")
    last_price: Optional[str] = Field(alias="lastPrice")
    ytm: Optional[str] = None
    ytw: Optional[str] = None
    duration: Optional[str] = None
    convexity: Optional[str] = None
    liquidity_score: Optional[str] = Field(alias="liquidityScore")
    status: str
    updated_at: datetime = Field(alias="updatedAt")
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
    
    @classmethod
    def from_moment_api(cls, data: Dict[str, Any]) -> "Bond":
        """Create Bond from Moment API response"""
        return cls(
            id=data.get("isin"),
            isin=data.get("isin"),
            cusip=data.get("cusip"),
            issuer=data.get("issuer"),
            description=data.get("description", data.get("description_short", "")),
            bondType=data.get("type", "corporate") if data.get("type") == "corporate" else data.get("type", "corporate"),
            sector=data.get("sector"),
            rating=data.get("sp_rating") or data.get("moodys_rating"),
            coupon=str(data.get("coupon", 0)) if data.get("coupon") is not None else None,
            maturityDate=datetime.fromisoformat(data["maturity_date"].replace("Z", "+00:00")) if data.get("maturity_date") else None,
            currency=data.get("currency", "USD"),
            parValue=str(data.get("par_value", 1000)) if data.get("par_value") is not None else None,
            lastPrice=None,
            ytm=None,
            ytw=None,
            duration=None,
            convexity=None,
            liquidityScore=None,
            status=data.get("status", "outstanding"),
            updatedAt=datetime.now()
        )

class OrderRequest(BaseModel):
    instrument_id: str
    side: OrderSide
    quantity: int
    order_type: OrderType
    price: Optional[float] = None
    client_order_id: Optional[str] = None

class OrderResponse(BaseModel):
    order_id: str
    client_order_id: Optional[str]
    instrument_id: str
    side: str
    quantity: int
    order_type: str
    price: Optional[float]
    status: str
    created_at: str
    updated_at: str
    filled_quantity: int = 0
    average_fill_price: Optional[float] = None
    fees: Optional[float] = None

class Order(BaseModel):
    id: str
    bond_id: str
    user_id: str
    action: str  # buy/sell
    quantity: int
    price: Optional[float] = None
    order_type: str
    status: str
    created_at: str
    updated_at: str
    filled_quantity: int = 0
    fees: Optional[float] = None

class Quote(BaseModel):
    timestamp: str
    bid_price: Optional[float]
    bid_yield_to_maturity: Optional[float]
    bid_yield_to_worst: Optional[float]
    bid_size: Optional[int]
    bid_min_size: Optional[int]
    ask_price: Optional[float]
    ask_yield_to_maturity: Optional[float]
    ask_yield_to_worst: Optional[float]
    ask_size: Optional[int]
    ask_min_size: Optional[int]

class PricePoint(BaseModel):
    timestamp: str
    price: float
    yield_to_worst: Optional[float]
    yield_to_maturity: Optional[float]

class HistoricalPrices(BaseModel):
    count: int
    next: Optional[str]
    prev: Optional[str]
    data: List[PricePoint]

class OrderBookEntry(BaseModel):
    price: float
    size: int
    yield_to_maturity: Optional[float]
    yield_to_worst: Optional[float]

class OrderBook(BaseModel):
    timestamp: str
    bids: List[OrderBookEntry]
    asks: List[OrderBookEntry]