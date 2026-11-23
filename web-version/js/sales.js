/**
 * StockWise AI - Sales Analytics Module
 * Analyzes transaction histories, computes sales velocity, categorizes fast/slow moving SKUs,
 * and formats data structures for Chart.js visualizations.
 */

const SalesAnalytics = (() => {
  /**
   * Calculates overall sales metrics
   * @param {Array} sales 
   * @param {Number} analysisDays 
   */
  function getOverallMetrics(sales, analysisDays = 30) {
    let totalUnits = 0;
    let totalRevenue = 0;

    sales.forEach(s => {
      totalUnits += Number(s.unitsSold || 0);
      totalRevenue += Number(s.totalRevenue || (s.unitsSold * s.unitPrice) || 0);
    });

    const avgDailySales = analysisDays > 0 ? (totalUnits / analysisDays) : 0;
    const avgOrderValue = sales.length > 0 ? (totalRevenue / sales.length) : 0;

    return {
      totalUnits,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgDailySales: Math.round(avgDailySales * 10) / 10,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      totalTransactions: sales.length
    };
  }

  /**
   * Aggregates sales by product and determines velocity classification
   * @param {Array} sales 
   * @param {Number} analysisDays 
   * @returns {Object} { productList, fastMoving, slowMoving }
   */
  function getProductSalesAnalysis(sales, analysisDays = 30) {
    const map = {};

    sales.forEach(s => {
      const pid = s.productId;
      if (!map[pid]) {
        map[pid] = {
          productId: pid,
          productName: s.productName,
          category: s.category,
          totalUnitsSold: 0,
          totalRevenue: 0,
          unitPrice: s.unitPrice
        };
      }
      map[pid].totalUnitsSold += Number(s.unitsSold || 0);
      map[pid].totalRevenue += Number(s.totalRevenue || (s.unitsSold * s.unitPrice) || 0);
    });

    const list = Object.values(map).map(p => {
      const dailyVelocity = Math.round((p.totalUnitsSold / analysisDays) * 100) / 100;
      return {
        ...p,
        dailyVelocity,
        totalRevenue: Math.round(p.totalRevenue * 100) / 100
      };
    });

    // Sort by units sold descending
    list.sort((a, b) => b.totalUnitsSold - a.totalUnitsSold);

    // Fast moving: top 25% by velocity (or dailyVelocity >= 2.5)
    // Slow moving: bottom 25% by velocity (or dailyVelocity <= 1.2)
    const thresholdFast = 2.5;
    const thresholdSlow = 1.2;

    const fastMoving = list.filter(p => p.dailyVelocity >= thresholdFast);
    const slowMoving = list.filter(p => p.dailyVelocity <= thresholdSlow);

    return {
      all: list,
      fastMoving,
      slowMoving
    };
  }

  /**
   * Aggregates sales revenue and units by Category
   */
  function getCategorySalesAnalysis(sales) {
    const catMap = {};

    sales.forEach(s => {
      const cat = s.category || "Uncategorized";
      if (!catMap[cat]) {
        catMap[cat] = {
          category: cat,
          unitsSold: 0,
          revenue: 0
        };
      }
      catMap[cat].unitsSold += Number(s.unitsSold || 0);
      catMap[cat].revenue += Number(s.totalRevenue || (s.unitsSold * s.unitPrice) || 0);
    });

    const list = Object.values(catMap).map(c => ({
      ...c,
      revenue: Math.round(c.revenue * 100) / 100
    }));

    list.sort((a, b) => b.revenue - a.revenue);
    return list;
  }

  /**
   * Generates chronological daily sales trend data for Chart.js
   * @param {Array} sales 
   * @returns {Object} { labels, revenues, units }
   */
  function getSalesTrendData(sales) {
    const dayMap = {};

    sales.forEach(s => {
      const d = s.date;
      if (!d) return;
      if (!dayMap[d]) {
        dayMap[d] = { revenue: 0, units: 0 };
      }
      dayMap[d].revenue += Number(s.totalRevenue || (s.unitsSold * s.unitPrice) || 0);
      dayMap[d].units += Number(s.unitsSold || 0);
    });

    const dates = Object.keys(dayMap).sort();
    const labels = [];
    const revenues = [];
    const units = [];

    dates.forEach(d => {
      // Format MM/DD
      const parts = d.split('-');
      const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : d;
      labels.push(label);
      revenues.push(Math.round(dayMap[d].revenue * 100) / 100);
      units.push(dayMap[d].units);
    });

    return { labels, revenues, units };
  }

  return {
    getOverallMetrics,
    getProductSalesAnalysis,
    getCategorySalesAnalysis,
    getSalesTrendData
  };
})();
