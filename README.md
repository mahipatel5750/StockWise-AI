# StockWise AI – Smart Inventory & Reorder Assistant

**StockWise AI** is an AI-powered retail inventory management dashboard designed to help small businesses and retail shop owners manage stock, analyze sales performance, identify low-stock products, and make smarter purchasing decisions.

The application combines inventory tracking, sales analytics, demand-based reorder calculations, and an AI inventory assistant in one dashboard.

🔗 **Live Demo:** https://stockwise-ai-alpha.vercel.app/web-version

---

## 🚀 Key Features

### 1. Dashboard Overview
- View total products and inventory performance.
- Monitor inventory value and stock health.
- Identify critical-stock and low-stock products.
- Track fast-moving and slow-moving products.
- View sales performance and inventory analytics.

### 2. Inventory Management
- Add new products to the inventory.
- Track product IDs, categories, prices, and suppliers.
- Manage current stock quantities.
- Configure supplier lead times and safety stock.
- Search and filter products.
- Export inventory records to CSV.

### 3. Sales Analytics
- Analyze historical sales transactions.
- Calculate total units sold and gross revenue.
- Monitor average daily sales and order value.
- Identify top-selling products.
- Analyze product demand velocity.
- View category-wise sales performance.

### 4. Smart Reorder Intelligence
- Calculate reorder points based on product demand.
- Identify products that require replenishment.
- Recommend suggested order quantities.
- Estimate purchasing costs.
- Generate consolidated supplier purchase orders.
- Export reorder recommendations as CSV.

**Core inventory calculations:**

- Average Daily Sales = Total Units Sold / Analysis Days
- Reorder Point = (Average Daily Sales × Supplier Lead Time) + Safety Stock
- Target Stock = (Average Daily Sales × Target Coverage Days) + Safety Stock
- Suggested Order Quantity = Max(0, Target Stock − Current Stock)

These calculations help businesses maintain sufficient stock while avoiding unnecessary overstocking.

### 5. AI Inventory Assistant
- Ask natural-language questions about inventory.
- Identify products with stockout risks.
- Get reorder recommendations.
- Identify fast-moving and slow-moving products.
- Generate inventory summaries.
- Use a deterministic local rule-based assistant.
- Optionally connect a secure server-side Google Gemini API proxy.

The local assistant can operate without an external AI API connection.

### 6. Reports & Data Management
- Export inventory records in CSV format.
- Export sales history in CSV format.
- Download Excel workbooks containing inventory, sales, and reorder recommendations.
- Import inventory through CSV files.
- Import historical sales transactions through CSV files.
- Download sample CSV templates.

### 7. Settings & Customization
- Switch between light and dark themes.
- Configure store name and currency symbol.
- Customize reorder calculation parameters.
- Configure an optional AI backend proxy.
- Reset factory sample data.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling and responsive interface |
| JavaScript (Vanilla JS) | Application logic and interactivity |
| Browser LocalStorage | Local data persistence |
| SheetJS | Excel workbook generation |
| CSV | Inventory and sales data import/export |
| Google Gemini API (Optional) | AI-powered assistance through a secure backend proxy |

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/mahipatel5750/stockwise-ai.git
```

### 2. Open the Project

```bash
cd stockwise-ai
```

If the application is inside the `web-version` folder, open that folder instead.

### 3. Run Locally

- Open the project in Visual Studio Code.
- Install the **Live Server** extension if you do not already have it.
- Open `index.html`.
- Right-click and select **Open with Live Server**.

The application will open in your browser.

---

## 🧠 How Smart Reordering Works

StockWise AI uses historical sales data, supplier lead time, safety stock, and target coverage days to calculate replenishment requirements.

**Example:**

Suppose a product has:

| Parameter | Value |
|---|---:|
| Current Stock | 8 units |
| Average Daily Sales | 3 units |
| Supplier Lead Time | 5 days |
| Safety Stock | 5 units |
| Target Coverage | 10 days |

Calculations:

- Reorder Point = (3 × 5) + 5 = **20 units**
- Target Stock = (3 × 10) + 5 = **35 units**
- Suggested Order = 35 − 8 = **27 units**

**Recommendation:** Reorder 27 units to reach the target stock level.

---

## 🔐 Data Storage & Security

- Inventory records, sales transactions, and preferences are stored in the browser's LocalStorage.
- Data persists across browser refreshes on the same browser and workstation.
- LocalStorage data is not automatically synchronized between different devices or browsers.
- The optional Gemini integration is designed to use a secure server-side proxy.
- API keys should never be embedded directly in frontend JavaScript code.

---

## 📸 Application Modules

The application includes the following modules:

1. Overview Dashboard
2. Inventory Management
3. Sales Analytics
4. Smart Reorders
5. AI Inventory Assistant
6. Reports & Data Center
7. System Settings

---

## 🎯 Project Objective

The objective of StockWise AI is to simplify inventory management for small and medium-sized retail businesses by turning sales and stock data into actionable purchasing recommendations.

It aims to reduce manual inventory tracking, identify potential stock shortages, improve purchasing decisions, and make inventory management more efficient.

---

## 🔮 Future Enhancements

- Cloud database integration for multi-device synchronization.
- User authentication and role-based access.
- Real-time inventory synchronization.
- Automated low-stock email and WhatsApp notifications.
- Supplier management and purchase order tracking.
- Advanced AI-powered demand forecasting.
- Multi-store inventory management.

---

## 👨‍💻 Author

**Mahi Patel**

Computer Science & Engineering Student

GitHub: https://github.com/mahipatel5750

---

## 📄 License

This project is developed for educational and portfolio purposes. A license can be added to define permissions for reuse and distribution.
