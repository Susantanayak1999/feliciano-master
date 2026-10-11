// ============================================================
// One-time script: populate MenuItem collection with existing items
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
    // BREAKFAST
    { name: "Masala Dosa",             price: 149, category: "Breakfast", type: "veg",     image: "images/breakfast-1.jpg", ingredients: ["Rice", "Lentils", "Potato", "Spices"] },
    { name: "Idli Sambar",             price: 99,  category: "Breakfast", type: "veg",     image: "images/breakfast-2.jpg", ingredients: ["Rice", "Lentils", "Sambar", "Coconut"] },
    { name: "Poha Jhatpat",            price: 79,  category: "Breakfast", type: "veg",     image: "images/breakfast-3.jpg", ingredients: ["Flattened Rice", "Peanuts", "Curry Leaves", "Lemon"] },
    { name: "Aloo Paratha",            price: 119, category: "Breakfast", type: "veg",     image: "images/breakfast-4.jpg", ingredients: ["Wheat", "Potato", "Butter", "Curd"] },
    { name: "Uttapam",                 price: 129, category: "Breakfast", type: "veg",     image: "images/breakfast-5.jpg", ingredients: ["Rice", "Lentils", "Onion", "Tomato"] },
    { name: "Vada Pav",                price: 69,  category: "Breakfast", type: "veg",     image: "images/breakfast-6.jpg", ingredients: ["Potato", "Bread", "Chutney", "Fried Chili"] },
    { name: "Upma",                    price: 89,  category: "Breakfast", type: "veg",     image: "images/breakfast-7.jpg", ingredients: ["Semolina", "Vegetables", "Mustard", "Ghee"] },
    { name: "Medu Vada",               price: 109, category: "Breakfast", type: "veg",     image: "images/breakfast-8.jpg", ingredients: ["Lentils", "Curry Leaves", "Ginger", "Coconut"] },

    // LUNCH
    { name: "Butter Chicken",          price: 349, category: "Lunch",     type: "non-veg", image: "images/lunch-1.jpg",     ingredients: ["Chicken", "Tomato", "Cream", "Butter"] },
    { name: "Paneer Tikka Masala",     price: 299, category: "Lunch",     type: "veg",     image: "images/lunch-2.jpg",     ingredients: ["Paneer", "Tomato", "Cashew", "Spices"] },
    { name: "Chole Bhature",           price: 199, category: "Lunch",     type: "veg",     image: "images/lunch-3.jpg",     ingredients: ["Chickpeas", "Flour", "Onion", "Spices"] },
    { name: "Dal Makhani",             price: 249, category: "Lunch",     type: "veg",     image: "images/lunch-4.jpg",     ingredients: ["Black Lentils", "Kidney Beans", "Cream", "Butter"] },
    { name: "Hyderabadi Biryani",      price: 399, category: "Lunch",     type: "non-veg", image: "images/lunch-5.jpg",     ingredients: ["Basmati Rice", "Chicken", "Saffron", "Yogurt"] },
    { name: "Rajma Chawal",            price: 179, category: "Lunch",     type: "veg",     image: "images/lunch-6.jpg",     ingredients: ["Kidney Beans", "Rice", "Onion", "Tomato"] },
    { name: "Kadai Paneer",            price: 279, category: "Lunch",     type: "veg",     image: "images/lunch-7.jpg",     ingredients: ["Paneer", "Capsicum", "Onion", "Tomato"] },
    { name: "Veg Thali",               price: 299, category: "Lunch",     type: "veg",     image: "images/lunch-8.jpg",     ingredients: ["Roti", "Rice", "Dal", "Sabzi", "Sweet"] },

    // DINNER
    { name: "Rogan Josh",              price: 379, category: "Dinner",    type: "non-veg", image: "images/dinner-1.jpg",    ingredients: ["Mutton", "Yogurt", "Kashmiri Chili", "Spices"] },
    { name: "Chicken Tikka",           price: 329, category: "Dinner",    type: "non-veg", image: "images/dinner-2.jpg",    ingredients: ["Chicken", "Yogurt", "Tandoori Masala", "Lemon"] },
    { name: "Malai Kofta",             price: 289, category: "Dinner",    type: "veg",     image: "images/dinner-3.jpg",    ingredients: ["Paneer", "Potato", "Cream", "Cashew"] },
    { name: "Prawn Curry",             price: 449, category: "Dinner",    type: "non-veg", image: "images/dinner-4.jpg",    ingredients: ["Prawns", "Coconut", "Curry Leaves", "Spices"] },
    { name: "Mutton Biryani",          price: 499, category: "Dinner",    type: "non-veg", image: "images/dinner-5.jpg",    ingredients: ["Basmati Rice", "Mutton", "Saffron", "Spices"] },
    { name: "Palak Paneer",            price: 269, category: "Dinner",    type: "veg",     image: "images/dinner-6.jpg",    ingredients: ["Spinach", "Paneer", "Garlic", "Cream"] },

    // DRINKS
    { name: "Masala Chai",             price: 49,  category: "Drinks",    type: "veg",     image: "images/drink-1.jpg",     ingredients: ["Tea", "Milk", "Ginger", "Cardamom"] },
    { name: "Mango Lassi",             price: 129, category: "Drinks",    type: "veg",     image: "images/drink-2.jpg",     ingredients: ["Yogurt", "Mango", "Sugar", "Cardamom"] },
    { name: "Rose Sherbet",            price: 99,  category: "Drinks",    type: "veg",     image: "images/drink-3.jpg",     ingredients: ["Rose Syrup", "Milk", "Ice", "Nuts"] },
    { name: "Jal Jeera",               price: 69,  category: "Drinks",    type: "veg",     image: "images/drink-4.jpg",     ingredients: ["Cumin", "Mint", "Lemon", "Black Salt"] },
    { name: "Filter Coffee",           price: 59,  category: "Drinks",    type: "veg",     image: "images/drink-5.jpg",     ingredients: ["Chicory", "Milk", "Sugar", "Filter Brew"] },
    { name: "Sugarcane Juice",         price: 79,  category: "Drinks",    type: "veg",     image: "images/drink-6.jpg",     ingredients: ["Sugarcane", "Lemon", "Ginger", "Ice"] },

    // DESSERTS
    { name: "Gulab Jamun",             price: 129, category: "Desserts",  type: "veg",     image: "images/dessert-1.jpg",   ingredients: ["Khoya", "Sugar Syrup", "Cardamom", "Rose Water"] },
    { name: "Rasmalai",                price: 149, category: "Desserts",  type: "veg",     image: "images/dessert-2.jpg",   ingredients: ["Paneer", "Milk", "Saffron", "Pistachio"] },
    { name: "Gajar Ka Halwa",          price: 139, category: "Desserts",  type: "veg",     image: "images/dessert-3.jpg",   ingredients: ["Carrot", "Ghee", "Milk", "Nuts"] },
    { name: "Kaju Katli",              price: 199, category: "Desserts",  type: "veg",     image: "images/dessert-4.jpg",   ingredients: ["Cashew", "Sugar", "Ghee", "Silver Leaf"] },
    { name: "Jalebi",                  price: 99,  category: "Desserts",  type: "veg",     image: "images/dessert-5.jpg",   ingredients: ["Flour", "Sugar Syrup", "Saffron", "Ghee"] },
    { name: "Kheer",                   price: 119, category: "Desserts",  type: "veg",     image: "images/drink-6.jpg",     ingredients: ["Rice", "Milk", "Cardamom", "Almonds"] },

    // WINE
    { name: "Sula Red Wine",           price: 599, category: "Wine",      type: "veg",     image: "images/wine-1.jpg",      ingredients: ["Nashik Grapes", "Oak Aged", "Full Bodied", "Dry"] },
    { name: "Grover Zampa",            price: 749, category: "Wine",      type: "veg",     image: "images/wine-2.jpg",      ingredients: ["Chenin Blanc", "Fruity", "Crisp", "White"] },
    { name: "Fratelli Shiraz",         price: 899, category: "Wine",      type: "veg",     image: "images/wine-3.jpg",      ingredients: ["Shiraz", "Spicy", "Dark Berry", "Bold"] },
    { name: "Chandon Brut",            price: 999, category: "Wine",      type: "veg",     image: "images/wine-4.jpg",      ingredients: ["Sparkling", "Chardonnay", "Fresh", "Elegant"] },
    { name: "Zinfandel Rosé",          price: 649, category: "Wine",      type: "veg",     image: "images/wine-5.jpg",      ingredients: ["Zinfandel", "Sweet", "Berries", "Rosé"] },
    { name: "Port Wine",               price: 799, category: "Wine",      type: "veg",     image: "images/wine-6.jpg",      ingredients: ["Fortified", "Rich", "Caramel", "Sweet"] },
    { name: "Cabernet Sauvignon",      price: 849, category: "Wine",      type: "veg",     image: "images/wine-7.jpg",      ingredients: ["Blackcurrant", "Oak", "Tannic", "Bold"] },
    { name: "Sauvignon Blanc",         price: 699, category: "Wine",      type: "veg",     image: "images/wine-8.jpg",      ingredients: ["Citrus", "Grassy", "Crisp", "Refreshing"] },
];

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected");

        await MenuItem.deleteMany({});
        console.log("🗑️  Cleared existing menu items");

        await MenuItem.insertMany(items);
        console.log(`✅ Inserted ${items.length} menu items`);

        await mongoose.disconnect();
        console.log("👋 Done");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seed error:", err.message);
        process.exit(1);
    }
})();