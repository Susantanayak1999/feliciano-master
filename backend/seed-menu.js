// ============================================================
// One-time script: populate MenuItem collection with items
// Run:  node seed-menu.js
// ============================================================
require("dotenv").config();
const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    image: String,
    category: String,
    type: { type: String, default: "veg" },
    ingredients: [String],
    available: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});
const MenuItem = mongoose.model("MenuItem", menuItemSchema);

const items = [
    // ================= BREAKFAST =================
    { name: "Masala Dosa", price: 149, category: "Breakfast", type: "veg", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80", ingredients: ["Rice", "Lentils", "Potato", "Spices"], description: "Crispy rice crepe stuffed with spiced potato mash." },
    { name: "Avocado Toast", price: 199, category: "Breakfast", type: "veg", image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&q=80", ingredients: ["Sourdough", "Avocado", "Poached Egg", "Chili Flakes"], description: "Smashed avocado on toasted sourdough with a poached egg." },
    { name: "Classic Pancakes", price: 249, category: "Breakfast", type: "veg", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80", ingredients: ["Flour", "Milk", "Eggs", "Maple Syrup"], description: "Fluffy pancakes served with butter and authentic maple syrup." },
    { name: "English Breakfast", price: 349, category: "Breakfast", type: "non-veg", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80", ingredients: ["Eggs", "Bacon", "Sausage", "Beans", "Toast"], description: "A hearty plate of eggs, bacon, sausage, and baked beans." },
    { name: "Aloo Paratha", price: 119, category: "Breakfast", type: "veg", image: "https://images.unsplash.com/photo-1626202496101-3e2759c80727?w=800&q=80", ingredients: ["Wheat", "Potato", "Butter", "Curd"], description: "Whole wheat flatbread stuffed with spiced potatoes, served with curd." },

    // ================= LUNCH =================
    { name: "Butter Chicken", price: 349, category: "Lunch", type: "non-veg", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80", ingredients: ["Chicken", "Tomato", "Cream", "Butter"], description: "Tender chicken simmered in a rich, creamy tomato-butter sauce." },
    { name: "Margherita Pizza", price: 299, category: "Lunch", type: "veg", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80", ingredients: ["Pizza Dough", "Tomato Sauce", "Mozzarella", "Basil"], description: "Classic Italian pizza with fresh mozzarella and basil." },
    { name: "Chicken Burger", price: 249, category: "Lunch", type: "non-veg", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80", ingredients: ["Chicken Patty", "Bun", "Lettuce", "Cheese", "Mayo"], description: "Crispy chicken patty with lettuce, cheese, and special sauce." },
    { name: "Hyderabadi Biryani", price: 399, category: "Lunch", type: "non-veg", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80", ingredients: ["Basmati Rice", "Chicken", "Saffron", "Yogurt"], description: "Fragrant basmati rice layered with marinated chicken and saffron." },
    { name: "Veg Sushi Rolls", price: 349, category: "Lunch", type: "veg", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80", ingredients: ["Nori", "Rice", "Cucumber", "Avocado", "Carrot"], description: "Fresh vegetarian sushi rolls with avocado and cucumber." },

    // ================= DINNER =================
    { name: "Paneer Tikka Masala", price: 299, category: "Dinner", type: "veg", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80", ingredients: ["Paneer", "Tomato", "Cashew", "Spices"], description: "Grilled paneer cubes in a spiced onion-tomato gravy." },
    { name: "Spaghetti Carbonara", price: 329, category: "Dinner", type: "non-veg", image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80", ingredients: ["Spaghetti", "Pancetta", "Egg Yolk", "Parmesan"], description: "Authentic Roman pasta with crispy pancetta and egg sauce." },
    { name: "Beef Steak", price: 599, category: "Dinner", type: "non-veg", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80", ingredients: ["Beef Tenderloin", "Butter", "Garlic", "Rosemary"], description: "Juicy grilled steak served with garlic butter and herbs." },
    { name: "Palak Paneer", price: 269, category: "Dinner", type: "veg", image: "https://images.unsplash.com/photo-1618449840665-9ed506d73a34?w=800&q=80", ingredients: ["Spinach", "Paneer", "Garlic", "Cream"], description: "Fresh spinach puree cooked with paneer cubes and mild spices." },
    { name: "Chicken Tacos", price: 279, category: "Dinner", type: "non-veg", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80", ingredients: ["Tortilla", "Chicken", "Salsa", "Guacamole", "Cheese"], description: "Soft tortillas filled with spiced chicken and fresh toppings." },

    // ================= DRINKS =================
    { name: "Masala Chai", price: 49, category: "Drinks", type: "veg", image: "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800&q=80", ingredients: ["Tea", "Milk", "Ginger", "Cardamom"], description: "Traditional Indian spiced tea brewed with milk and aromatic spices." },
    { name: "Iced Caramel Macchiato", price: 189, category: "Drinks", type: "veg", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80", ingredients: ["Espresso", "Milk", "Caramel Syrup", "Ice"], description: "Chilled espresso with milk, vanilla, and a caramel drizzle." },
    { name: "Mango Lassi", price: 129, category: "Drinks", type: "veg", image: "https://images.unsplash.com/photo-1572490122747-3968b75ab3a8?w=800&q=80", ingredients: ["Yogurt", "Mango", "Sugar", "Cardamom"], description: "Sweet and creamy yogurt drink blended with fresh mango pulp." },
    { name: "Virgin Mojito", price: 149, category: "Drinks", type: "veg", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80", ingredients: ["Lime", "Mint", "Soda", "Sugar Syrup"], description: "Refreshing blend of lime, mint, and soda over crushed ice." },

    // ================= DESSERTS =================
    { name: "Gulab Jamun", price: 129, category: "Desserts", type: "veg", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80", ingredients: ["Khoya", "Sugar Syrup", "Cardamom", "Rose Water"], description: "Deep-fried milk dumplings soaked in sweet rose-flavored syrup." },
    { name: "New York Cheesecake", price: 249, category: "Desserts", type: "veg", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=80", ingredients: ["Cream Cheese", "Graham Cracker", "Eggs", "Sugar"], description: "Classic dense and creamy baked cheesecake." },
    { name: "Chocolate Lava Cake", price: 199, category: "Desserts", type: "veg", image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80", ingredients: ["Chocolate", "Flour", "Egg", "Butter"], description: "Rich chocolate cake with a gooey, molten center." },
    { name: "Tiramisu", price: 229, category: "Desserts", type: "veg", image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80", ingredients: ["Ladyfingers", "Mascarpone", "Coffee", "Cocoa"], description: "Italian coffee-flavored dessert with layers of mascarpone." },
    { name: "Apple Pie", price: 179, category: "Desserts", type: "veg", image: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=800&q=80", ingredients: ["Apples", "Pie Crust", "Cinnamon", "Sugar"], description: "Warm spiced apple pie with a flaky golden crust." }
];

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        await MenuItem.deleteMany({});
        console.log("🗑️  Cleared existing menu items");

        await MenuItem.insertMany(items);
        console.log(`✅ Inserted ${items.length} new menu items with permanent images`);

        await mongoose.disconnect();
        console.log("👋 Done. Check your website!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seed error:", err.message);
        process.exit(1);
    }
})();