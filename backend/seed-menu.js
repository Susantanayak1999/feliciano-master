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
    { name: "Masala Dosa", price: 149, category: "Breakfast", type: "veg", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop", ingredients: ["Rice", "Lentils", "Potato", "Spices"], description: "Crispy rice crepe stuffed with spiced potato mash." },
    { name: "Idli Sambar", price: 99, category: "Breakfast", type: "veg", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&auto=format&fit=crop", ingredients: ["Rice", "Lentils", "Sambar", "Coconut"], description: "Steamed rice cakes served with lentil soup and chutney." },
    { name: "Poha Jhatpat", price: 79, category: "Breakfast", type: "veg", image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=800&auto=format&fit=crop", ingredients: ["Flattened Rice", "Peanuts", "Curry Leaves", "Lemon"], description: "Light and fluffy flattened rice with peanuts and spices." },
    { name: "Aloo Paratha", price: 119, category: "Breakfast", type: "veg", image: "https://images.unsplash.com/photo-1626202496101-3e2759c80727?q=80&w=800&auto=format&fit=crop", ingredients: ["Wheat", "Potato", "Butter", "Curd"], description: "Whole wheat flatbread stuffed with spiced potatoes, served with curd." },
    { name: "Uttapam", price: 129, category: "Breakfast", type: "veg", image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=800&auto=format&fit=crop", ingredients: ["Rice", "Lentils", "Onion", "Tomato"], description: "Thick pancake topped with onions and tomatoes." },
    { name: "Vada Pav", price: 69, category: "Breakfast", type: "veg", image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=800&auto=format&fit=crop", ingredients: ["Potato", "Bread", "Chutney", "Fried Chili"], description: "Mumbai's favorite street food - spicy potato fritter in a bun." },
    { name: "Upma", price: 89, category: "Breakfast", type: "veg", image: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?q=80&w=800&auto=format&fit=crop", ingredients: ["Semolina", "Vegetables", "Mustard", "Ghee"], description: "Savory semolina porridge with vegetables and mustard seeds." },
    { name: "Medu Vada", price: 109, category: "Breakfast", type: "veg", image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=800&auto=format&fit=crop", ingredients: ["Lentils", "Curry Leaves", "Ginger", "Coconut"], description: "Crispy, savory lentil donuts served with sambar." },

    // ================= LUNCH =================
    { name: "Butter Chicken", price: 349, category: "Lunch", type: "non-veg", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800&auto=format&fit=crop", ingredients: ["Chicken", "Tomato", "Cream", "Butter"], description: "Tender chicken simmered in a rich, creamy tomato-butter sauce." },
    { name: "Paneer Tikka Masala", price: 299, category: "Lunch", type: "veg", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop", ingredients: ["Paneer", "Tomato", "Cashew", "Spices"], description: "Grilled paneer cubes in a spiced onion-tomato gravy." },
    { name: "Chole Bhature", price: 199, category: "Lunch", type: "veg", image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=800&auto=format&fit=crop", ingredients: ["Chickpeas", "Flour", "Onion", "Spices"], description: "Spicy chickpeas served with deep-fried puffed bread." },
    { name: "Dal Makhani", price: 249, category: "Lunch", type: "veg", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop", ingredients: ["Black Lentils", "Kidney Beans", "Cream", "Butter"], description: "Slow-cooked black lentils enriched with butter and cream." },
    { name: "Hyderabadi Biryani", price: 399, category: "Lunch", type: "non-veg", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop", ingredients: ["Basmati Rice", "Chicken", "Saffron", "Yogurt"], description: "Fragrant basmati rice layered with marinated chicken and saffron." },
    { name: "Rajma Chawal", price: 179, category: "Lunch", type: "veg", image: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?q=80&w=800&auto=format&fit=crop", ingredients: ["Kidney Beans", "Rice", "Onion", "Tomato"], description: "Comforting red kidney bean curry served with steamed rice." },
    { name: "Kadai Paneer", price: 279, category: "Lunch", type: "veg", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc0?q=80&w=800&auto=format&fit=crop", ingredients: ["Paneer", "Capsicum", "Onion", "Tomato"], description: "Paneer cooked with bell peppers in a spicy kadai masala." },
    { name: "Veg Thali", price: 299, category: "Lunch", type: "veg", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&auto=format&fit=crop", ingredients: ["Roti", "Rice", "Dal", "Sabzi", "Sweet"], description: "A complete platter with assorted vegetarian dishes." },

    // ================= DINNER =================
    { name: "Rogan Josh", price: 379, category: "Dinner", type: "non-veg", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800&auto=format&fit=crop", ingredients: ["Mutton", "Yogurt", "Kashmiri Chili", "Spices"], description: "Aromatic Kashmiri mutton curry with a rich red gravy." },
    { name: "Chicken Tikka", price: 329, category: "Dinner", type: "non-veg", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800&auto=format&fit=crop", ingredients: ["Chicken", "Yogurt", "Tandoori Masala", "Lemon"], description: "Boneless chicken marinated in yogurt and spices, grilled to perfection." },
    { name: "Malai Kofta", price: 289, category: "Dinner", type: "veg", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&auto=format&fit=crop", ingredients: ["Paneer", "Potato", "Cream", "Cashew"], description: "Soft paneer and potato dumplings in a creamy cashew gravy." },
    { name: "Prawn Curry", price: 449, category: "Dinner", type: "non-veg", image: "https://images.unsplash.com/photo-1625943553852-781c6dd46faa?q=80&w=800&auto=format&fit=crop", ingredients: ["Prawns", "Coconut", "Curry Leaves", "Spices"], description: "Juicy prawns cooked in a rich, coconut-based coastal curry." },
    { name: "Mutton Biryani", price: 499, category: "Dinner", type: "non-veg", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800&auto=format&fit=crop", ingredients: ["Basmati Rice", "Mutton", "Saffron", "Spices"], description: "Authentic dum-cooked biryani with tender mutton pieces." },
    { name: "Palak Paneer", price: 269, category: "Dinner", type: "veg", image: "https://images.unsplash.com/photo-1618449840665-9ed506d73a34?q=80&w=800&auto=format&fit=crop", ingredients: ["Spinach", "Paneer", "Garlic", "Cream"], description: "Fresh spinach puree cooked with paneer cubes and mild spices." },

    // ================= DRINKS =================
    { name: "Masala Chai", price: 49, category: "Drinks", type: "veg", image: "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?q=80&w=800&auto=format&fit=crop", ingredients: ["Tea", "Milk", "Ginger", "Cardamom"], description: "Traditional Indian spiced tea brewed with milk and aromatic spices." },
    { name: "Mango Lassi", price: 129, category: "Drinks", type: "veg", image: "https://images.unsplash.com/photo-1572490122747-3968b75ab3a8?q=80&w=800&auto=format&fit=crop", ingredients: ["Yogurt", "Mango", "Sugar", "Cardamom"], description: "Sweet and creamy yogurt drink blended with fresh mango pulp." },
    { name: "Rose Sherbet", price: 99, category: "Drinks", type: "veg", image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=800&auto=format&fit=crop", ingredients: ["Rose Syrup", "Milk", "Ice", "Nuts"], description: "Chilled milk drink flavored with rose syrup and topped with nuts." },
    { name: "Jal Jeera", price: 69, category: "Drinks", type: "veg", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop", ingredients: ["Cumin", "Mint", "Lemon", "Black Salt"], description: "Refreshing tangy drink made with cumin and mint." },
    { name: "Filter Coffee", price: 59, category: "Drinks", type: "veg", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop", ingredients: ["Chicory", "Milk", "Sugar", "Filter Brew"], description: "Strong South Indian filter coffee with frothy milk." },
    { name: "Fresh Lime Soda", price: 79, category: "Drinks", type: "veg", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop", ingredients: ["Lemon", "Soda", "Sugar/Salt", "Mint"], description: "Refreshing fizzy drink with fresh lime juice." },

    // ================= DESSERTS =================
    { name: "Gulab Jamun", price: 129, category: "Desserts", type: "veg", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop", ingredients: ["Khoya", "Sugar Syrup", "Cardamom", "Rose Water"], description: "Deep-fried milk dumplings soaked in sweet rose-flavored syrup." },
    { name: "Rasmalai", price: 149, category: "Desserts", type: "veg", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&auto=format&fit=crop", ingredients: ["Paneer", "Milk", "Saffron", "Pistachio"], description: "Soft paneer discs in creamy, saffron-infused milk." },
    { name: "Gajar Ka Halwa", price: 139, category: "Desserts", type: "veg", image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=800&auto=format&fit=crop", ingredients: ["Carrot", "Ghee", "Milk", "Nuts"], description: "Warm, sweet carrot pudding cooked with ghee and nuts." },
    { name: "Kaju Katli", price: 199, category: "Desserts", type: "veg", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop", ingredients: ["Cashew", "Sugar", "Ghee", "Silver Leaf"], description: "Premium cashew fudge, a classic Indian sweet." },
    { name: "Jalebi", price: 99, category: "Desserts", type: "veg", image: "https://images.unsplash.com/photo-1626202496101-3e2759c80727?q=80&w=800&auto=format&fit=crop", ingredients: ["Flour", "Sugar Syrup", "Saffron", "Ghee"], description: "Crispy, spiral-shaped sweet soaked in sugar syrup." },
    { name: "Chocolate Lava Cake", price: 199, category: "Desserts", type: "veg", image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=800&auto=format&fit=crop", ingredients: ["Chocolate", "Flour", "Egg", "Butter"], description: "Rich chocolate cake with a gooey, molten center." },

    // ================= WINE =================
    { name: "Sula Red Wine", price: 599, category: "Wine", type: "veg", image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800&auto=format&fit=crop", ingredients: ["Nashik Grapes", "Oak Aged", "Full Bodied", "Dry"], description: "A rich, full-bodied red wine from Nashik." },
    { name: "Grover Zampa", price: 749, category: "Wine", type: "veg", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop", ingredients: ["Chenin Blanc", "Fruity", "Crisp", "White"], description: "Crisp and fruity white wine with a refreshing finish." },
    { name: "Fratelli Shiraz", price: 899, category: "Wine", type: "veg", image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop", ingredients: ["Shiraz", "Spicy", "Dark Berry", "Bold"], description: "Bold and spicy red wine with dark berry notes." },
    { name: "Chandon Brut", price: 999, category: "Wine", type: "veg", image: "https://images.unsplash.com/photo-1592483648228-b35146a4330c?q=80&w=800&auto=format&fit=crop", ingredients: ["Sparkling", "Chardonnay", "Fresh", "Elegant"], description: "Elegant sparkling wine, perfect for celebrations." }
];

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected");

        await MenuItem.deleteMany({});
        console.log("🗑️  Cleared existing menu items");

        await MenuItem.insertMany(items);
        console.log(`✅ Inserted ${items.length} menu items with real images`);

        await mongoose.disconnect();
        console.log("👋 Done. Check your website!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seed error:", err.message);
        process.exit(1);
    }
})();