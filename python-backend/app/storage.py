from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from .models import Bond, Order

class BondStorage:
    """In-memory storage for bonds and orders - perfect for demo purposes"""
    
    def __init__(self):
        self.bonds: Dict[str, Bond] = {}
        self.orders: Dict[str, Order] = {}
    
    # Bond methods
    def add_bond(self, bond: Bond) -> None:
        """Add a bond to storage"""
        self.bonds[bond.id] = bond
    
    def get_bond(self, bond_id: str) -> Optional[Bond]:
        """Get a bond by ID"""
        return self.bonds.get(bond_id)
    
    def get_bond_by_isin(self, isin: str) -> Optional[Bond]:
        """Get a bond by ISIN"""
        for bond in self.bonds.values():
            if bond.isin == isin:
                return bond
        return None
    
    def get_all_bonds(self) -> List[Bond]:
        """Get all bonds"""
        return list(self.bonds.values())
    
    def search_bonds(self, filters: Dict[str, Any]) -> List[Bond]:
        """Search bonds with filters"""
        bonds = list(self.bonds.values())
        
        # Apply filters
        if 'bond_type' in filters:
            bonds = [b for b in bonds if b.bond_type == filters['bond_type']]
        
        if 'rating' in filters:
            bonds = [b for b in bonds if b.rating == filters['rating']]
        
        if 'sector' in filters:
            bonds = [b for b in bonds if b.sector == filters['sector']]
        
        if 'currency' in filters:
            bonds = [b for b in bonds if b.currency == filters['currency']]
        
        # Yield filtering (use coupon as proxy since ytm is null)
        if 'min_yield' in filters:
            bonds = [b for b in bonds if b.coupon and float(b.coupon) >= filters['min_yield']]
        
        if 'max_yield' in filters:
            bonds = [b for b in bonds if b.coupon and float(b.coupon) <= filters['max_yield']]
        
        # Maturity filtering
        if 'min_maturity' in filters:
            min_date = datetime.now() + timedelta(days=365 * filters['min_maturity'])
            bonds = [b for b in bonds if b.maturity_date and b.maturity_date >= min_date]
        
        if 'max_maturity' in filters:
            max_date = datetime.now() + timedelta(days=365 * filters['max_maturity'])
            bonds = [b for b in bonds if b.maturity_date and b.maturity_date <= max_date]
        
        return bonds
    
    # Order methods
    def add_order(self, order: Order) -> None:
        """Add an order to storage"""
        self.orders[order.id] = order
    
    def get_order(self, order_id: str) -> Optional[Order]:
        """Get an order by ID"""
        return self.orders.get(order_id)
    
    def get_orders(self, user_id: Optional[str] = None, status: Optional[str] = None) -> List[Order]:
        """Get orders with optional filters"""
        orders = list(self.orders.values())
        
        if user_id:
            orders = [o for o in orders if o.user_id == user_id]
        
        if status:
            orders = [o for o in orders if o.status == status]
        
        # Sort by creation time (newest first)
        orders.sort(key=lambda x: x.created_at, reverse=True)
        
        return orders
    
    def update_order_status(self, order_id: str, status: str, filled_quantity: int = 0, avg_price: Optional[float] = None) -> Optional[Order]:
        """Update order status"""
        if order_id in self.orders:
            order = self.orders[order_id]
            order.status = status
            order.filled_quantity = filled_quantity
            order.updated_at = datetime.now().isoformat()
            return order
        return None
    
    # Analytics methods
    def get_bond_count(self) -> int:
        """Get total number of bonds"""
        return len(self.bonds)
    
    def get_order_count(self) -> int:
        """Get total number of orders"""
        return len(self.orders)
    
    def get_sectors(self) -> List[str]:
        """Get unique sectors"""
        sectors = set()
        for bond in self.bonds.values():
            if bond.sector:
                sectors.add(bond.sector)
        return sorted(list(sectors))
    
    def get_ratings(self) -> List[str]:
        """Get unique ratings"""
        ratings = set()
        for bond in self.bonds.values():
            if bond.rating:
                ratings.add(bond.rating)
        return sorted(list(ratings))
    
    def get_bond_types(self) -> List[str]:
        """Get unique bond types"""
        bond_types = set()
        for bond in self.bonds.values():
            if bond.bond_type:
                bond_types.add(bond.bond_type)
        return sorted(list(bond_types))