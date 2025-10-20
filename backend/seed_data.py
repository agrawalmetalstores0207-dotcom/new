import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_data():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("Seeding database...")
    
    # Create admin user
    admin_exists = await db.users.find_one({"email": "admin@fatima.com"})
    if not admin_exists:
        admin_user = {
            "id": str(uuid.uuid4()),
            "email": "admin@fatima.com",
            "password": pwd_context.hash("admin123"),
            "full_name": "Admin User",
            "phone": "+919876543210",
            "role": "admin",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
        print("✓ Admin user created (email: admin@fatima.com, password: admin123)")
    
    # Create test customer
    customer_exists = await db.users.find_one({"email": "customer@test.com"})
    if not customer_exists:
        customer_user = {
            "id": str(uuid.uuid4()),
            "email": "customer@test.com",
            "password": pwd_context.hash("customer123"),
            "full_name": "Test Customer",
            "phone": "+919876543211",
            "role": "customer",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(customer_user)
        print("✓ Test customer created (email: customer@test.com, password: customer123)")
    
    # Create sample products
    products_count = await db.products.count_documents({})
    if products_count == 0:
        sample_products = [
            {
                "id": str(uuid.uuid4()),
                "name": "Elegant Silk Kurti",
                "description": "Beautiful silk kurti with intricate embroidery. Perfect for festive occasions.",
                "category": "kurti",
                "price": 2499.0,
                "sale_price": 1999.0,
                "stock": 25,
                "images": ["https://images.unsplash.com/photo-1583391733975-830022e63bbb?w=600"],
                "sizes": ["S", "M", "L", "XL"],
                "colors": ["#8b4513", "#d4a574", "#ff6b6b"],
                "fabric": "Silk",
                "brand": "Fatima Collection",
                "tags": ["festive", "silk", "premium"],
                "is_featured": True,
                "is_trending": True,
                "views": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Cotton Dress Material Set",
                "description": "Premium cotton dress material with matching dupatta. Soft and comfortable.",
                "category": "dress_material",
                "price": 1799.0,
                "sale_price": 1499.0,
                "stock": 30,
                "images": ["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600"],
                "sizes": ["Free Size"],
                "colors": ["#4a90e2", "#50c878", "#ffb6c1"],
                "fabric": "Cotton",
                "brand": "Fatima Collection",
                "tags": ["casual", "cotton", "comfortable"],
                "is_featured": True,
                "is_trending": False,
                "views": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Designer Kurti with Palazzo",
                "description": "Trendy kurti with palazzo set. Perfect for daily wear and casual outings.",
                "category": "kurti",
                "price": 1999.0,
                "sale_price": None,
                "stock": 20,
                "images": ["https://images.unsplash.com/photo-1583391733975-830022e63bbb?w=600"],
                "sizes": ["S", "M", "L", "XL", "XXL"],
                "colors": ["#000000", "#ffffff", "#ff0000"],
                "fabric": "Rayon",
                "brand": "Fatima Collection",
                "tags": ["casual", "trendy", "palazzo"],
                "is_featured": False,
                "is_trending": True,
                "views": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Premium Cotton Set",
                "description": "Luxurious cotton kurti set with pants. Breathable and stylish.",
                "category": "cotton_set",
                "price": 2199.0,
                "sale_price": 1899.0,
                "stock": 15,
                "images": ["https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=600"],
                "sizes": ["M", "L", "XL"],
                "colors": ["#8b4513", "#2f4f4f", "#daa520"],
                "fabric": "Premium Cotton",
                "brand": "Fatima Collection",
                "tags": ["premium", "cotton", "comfortable"],
                "is_featured": True,
                "is_trending": False,
                "views": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Readymade Anarkali Suit",
                "description": "Stunning readymade anarkali suit with beautiful embroidery work.",
                "category": "readymade",
                "price": 3499.0,
                "sale_price": 2999.0,
                "stock": 10,
                "images": ["https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600"],
                "sizes": ["S", "M", "L", "XL"],
                "colors": ["#ff1493", "#00ced1", "#ffd700"],
                "fabric": "Georgette",
                "brand": "Fatima Collection",
                "tags": ["festive", "wedding", "party"],
                "is_featured": False,
                "is_trending": True,
                "views": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Printed Cotton Kurti",
                "description": "Vibrant printed cotton kurti for everyday wear. Comfortable and stylish.",
                "category": "kurti",
                "price": 899.0,
                "sale_price": 749.0,
                "stock": 40,
                "images": ["https://images.unsplash.com/photo-1583391733975-830022e63bbb?w=600"],
                "sizes": ["S", "M", "L", "XL"],
                "colors": ["#ff6b6b", "#4ecdc4", "#ffe66d"],
                "fabric": "Cotton",
                "brand": "Fatima Collection",
                "tags": ["casual", "printed", "daily wear"],
                "is_featured": False,
                "is_trending": False,
                "views": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        
        await db.products.insert_many(sample_products)
        print(f"✓ Created {len(sample_products)} sample products")
    
    print("\n✅ Database seeded successfully!")
    print("\nLogin credentials:")
    print("Admin - Email: admin@fatima.com, Password: admin123")
    print("Customer - Email: customer@test.com, Password: customer123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
