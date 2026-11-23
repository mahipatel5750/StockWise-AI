import os
import sys
import json

# Auto-launch wrapper: allows running via either 'streamlit run streamlit_app.py' OR directly with 'python streamlit_app.py' / VS Code Play Button
if __name__ == "__main__" and not os.environ.get("STREAMLIT_RUNNING"):
    # Check if run directly via python
    import streamlit.web.bootstrap as bootstrap
    from streamlit import config as _config
    
    # If not running inside Streamlit runner, re-launch via streamlit
    if "streamlit" not in sys.argv[0]:
        os.environ["STREAMLIT_RUNNING"] = "1"
        from streamlit.web import cli as stcli
        sys.argv = ["streamlit", "run", os.path.abspath(__file__)]
        sys.exit(stcli.main())

import streamlit as st
import pandas as pd

st.set_page_config(
    page_title="StockWise AI – Intelligent Retail Inventory & Reorder Assistant",
    page_icon="📦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling to match dark navy theme
st.markdown("""
<style>
    .main { background-color: #0b1120; }
    div[data-testid="stMetricValue"] { font-size: 1.8rem; font-weight: 700; color: #38bdf8; }
    .badge-critical { background-color: #ef4444; color: white; padding: 3px 8px; border-radius: 12px; font-weight: bold; }
    .badge-warning { background-color: #f59e0b; color: white; padding: 3px 8px; border-radius: 12px; font-weight: bold; }
    .badge-healthy { background-color: #10b981; color: white; padding: 3px 8px; border-radius: 12px; font-weight: bold; }
</style>
""", unsafe_allow_html=True)

# Load data safely
@st.cache_data
def load_data():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    inv_path = os.path.join(base_dir, "web-version", "data", "inventory.json")
    sales_path = os.path.join(base_dir, "web-version", "data", "sales.json")
    
    with open(inv_path, "r", encoding="utf-8") as f:
        inv = json.load(f)
    with open(sales_path, "r", encoding="utf-8") as f:
        sales = json.load(f)
        
    return pd.DataFrame(inv), pd.DataFrame(sales)

inv_df, sales_df = load_data()

st.sidebar.title("📦 StockWise AI")
st.sidebar.caption("Retail Inventory & Procurement Assistant")

menu = st.sidebar.radio(
    "Navigation",
    ["Dashboard", "Inventory Management", "Sales Analytics", "Smart Reorders", "AI Assistant", "Data & Settings"]
)

# Analysis settings
st.sidebar.subheader("⚙️ Reorder Parameters")
analysis_days = st.sidebar.slider("Analysis Period (Days)", min_value=7, max_value=60, value=30)
target_coverage = st.sidebar.slider("Target Coverage (Days)", min_value=5, max_value=30, value=10)

# Calculate Daily Sales and Reorder metrics
product_sales = sales_df.groupby("productId")["unitsSold"].sum().to_dict()
inv_calc = inv_df.copy()

inv_calc["totalUnitsSold"] = inv_calc["id"].map(lambda x: product_sales.get(x, 0))
inv_calc["avgDailySales"] = (inv_calc["totalUnitsSold"] / analysis_days).round(2)
inv_calc["reorderPoint"] = ((inv_calc["avgDailySales"] * inv_calc["leadTime"]) + inv_calc["safetyStock"]).round(2)
inv_calc["targetStock"] = ((inv_calc["avgDailySales"] * target_coverage) + inv_calc["safetyStock"]).round(2)
inv_calc["suggestedOrder"] = (inv_calc["targetStock"] - inv_calc["currentStock"]).clip(lower=0).round(0).astype(int)
inv_calc["estimatedCost"] = (inv_calc["suggestedOrder"] * inv_calc["unitPrice"]).round(2)

def classify_stock(row):
    if row["currentStock"] <= 0:
        return "Critical"
    elif row["currentStock"] <= row["reorderPoint"]:
        return "Reorder Now"
    else:
        return "Healthy"

inv_calc["status"] = inv_calc.apply(classify_stock, axis=1)

# Categorize velocity
fast_moving_skus = inv_calc[inv_calc["avgDailySales"] >= 2.5]
slow_moving_skus = inv_calc[inv_calc["avgDailySales"] <= 1.2]

if menu == "Dashboard":
    st.title("📊 Executive Inventory Dashboard")
    st.caption("Real-time operational KPIs and stock health diagnostics")
    
    # 9 KPIs in 3 rows
    r1_col1, r1_col2, r1_col3 = st.columns(3)
    r1_col1.metric("1. Total Products", f"{len(inv_calc)} SKUs")
    r1_col2.metric("2. Inventory Value", f"${(inv_calc['currentStock'] * inv_calc['unitPrice']).sum():,.2f}")
    r1_col3.metric("3. Critical Stockouts", len(inv_calc[inv_calc['status'] == 'Critical']))

    r2_col1, r2_col2, r2_col3 = st.columns(3)
    r2_col1.metric("4. Reorder Now", len(inv_calc[inv_calc['status'] == 'Reorder Now']))
    r2_col2.metric("5. Healthy Stock", len(inv_calc[inv_calc['status'] == 'Healthy']))
    r2_col3.metric("6. Fast-Moving SKUs", len(fast_moving_skus))

    r3_col1, r3_col2, r3_col3 = st.columns(3)
    r3_col1.metric("7. Slow-Moving SKUs", len(slow_moving_skus))
    r3_col2.metric("8. Units Sold (30d)", f"{int(sales_df['unitsSold'].sum()):,}")
    r3_col3.metric("9. Total Revenue", f"${sales_df['totalRevenue'].sum():,.2f}")
    
    st.divider()

    chart_col1, chart_col2 = st.columns(2)
    with chart_col1:
        st.subheader("📈 Daily Sales Revenue Trend")
        daily_rev = sales_df.groupby("date")["totalRevenue"].sum()
        st.line_chart(daily_rev)
    with chart_col2:
        st.subheader("📦 Inventory by Category")
        cat_val = (inv_calc["currentStock"] * inv_calc["unitPrice"]).groupby(inv_calc["category"]).sum()
        st.bar_chart(cat_val)

    st.subheader("⚠️ High-Priority Stock Alerts")
    alerts = inv_calc[inv_calc['status'].isin(['Critical', 'Reorder Now'])][['id', 'name', 'category', 'currentStock', 'reorderPoint', 'suggestedOrder', 'status']]
    st.dataframe(alerts, width='stretch')

elif menu == "Inventory Management":
    st.title("📋 Inventory Management")
    st.caption("Active catalog products, lead times, safety buffers, and prices")
    
    # Category filter
    categories = ["All"] + sorted(list(inv_calc["category"].unique()))
    sel_cat = st.selectbox("Filter by Category", categories)
    
    filtered_df = inv_calc if sel_cat == "All" else inv_calc[inv_calc["category"] == sel_cat]
    st.dataframe(
        filtered_df[['id', 'name', 'category', 'currentStock', 'unitPrice', 'supplier', 'leadTime', 'safetyStock', 'status']],
        width='stretch'
    )

elif menu == "Sales Analytics":
    st.title("📈 Sales Velocity & Demand Analytics")
    
    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Sales Revenue by Category")
        st.bar_chart(sales_df.groupby("category")["totalRevenue"].sum())
    with col2:
        st.subheader("Units Sold by Category")
        st.bar_chart(sales_df.groupby("category")["unitsSold"].sum())

    st.subheader("Product Performance Table")
    prod_summary = sales_df.groupby(["productId", "productName", "category"]).agg({
        "unitsSold": "sum",
        "totalRevenue": "sum"
    }).reset_index().sort_values(by="unitsSold", ascending=False)
    st.dataframe(prod_summary, width='stretch')

elif menu == "Smart Reorders":
    st.title("🎯 Smart Reorder Engine")
    st.caption(f"Calculations for {target_coverage} days target coverage and {analysis_days} days analysis period")
    
    reorder_needed = inv_calc[inv_calc["suggestedOrder"] > 0]
    total_units_needed = reorder_needed["suggestedOrder"].sum()
    total_cost_needed = reorder_needed["estimatedCost"].sum()
    
    m1, m2, m3 = st.columns(3)
    m1.metric("SKUs to Order", len(reorder_needed))
    m2.metric("Total Order Units", f"{total_units_needed:,}")
    m3.metric("Estimated Cost", f"${total_cost_needed:,.2f}")
    
    st.dataframe(
        inv_calc[['id', 'name', 'supplier', 'currentStock', 'avgDailySales', 'leadTime', 'safetyStock', 'reorderPoint', 'targetStock', 'suggestedOrder', 'estimatedCost', 'status']],
        width='stretch'
    )
    
    st.subheader("Consolidated Supplier Purchase Orders")
    supplier_orders = reorder_needed.groupby("supplier").agg({
        "id": "count",
        "suggestedOrder": "sum",
        "estimatedCost": "sum"
    }).rename(columns={"id": "Items to Order", "suggestedOrder": "Total Units", "estimatedCost": "Total Cost ($)"})
    st.dataframe(supplier_orders, width='stretch')

elif menu == "AI Assistant":
    st.title("🤖 AI Inventory Assistant")
    st.info("StockWise AI rule-based assistant is active. Real-time deterministic reasoning running locally.")
    
    prompt = st.selectbox("Select Quick Analysis Prompt", [
        "Executive Daily Inventory Briefing",
        "Stockout Risk Assessment",
        "Reorder Priority Ranking",
        "Fast-Moving vs Slow-Moving Insights"
    ])
    
    if prompt == "Executive Daily Inventory Briefing":
        st.markdown(f"""
        ### 📋 Executive Daily Inventory Briefing
        - **Active SKUs:** {len(inv_calc)}
        - **Total On-Hand Inventory Value:** ${(inv_calc['currentStock'] * inv_calc['unitPrice']).sum():,.2f}
        - **Critical Stockouts:** {len(inv_calc[inv_calc['status'] == 'Critical'])} SKUs
        - **Reorder Threshold Breached:** {len(inv_calc[inv_calc['status'] == 'Reorder Now'])} SKUs
        - **Suggested PO Investment:** ${(inv_calc['suggestedOrder'] * inv_calc['unitPrice']).sum():,.2f} for {inv_calc['suggestedOrder'].sum()} units
        """)
    elif prompt == "Stockout Risk Assessment":
        st.markdown("### ⚠️ Stockout Risk & Depletion Velocity")
        critical = inv_calc[inv_calc['status'] == 'Critical']
        for _, p in critical.iterrows():
            st.error(f"**{p['name']} ({p['id']})**: Stock is 0! Supplier: {p['supplier']} (Lead time: {p['leadTime']} days). Suggested order: {p['suggestedOrder']} units.")
    elif prompt == "Reorder Priority Ranking":
        st.markdown("### 🎯 Reorder Priority Ranking")
        st.dataframe(inv_calc[inv_calc['suggestedOrder'] > 0].sort_values(by="suggestedOrder", ascending=False)[['id', 'name', 'supplier', 'currentStock', 'suggestedOrder', 'estimatedCost', 'status']], width='stretch')
    elif prompt == "Fast-Moving vs Slow-Moving Insights":
        st.markdown("### ⚡ Fast-Moving vs Slow-Moving SKUs")
        c1, c2 = st.columns(2)
        with c1:
            st.success("**🚀 Fast-Moving SKUs (High Velocity)**")
            st.dataframe(fast_moving_skus[['name', 'avgDailySales', 'currentStock']], width='stretch')
        with c2:
            st.warning("**🐢 Slow-Moving SKUs (Capital Tied Up)**")
            st.dataframe(slow_moving_skus[['name', 'avgDailySales', 'currentStock']], width='stretch')

elif menu == "Data & Settings":
    st.title("💾 Data & Persistence")
    st.write("Both the Python Streamlit app and the standalone Vanilla Web Version read from synchronized JSON datasets inside `web-version/data/`.")
    st.success("Web version is ready at `web-version/index.html` or launchable via `python server.py` / `start_web_app.bat`.")
