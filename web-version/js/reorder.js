/**
 * StockWise AI - Smart Reorder Engine Module
 * Implements deterministic inventory formulas and purchase recommendation algorithms.
 */

const ReorderEngine = (() => {
  /**
   * Calculates comprehensive reorder metrics for all products
   * @param {Array} inventory 
   * @param {Array} sales 
   * @param {Object} options { targetCoverageDays: 10, analysisDays: 30 }
   * @returns {Array} Array of products with computed reorder properties
   */
  function calculateMetrics(inventory, sales, options = {}) {
    const targetCoverageDays = Number(options.targetCoverageDays) || 10;
    const analysisDays = Number(options.analysisDays) || 30;

    // Filter sales within the analysis period if dates are present
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - analysisDays * 24 * 60 * 60 * 1000);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    // Aggregate units sold per product
    const unitsSoldMap = {};
    sales.forEach(sale => {
      // If sale has a date and it falls before the cutoff, skip (or include all if analysisDays covers it)
      if (sale.date && sale.date < cutoffStr && analysisDays < 365) {
        return;
      }
      const pid = sale.productId;
      unitsSoldMap[pid] = (unitsSoldMap[pid] || 0) + Number(sale.unitsSold || 0);
    });

    return inventory.map(prod => {
      const currentStock = Number(prod.currentStock) || 0;
      const unitPrice = Number(prod.unitPrice) || 0;
      const leadTime = Number(prod.leadTime) || 0;
      const safetyStock = Number(prod.safetyStock) || 0;
      const totalUnitsSold = unitsSoldMap[prod.id] || 0;

      // Formula 1: Average Daily Sales = Total Units Sold / Number of Analysis Days
      const avgDailySales = Math.round((totalUnitsSold / analysisDays) * 100) / 100;

      // Formula 2: Reorder Point = (Average Daily Sales × Supplier Lead Time) + Safety Stock
      const reorderPoint = Math.round(((avgDailySales * leadTime) + safetyStock) * 100) / 100;

      // Formula 3: Target Stock = (Average Daily Sales × Target Coverage Days) + Safety Stock
      const targetStock = Math.round(((avgDailySales * targetCoverageDays) + safetyStock) * 100) / 100;

      // Formula 4: Suggested Order Quantity = max(0, Target Stock - Current Stock)
      // Usually whole units for ordering: round up to nearest integer if positive
      const rawDeficit = targetStock - currentStock;
      const suggestedOrder = Math.max(0, Math.ceil(rawDeficit));

      // Estimated Purchase Cost
      const estimatedCost = Math.round(suggestedOrder * unitPrice * 100) / 100;

      // Stock Classifications:
      // - Critical: Current stock <= 0
      // - Reorder Now: Current stock > 0 and Current stock <= Reorder Point
      // - Healthy: Current stock > Reorder Point
      let status = "Healthy";
      let statusClass = "badge-healthy";
      let priorityScore = 1;

      if (currentStock <= 0) {
        status = "Critical";
        statusClass = "badge-critical";
        priorityScore = 3;
      } else if (currentStock <= reorderPoint) {
        status = "Reorder Now";
        statusClass = "badge-reorder";
        priorityScore = 2;
      }

      // Stock runway (days of supply remaining)
      const daysOfSupply = avgDailySales > 0 
        ? Math.round((currentStock / avgDailySales) * 10) / 10 
        : 999;

      return {
        ...prod,
        currentStock,
        unitPrice,
        leadTime,
        safetyStock,
        totalUnitsSold,
        avgDailySales,
        reorderPoint,
        targetStock,
        suggestedOrder,
        estimatedCost,
        status,
        statusClass,
        priorityScore,
        daysOfSupply: daysOfSupply === 999 ? "∞" : daysOfSupply
      };
    });
  }

  /**
   * Summarizes purchase requirements grouped by supplier
   * @param {Array} reorderData 
   * @returns {Array} List of supplier summaries
   */
  function getSupplierSummaries(reorderData) {
    const suppliers = {};

    reorderData.forEach(item => {
      const sup = item.supplier || "Unknown Supplier";
      if (!suppliers[sup]) {
        suppliers[sup] = {
          supplier: sup,
          totalProducts: 0,
          itemsToReorder: 0,
          totalUnitsToOrder: 0,
          totalEstimatedCost: 0,
          leadTime: item.leadTime,
          urgentProducts: []
        };
      }

      suppliers[sup].totalProducts += 1;
      if (item.suggestedOrder > 0) {
        suppliers[sup].itemsToReorder += 1;
        suppliers[sup].totalUnitsToOrder += item.suggestedOrder;
        suppliers[sup].totalEstimatedCost += item.estimatedCost;
        if (item.status === 'Critical' || item.status === 'Reorder Now') {
          suppliers[sup].urgentProducts.push(item.name);
        }
      }
    });

    return Object.values(suppliers).map(s => ({
      ...s,
      totalEstimatedCost: Math.round(s.totalEstimatedCost * 100) / 100
    })).sort((a, b) => b.totalEstimatedCost - a.totalEstimatedCost);
  }

  return {
    calculateMetrics,
    getSupplierSummaries
  };
})();
