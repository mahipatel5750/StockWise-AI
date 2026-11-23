/**
 * StockWise AI - AI Inventory Assistant Module
 * Features a local deterministic rule-based reasoning engine powered by real inventory
 * and reorder calculations, along with a secure client-side integration adapter for
 * a future Gemini AI backend proxy.
 */

const AIAssistant = (() => {
  /**
   * Generates a comprehensive contextual report using actual live inventory & reorder calculations.
   */
  function generateExecutiveSummary(calculatedProducts, salesMetrics, supplierSummaries, settings) {
    const totalProducts = calculatedProducts.length;
    const totalInventoryValue = calculatedProducts.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);
    const criticalItems = calculatedProducts.filter(p => p.status === 'Critical');
    const reorderItems = calculatedProducts.filter(p => p.status === 'Reorder Now');
    const healthyItems = calculatedProducts.filter(p => p.status === 'Healthy');
    const totalSuggestedOrderUnits = calculatedProducts.reduce((sum, p) => sum + p.suggestedOrder, 0);
    const totalCapitalRequired = calculatedProducts.reduce((sum, p) => sum + p.estimatedCost, 0);

    let html = `
      <div class="ai-response-card">
        <h4>📋 Executive Daily Inventory Briefing</h4>
        <p><strong>System Status:</strong> Operating in deterministic local analytics mode with <strong>${settings.targetCoverageDays} days</strong> target stock coverage.</p>
        
        <div class="ai-summary-grid">
          <div class="ai-stat-box">
            <span class="stat-num">${totalProducts}</span>
            <span class="stat-lbl">Active SKUs</span>
          </div>
          <div class="ai-stat-box">
            <span class="stat-num">$${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span class="stat-lbl">On-Hand Value</span>
          </div>
          <div class="ai-stat-box ${criticalItems.length > 0 ? 'alert-danger' : ''}">
            <span class="stat-num">${criticalItems.length}</span>
            <span class="stat-lbl">Stockouts (Critical)</span>
          </div>
          <div class="ai-stat-box ${reorderItems.length > 0 ? 'alert-warning' : ''}">
            <span class="stat-num">${reorderItems.length}</span>
            <span class="stat-lbl">Need Reorder</span>
          </div>
        </div>

        <h5>Immediate Action Items:</h5>
        <ul>
    `;

    if (criticalItems.length > 0) {
      html += `<li><strong class="text-danger">Urgent Stockouts:</strong> ${criticalItems.map(p => `<strong>${p.name}</strong> (Lead time: ${p.leadTime}d, Deficit: ${p.suggestedOrder} units)`).join(', ')}. Immediate PO issuance recommended to minimize lost sales revenue.</li>`;
    } else {
      html += `<li><strong class="text-success">No Stockouts:</strong> All catalog items currently have positive on-hand inventory.</li>`;
    }

    if (reorderItems.length > 0) {
      html += `<li><strong class="text-warning">Reorder Threshold Breached:</strong> ${reorderItems.map(p => `<strong>${p.name}</strong> (Stock: ${p.currentStock}, Reorder Point: ${p.reorderPoint}, Suggested: ${p.suggestedOrder})`).join('; ')}.</li>`;
    }

    html += `
        </ul>
        <p class="ai-footnote">💰 <strong>Total Reorder Capital Required:</strong> $${totalCapitalRequired.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} for ${totalSuggestedOrderUnits} units across ${supplierSummaries.filter(s => s.itemsToReorder > 0).length} suppliers.</p>
      </div>
    `;

    return html;
  }

  /**
   * Generates Stockout Risk explanation
   */
  function generateStockoutRiskExplanation(calculatedProducts) {
    const atRisk = calculatedProducts.filter(p => p.status === 'Critical' || p.status === 'Reorder Now')
      .sort((a, b) => a.priorityScore !== b.priorityScore ? b.priorityScore - a.priorityScore : (a.daysOfSupply === "∞" ? 999 : Number(a.daysOfSupply)) - (b.daysOfSupply === "∞" ? 999 : Number(b.daysOfSupply)));

    if (atRisk.length === 0) {
      return `
        <div class="ai-response-card">
          <h4>🛡️ Stockout Risk Assessment</h4>
          <p class="text-success"><strong>Outstanding News!</strong> No products are currently at risk of stockout. All SKUs are operating comfortably above their calculated Reorder Point based on supplier lead times and safety stock buffers.</p>
        </div>
      `;
    }

    let itemsHtml = atRisk.map(p => {
      const isCritical = p.status === 'Critical';
      const runwayText = isCritical 
        ? `<span class="badge-critical">0 Days (Stocked Out)</span>` 
        : `<span class="badge-reorder">${p.daysOfSupply} days remaining</span>`;

      return `
        <div class="ai-risk-item ${isCritical ? 'critical' : 'warning'}">
          <div class="ai-risk-header">
            <strong>${p.name} (${p.id})</strong>
            ${runwayText}
          </div>
          <div class="ai-risk-details">
            <span>Current Stock: <strong>${p.currentStock}</strong></span> |
            <span>Avg Daily Velocity: <strong>${p.avgDailySales}/day</strong></span> |
            <span>Supplier Lead Time: <strong>${p.leadTime} days</strong></span> |
            <span>Safety Stock: <strong>${p.safetyStock}</strong></span>
          </div>
          <p class="ai-risk-rationale">
            ${isCritical 
              ? `⚠️ <strong>Zero stock on hand!</strong> With a ${p.leadTime}-day lead time from <em>${p.supplier}</em>, every day without ordering results in an estimated loss of ~${p.avgDailySales} units ($${(p.avgDailySales * p.unitPrice).toFixed(2)}) in sales.` 
              : `⚡ At current velocity (${p.avgDailySales} units/day), existing stock (${p.currentStock}) will be completely depleted in ~${p.daysOfSupply} days. Because supplier <em>${p.supplier}</em> requires ${p.leadTime} days for delivery, an order must be placed now to prevent downtime.`}
          </p>
        </div>
      `;
    }).join('');

    return `
      <div class="ai-response-card">
        <h4>⚠️ Stockout Risk & Depletion Velocity Analysis</h4>
        <p>The system identified <strong>${atRisk.length} SKUs</strong> that require immediate replenishment action:</p>
        <div class="ai-risk-list">
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  /**
   * Generates Reorder Priority explanation
   */
  function generateReorderPriorityExplanation(calculatedProducts, supplierSummaries) {
    const itemsNeedingOrder = calculatedProducts.filter(p => p.suggestedOrder > 0)
      .sort((a, b) => b.priorityScore - a.priorityScore || b.estimatedCost - a.estimatedCost);

    if (itemsNeedingOrder.length === 0) {
      return `
        <div class="ai-response-card">
          <h4>🎯 Reorder Priority Ranking</h4>
          <p class="text-success">No reorders are currently required. All products meet or exceed the target coverage threshold.</p>
        </div>
      `;
    }

    let rowsHtml = itemsNeedingOrder.map((p, idx) => `
      <tr>
        <td><strong>#${idx + 1}</strong></td>
        <td>
          <span class="badge ${p.statusClass}">${p.status}</span>
          <strong>${p.name}</strong>
        </td>
        <td>${p.supplier}</td>
        <td>${p.currentStock}</td>
        <td>${p.reorderPoint}</td>
        <td><strong>${p.suggestedOrder}</strong> units</td>
        <td>$${p.estimatedCost.toFixed(2)}</td>
      </tr>
    `).join('');

    let supplierCards = supplierSummaries.filter(s => s.itemsToReorder > 0).map(s => `
      <div class="ai-supplier-card">
        <h6>${s.supplier}</h6>
        <p><strong>${s.itemsToReorder} SKUs</strong> | Total Units: <strong>${s.totalUnitsToOrder}</strong></p>
        <p>Lead Time: ${s.leadTime}d | Est Cost: <strong>$${s.totalEstimatedCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></p>
      </div>
    `).join('');

    return `
      <div class="ai-response-card">
        <h4>🎯 Smart Reorder Priority & Purchase Allocation</h4>
        <p>Procurement recommendations prioritized by stockout severity, supplier lead times, and financial outlay:</p>
        
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Product</th>
                <th>Supplier</th>
                <th>Current Stock</th>
                <th>Reorder Point</th>
                <th>Suggested Order</th>
                <th>Est. Cost</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>

        <h5 style="margin-top: 1.25rem;">Consolidated Supplier PO Batches:</h5>
        <div class="ai-supplier-grid">
          ${supplierCards}
        </div>
      </div>
    `;
  }

  /**
   * Generates Fast and Slow moving product insights
   */
  function generateVelocityInsights(salesAnalysis) {
    const { fastMoving, slowMoving, all } = salesAnalysis;

    let fastHtml = fastMoving.slice(0, 5).map(p => `
      <li>
        <strong>${p.productName}</strong> (${p.category}): 
        <span>${p.totalUnitsSold} units sold</span> 
        (<em>${p.dailyVelocity} units/day</em>) – Revenue: <strong>$${p.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
      </li>
    `).join('');

    let slowHtml = slowMoving.slice(0, 5).map(p => `
      <li>
        <strong>${p.productName}</strong> (${p.category}): 
        <span>${p.totalUnitsSold} units sold</span> 
        (<em>${p.dailyVelocity} units/day</em>) – Revenue: <strong>$${p.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
      </li>
    `).join('');

    return `
      <div class="ai-response-card">
        <h4>⚡ Fast-Moving vs Slow-Moving Product Insights</h4>
        <div class="ai-insights-columns">
          <div class="ai-insight-column fast">
            <h5>🚀 Top Fast-Moving SKUs (High Turnover)</h5>
            <p>These products drive the highest inventory velocity. Keep safety stock high and monitor supplier lead times closely to avoid painful stockout costs.</p>
            <ul>${fastHtml || '<li>No high velocity products identified.</li>'}</ul>
          </div>
          <div class="ai-insight-column slow">
            <h5>🐢 Slow-Moving SKUs (Capital Tied Up)</h5>
            <p>These products show low turnover. Consider bundling, promotional discounts, or lowering safety stock targets to avoid dead inventory carrying costs.</p>
            <ul>${slowHtml || '<li>No sluggish SKUs identified.</li>'}</ul>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Responds to user queries intelligently using rule-based parsing + live store calculations
   */
  function processUserQuery(query, calculatedProducts, salesAnalysis, supplierSummaries, settings) {
    const q = query.toLowerCase().trim();

    if (q.includes('summary') || q.includes('overview') || q.includes('daily') || q.includes('briefing')) {
      return generateExecutiveSummary(calculatedProducts, salesAnalysis, supplierSummaries, settings);
    }

    if (q.includes('risk') || q.includes('stockout') || q.includes('critical') || q.includes('deplet') || q.includes('run out')) {
      return generateStockoutRiskExplanation(calculatedProducts);
    }

    if (q.includes('reorder') || q.includes('order') || q.includes('priority') || q.includes('purchase') || q.includes('buy')) {
      return generateReorderPriorityExplanation(calculatedProducts, supplierSummaries);
    }

    if (q.includes('fast') || q.includes('slow') || q.includes('velocity') || q.includes('selling') || q.includes('moving')) {
      return generateVelocityInsights(salesAnalysis);
    }

    if (q.includes('supplier') || q.includes('vendor')) {
      let html = `
        <div class="ai-response-card">
          <h4>🏭 Supplier Performance & Purchase Orders</h4>
          <p>Consolidated supplier overview for active replenishment orders:</p>
          <div class="ai-supplier-grid">
      `;
      supplierSummaries.forEach(s => {
        html += `
          <div class="ai-supplier-card">
            <h6>${s.supplier}</h6>
            <p>Catalog items: <strong>${s.totalProducts}</strong> | Lead time: <strong>${s.leadTime} days</strong></p>
            <p>Items to order: <strong class="${s.itemsToReorder > 0 ? 'text-warning' : 'text-success'}">${s.itemsToReorder}</strong></p>
            <p>Suggested units: <strong>${s.totalUnitsToOrder}</strong></p>
            <p>Estimated PO total: <strong>$${s.totalEstimatedCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></p>
          </div>
        `;
      });
      html += `</div></div>`;
      return html;
    }

    // Check specific product query
    const matchedProduct = calculatedProducts.find(p => 
      q.includes(p.name.toLowerCase()) || q.includes(p.id.toLowerCase())
    );

    if (matchedProduct) {
      return `
        <div class="ai-response-card">
          <h4>🔎 Product Deep-Dive: ${matchedProduct.name} (${matchedProduct.id})</h4>
          <div class="ai-summary-grid">
            <div class="ai-stat-box">
              <span class="stat-num">${matchedProduct.currentStock}</span>
              <span class="stat-lbl">On-Hand Stock</span>
            </div>
            <div class="ai-stat-box">
              <span class="stat-num">${matchedProduct.reorderPoint}</span>
              <span class="stat-lbl">Reorder Point</span>
            </div>
            <div class="ai-stat-box">
              <span class="stat-num">${matchedProduct.avgDailySales}</span>
              <span class="stat-lbl">Daily Velocity</span>
            </div>
            <div class="ai-stat-box">
              <span class="stat-num">${matchedProduct.suggestedOrder}</span>
              <span class="stat-lbl">Suggested Order</span>
            </div>
          </div>
          <p><strong>Status:</strong> <span class="badge ${matchedProduct.statusClass}">${matchedProduct.status}</span></p>
          <p><strong>Supplier:</strong> ${matchedProduct.supplier} (Lead Time: ${matchedProduct.leadTime} days)</p>
          <p><strong>Stock Runway:</strong> ${matchedProduct.daysOfSupply} days of stock remaining at current consumption.</p>
          <p><strong>Reorder Target:</strong> Target stock is ${matchedProduct.targetStock} units for ${settings.targetCoverageDays} days coverage. Estimated order cost is $${matchedProduct.estimatedCost.toFixed(2)}.</p>
        </div>
      `;
    }

    // Fallback general guidance
    return `
      <div class="ai-response-card">
        <h4>🤖 StockWise AI Assistant Response</h4>
        <p>I analyzed your question regarding <em>"${query}"</em> against our current inventory (${calculatedProducts.length} items) and 30-day sales history.</p>
        <p>Here is what you can ask me:</p>
        <ul>
          <li><strong>"Executive Summary"</strong>: Overview of inventory valuation, critical stockouts, and capital requirements.</li>
          <li><strong>"Stockout Risks"</strong>: Explains which SKUs will run out first based on supplier lead times and daily burn rates.</li>
          <li><strong>"Reorder Priorities"</strong>: Generates prioritized purchase order recommendations.</li>
          <li><strong>"Fast vs Slow Moving"</strong>: Highlights best sellers and slow moving SKUs tying up cash.</li>
          <li><strong>"Product Name"</strong> (e.g. <em>"Sunscreen SPF 50"</em> or <em>"PRD-001"</em>): Detailed product analysis and reorder breakdown.</li>
        </ul>
      </div>
    `;
  }

  /**
   * Future Secure Gemini AI Backend Proxy Integration Adapter
   * In a future production deployment with a backend, requests are forwarded securely
   * without exposing API keys in client-side code.
   */
  async function queryGeminiBackend(userPrompt, inventoryContext, backendUrl) {
    if (!backendUrl) {
      throw new Error("No backend proxy URL configured. Using local deterministic AI engine.");
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userPrompt,
        context: inventoryContext
      })
    });

    if (!response.ok) {
      throw new Error(`Backend AI service returned HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.reply;
  }

  return {
    generateExecutiveSummary,
    generateStockoutRiskExplanation,
    generateReorderPriorityExplanation,
    generateVelocityInsights,
    processUserQuery,
    queryGeminiBackend
  };
})();
