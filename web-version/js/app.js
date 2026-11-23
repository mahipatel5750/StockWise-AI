/**
 * StockWise AI - Main Application Coordinator (Premium Redesign)
 * Integrates all modules, handles DOM rendering, events, Chart.js instances, and routing.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  let state = {
    inventory: [],
    sales: [],
    settings: {},
    calculatedProducts: [],
    salesMetrics: {},
    salesAnalysis: {},
    supplierSummaries: [],
    activeSection: 'dashboard',
    charts: {}
  };

  // Cache DOM Elements
  const DOM = {
    // Navigation & Shell
    navLinks: document.querySelectorAll('.nav-link'),
    sections: document.querySelectorAll('.app-section'),
    sidebar: document.getElementById('app-sidebar'),
    sidebarToggle: document.getElementById('sidebar-toggle'),
    sidebarCollapseBtn: document.getElementById('sidebar-collapse-btn'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    mainWrapper: document.getElementById('main-wrapper'),
    collapseIcon: document.getElementById('collapse-icon'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    themeIcon: document.getElementById('theme-icon'),
    themeLabel: document.getElementById('theme-label'),
    sidebarReorderBadge: document.getElementById('sidebar-reorder-badge'),

    // Top Header Elements
    headerLiveDate: document.getElementById('header-live-date'),
    globalSearchInput: document.getElementById('global-search-input'),
    notificationsBtn: document.getElementById('header-notifications-btn'),

    // Dashboard KPIs
    kpiTotalProducts: document.getElementById('kpi-total-products'),
    kpiInventoryValue: document.getElementById('kpi-inventory-value'),
    kpiCriticalStock: document.getElementById('kpi-critical-stock'),
    kpiReorderStock: document.getElementById('kpi-reorder-stock'),
    kpiHealthyStock: document.getElementById('kpi-healthy-stock'),
    kpiFastMoving: document.getElementById('kpi-fast-moving'),
    kpiSlowMoving: document.getElementById('kpi-slow-moving'),
    kpiTotalUnitsSold: document.getElementById('kpi-total-units-sold'),
    kpiTotalRevenue: document.getElementById('kpi-total-revenue'),

    // Dashboard lists & alerts
    dashboardAlertsList: document.getElementById('dashboard-alerts-list'),
    topProductsList: document.getElementById('top-products-list'),

    // Inventory Controls
    inventoryTableBody: document.getElementById('inventory-table-body'),
    inventorySearchInput: document.getElementById('inventory-search'),
    categoryFilterSelect: document.getElementById('category-filter'),
    statusFilterSelect: document.getElementById('status-filter'),
    sortSelect: document.getElementById('sort-select'),
    btnOpenAddModal: document.getElementById('btn-open-add-modal'),

    // Reorder Controls
    reorderTableBody: document.getElementById('reorder-table-body'),
    supplierSummaryContainer: document.getElementById('supplier-summary-container'),
    targetCoverageInput: document.getElementById('target-coverage-input'),
    targetCoverageVal: document.getElementById('target-coverage-val'),
    reorderTotalUnits: document.getElementById('reorder-total-units'),
    reorderTotalCost: document.getElementById('reorder-total-cost'),
    reorderItemsCount: document.getElementById('reorder-items-count'),
    btnExportReorderCSV: document.getElementById('btn-export-reorder-csv'),

    // Sales Controls
    salesTotalUnits: document.getElementById('sales-total-units'),
    salesTotalRevenue: document.getElementById('sales-total-revenue'),
    salesAvgDaily: document.getElementById('sales-avg-daily'),
    salesAvgOrder: document.getElementById('sales-avg-order'),
    salesTableBody: document.getElementById('sales-table-body'),

    // AI Assistant Controls
    aiChatContainer: document.getElementById('ai-chat-messages'),
    aiChatInput: document.getElementById('ai-chat-input'),
    aiSendBtn: document.getElementById('ai-send-btn'),
    aiChips: document.querySelectorAll('.ai-chip'),
    btnClearAiChat: document.getElementById('btn-clear-ai-chat'),
    aiStatusBadge: document.getElementById('ai-status-badge'),

    // Import / Export Controls
    btnExportInvCSV: document.getElementById('btn-export-inv-csv'),
    btnExportSalesCSV: document.getElementById('btn-export-sales-csv'),
    btnExportExcel: document.getElementById('btn-export-excel'),
    btnImportInvCSV: document.getElementById('btn-import-inv-csv'),
    btnImportSalesCSV: document.getElementById('btn-import-sales-csv'),
    fileInputInv: document.getElementById('file-input-inv'),
    fileInputSales: document.getElementById('file-input-sales'),
    btnDownloadSampleInv: document.getElementById('btn-download-sample-inv'),
    btnDownloadSampleSales: document.getElementById('btn-download-sample-sales'),

    // Settings Controls
    settingTargetDays: document.getElementById('setting-target-days'),
    settingAnalysisDays: document.getElementById('setting-analysis-days'),
    settingThemeSelect: document.getElementById('setting-theme-select'),
    settingBackendUrl: document.getElementById('setting-backend-url'),
    settingStoreName: document.getElementById('setting-store-name'),
    btnSaveSettings: document.getElementById('btn-save-settings'),
    btnResetData: document.getElementById('btn-reset-data'),

    // Modals
    productModal: document.getElementById('product-modal'),
    productModalTitle: document.getElementById('product-modal-title'),
    productForm: document.getElementById('product-form'),
    btnCancelProductModal: document.getElementById('btn-cancel-product-modal'),
    confirmModal: document.getElementById('confirm-modal'),
    confirmModalTitle: document.getElementById('confirm-modal-title'),
    confirmModalMessage: document.getElementById('confirm-modal-message'),
    btnConfirmAction: document.getElementById('btn-confirm-action'),
    btnCancelConfirm: document.getElementById('btn-cancel-confirm'),

    // Toast Container
    toastContainer: document.getElementById('toast-container')
  };

  /**
   * Application Initializer
   */
  function initApp() {
    loadData();
    formatLiveDate();
    applyTheme(state.settings.theme || 'dark');
    setupEventListeners();
    refreshAllViews();
    renderInitialAIMessage();
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  /**
   * Format header live date
   */
  function formatLiveDate() {
    if (!DOM.headerLiveDate) return;
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    DOM.headerLiveDate.textContent = now.toLocaleDateString('en-US', options);
  }

  /**
   * Loads data from LocalStorage and computes initial reactive state
   */
  function loadData() {
    state.inventory = Storage.getInventory();
    state.sales = Storage.getSales();
    state.settings = Storage.getSettings();

    // Sync settings inputs
    if (DOM.targetCoverageInput) {
      DOM.targetCoverageInput.value = state.settings.targetCoverageDays;
      DOM.targetCoverageVal.textContent = `${state.settings.targetCoverageDays} days`;
    }
    if (DOM.settingTargetDays) DOM.settingTargetDays.value = state.settings.targetCoverageDays;
    if (DOM.settingAnalysisDays) DOM.settingAnalysisDays.value = state.settings.analysisDays;
    if (DOM.settingThemeSelect) DOM.settingThemeSelect.value = state.settings.theme;
    if (DOM.settingBackendUrl) DOM.settingBackendUrl.value = state.settings.geminiBackendUrl || '';

    recalculateMetrics();
  }

  /**
   * Recalculates metrics based on active inventory, sales, and settings
   */
  function recalculateMetrics() {
    state.calculatedProducts = ReorderEngine.calculateMetrics(
      state.inventory,
      state.sales,
      state.settings
    );

    state.supplierSummaries = ReorderEngine.getSupplierSummaries(state.calculatedProducts);

    state.salesMetrics = SalesAnalytics.getOverallMetrics(
      state.sales,
      state.settings.analysisDays
    );

    state.salesAnalysis = SalesAnalytics.getProductSalesAnalysis(
      state.sales,
      state.settings.analysisDays
    );

    // Update sidebar PO badge
    const itemsNeedingOrder = state.calculatedProducts.filter(p => p.suggestedOrder > 0).length;
    if (DOM.sidebarReorderBadge) {
      if (itemsNeedingOrder > 0) {
        DOM.sidebarReorderBadge.style.display = 'inline-block';
        DOM.sidebarReorderBadge.textContent = `${itemsNeedingOrder} PO`;
      } else {
        DOM.sidebarReorderBadge.style.display = 'none';
      }
    }
  }

  /**
   * Refreshes all UI views based on state
   */
  function refreshAllViews() {
    recalculateMetrics();
    renderDashboard();
    renderInventory();
    renderSalesAnalytics();
    renderReorders();
    populateCategoryFilter();
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  /**
   * 1. Dashboard View Renderer
   */
  function renderDashboard() {
    const products = state.calculatedProducts;

    // 1. Total Products
    DOM.kpiTotalProducts.textContent = products.length;

    // 2. Total Inventory Value
    const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);
    DOM.kpiInventoryValue.textContent = `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // 3. Critical Stock
    const criticalCount = products.filter(p => p.status === 'Critical').length;
    DOM.kpiCriticalStock.textContent = criticalCount;

    // 4. Low Stock (Reorder Now)
    const reorderCount = products.filter(p => p.status === 'Reorder Now').length;
    DOM.kpiReorderStock.textContent = reorderCount;

    // 5. Healthy Stock
    const healthyCount = products.filter(p => p.status === 'Healthy').length;
    DOM.kpiHealthyStock.textContent = healthyCount;

    // 6. Fast-Moving SKUs
    DOM.kpiFastMoving.textContent = state.salesAnalysis.fastMoving.length;

    // 7. Slow-Moving SKUs
    DOM.kpiSlowMoving.textContent = state.salesAnalysis.slowMoving.length;

    // 8. Total Units Sold
    DOM.kpiTotalUnitsSold.textContent = state.salesMetrics.totalUnits.toLocaleString();

    // 9. Total Historical Revenue
    DOM.kpiTotalRevenue.textContent = `$${state.salesMetrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Render Urgent Alerts List
    const urgentItems = products.filter(p => p.status === 'Critical' || p.status === 'Reorder Now')
      .sort((a, b) => b.priorityScore - a.priorityScore);

    if (urgentItems.length === 0) {
      DOM.dashboardAlertsList.innerHTML = `
        <div class="empty-state" style="padding: 2rem; text-align: center; color: var(--text-muted);">
          <i data-lucide="check-circle" class="text-success" style="width: 38px; height: 38px; display: block; margin: 0 auto 0.75rem auto;"></i>
          <strong>All items healthy!</strong>
          <p class="small">No products currently breach reorder safety thresholds.</p>
        </div>
      `;
    } else {
      DOM.dashboardAlertsList.innerHTML = urgentItems.slice(0, 6).map(p => `
        <div class="alert-item ${p.status === 'Critical' ? 'alert-critical' : 'alert-warning'}">
          <div class="alert-info">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="badge ${p.statusClass}">${p.status}</span>
              <strong>${p.name}</strong>
            </div>
            <div class="alert-meta">
              <span>Stock: <strong>${p.currentStock}</strong></span>
              <span>Daily Demand: <strong>${p.avgDailySales}/d</strong></span>
              <span>Lead: <strong>${p.leadTime}d</strong></span>
              <span>Est Cost: <strong>$${p.estimatedCost.toFixed(2)}</strong></span>
            </div>
          </div>
          <div class="alert-action">
            <span class="order-tag">+${p.suggestedOrder} units</span>
            <button class="btn btn-sm btn-outline btn-quick-reorder" data-id="${p.id}">Order</button>
          </div>
        </div>
      `).join('');
    }

    // Render Top Products List
    const topSellers = [...state.salesAnalysis.all].slice(0, 5);
    if (topSellers.length === 0) {
      DOM.topProductsList.innerHTML = `<p class="text-muted" style="padding: 1.5rem; text-align: center;">No sales transactions recorded yet.</p>`;
    } else {
      DOM.topProductsList.innerHTML = topSellers.map((p, idx) => `
        <div class="top-product-item">
          <span class="rank-badge">#${idx + 1}</span>
          <div class="top-product-info">
            <strong>${p.productName}</strong>
            <span>${p.category} &bull; ${p.dailyVelocity} units/day</span>
          </div>
          <div class="top-product-stats">
            <span class="stat-units">${p.totalUnitsSold} sold</span>
            <span class="stat-rev">$${p.totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      `).join('');
    }

    // Render Dashboard Charts
    renderDashboardCharts(criticalCount, reorderCount, healthyCount);
  }

  /**
   * Renders Chart.js interactive charts on the Dashboard
   */
  function renderDashboardCharts(critical, reorder, healthy) {
    const isDark = document.body.classList.contains('dark-theme');
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)';

    // 1. Stock Health Doughnut Chart
    const healthCanvas = document.getElementById('chart-stock-health');
    if (healthCanvas) {
      if (state.charts.stockHealth) state.charts.stockHealth.destroy();
      state.charts.stockHealth = new Chart(healthCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Critical (Stockout)', 'Reorder Now', 'Healthy Stock'],
          datasets: [{
            data: [critical, reorder, healthy],
            backgroundColor: ['#F43F5E', '#F59E0B', '#10B981'],
            borderColor: isDark ? '#1E293B' : '#FFFFFF',
            borderWidth: 3,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, font: { family: 'Inter', size: 12, weight: 600 }, padding: 16 }
            }
          },
          cutout: '72%'
        }
      });
    }

    // 2. Sales Trend Line Chart
    const trendCanvas = document.getElementById('chart-sales-trend');
    if (trendCanvas) {
      const trendData = SalesAnalytics.getSalesTrendData(state.sales);
      if (state.charts.salesTrend) state.charts.salesTrend.destroy();
      
      const ctx = trendCanvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 280);
      gradient.addColorStop(0, isDark ? 'rgba(37, 99, 235, 0.45)' : 'rgba(37, 99, 235, 0.25)');
      gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

      state.charts.salesTrend = new Chart(trendCanvas, {
        type: 'line',
        data: {
          labels: trendData.labels,
          datasets: [{
            label: 'Daily Revenue ($)',
            data: trendData.revenues,
            borderColor: '#2563EB',
            backgroundColor: gradient,
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#2563EB',
            pointRadius: 2,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => ` Revenue: $${context.parsed.y.toLocaleString()}`
              }
            }
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { family: 'Inter', size: 11 }, maxTicksLimit: 10 }
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                font: { family: 'Inter', size: 11 },
                callback: (val) => `$${val}`
              }
            }
          }
        }
      });
    }

    // 3. Category Inventory Distribution Bar Chart
    const categoryCanvas = document.getElementById('chart-category-inv');
    if (categoryCanvas) {
      const catMap = {};
      state.calculatedProducts.forEach(p => {
        catMap[p.category] = (catMap[p.category] || 0) + (p.currentStock * p.unitPrice);
      });
      const catLabels = Object.keys(catMap);
      const catValues = catLabels.map(c => Math.round(catMap[c]));

      if (state.charts.categoryInv) state.charts.categoryInv.destroy();
      state.charts.categoryInv = new Chart(categoryCanvas, {
        type: 'bar',
        data: {
          labels: catLabels,
          datasets: [{
            label: 'Inventory Value ($)',
            data: catValues,
            backgroundColor: [
              '#2563EB',
              '#10B981',
              '#8B5CF6',
              '#F59E0B',
              '#06B6D4',
              '#F43F5E'
            ],
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => ` Value: $${context.parsed.y.toLocaleString()}`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: textColor, font: { family: 'Inter', size: 11, weight: 600 } }
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                font: { family: 'Inter', size: 11 },
                callback: (val) => `$${val}`
              }
            }
          }
        }
      });
    }
  }

  /**
   * 2. Inventory Management View Renderer
   */
  function renderInventory() {
    const processed = InventoryManager.getProcessedInventory(state.calculatedProducts);
    
    if (processed.length === 0) {
      DOM.inventoryTableBody.innerHTML = `
        <tr>
          <td colspan="11" class="text-center py-4 text-muted">
            <i data-lucide="package-search" style="width: 36px; height: 36px; display: block; margin: 0 auto 0.65rem auto; color: var(--text-dim);"></i>
            <strong>No products found matching your search or filters.</strong>
          </td>
        </tr>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    DOM.inventoryTableBody.innerHTML = processed.map(p => `
      <tr>
        <td><strong style="font-family: var(--font-mono); font-size: 0.825rem;">${p.id}</strong></td>
        <td>
          <div style="display: flex; flex-direction: column;">
            <strong style="color: var(--text-main); font-size: 0.925rem;">${p.name}</strong>
          </div>
        </td>
        <td><span class="category-pill">${p.category}</span></td>
        <td><strong class="${p.currentStock === 0 ? 'text-danger' : ''}">${p.currentStock}</strong></td>
        <td>$${p.unitPrice.toFixed(2)}</td>
        <td>${p.supplier}</td>
        <td>${p.leadTime} days</td>
        <td>${p.safetyStock}</td>
        <td><strong>${p.reorderPoint}</strong></td>
        <td><span class="badge ${p.statusClass}">${p.status}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-edit-product" data-id="${p.id}" title="Edit Product">
              <i data-lucide="edit-3"></i>
            </button>
            <button class="btn-icon btn-delete-product text-danger" data-id="${p.id}" title="Delete Product">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  /**
   * Populates Category filter dropdown
   */
  function populateCategoryFilter() {
    const categories = InventoryManager.getCategories();
    const currentVal = DOM.categoryFilterSelect.value;
    
    let optionsHtml = `<option value="all">All Categories</option>`;
    categories.forEach(cat => {
      optionsHtml += `<option value="${cat}">${cat}</option>`;
    });
    DOM.categoryFilterSelect.innerHTML = optionsHtml;
    DOM.categoryFilterSelect.value = currentVal || 'all';
  }

  /**
   * 3. Smart Reorders View Renderer
   */
  function renderReorders() {
    const products = [...state.calculatedProducts];
    
    // Sort: Critical (score 3) -> Reorder Now (score 2) -> Healthy (score 1)
    products.sort((a, b) => b.priorityScore - a.priorityScore || b.suggestedOrder - a.suggestedOrder);

    let totalSuggestedUnits = 0;
    let totalEstimatedCost = 0;
    let itemsRequiringOrder = 0;

    DOM.reorderTableBody.innerHTML = products.map(p => {
      if (p.suggestedOrder > 0) {
        totalSuggestedUnits += p.suggestedOrder;
        totalEstimatedCost += p.estimatedCost;
        itemsRequiringOrder += 1;
      }

      const isReorder = p.suggestedOrder > 0;
      return `
        <tr class="${p.status === 'Critical' ? 'row-critical' : (p.status === 'Reorder Now' ? 'row-warning' : '')}">
          <td><strong style="font-family: var(--font-mono); font-size: 0.825rem;">${p.id}</strong></td>
          <td>
            <strong>${p.name}</strong>
            <div class="text-muted small">${p.supplier}</div>
          </td>
          <td>${p.currentStock}</td>
          <td>${p.avgDailySales}/d</td>
          <td>${p.leadTime}d</td>
          <td>${p.safetyStock}</td>
          <td><strong>${p.reorderPoint}</strong></td>
          <td>${p.targetStock}</td>
          <td>
            <strong class="${isReorder ? 'text-primary' : 'text-muted'}">
              ${p.suggestedOrder > 0 ? `+${p.suggestedOrder}` : '0'}
            </strong>
          </td>
          <td>$${p.estimatedCost.toFixed(2)}</td>
          <td><span class="badge ${p.statusClass}">${p.status}</span></td>
        </tr>
      `;
    }).join('');

    // Summary KPIs
    DOM.reorderTotalUnits.textContent = totalSuggestedUnits.toLocaleString();
    DOM.reorderTotalCost.textContent = `$${totalEstimatedCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    DOM.reorderItemsCount.textContent = itemsRequiringOrder;

    // Supplier Summaries Cards
    DOM.supplierSummaryContainer.innerHTML = state.supplierSummaries.map(s => `
      <div class="supplier-card ${s.itemsToReorder > 0 ? 'needs-order' : ''}">
        <div class="supplier-header">
          <h5>${s.supplier}</h5>
          <span class="badge ${s.itemsToReorder > 0 ? 'badge-warning' : 'badge-healthy'}">
            ${s.itemsToReorder > 0 ? `${s.itemsToReorder} SKUs to Order` : 'Healthy'}
          </span>
        </div>
        <div class="supplier-body">
          <p>Lead Time: <strong>${s.leadTime} Days</strong></p>
          <p>Total Items Cataloged: <strong>${s.totalProducts}</strong></p>
          <p>Units to Order: <strong>${s.totalUnitsToOrder} units</strong></p>
          <p class="supplier-cost">Estimated PO Investment: <strong>$${s.totalEstimatedCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
        </div>
      </div>
    `).join('');
  }

  /**
   * 4. Sales Analytics View Renderer
   */
  function renderSalesAnalytics() {
    DOM.salesTotalUnits.textContent = state.salesMetrics.totalUnits.toLocaleString();
    DOM.salesTotalRevenue.textContent = `$${state.salesMetrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    DOM.salesAvgDaily.textContent = state.salesMetrics.avgDailySales;
    DOM.salesAvgOrder.textContent = `$${state.salesMetrics.avgOrderValue}`;

    // Render Product-wise Sales Table
    DOM.salesTableBody.innerHTML = state.salesAnalysis.all.map((p, idx) => `
      <tr>
        <td>#${idx + 1}</td>
        <td><strong style="font-family: var(--font-mono); font-size: 0.825rem;">${p.productId}</strong></td>
        <td><strong>${p.productName}</strong></td>
        <td><span class="category-pill">${p.category}</span></td>
        <td><strong>${p.totalUnitsSold}</strong></td>
        <td>$${p.totalRevenue.toLocaleString()}</td>
        <td>${p.dailyVelocity} / day</td>
        <td>
          <span class="badge ${p.dailyVelocity >= 2.5 ? 'badge-healthy' : (p.dailyVelocity <= 1.2 ? 'badge-critical' : 'badge-neutral')}">
            ${p.dailyVelocity >= 2.5 ? 'Fast Moving' : (p.dailyVelocity <= 1.2 ? 'Slow Moving' : 'Normal')}
          </span>
        </td>
      </tr>
    `).join('');

    renderSalesAnalyticsCharts();
  }

  function renderSalesAnalyticsCharts() {
    const isDark = document.body.classList.contains('dark-theme');
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)';

    // Category Sales Chart
    const catSalesCanvas = document.getElementById('chart-category-sales');
    if (catSalesCanvas) {
      const catData = SalesAnalytics.getCategorySalesAnalysis(state.sales);
      const labels = catData.map(c => c.category);
      const revenues = catData.map(c => c.revenue);

      if (state.charts.categorySales) state.charts.categorySales.destroy();
      state.charts.categorySales = new Chart(catSalesCanvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Sales Revenue ($)',
            data: revenues,
            backgroundColor: '#2563EB',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Inter', size: 11 } } },
            y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Inter', size: 11 }, callback: v => `$${v}` } }
          }
        }
      });
    }

    // Velocity Breakdown Chart
    const velocityCanvas = document.getElementById('chart-sales-velocity');
    if (velocityCanvas) {
      const top10 = state.salesAnalysis.all.slice(0, 8);
      const labels = top10.map(p => p.productName.length > 18 ? p.productName.substring(0, 16) + '...' : p.productName);
      const velocities = top10.map(p => p.dailyVelocity);

      if (state.charts.salesVelocity) state.charts.salesVelocity.destroy();
      state.charts.salesVelocity = new Chart(velocityCanvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Daily Sales Velocity (units/day)',
            data: velocities,
            backgroundColor: '#10B981',
            borderRadius: 8
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Inter', size: 11 } } },
            y: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Inter', size: 11 } } }
          }
        }
      });
    }
  }

  /**
   * 5. AI Assistant View
   */
  function renderInitialAIMessage() {
    DOM.aiChatContainer.innerHTML = `
      <div class="ai-chat-bubble assistant">
        <div class="bubble-header">
          <i data-lucide="bot"></i>
          <strong>StockWise AI Assistant</strong>
          <span class="ai-badge">${state.settings.geminiBackendUrl ? 'Backend Connected' : 'Deterministic Local Engine'}</span>
        </div>
        <div class="bubble-content">
          ${AIAssistant.generateExecutiveSummary(state.calculatedProducts, state.salesMetrics, state.supplierSummaries, state.settings)}
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }

  function handleUserMessage(query) {
    if (!query || !query.trim()) return;

    // Append User Bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'ai-chat-bubble user';
    userBubble.innerHTML = `
      <div class="bubble-header">
        <i data-lucide="user"></i>
        <strong>You</strong>
      </div>
      <div class="bubble-content">
        <p>${escapeHtml(query)}</p>
      </div>
    `;
    DOM.aiChatContainer.appendChild(userBubble);
    DOM.aiChatInput.value = '';
    DOM.aiChatContainer.scrollTop = DOM.aiChatContainer.scrollHeight;

    const backendUrl = state.settings.geminiBackendUrl;
    
    // Create assistant bubble container
    const assistantBubble = document.createElement('div');
    assistantBubble.className = 'ai-chat-bubble assistant';
    assistantBubble.innerHTML = `
      <div class="bubble-header">
        <i data-lucide="bot"></i>
        <strong>StockWise AI Assistant</strong>
        <span class="ai-badge">${backendUrl ? 'Gemini Backend' : 'Deterministic Local'}</span>
      </div>
      <div class="bubble-content">
        <div class="ai-loading-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    DOM.aiChatContainer.appendChild(assistantBubble);
    DOM.aiChatContainer.scrollTop = DOM.aiChatContainer.scrollHeight;

    setTimeout(async () => {
      let responseHtml = '';
      if (backendUrl) {
        try {
          const reply = await AIAssistant.queryGeminiBackend(query, state.calculatedProducts, backendUrl);
          responseHtml = `<div class="ai-response-card"><p>${escapeHtml(reply)}</p></div>`;
        } catch (e) {
          console.warn('Backend proxy unavailable, falling back to local rule-based engine:', e);
          responseHtml = AIAssistant.processUserQuery(query, state.calculatedProducts, state.salesAnalysis, state.supplierSummaries, state.settings);
        }
      } else {
        responseHtml = AIAssistant.processUserQuery(query, state.calculatedProducts, state.salesAnalysis, state.supplierSummaries, state.settings);
      }

      assistantBubble.querySelector('.bubble-content').innerHTML = responseHtml;
      DOM.aiChatContainer.scrollTop = DOM.aiChatContainer.scrollHeight;
      if (window.lucide) lucide.createIcons();
    }, 400);
  }

  /**
   * Toast Notification Helper
   */
  function showToast(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'info';
    if (type === 'success') icon = 'check-circle';
    if (type === 'danger' || type === 'error') icon = 'alert-triangle';
    if (type === 'warning') icon = 'alert-circle';

    toast.innerHTML = `
      <i data-lucide="${icon}"></i>
      <span>${message}</span>
    `;

    DOM.toastContainer.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /**
   * Custom Confirmation Modal Helper
   */
  let pendingConfirmCallback = null;
  function showConfirmDialog(title, message, onConfirm) {
    DOM.confirmModalTitle.textContent = title;
    DOM.confirmModalMessage.textContent = message;
    pendingConfirmCallback = onConfirm;
    DOM.confirmModal.classList.add('active');
  }

  function hideConfirmDialog() {
    DOM.confirmModal.classList.remove('active');
    pendingConfirmCallback = null;
  }

  /**
   * Theme Switcher
   */
  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      if (DOM.themeIcon) DOM.themeIcon.setAttribute('data-lucide', 'moon');
      if (DOM.themeLabel) DOM.themeLabel.textContent = 'Dark Mode';
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      if (DOM.themeIcon) DOM.themeIcon.setAttribute('data-lucide', 'sun');
      if (DOM.themeLabel) DOM.themeLabel.textContent = 'Light Mode';
    }
    state.settings.theme = theme;
    Storage.saveSettings({ theme });
    if (window.lucide) lucide.createIcons();
  }

  function toggleTheme() {
    const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    refreshAllViews();
  }

  /**
   * Navigation router
   */
  function navigateTo(sectionId) {
    state.activeSection = sectionId;
    DOM.navLinks.forEach(link => {
      if (link.dataset.section === sectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    DOM.sections.forEach(sec => {
      if (sec.id === `section-${sectionId}`) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Close mobile drawer if open
    DOM.sidebar.classList.remove('open');
    DOM.sidebarOverlay.classList.remove('active');

    // Trigger chart resize if navigating to dashboard or analytics
    if (sectionId === 'dashboard' || sectionId === 'sales') {
      setTimeout(() => {
        Object.values(state.charts).forEach(c => c && c.resize && c.resize());
      }, 60);
    }
  }

  /**
   * Event Listeners Setup
   */
  function setupEventListeners() {
    // Navigation items
    DOM.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        navigateTo(section);
      });
    });

    // Mobile sidebar toggle
    if (DOM.sidebarToggle) {
      DOM.sidebarToggle.addEventListener('click', () => {
        DOM.sidebar.classList.toggle('open');
        DOM.sidebarOverlay.classList.toggle('active');
      });
    }

    if (DOM.sidebarOverlay) {
      DOM.sidebarOverlay.addEventListener('click', () => {
        DOM.sidebar.classList.remove('open');
        DOM.sidebarOverlay.classList.remove('active');
      });
    }

    // Desktop sidebar collapse toggle
    if (DOM.sidebarCollapseBtn) {
      DOM.sidebarCollapseBtn.addEventListener('click', () => {
        DOM.sidebar.classList.toggle('collapsed');
        DOM.mainWrapper.classList.toggle('sidebar-collapsed');
        const isCollapsed = DOM.sidebar.classList.contains('collapsed');
        if (DOM.collapseIcon) {
          DOM.collapseIcon.setAttribute('data-lucide', isCollapsed ? 'chevron-right' : 'chevron-left');
          if (window.lucide) lucide.createIcons();
        }
        // Resize charts smoothly
        setTimeout(() => {
          Object.values(state.charts).forEach(c => c && c.resize && c.resize());
        }, 360);
      });
    }

    // Global Search header input
    if (DOM.globalSearchInput) {
      DOM.globalSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const q = e.target.value.trim();
          if (q) {
            navigateTo('inventory');
            DOM.inventorySearchInput.value = q;
            InventoryManager.setFilter('search', q);
            renderInventory();
          }
        }
      });
    }

    // Theme toggle button
    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Inventory search & filters
    if (DOM.inventorySearchInput) {
      DOM.inventorySearchInput.addEventListener('input', (e) => {
        InventoryManager.setFilter('search', e.target.value);
        renderInventory();
      });
    }

    if (DOM.categoryFilterSelect) {
      DOM.categoryFilterSelect.addEventListener('change', (e) => {
        InventoryManager.setFilter('category', e.target.value);
        renderInventory();
      });
    }

    if (DOM.statusFilterSelect) {
      DOM.statusFilterSelect.addEventListener('change', (e) => {
        InventoryManager.setFilter('status', e.target.value);
        renderInventory();
      });
    }

    // Sort select
    if (DOM.sortSelect) {
      DOM.sortSelect.addEventListener('change', (e) => {
        const [col, dir] = e.target.value.split('-');
        InventoryManager.setSort(col);
        renderInventory();
      });
    }

    // Sorting inventory columns via table header click
    document.querySelectorAll('.th-sortable').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.sort;
        InventoryManager.setSort(col);
        renderInventory();
      });
    });

    // Add Product Modal open
    if (DOM.btnOpenAddModal) {
      DOM.btnOpenAddModal.addEventListener('click', () => {
        DOM.productModalTitle.textContent = "Add New Product";
        DOM.productForm.reset();
        document.getElementById('product-form-is-edit').value = "false";
        document.getElementById('prod-id').removeAttribute('readonly');
        DOM.productModal.classList.add('active');
      });
    }

    // Cancel modal
    if (DOM.btnCancelProductModal) {
      DOM.btnCancelProductModal.addEventListener('click', () => {
        DOM.productModal.classList.remove('active');
      });
    }

    // Submit product form (Add or Edit)
    if (DOM.productForm) {
      DOM.productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const isEdit = document.getElementById('product-form-is-edit').value === "true";
        
        const productData = {
          id: document.getElementById('prod-id').value.trim(),
          name: document.getElementById('prod-name').value.trim(),
          category: document.getElementById('prod-category').value.trim(),
          currentStock: Number(document.getElementById('prod-stock').value),
          unitPrice: Number(document.getElementById('prod-price').value),
          supplier: document.getElementById('prod-supplier').value.trim(),
          leadTime: Number(document.getElementById('prod-lead-time').value),
          safetyStock: Number(document.getElementById('prod-safety-stock').value)
        };

        const errors = InventoryManager.validateProduct(productData, isEdit);
        if (errors.length > 0) {
          showToast(errors[0], 'error');
          return;
        }

        try {
          if (isEdit) {
            Storage.updateProduct(productData);
            showToast(`Product "${productData.name}" updated successfully!`, 'success');
          } else {
            Storage.addProduct(productData);
            showToast(`Product "${productData.name}" added successfully!`, 'success');
          }
          DOM.productModal.classList.remove('active');
          loadData();
          refreshAllViews();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    }

    // Edit Product Click
    document.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.btn-edit-product');
      if (editBtn) {
        const pid = editBtn.dataset.id;
        const prod = state.inventory.find(p => p.id === pid);
        if (prod) {
          DOM.productModalTitle.textContent = `Edit Product (${prod.id})`;
          document.getElementById('product-form-is-edit').value = "true";
          document.getElementById('prod-id').value = prod.id;
          document.getElementById('prod-id').setAttribute('readonly', 'true');
          document.getElementById('prod-name').value = prod.name;
          document.getElementById('prod-category').value = prod.category;
          document.getElementById('prod-stock').value = prod.currentStock;
          document.getElementById('prod-price').value = prod.unitPrice;
          document.getElementById('prod-supplier').value = prod.supplier;
          document.getElementById('prod-lead-time').value = prod.leadTime;
          document.getElementById('prod-safety-stock').value = prod.safetyStock;
          DOM.productModal.classList.add('active');
        }
      }

      // Delete Product Click
      const delBtn = e.target.closest('.btn-delete-product');
      if (delBtn) {
        const pid = delBtn.dataset.id;
        const prod = state.inventory.find(p => p.id === pid);
        showConfirmDialog(
          "Delete Product",
          `Are you sure you want to delete "${prod ? prod.name : pid}"? This action cannot be undone.`,
          () => {
            try {
              Storage.deleteProduct(pid);
              showToast(`Product ${pid} deleted successfully.`, 'info');
              loadData();
              refreshAllViews();
            } catch (err) {
              showToast(err.message, 'error');
            }
          }
        );
      }

      // Quick Reorder button from Dashboard
      const quickBtn = e.target.closest('.btn-quick-reorder');
      if (quickBtn) {
        navigateTo('reorders');
      }
    });

    // Confirmation Modal buttons
    if (DOM.btnConfirmAction) {
      DOM.btnConfirmAction.addEventListener('click', () => {
        if (pendingConfirmCallback) {
          pendingConfirmCallback();
        }
        hideConfirmDialog();
      });
    }

    if (DOM.btnCancelConfirm) {
      DOM.btnCancelConfirm.addEventListener('click', hideConfirmDialog);
    }

    // Target Coverage Days Slider
    if (DOM.targetCoverageInput) {
      DOM.targetCoverageInput.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        DOM.targetCoverageVal.textContent = `${val} days`;
        state.settings.targetCoverageDays = val;
        Storage.saveSettings({ targetCoverageDays: val });
        refreshAllViews();
      });
    }

    // AI Chat events
    if (DOM.aiSendBtn) {
      DOM.aiSendBtn.addEventListener('click', () => {
        handleUserMessage(DOM.aiChatInput.value);
      });
    }

    if (DOM.aiChatInput) {
      DOM.aiChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleUserMessage(DOM.aiChatInput.value);
        }
      });
    }

    // AI quick prompt chips
    DOM.aiChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const prompt = chip.dataset.prompt;
        handleUserMessage(prompt);
      });
    });

    // Clear AI Chat
    if (DOM.btnClearAiChat) {
      DOM.btnClearAiChat.addEventListener('click', () => {
        renderInitialAIMessage();
        showToast("AI Chat history cleared.", "info");
      });
    }

    // Settings save
    if (DOM.btnSaveSettings) {
      DOM.btnSaveSettings.addEventListener('click', () => {
        const updated = {
          targetCoverageDays: Number(DOM.settingTargetDays.value) || 10,
          analysisDays: Number(DOM.settingAnalysisDays.value) || 30,
          theme: DOM.settingThemeSelect.value,
          geminiBackendUrl: DOM.settingBackendUrl.value.trim()
        };
        Storage.saveSettings(updated);
        state.settings = updated;
        applyTheme(updated.theme);
        loadData();
        refreshAllViews();
        showToast("Settings saved successfully!", "success");
      });
    }

    // Reset default sample data
    if (DOM.btnResetData) {
      DOM.btnResetData.addEventListener('click', () => {
        showConfirmDialog(
          "Reset Sample Data",
          "Are you sure you want to reset inventory and sales data to the default 16 sample products? Any custom products or edits will be restored to defaults.",
          () => {
            Storage.resetToDefault();
            loadData();
            refreshAllViews();
            renderInitialAIMessage();
            showToast("Inventory & sales restored to factory defaults!", "success");
          }
        );
      });
    }

    // Export CSVs
    if (DOM.btnExportInvCSV) {
      DOM.btnExportInvCSV.addEventListener('click', () => {
        Storage.exportToCSV('stockwise_inventory.csv', state.inventory);
        showToast("Inventory CSV exported!", "success");
      });
    }

    if (DOM.btnExportSalesCSV) {
      DOM.btnExportSalesCSV.addEventListener('click', () => {
        Storage.exportToCSV('stockwise_sales.csv', state.sales);
        showToast("Sales history CSV exported!", "success");
      });
    }

    if (DOM.btnExportReorderCSV) {
      DOM.btnExportReorderCSV.addEventListener('click', () => {
        const reorderExport = state.calculatedProducts.map(p => ({
          "Product ID": p.id,
          "Product Name": p.name,
          "Category": p.category,
          "Supplier": p.supplier,
          "Current Stock": p.currentStock,
          "Avg Daily Sales": p.avgDailySales,
          "Lead Time (Days)": p.leadTime,
          "Safety Stock": p.safetyStock,
          "Reorder Point": p.reorderPoint,
          "Target Stock": p.targetStock,
          "Suggested Order": p.suggestedOrder,
          "Unit Price": p.unitPrice,
          "Estimated Cost": p.estimatedCost,
          "Stock Status": p.status
        }));
        Storage.exportToCSV('stockwise_reorder_recommendations.csv', reorderExport);
        showToast("Reorder recommendations exported!", "success");
      });
    }

    // Export Excel (.xlsx) using SheetJS
    if (DOM.btnExportExcel) {
      DOM.btnExportExcel.addEventListener('click', () => {
        try {
          const reorderExport = state.calculatedProducts.map(p => ({
            "Product ID": p.id,
            "Product Name": p.name,
            "Category": p.category,
            "Supplier": p.supplier,
            "Current Stock": p.currentStock,
            "Avg Daily Sales": p.avgDailySales,
            "Lead Time": p.leadTime,
            "Safety Stock": p.safetyStock,
            "Reorder Point": p.reorderPoint,
            "Target Stock": p.targetStock,
            "Suggested Order": p.suggestedOrder,
            "Unit Price": p.unitPrice,
            "Estimated Cost": p.estimatedCost,
            "Status": p.status
          }));

          Storage.exportToExcel('StockWise_Inventory_Report.xlsx', {
            'Inventory': state.inventory,
            'Sales History': state.sales,
            'Reorders': reorderExport
          });
          showToast("Complete Excel workbook exported!", "success");
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    }

    // Import Inventory CSV
    if (DOM.btnImportInvCSV && DOM.fileInputInv) {
      DOM.btnImportInvCSV.addEventListener('click', () => DOM.fileInputInv.click());
      DOM.fileInputInv.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const raw = Storage.parseCSV(event.target.result);
            if (!raw || raw.length === 0) throw new Error("File contains no records.");
            
            const validated = raw.map((r, i) => {
              const id = r.id || r['Product ID'] || r.productId;
              const name = r.name || r['Product Name'] || r.productName;
              if (!id || !name) throw new Error(`Row ${i + 1} is missing ID or Name.`);

              return {
                id: String(id).trim(),
                name: String(name).trim(),
                category: String(r.category || r['Category'] || 'General').trim(),
                currentStock: Number(r.currentStock || r['Current Stock'] || 0),
                unitPrice: Number(r.unitPrice || r['Unit Price'] || 0),
                supplier: String(r.supplier || r['Supplier'] || 'General Supplier').trim(),
                leadTime: Number(r.leadTime || r['Lead Time'] || 5),
                safetyStock: Number(r.safetyStock || r['Safety Stock'] || 5)
              };
            });

            showConfirmDialog(
              "Import Inventory",
              `Found ${validated.length} valid product records. Do you want to replace existing inventory with this file?`,
              () => {
                Storage.saveInventory(validated);
                loadData();
                refreshAllViews();
                showToast(`Successfully imported ${validated.length} products!`, "success");
              }
            );
          } catch (err) {
            showToast(`Import failed: ${err.message}`, "error");
          } finally {
            DOM.fileInputInv.value = '';
          }
        };
        reader.readAsText(file);
      });
    }

    // Import Sales CSV
    if (DOM.btnImportSalesCSV && DOM.fileInputSales) {
      DOM.btnImportSalesCSV.addEventListener('click', () => DOM.fileInputSales.click());
      DOM.fileInputSales.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const raw = Storage.parseCSV(event.target.result);
            if (!raw || raw.length === 0) throw new Error("File contains no sales records.");

            const validated = raw.map((r, i) => {
              const pid = r.productId || r['Product ID'] || r.id;
              if (!pid) throw new Error(`Row ${i + 1} is missing Product ID.`);
              const units = Number(r.unitsSold || r['Units Sold'] || 1);
              const price = Number(r.unitPrice || r['Unit Price'] || 0);

              return {
                transactionId: String(r.transactionId || r['Transaction ID'] || `TXN-${Date.now() + i}`),
                date: r.date || r['Date'] || new Date().toISOString().split('T')[0],
                productId: String(pid).trim(),
                productName: String(r.productName || r['Product Name'] || pid).trim(),
                category: String(r.category || r['Category'] || 'General').trim(),
                unitsSold: units,
                unitPrice: price,
                totalRevenue: Number(r.totalRevenue || (units * price))
              };
            });

            showConfirmDialog(
              "Import Sales History",
              `Found ${validated.length} sales records. Replace existing sales log?`,
              () => {
                Storage.saveSales(validated);
                loadData();
                refreshAllViews();
                showToast(`Successfully imported ${validated.length} sales transactions!`, "success");
              }
            );
          } catch (err) {
            showToast(`Import failed: ${err.message}`, "error");
          } finally {
            DOM.fileInputSales.value = '';
          }
        };
        reader.readAsText(file);
      });
    }

    // Download Sample CSV templates
    if (DOM.btnDownloadSampleInv) {
      DOM.btnDownloadSampleInv.addEventListener('click', () => {
        const sampleInv = [
          { id: "PRD-101", name: "Sample Item A", category: "Electronics", currentStock: 15, unitPrice: 29.99, supplier: "Apex Direct", leadTime: 5, safetyStock: 10 },
          { id: "PRD-102", name: "Sample Item B", category: "Personal Care", currentStock: 4, unitPrice: 14.50, supplier: "GlowCare", leadTime: 7, safetyStock: 8 }
        ];
        Storage.exportToCSV('sample_inventory_template.csv', sampleInv);
      });
    }

    if (DOM.btnDownloadSampleSales) {
      DOM.btnDownloadSampleSales.addEventListener('click', () => {
        const sampleSales = [
          { transactionId: "TXN-9001", date: "2026-11-01", productId: "PRD-101", productName: "Sample Item A", category: "Electronics", unitsSold: 3, unitPrice: 29.99, totalRevenue: 89.97 },
          { transactionId: "TXN-9002", date: "2026-11-02", productId: "PRD-102", productName: "Sample Item B", category: "Personal Care", unitsSold: 2, unitPrice: 14.50, totalRevenue: 29.00 }
        ];
        Storage.exportToCSV('sample_sales_template.csv', sampleSales);
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Start the application
  initApp();
});
