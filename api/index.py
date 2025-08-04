from http.server import BaseHTTPRequestHandler
import json
import httpx
import asyncio
from urllib.parse import urlparse, parse_qs
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        url_parts = urlparse(self.path)
        path = url_parts.path
        query = parse_qs(url_parts.query)
        
        # Set CORS headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        try:
            if path == '/api/bonds':
                # Get bonds from Moment API
                bonds = asyncio.run(self.get_bonds())
                self.wfile.write(json.dumps(bonds).encode())
            elif path == '/api/health':
                self.wfile.write(json.dumps({"status": "healthy"}).encode())
            elif path.startswith('/api/orders'):
                # Return empty orders for now
                self.wfile.write(json.dumps([]).encode())
            else:
                self.send_error(404, "Not Found")
        except Exception as e:
            self.send_error(500, str(e))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    async def get_bonds(self):
        try:
            api_key = "msk_papr.5dde1e4b.qcUk-rVwMth7b7woezLIk_lAtLwL_Kg0"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            url = "https://paper.moment-api.com/v1/data/instrument/?status=outstanding&limit=50"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers)
                
                if response.status_code != 200:
                    return []
                
                data = response.json()
                
                # Parse response
                if isinstance(data, dict) and "data" in data:
                    instruments = data["data"]
                elif isinstance(data, list):
                    instruments = data
                else:
                    return []
                
                # Convert to frontend format
                bonds = []
                for item in instruments:
                    bond = {
                        "id": item.get("id", ""),
                        "isin": item.get("isin", ""),
                        "cusip": item.get("cusip"),
                        "issuer": item.get("issuer", "Unknown Issuer"),
                        "description": item.get("description", ""),
                        "bondType": item.get("asset_class", "corporate").lower(),
                        "sector": item.get("sector"),
                        "rating": item.get("rating"),
                        "coupon": str(item.get("coupon")) if item.get("coupon") else None,
                        "maturityDate": item.get("maturity_date"),
                        "currency": item.get("currency", "USD"),
                        "parValue": str(item.get("par_value")) if item.get("par_value") else None,
                        "lastPrice": str(item.get("last_price")) if item.get("last_price") else None,
                        "ytm": str(item.get("yield_to_maturity")) if item.get("yield_to_maturity") else None,
                        "ytw": str(item.get("yield_to_worst")) if item.get("yield_to_worst") else None,
                        "status": item.get("status", "outstanding"),
                        "updatedAt": datetime.now().isoformat()
                    }
                    bonds.append(bond)
                
                return bonds
                
        except Exception as e:
            # Return empty list on error
            return []