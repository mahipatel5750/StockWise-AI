# StockWise AI – Intelligent Retail Inventory & Reorder Assistant (Web Version)

A professional, high-performance, responsive retail inventory and procurement intelligence web application built with **HTML5, CSS3, and Vanilla JavaScript (ES6+)**.

StockWise AI features a dark navy retail dashboard, deterministic reorder calculations, sales demand analytics, an intelligent local AI assistant, and full LocalStorage persistence.

---

## 🚀 Quick Start Guide

### How to Run with VS Code Live Server (Recommended)
1. Open the project folder in **Visual Studio Code**.
2. If you don't already have it, install the **Live Server** extension (by *Ritwick Dey*) from the Extensions panel (`Ctrl+Shift+X`).
3. In the Explorer pane, navigate to `web-version/index.html`.
4. Right-click on `index.html` and choose **"Open with Live Server"** (or click **"Go Live"** on the bottom status bar).
5. The application will launch in your default browser at `http://127.0.0.1:5500/web-version/index.html`.

### Alternative: Direct File Opening
You can also directly double-click or drag-and-drop `web-version/index.html` into Chrome, Edge, Firefox, or Safari. All scripts, fonts, icons, and LocalStorage data function natively in standard browser environments.

---

## 📁 Project Structure

```
StockWise AI/
├── streamlit_app.py               # Preserved Python + Streamlit application
├── web-version/                   # Standalone Web Application
│   ├── index.html                 # Semantic single-page responsive layout
│   ├── css/
│   │   └── style.css              # Dark navy & light slate themes, responsive grid, UI components
│   ├── js/
│   │   ├── storage.js             # LocalStorage engine, sample datasets, CSV/Excel helpers
│   │   ├── reorder.js             # Deterministic inventory formulas & supplier grouping
│   │   ├── inventory.js           # Inventory CRUD, multi-criteria filtering & sorting
│   │   ├── sales.js               # Sales velocity analytics & Chart.js data adapters
│   │   ├── ai.js                  # Rule-based reasoning engine & Gemini proxy adapter
│   │   └── app.js                 # App coordinator, UI events, Chart.js instances, modals
│   ├── data/
│   │   ├── inventory.json         # 16 standard sample retail products
│   │   └── sales.json             # 409 realistic sales transactions across 30 days
│   └── README.md                  # Complete documentation and user guide
```

---

## 🧮 Smart Reorder Calculation Engine

StockWise AI uses strict deterministic mathematical formulas for replenishment decisions:

### Formula 1: Average Daily Sales Velocity
$$\text{Average Daily Sales} = \frac{\text{Total Units Sold}}{\text{Number of Analysis Days (default: 30)}}$$

### Formula 2: Reorder Point
$$\text{Reorder Point} = (\text{Average Daily Sales} \times \text{Supplier Lead Time}) + \text{Safety Stock}$$

### Formula 3: Target Stock
$$\text{Target Stock} = (\text{Average Daily Sales} \times \text{Target Coverage Days (default: 10)}) + \text{Safety Stock}$$

### Formula 4: Suggested Order Quantity
$$\text{Suggested Order Quantity} = \max(0, \lceil \text{Target Stock} - \text{Current Stock} \rceil)$$

### Stock Classification Rules
- **Critical (Stockout)**: $\text{Current Stock} \le 0$
- **Reorder Now**: $\text{Current Stock} > 0 \text{ and } \text{Current Stock} \le \text{Reorder Point}$
- **Healthy**: $\text{Current Stock} > \text{Reorder Point}$

---

## 🧪 Verification & Test Case (Section 11)

Verify the reorder engine against the test specification:

- **Product:** Sunscreen SPF 50 (`PRD-001`)
- **Current Stock:** `8` units
- **Average Daily Sales:** `3` units/day (90 units sold / 30 analysis days)
- **Supplier Lead Time:** `5` days
- **Safety Stock:** `5` units
- **Target Coverage:** `10` days

### Computed Results:
- **Reorder Point:** $(3 \times 5) + 5 = \mathbf{20}$
- **Target Stock:** $(3 \times 10) + 5 = \mathbf{35}$
- **Suggested Order Quantity:** $\max(0, 35 - 8) = \mathbf{27}$ units
- **Stock Classification:** $\mathbf{Reorder\ Now}$ ($0 < 8 \le 20$)

---

## 🌟 Key Application Features

### 1. Executive Dashboard
- **9 Dynamic KPI Cards:** Total Products, Inventory Value, Critical Stockouts, Reorder Now, Healthy Stock, Fast-Moving SKUs, Slow-Moving SKUs, Total Units Sold, and Total Historical Revenue.
- **3 Interactive Chart.js Visualizations:**
  - Sales Revenue Trend Line Chart with smooth area gradients.
  - Stock Health Status Doughnut Chart.
  - Category Inventory Capital Valuation Bar Chart.
- **High-Priority Stock Alerts List:** Quick 1-click reorder navigation for critical SKUs.
- **Top-Selling SKUs List:** Ranked by volume and historical revenue.

### 2. Inventory Management
- Full CRUD (Create, Read, Update, Delete) with interactive modal forms.
- Real-time client-side search across Product ID, Name, Category, and Supplier.
- Category filter and Stock Status filter.
- Multi-column sortable table headers.
- Input validation to ensure unique product IDs, positive prices, and non-negative stock.

### 3. Sales Analytics
- Overall volume, historical revenue, average daily velocity, and average order value.
- Visual breakdown of revenue by product category and SKU velocity.
- Product-level velocity ranking classifying items into **Fast-Moving**, **Normal**, and **Slow-Moving**.

### 4. Smart Reorders Engine
- Interactive **Target Coverage Horizon** slider (5 to 30 days) that dynamically recalculates all order suggestions in real time.
- Detailed purchase order calculation table with estimated costs per SKU.
- Supplier-wise purchase order batch summaries showing total units and financial investment required per supplier.
- One-click export to CSV for procurement.

### 5. Local AI Inventory Assistant & Future Gemini Proxy
- **Deterministic Local AI Engine:** Provides instantaneous, offline, rule-based answers analyzing live store calculations:
  - Daily Executive Briefings.
  - Stockout Risk & Depletion Velocity Assessment.
  - Reorder Priority Ranking.
  - Fast-Moving vs Slow-Moving SKU Insights.
  - Product-specific deep dives.
- **Future Backend Gemini Integration:**
  - **Security Best Practice:** In strict adherence to security guidelines, Gemini API keys are **never** embedded inside frontend JavaScript, HTML, or public assets.
  - A clean integration adapter (`AIAssistant.queryGeminiBackend`) is included. Users can configure their secure backend proxy URL under **Settings**.
  - The local rule-based assistant functions continuously and seamlessly whether a backend is connected or not.

### 6. Data Import & Export Center
- **Excel (.xlsx) Export:** Uses **SheetJS** to compile a multi-sheet workbook containing Inventory, Sales Transactions, and Reorder Calculations.
- **CSV Export:** Individual exports for Inventory, Sales History, and Reorder Recommendations.
- **CSV Import:** Safe import parsing for both Inventory and Sales with verification dialogs and format validation.
- **Sample Templates:** One-click download of sample CSV templates.

### 7. Settings & Persistence
- Persistent LocalStorage for all inventory items, sales records, theme choices, and horizon days.
- Light and Dark Navy theme switcher with smooth transition effects.
- Factory sample data reset with confirmation modal.
- Educational notice explaining browser LocalStorage scope.

---

## 🔒 Backend Integration Status Report

| Feature | Current Implementation Status | Future Backend Requirements |
| :--- | :--- | :--- |
| **Inventory Calculations** | **Fully Functional Locally** | Optional central SQL database for multi-user sync. |
| **Sales Analytics** | **Fully Functional Locally** | Optional ERP/POS automated webhook sync. |
| **Reorder Engine** | **Fully Functional Locally** | Optional automated EDI / Email PO dispatch to suppliers. |
| **Local AI Copilot** | **Fully Functional Locally** | None. Local deterministic engine runs client-side. |
| **Cloud Gemini AI** | **Architectural Proxy Ready** | Requires a secure backend server (e.g. Node.js/Python FastAPI) holding `GEMINI_API_KEY` in environment variables. |

---

## 💻 Tech Stack
- **HTML5** (Semantic layout, accessible controls)
- **CSS3** (CSS Custom Properties, Grid, Flexbox, responsive media queries)
- **Vanilla JavaScript ES6+** (Modular architecture, no heavy frameworks)
- **Chart.js v4.4** (Canvas charts)
- **SheetJS / xlsx v0.18.5** (Excel spreadsheet generation)
- **Lucide Icons** (Vector UI iconography)
