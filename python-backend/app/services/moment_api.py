import httpx
import asyncio
import json
import random
import time
from typing import Dict, List, Optional, Any
from datetime import datetime

from ..models import OrderRequest, OrderResponse, Quote, HistoricalPrices, OrderBook


class MomentAPIService:
    def __init__(self):
        self.base_url = "https://paper.moment-api.com"
        self.api_key = "msk_papr.5dde1e4b.qcUk-rVwMth7b7woezLIk_lAtLwL_Kg0"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def _make_request(self, endpoint: str, method: str = "GET", data: Optional[Dict] = None) -> Dict[str, Any]:
        """Make HTTP request to Moment API"""
        url = f"{self.base_url}{endpoint}"
        
        async with httpx.AsyncClient() as client:
            if method == "GET":
                response = await client.get(url, headers=self.headers)
            elif method == "POST":
                response = await client.post(url, headers=self.headers, json=data)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            if response.status_code != 200:
                error_detail = response.text
                try:
                    error_json = response.json()
                    error_detail = error_json.get("error", error_detail)
                except:
                    pass
                raise Exception(f"Moment API Error ({response.status_code}): {error_detail}")
            
            return response.json()
    
    async def get_instruments(self, status: str = "outstanding", limit: int = 100) -> List[Dict[str, Any]]:
        """Get list of instruments from Moment API"""
        try:
            params = f"?status={status}&limit={limit}"
            endpoint = f"/v1/data/instrument/{params}"
            
            response = await self._make_request(endpoint)
            
            # Handle paginated response
            if isinstance(response, dict) and "data" in response:
                instruments = response["data"]
                return instruments
            elif isinstance(response, list):
                return response
            else:
                return []
                
        except Exception as e:
            # Return empty list to prevent startup failure
            return []
    
    async def get_quote(self, instrument_id: str) -> Quote:
        """Get real-time quote for an instrument"""
        try:
            endpoint = f"/v1/trading/quote/{instrument_id}/"
            response = await self._make_request(endpoint)
            
            
            return Quote(
                timestamp=response.get("timestamp", datetime.now().isoformat()),
                bid_price=response.get("bid_price"),
                bid_yield_to_maturity=response.get("bid_yield_to_maturity"),
                bid_yield_to_worst=response.get("bid_yield_to_worst"),
                bid_size=response.get("bid_size"),
                bid_min_size=response.get("bid_min_size"),
                ask_price=response.get("ask_price"),
                ask_yield_to_maturity=response.get("ask_yield_to_maturity"),
                ask_yield_to_worst=response.get("ask_yield_to_worst"),
                ask_size=response.get("ask_size"),
                ask_min_size=response.get("ask_min_size")
            )
        except Exception as e:
            raise Exception(f"Failed to get quote: {str(e)}")
    
    async def get_historical_prices(self, instrument_id: str, start_date: str, end_date: str, frequency: str = "1day") -> HistoricalPrices:
        """Get historical pricing data for an instrument"""
        try:
            # Use direct HTTP request with params since _make_request doesn't handle query params
            url = f"{self.base_url}/v1/data/instrument/{instrument_id}/price/"
            params = {
                "start": start_date,
                "end": end_date,
                "frequency": frequency
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, params=params)
                
                if response.status_code != 200:
                    error_detail = response.text
                    raise Exception(f"Historical data API Error ({response.status_code}): {error_detail}")
                
                data = response.json()
            
            return HistoricalPrices(**data)
        except Exception as e:
            raise Exception(f"Failed to get historical prices: {str(e)}")
    
    async def get_order_book(self, instrument_id: str) -> OrderBook:
        """Get full order book for an instrument"""
        try:
            url = f"{self.base_url}/v1/trading/order-book/{instrument_id}/"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers)
                
                if response.status_code != 200:
                    error_detail = response.text
                    raise Exception(f"Order book API Error ({response.status_code}): {error_detail}")
                
                data = response.json()
            
            return OrderBook(**data)
        except Exception as e:
            raise Exception(f"Failed to get order book: {str(e)}")
    
    async def submit_mock_order(self, order_request: OrderRequest) -> OrderResponse:
        """
        Mock order submission since API key lacks trading permissions.
        Simulates realistic order flow for demo purposes.
        """
        # Generate mock order ID
        order_id = f"mock_{int(time.time() * 1000)}_{random.randint(1000, 9999)}"
        
        # Simulate network delay (1-3 seconds)
        await asyncio.sleep(1 + random.random() * 2)
        
        # Mock order response
        return OrderResponse(
            order_id=order_id,
            client_order_id=order_request.client_order_id,
            instrument_id=order_request.instrument_id,
            side=order_request.side.value,
            quantity=order_request.quantity,
            order_type=order_request.order_type.value,
            price=order_request.price,
            status="pending",
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat(),
            filled_quantity=0,
            average_fill_price=None,
            fees=None
        )
    
    async def get_mock_orders(self, status: Optional[str] = None) -> List[OrderResponse]:
        """Get mock orders for demo"""
        mock_orders = [
            OrderResponse(
                order_id="mock_demo_001",
                client_order_id="client_demo_001",
                instrument_id="US649296AB61",
                side="buy",
                quantity=1000,
                order_type="market",
                price=100.50,
                status="filled",
                created_at=(datetime.now().replace(microsecond=0) - 
                           __import__('datetime').timedelta(hours=1)).isoformat(),
                updated_at=(datetime.now().replace(microsecond=0) - 
                           __import__('datetime').timedelta(minutes=50)).isoformat(),
                filled_quantity=1000,
                average_fill_price=100.45,
                fees=2.50
            ),
            OrderResponse(
                order_id="mock_demo_002",
                client_order_id="client_demo_002",
                instrument_id="US645767AW49",
                side="sell",
                quantity=500,
                order_type="limit",
                price=110.00,
                status="pending",
                created_at=(datetime.now().replace(microsecond=0) - 
                           __import__('datetime').timedelta(minutes=30)).isoformat(),
                updated_at=(datetime.now().replace(microsecond=0) - 
                           __import__('datetime').timedelta(minutes=30)).isoformat(),
                filled_quantity=0,
                average_fill_price=None,
                fees=None
            )
        ]
        
        if status:
            return [order for order in mock_orders if order.status == status]
        return mock_orders