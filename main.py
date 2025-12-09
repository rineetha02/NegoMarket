"""
FastAPI Multi-Agent US Marketplace with Groq Llama 3.1 + AutoGen
Complete implementation with AI negotiation
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
from autogen_agentchat import AssistantAgent, GroupChat, GroupChatManager

from datetime import datetime
import json
import re

from dotenv import load_dotenv

load_dotenv()


app = FastAPI(title="US AI Marketplace")

# ============================================================================
# GROQ LLAMA 3.1 CONFIG
# ============================================================================

llm_config = {
    'config_list': [{
        'model': 'llama-3.3-70b-versatile',  # updated model ID
        'api_key': os.getenv('GROQ_API_KEY'),
        'base_url': 'https://api.groq.com/openai/v1'
    }],
    'temperature': 0.7,
    'timeout': 120
}




# ============================================================================
# DATA MODELS
# ============================================================================

class Message(BaseModel):
    sender: str
    receiver: str
    content: str
    timestamp: str = None

class ChatRequest(BaseModel):
    message: Message

class NegotiateRequest(BaseModel):
    query: str
    max_rounds: int = 3
    
class ChatResponse(BaseModel):
    response: Message
    status: str

class NegotiateResponse(BaseModel):
    ranked_offers: List[Dict]
    negotiation_log: List[Dict]
    ai_used: str
    best_deal: Dict

# ============================================================================
# US INVENTORY DATABASE
# ============================================================================

INVENTORY_DB = {
    "store_1": {
        "store_id": "store_1",
        "name": "Walmart Electronics",
        "location": "New York",
        "inventory": [
            {
                "model": "iPhone 15 Pro",
                "brand": "Apple",
                "base_price": 999.00,
                "stock": 15,
                "specs": {"screen": "6.1 inch", "storage": "256GB", "camera": "48MP"},
                "delivery_options": ["2-day shipping", "pickup today", "same-day urban"]
            },
            {
                "model": "Galaxy S24 Ultra",
                "brand": "Samsung",
                "base_price": 1199.00,
                "stock": 10,
                "specs": {"screen": "6.8 inch", "storage": "512GB", "camera": "200MP"},
                "delivery_options": ["2-day shipping", "pickup today"]
            }
        ],
        "perks": ["Walmart+ FREE", "Price match"],
        "rules": {"max_discount": 5, "pickup_discount": 30, "walmart_plus": 34}
    },
    "store_2": {
        "store_id": "store_2",
        "name": "Target Mobile",
        "location": "Los Angeles",
        "inventory": [
            {
                "model": "iPhone 15 Pro",
                "brand": "Apple",
                "base_price": 979.00,
                "stock": 12,
                "specs": {"screen": "6.1 inch", "storage": "256GB", "camera": "48MP"},
                "delivery_options": ["2-day shipping", "same-day urban", "pickup today"]
            },
            {
                "model": "Pixel 8 Pro",
                "brand": "Google",
                "base_price": 899.00,
                "stock": 20,
                "specs": {"screen": "6.7 inch", "storage": "256GB", "camera": "50MP"},
                "delivery_options": ["2-day shipping", "pickup today"]
            }
        ],
        "perks": ["RedCard 5% off", "Free returns"],
        "rules": {"redcard_discount": 5, "floor": 930}
    },
    "store_3": {
        "store_id": "store_3",
        "name": "Best Buy",
        "location": "Chicago",
        "inventory": [
            {
                "model": "iPhone 15 Pro",
                "brand": "Apple",
                "base_price": 949.00,
                "stock": 25,
                "specs": {"screen": "6.1 inch", "storage": "256GB", "camera": "48MP"},
                "delivery_options": ["pickup today", "2-day shipping", "same-day urban"]
            },
            {
                "model": "MacBook Pro 14",
                "brand": "Apple",
                "base_price": 1299.00,
                "stock": 8,
                "specs": {"screen": "14 inch", "storage": "512GB", "chip": "M3"},
                "delivery_options": ["pickup today", "2-day shipping"]
            }
        ],
        "perks": ["Geek Squad", "Student discount", "Price match"],
        "rules": {"student_discount": 50, "pickup_discount": 50, "floor": 899}
    }
}

SERVICES_DB = {
    "salon_1": {
        "service_id": "salon_1",
        "name": "Ulta Beauty",
        "location": "New York",
        "services": [
            {
                "service_type": "haircut",
                "base_price": 65.00,
                "duration": "45 min",
                "available_slots": ["5PM", "6PM", "7PM"]
            }
        ],
        "perks": ["First-time discount", "Loyalty"],
        "rules": {"first_time": 10, "cash_discount": 9, "floor": 55}
    },
    "salon_2": {
        "service_id": "salon_2",
        "name": "Great Clips",
        "location": "Los Angeles",
        "services": [
            {
                "service_type": "haircut",
                "base_price": 45.00,
                "duration": "30 min",
                "available_slots": ["4PM", "5:30PM", "6:30PM"]
            }
        ],
        "perks": ["Walk-ins", "Cash discount"],
        "rules": {"cash_discount": 9, "floor": 40}
    },
    "repair_1": {
        "service_id": "repair_1",
        "name": "uBreakiFix",
        "location": "Chicago",
        "services": [
            {
                "service_type": "screen_repair",
                "base_price": 199.00,
                "duration": "2 hours",
                "available_slots": ["10AM", "12PM", "2PM", "4PM"]
            }
        ],
        "perks": ["Same-day", "90-day warranty"],
        "rules": {"same_day_discount": 20, "floor": 179}
    }
}

# ============================================================================
# AUTOGEN AI AGENTS
# ============================================================================

user_proxy = AssistantAgent(
    name="USCustomerAgent",
    system_message="""Aggressive negotiator for NYC/LA/Chicago. Push for pickup discounts. 
    Demand price matching. Always ask "Can you beat this?" Reference competitor prices.""",
    llm_config=llm_config,
    human_input_mode="NEVER"
)

walmart_agent = AssistantAgent(
    name="WalmartNYC",
    system_message="""Walmart Electronics NYC. iPhone 15: $999 base. Max 5% off. 
    Pickup: $30 off. Walmart+: $34 off. FLOOR: $949. Be firm but friendly.""",
    llm_config=llm_config,
    human_input_mode="NEVER"
)

target_agent = AssistantAgent(
    name="TargetLA",
    system_message="""Target Mobile LA. iPhone 15: $979 base. RedCard 5% = $930. 
    Same-day delivery FREE. FLOOR: $930. Emphasize RedCard value.""",
    llm_config=llm_config,
    human_input_mode="NEVER"
)

bestbuy_agent = AssistantAgent(
    name="BestBuyChicago",
    system_message="""Best Buy Chicago. iPhone 15: $949 base (lowest!). Pickup: $50 off = $899. 
    Student: $50 off = $899. FLOOR: $899. Push Geek Squad.""",
    llm_config=llm_config,
    human_input_mode="NEVER"
)

ulta_agent = AssistantAgent(
    name="UltaBeautyNYC",
    system_message="""Ulta Beauty NYC. Haircut: $65 base. First-time: $55. Cash: $59. 
    FLOOR: $55. Slots: 5PM, 6PM, 7PM. Promote loyalty.""",
    llm_config=llm_config,
    human_input_mode="NEVER"
)

ubreakifix_agent = AssistantAgent(
    name="uBreakiFixChicago",
    system_message="""uBreakiFix Chicago. Screen repair: $199 base. Same-day pickup: $179. 
    2-hour turnaround. FLOOR: $179. 90-day warranty included.""",
    llm_config=llm_config,
    human_input_mode="NEVER"
)

# ============================================================================
# LEGACY AGENTS
# ============================================================================

class SellerAgent:
    def __init__(self, store_id: str, store_data: Dict):
        self.store_id = store_id
        self.store_data = store_data
        self.name = store_data["name"]
        self.location = store_data["location"]
        
    def handle_query(self, query: str) -> str:
        query_lower = query.lower()
        if "price" in query_lower:
            return self._get_pricing(query_lower)
        elif "stock" in query_lower:
            return self._get_stock(query_lower)
        else:
            return self._list_inventory()
    
    def _list_inventory(self) -> str:
        inv = self.store_data["inventory"]
        result = f"📍 {self.name} - {self.location}\n\n"
        for i, p in enumerate(inv, 1):
            result += f"{i}. {p['brand']} {p['model']} - ${p['base_price']:.2f} ({p['stock']} in stock)\n"
        return result
    
    def _get_pricing(self, query: str) -> str:
        results = []
        for p in self.store_data["inventory"]:
            if p["model"].lower() in query:
                base = p["base_price"]
                rules = self.store_data.get("rules", {})
                pickup_disc = rules.get("pickup_discount", 0)
                results.append(f"{p['brand']} {p['model']}: ${base:.2f} (Pickup: ${base-pickup_disc:.2f})")
        return "\n".join(results) if results else "No matches."
    
    def _get_stock(self, query: str) -> str:
        results = []
        for p in self.store_data["inventory"]:
            if p["model"].lower() in query:
                results.append(f"{p['brand']} {p['model']}: {p['stock']} units")
        return "\n".join(results) if results else "Specify product."


class ServiceAgent:
    def __init__(self, service_id: str, service_data: Dict):
        self.service_id = service_id
        self.service_data = service_data
        self.name = service_data["name"]
        
    def handle_query(self, query: str) -> str:
        query_lower = query.lower()
        if "price" in query_lower:
            return self._get_pricing()
        elif "slot" in query_lower:
            return self._get_slots()
        return f"Hi from {self.name}! Ask about pricing or slots."
    
    def _get_pricing(self) -> str:
        result = f"{self.name} Services:\n"
        for s in self.service_data["services"]:
            result += f"• {s['service_type']}: ${s['base_price']:.2f}\n"
        return result
    
    def _get_slots(self) -> str:
        result = f"{self.name} Slots:\n"
        for s in self.service_data["services"]:
            result += f"• {s['service_type']}: {', '.join(s['available_slots'])}\n"
        return result


class UserAgent:
    def __init__(self, hub):
        self.hub = hub
    
    def parse_query(self, query: str) -> Dict:
        query_lower = query.lower()
        parsed = {"type": None, "item": None, "budget": None, "location": None, "delivery": None}
        
        # Detect type
        if any(k in query_lower for k in ["haircut", "repair", "screen"]):
            parsed["type"] = "service"
            if "haircut" in query_lower:
                parsed["item"] = "haircut"
            elif "repair" in query_lower or "screen" in query_lower:
                parsed["item"] = "screen_repair"
        else:
            parsed["type"] = "product"
            for prod in ["iphone", "galaxy", "pixel", "macbook"]:
                if prod in query_lower:
                    parsed["item"] = prod
                    break
        
        # Extract budget
        budget_match = re.search(r'under\s+\$?(\d+)', query_lower)
        if budget_match:
            parsed["budget"] = int(budget_match.group(1))
        
        # Extract location
        for loc in ["nyc", "new york", "la", "los angeles", "chicago"]:
            if loc in query_lower:
                parsed["location"] = loc
                break
        
        # Extract delivery
        if "pickup" in query_lower:
            parsed["delivery"] = "pickup"
        
        return parsed


class CoordinationHub:
    def __init__(self, sellers: Dict, services: Dict):
        self.sellers = sellers
        self.services = services
        
    def route_message(self, sender: str, receiver: str, content: str) -> str:
        if receiver in self.sellers:
            return self.sellers[receiver].handle_query(content)
        elif receiver in self.services:
            return self.services[receiver].handle_query(content)
        return "Unknown receiver"


# Initialize legacy agents
seller_agents = {f"store_{i+1}": SellerAgent(f"store_{i+1}", data) 
                 for i, data in enumerate(INVENTORY_DB.values())}
service_agents = {sid: ServiceAgent(sid, data) for sid, data in SERVICES_DB.items()}
coordination_hub = CoordinationHub(seller_agents, service_agents)
user_agent = UserAgent(coordination_hub)

# ============================================================================
# AI HELPERS
# ============================================================================

def extract_price_with_type(text: str, is_service: bool) -> Optional[float]:
    """Extract main price, using different thresholds for products vs services."""
    prices = re.findall(r'\$(\d{1,5}(?:,\d{3})?(?:\.\d{2})?)', text)
    if not prices:
        return None

    values = [float(p.replace(',', '')) for p in prices]

    if is_service:
        # Haircuts, repairs, etc.
        filtered = [v for v in values if v >= 20]
    else:
        # Phones, laptops, etc.
        filtered = [v for v in values if v >= 100]

    if filtered:
        return max(filtered)

    return max(values)




def rank_offers(offers: List[Dict]) -> Dict:
    """Find best deal"""
    if not offers:
        return {}
    sorted_offers = sorted(offers, key=lambda x: x['price'])
    return sorted_offers[0]

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
def root():
    return {
        "message": "US AI Marketplace (Groq Llama 3.1 + AutoGen)",
        "endpoints": {
            "POST /ai_negotiate": "AI negotiation tournament ⭐",
            "POST /chat": "Legacy routing",
            "GET /stores": "List stores",
            "GET /services": "List services",
            "GET /agents": "List all agents"
        }
    }



@app.post("/ai_negotiate", response_model=NegotiateResponse)
def ai_negotiate(request: NegotiateRequest):
    """
    AI-powered negotiation using Groq Llama 3.1 (1v1 sequential)
    Example: {"query": "iPhone under $900 NYC pickup", "max_rounds": 3}
    """
    try:
        query = request.query
        query_lower = query.lower()

        # Select relevant AI agents
        agents = []
        if "haircut" in query_lower:
            agents = [ulta_agent]
        elif "repair" in query_lower or "screen" in query_lower:
            agents = [ubreakifix_agent]
        elif "iphone" in query_lower or "macbook" in query_lower:
            agents = [walmart_agent, target_agent, bestbuy_agent]

        if not agents:
            return NegotiateResponse(
                ranked_offers=[],
                negotiation_log=[{"error": "No matching agents"}],
                ai_used="Groq Llama 3.1 70B",
                best_deal={}
            )

        # Decide if this is a service (haircut/repair) or product (phone/laptop)
        is_service = any(a.name in ["UltaBeautyNYC", "uBreakiFixChicago"] for a in agents)

        # 1v1 SEQUENTIAL AI NEGOTIATION
        results: List[Dict] = []
        negotiation_log: List[Dict] = []

        for i, agent in enumerate(agents, start=1):
            print(f"🤖 {user_proxy.name} vs {agent.name}")
            chat_result = user_proxy.initiate_chat(
                agent,
                message=query,
                max_turns=2,
            )

            summary = getattr(chat_result, "summary", "")
            negotiation_log.append(
                {
                    "round": i,
                    "customer": user_proxy.name,
                    "seller": agent.name,
                    "summary": summary[:500],
                }
            )

            # Use type-aware price extraction
            price = extract_price_with_type(summary, is_service)
            if price is not None:
                results.append(
                    {
                        "agent": agent.name,
                        "price": price,
                        "details": summary[:400],
                    }
                )

        if not results:
            return NegotiateResponse(
                ranked_offers=[],
                negotiation_log=negotiation_log,
                ai_used="Groq Llama 3.1 70B",
                best_deal={},
            )

        ranked_offers = sorted(results, key=lambda x: x["price"])
        best_deal = ranked_offers[0]

        return NegotiateResponse(
            ranked_offers=ranked_offers,
            negotiation_log=negotiation_log,
            ai_used="Groq Llama 3.1 70B (1v1 sequential)",
            best_deal=best_deal,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Negotiation error: {str(e)}")

@app.get("/stores")
def list_stores():
    return {
        "stores": [
            {"id": k, "name": v.name, "location": v.location}
            for k, v in seller_agents.items()
        ]
    }

@app.get("/services")
def list_services():
    return {
        "services": [
            {"id": k, "name": v.name}
            for k, v in service_agents.items()
        ]
    }

@app.get("/agents")
def list_agents():
    return {
        "ai_agents": {
            "USCustomerAgent": "Customer (Groq AI)",
            "WalmartNYC": "Walmart NYC (AI)",
            "TargetLA": "Target LA (AI)",
            "BestBuyChicago": "Best Buy Chicago (AI)",
            "UltaBeautyNYC": "Ulta NYC (AI)",
            "uBreakiFixChicago": "uBreakiFix Chicago (AI)"
        },
        "legacy_agents": {
            "store_1": "Walmart (rule-based)",
            "store_2": "Target (rule-based)",
            "store_3": "Best Buy (rule-based)"
        }
    }

# ============================================================================
# USAGE
# ============================================================================

"""
SETUP:
1. pip install fastapi uvicorn pyautogen pydantic
2. export GROQ_API_KEY="your-key-here"
3. uvicorn main:app --reload

TEST AI NEGOTIATION:
curl -X POST "http://localhost:8000/ai_negotiate" \
  -H "Content-Type: application/json" \
  -d '{"query": "iPhone under $900 NYC pickup", "max_rounds": 3}'

Response shows AI agents negotiating:
- USCustomerAgent: "Need iPhone under $900. Beat Best Buy's $949?"
- WalmartNYC: "$969 with pickup or $965 Walmart+"
- TargetLA: "$930 with RedCard"
- BestBuyChicago: "$899 pickup - best price!"
Winner: Best Buy at $899

More tests:
curl -X POST http://localhost:8000/ai_negotiate -H "Content-Type: application/json" \
  -d '{"query": "Haircut NYC 5PM under $60"}'

curl -X POST http://localhost:8000/ai_negotiate -H "Content-Type: application/json" \
  -d '{"query": "MacBook student discount under $1250"}'
"""

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)