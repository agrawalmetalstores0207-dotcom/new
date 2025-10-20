from fastapi import FastAPI, APIRouter, HTTPException, status, Depends, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from jose import JWTError
import random
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
SECRET_KEY = os.environ.get('JWT_SECRET', 'fatima-collection-secret-key-change-in-production')
ALGORITHM = "HS256"

# ============ MODELS ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str = "customer"  # customer, admin
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str  # dress_material, kurti, cotton_set, readymade
    price: float
    sale_price: Optional[float] = None
    stock: int
    images: List[str] = []
    model_3d_url: Optional[str] = None  # For 3D model
    sizes: List[str] = []
    colors: List[str] = []
    fabric: Optional[str] = None
    brand: Optional[str] = None
    tags: List[str] = []
    is_featured: bool = False
    is_trending: bool = False
    views: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    category: str
    price: float
    sale_price: Optional[float] = None
    stock: int
    images: List[str] = []
    model_3d_url: Optional[str] = None
    sizes: List[str] = []
    colors: List[str] = []
    fabric: Optional[str] = None
    brand: Optional[str] = None
    tags: List[str] = []
    is_featured: bool = False
    is_trending: bool = False

class CartItem(BaseModel):
    product_id: str
    quantity: int
    size: Optional[str] = None
    color: Optional[str] = None

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str = Field(default_factory=lambda: f"FTC{random.randint(100000, 999999)}")
    user_id: str
    items: List[Dict[str, Any]]
    total_amount: float
    payment_method: str  # cod, upi, card, wallet
    payment_status: str = "pending"  # pending, completed, failed
    order_status: str = "placed"  # placed, confirmed, shipped, delivered, cancelled
    shipping_address: Dict[str, Any]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    items: List[CartItem]
    payment_method: str
    shipping_address: Dict[str, Any]

class Wishlist(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    product_ids: List[str] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AIRecommendation(BaseModel):
    products: List[Product]
    reason: str

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    products: List[Product] = []

class MarketingDesign(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    template: str
    design_text: str
    font_size: int
    text_color: str
    background_image: Optional[str] = None
    background_gradient: Optional[str] = None
    width: int
    height: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MarketingDesignCreate(BaseModel):
    name: str
    template: str
    design_text: str
    font_size: int
    text_color: str
    background_image: Optional[str] = None
    background_gradient: Optional[str] = None
    width: int
    height: int

# ============ AUTH HELPERS ============

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return User(**user)

async def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        phone=user_data.phone,
        role="customer"
    )
    
    # Store user with hashed password
    user_doc = user.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    user_doc['password'] = pwd_context.hash(user_data.password)
    
    await db.users.insert_one(user_doc)
    
    # Create token
    token = create_access_token({"sub": user.id})
    
    return Token(access_token=token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not pwd_context.verify(user_data.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Convert datetime
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    
    # Create token
    token = create_access_token({"sub": user.id})
    
    return Token(access_token=token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ============ PRODUCT ROUTES ============

@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    is_featured: Optional[bool] = None,
    is_trending: Optional[bool] = None,
    limit: int = 50
):
    query = {}
    if category:
        query['category'] = category
    if is_featured is not None:
        query['is_featured'] = is_featured
    if is_trending is not None:
        query['is_trending'] = is_trending
    if search:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}},
            {'tags': {'$regex': search, '$options': 'i'}}
        ]
    
    products = await db.products.find(query, {"_id": 0}).limit(limit).to_list(limit)
    
    for p in products:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
        if isinstance(p.get('updated_at'), str):
            p['updated_at'] = datetime.fromisoformat(p['updated_at'])
    
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Increment views
    await db.products.update_one({"id": product_id}, {"$inc": {"views": 1}})
    product['views'] = product.get('views', 0) + 1
    
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    if isinstance(product.get('updated_at'), str):
        product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_admin)
):
    product = Product(**product_data.model_dump())
    
    product_doc = product.model_dump()
    product_doc['created_at'] = product_doc['created_at'].isoformat()
    product_doc['updated_at'] = product_doc['updated_at'].isoformat()
    
    await db.products.insert_one(product_doc)
    
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_data: ProductCreate,
    current_user: User = Depends(get_current_admin)
):
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_data.model_dump()
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(updated_product.get('created_at'), str):
        updated_product['created_at'] = datetime.fromisoformat(updated_product['created_at'])
    if isinstance(updated_product.get('updated_at'), str):
        updated_product['updated_at'] = datetime.fromisoformat(updated_product['updated_at'])
    
    return Product(**updated_product)

@api_router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_admin)
):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# ============ CART ROUTES ============

@api_router.get("/cart", response_model=Cart)
async def get_cart(current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id}, {"_id": 0})
    if not cart:
        cart = Cart(user_id=current_user.id)
        cart_doc = cart.model_dump()
        cart_doc['updated_at'] = cart_doc['updated_at'].isoformat()
        await db.carts.insert_one(cart_doc)
    else:
        if isinstance(cart.get('updated_at'), str):
            cart['updated_at'] = datetime.fromisoformat(cart['updated_at'])
        cart = Cart(**cart)
    
    return cart

@api_router.post("/cart/add")
async def add_to_cart(
    item: CartItem,
    current_user: User = Depends(get_current_user)
):
    cart = await db.carts.find_one({"user_id": current_user.id}, {"_id": 0})
    
    if not cart:
        cart = Cart(user_id=current_user.id, items=[item])
        cart_doc = cart.model_dump()
        cart_doc['updated_at'] = cart_doc['updated_at'].isoformat()
        await db.carts.insert_one(cart_doc)
    else:
        # Check if item exists
        items = cart.get('items', [])
        found = False
        for i, existing_item in enumerate(items):
            if (existing_item['product_id'] == item.product_id and 
                existing_item.get('size') == item.size and 
                existing_item.get('color') == item.color):
                items[i]['quantity'] += item.quantity
                found = True
                break
        
        if not found:
            items.append(item.model_dump())
        
        await db.carts.update_one(
            {"user_id": current_user.id},
            {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    return {"message": "Item added to cart"}

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(
    product_id: str,
    current_user: User = Depends(get_current_user)
):
    cart = await db.carts.find_one({"user_id": current_user.id}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = [item for item in cart.get('items', []) if item['product_id'] != product_id]
    
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Item removed from cart"}

# ============ WISHLIST ROUTES ============

@api_router.get("/wishlist", response_model=Wishlist)
async def get_wishlist(current_user: User = Depends(get_current_user)):
    wishlist = await db.wishlists.find_one({"user_id": current_user.id}, {"_id": 0})
    if not wishlist:
        wishlist = Wishlist(user_id=current_user.id)
        wishlist_doc = wishlist.model_dump()
        wishlist_doc['updated_at'] = wishlist_doc['updated_at'].isoformat()
        await db.wishlists.insert_one(wishlist_doc)
    else:
        if isinstance(wishlist.get('updated_at'), str):
            wishlist['updated_at'] = datetime.fromisoformat(wishlist['updated_at'])
        wishlist = Wishlist(**wishlist)
    
    return wishlist

@api_router.post("/wishlist/add/{product_id}")
async def add_to_wishlist(
    product_id: str,
    current_user: User = Depends(get_current_user)
):
    await db.wishlists.update_one(
        {"user_id": current_user.id},
        {
            "$addToSet": {"product_ids": product_id},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        },
        upsert=True
    )
    return {"message": "Added to wishlist"}

@api_router.delete("/wishlist/remove/{product_id}")
async def remove_from_wishlist(
    product_id: str,
    current_user: User = Depends(get_current_user)
):
    await db.wishlists.update_one(
        {"user_id": current_user.id},
        {
            "$pull": {"product_ids": product_id},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    return {"message": "Removed from wishlist"}

# ============ ORDER ROUTES ============

@api_router.post("/orders", response_model=Order)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user)
):
    # Get product details and calculate total
    total = 0
    items = []
    
    for cart_item in order_data.items:
        product = await db.products.find_one({"id": cart_item.product_id}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {cart_item.product_id} not found")
        
        if product['stock'] < cart_item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product['name']}")
        
        price = product.get('sale_price') or product['price']
        item_total = price * cart_item.quantity
        total += item_total
        
        items.append({
            "product_id": cart_item.product_id,
            "name": product['name'],
            "price": price,
            "quantity": cart_item.quantity,
            "size": cart_item.size,
            "color": cart_item.color,
            "image": product['images'][0] if product['images'] else None
        })
        
        # Update stock
        await db.products.update_one(
            {"id": cart_item.product_id},
            {"$inc": {"stock": -cart_item.quantity}}
        )
    
    order = Order(
        user_id=current_user.id,
        items=items,
        total_amount=total,
        payment_method=order_data.payment_method,
        shipping_address=order_data.shipping_address
    )
    
    order_doc = order.model_dump()
    order_doc['created_at'] = order_doc['created_at'].isoformat()
    order_doc['updated_at'] = order_doc['updated_at'].isoformat()
    
    await db.orders.insert_one(order_doc)
    
    # Clear cart
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {"items": [], "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: User = Depends(get_current_user)):
    query = {"user_id": current_user.id}
    if current_user.role == "admin":
        query = {}  # Admin can see all orders
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
        if isinstance(order.get('updated_at'), str):
            order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: User = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order['user_id'] != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    if isinstance(order.get('created_at'), str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    if isinstance(order.get('updated_at'), str):
        order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    
    return Order(**order)

@api_router.patch("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    order_status: str,
    current_user: User = Depends(get_current_admin)
):
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"order_status": order_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated"}

# ============ AI ROUTES (MOCKED) ============

@api_router.get("/ai/recommendations", response_model=AIRecommendation)
async def get_ai_recommendations(current_user: User = Depends(get_current_user)):
    # Mock AI: Get random trending products
    products = await db.products.find({"is_trending": True}, {"_id": 0}).limit(4).to_list(4)
    
    if not products:
        products = await db.products.find({}, {"_id": 0}).limit(4).to_list(4)
    
    for p in products:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
        if isinstance(p.get('updated_at'), str):
            p['updated_at'] = datetime.fromisoformat(p['updated_at'])
    
    products = [Product(**p) for p in products]
    
    return AIRecommendation(
        products=products,
        reason="Based on your browsing history and trending styles, we recommend these elegant pieces for you."
    )

@api_router.post("/ai/chat", response_model=ChatResponse)
async def ai_chat(chat_msg: ChatMessage):
    message = chat_msg.message.lower()
    
    # Mock AI responses
    if "kurti" in message or "kurtis" in message:
        products = await db.products.find({"category": "kurti"}, {"_id": 0}).limit(3).to_list(3)
        response = "I found some beautiful kurtis for you! Here are our top recommendations:"
    elif "dress" in message:
        products = await db.products.find({"category": "dress_material"}, {"_id": 0}).limit(3).to_list(3)
        response = "Check out these stunning dress materials perfect for any occasion!"
    elif "cotton" in message:
        products = await db.products.find({"category": "cotton_set"}, {"_id": 0}).limit(3).to_list(3)
        response = "Our premium cotton sets are comfortable and stylish. Take a look!"
    elif "price" in message or "cost" in message:
        response = "Our collection ranges from ₹500 to ₹5000. What's your budget range?"
        products = []
    elif "delivery" in message or "shipping" in message:
        response = "We offer free shipping on orders above ₹999. Standard delivery takes 3-5 business days."
        products = []
    else:
        products = await db.products.find({"is_featured": True}, {"_id": 0}).limit(3).to_list(3)
        response = "Welcome to Fatima Collection! I'm here to help you find the perfect outfit. What are you looking for today?"
    
    for p in products:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
        if isinstance(p.get('updated_at'), str):
            p['updated_at'] = datetime.fromisoformat(p['updated_at'])
    
    products = [Product(**p) for p in products]
    
    return ChatResponse(response=response, products=products)

# ============ ANALYTICS (MOCK) ============

@api_router.get("/analytics/dashboard")
async def get_analytics(current_user: User = Depends(get_current_admin)):
    total_orders = await db.orders.count_documents({})
    total_products = await db.products.count_documents({})
    total_customers = await db.users.count_documents({"role": "customer"})
    
    # Mock revenue calculation
    orders = await db.orders.find({"payment_status": "completed"}, {"_id": 0}).to_list(1000)
    total_revenue = sum(order.get('total_amount', 0) for order in orders)
    
    return {
        "total_orders": total_orders,
        "total_products": total_products,
        "total_customers": total_customers,
        "total_revenue": total_revenue,
        "top_selling_category": "kurti",  # Mock
        "ai_insights": "Sales increased by 25% this month. Kurtis are trending!"
    }

# ============ MARKETING DESIGNER ============

@api_router.post("/marketing/upload-background")
async def upload_background(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin)
):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = f"/app/backend/uploads/backgrounds/{filename}"
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"filename": filename, "url": f"/uploads/backgrounds/{filename}"}

@api_router.post("/products/upload-image")
async def upload_product_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin)
):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = f"/app/backend/uploads/products/{filename}"
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"filename": filename, "url": f"/uploads/products/{filename}"}

@api_router.post("/marketing/designs", response_model=MarketingDesign)
async def save_design(
    design_data: MarketingDesignCreate,
    current_user: User = Depends(get_current_admin)
):
    design = MarketingDesign(
        user_id=current_user.id,
        **design_data.model_dump()
    )
    
    design_doc = design.model_dump()
    design_doc['created_at'] = design_doc['created_at'].isoformat()
    
    await db.marketing_designs.insert_one(design_doc)
    
    return design

@api_router.get("/marketing/designs", response_model=List[MarketingDesign])
async def get_designs(current_user: User = Depends(get_current_admin)):
    designs = await db.marketing_designs.find(
        {"user_id": current_user.id}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    for design in designs:
        if isinstance(design.get('created_at'), str):
            design['created_at'] = datetime.fromisoformat(design['created_at'])
    
    return designs

@api_router.get("/marketing/designs/{design_id}", response_model=MarketingDesign)
async def get_design(
    design_id: str,
    current_user: User = Depends(get_current_admin)
):
    design = await db.marketing_designs.find_one({"id": design_id}, {"_id": 0})
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    
    if isinstance(design.get('created_at'), str):
        design['created_at'] = datetime.fromisoformat(design['created_at'])
    
    return MarketingDesign(**design)

@api_router.delete("/marketing/designs/{design_id}")
async def delete_design(
    design_id: str,
    current_user: User = Depends(get_current_admin)
):
    result = await db.marketing_designs.delete_one({"id": design_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Design not found")
    
    return {"message": "Design deleted successfully"}

# Include router
app.include_router(api_router)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="/app/backend/uploads"), name="uploads")

# Import and include ERP routers
from erp import sales, purchases, payments, reports

app.include_router(sales.router)
app.include_router(purchases.router)
app.include_router(payments.router)
app.include_router(payments.party_router)
app.include_router(reports.router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
