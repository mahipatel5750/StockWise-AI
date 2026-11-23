/**
 * StockWise AI - Storage & Data Persistence Module
 * Manages LocalStorage, initial sample data, schema migration, and data export/import.
 */

const Storage = (() => {
  const STORAGE_KEYS = {
    INVENTORY: 'stockwise_inventory',
    SALES: 'stockwise_sales',
    SETTINGS: 'stockwise_settings'
  };

  // 16 Initial Sample Products
  const DEFAULT_INVENTORY = [
    {
      id: "PRD-001",
      name: "Sunscreen SPF 50",
      category: "Personal Care",
      currentStock: 8,
      unitPrice: 18.50,
      supplier: "GlowCare Labs",
      leadTime: 5,
      safetyStock: 5
    },
    {
      id: "PRD-002",
      name: "Wireless Bluetooth Earbuds",
      category: "Electronics",
      currentStock: 0,
      unitPrice: 49.99,
      supplier: "Apex Tech Direct",
      leadTime: 7,
      safetyStock: 10
    },
    {
      id: "PRD-003",
      name: "Organic Green Tea (100 bags)",
      category: "Groceries",
      currentStock: 45,
      unitPrice: 12.00,
      supplier: "NatureHarvest Organics",
      leadTime: 5,
      safetyStock: 10
    },
    {
      id: "PRD-004",
      name: "USB-C Fast Charging Cable",
      category: "Electronics",
      currentStock: 12,
      unitPrice: 9.99,
      supplier: "Apex Tech Direct",
      leadTime: 4,
      safetyStock: 8
    },
    {
      id: "PRD-005",
      name: "Hydrating Facial Cleanser",
      category: "Personal Care",
      currentStock: 6,
      unitPrice: 22.00,
      supplier: "GlowCare Labs",
      leadTime: 6,
      safetyStock: 6
    },
    {
      id: "PRD-006",
      name: "Ceramic Coffee Mug Set",
      category: "Home & Kitchen",
      currentStock: 0,
      unitPrice: 24.50,
      supplier: "UrbanComfort Goods",
      leadTime: 10,
      safetyStock: 4
    },
    {
      id: "PRD-007",
      name: "Stainless Steel Water Bottle (1L)",
      category: "Home & Kitchen",
      currentStock: 60,
      unitPrice: 19.99,
      supplier: "EcoLiving Co.",
      leadTime: 7,
      safetyStock: 12
    },
    {
      id: "PRD-008",
      name: "Ergonomic Memory Foam Pillow",
      category: "Home & Kitchen",
      currentStock: 5,
      unitPrice: 34.00,
      supplier: "UrbanComfort Goods",
      leadTime: 8,
      safetyStock: 4
    },
    {
      id: "PRD-009",
      name: "Smart Fitness Tracker",
      category: "Electronics",
      currentStock: 35,
      unitPrice: 59.99,
      supplier: "Apex Tech Direct",
      leadTime: 10,
      safetyStock: 8
    },
    {
      id: "PRD-010",
      name: "Lavender Essential Oil (30ml)",
      category: "Personal Care",
      currentStock: 50,
      unitPrice: 14.50,
      supplier: "NatureHarvest Organics",
      leadTime: 6,
      safetyStock: 6
    },
    {
      id: "PRD-011",
      name: "Cotton Crewneck T-Shirt",
      category: "Apparel",
      currentStock: 80,
      unitPrice: 16.00,
      supplier: "TrendWeave Apparel",
      leadTime: 7,
      safetyStock: 15
    },
    {
      id: "PRD-012",
      name: "Noise-Cancelling Headphones",
      category: "Electronics",
      currentStock: 25,
      unitPrice: 129.99,
      supplier: "Apex Tech Direct",
      leadTime: 12,
      safetyStock: 5
    },
    {
      id: "PRD-013",
      name: "Bamboo Cutting Board Set",
      category: "Home & Kitchen",
      currentStock: 40,
      unitPrice: 27.50,
      supplier: "EcoLiving Co.",
      leadTime: 5,
      safetyStock: 6
    },
    {
      id: "PRD-014",
      name: "Vitamin C Serum (30ml)",
      category: "Personal Care",
      currentStock: 55,
      unitPrice: 24.00,
      supplier: "GlowCare Labs",
      leadTime: 5,
      safetyStock: 8
    },
    {
      id: "PRD-015",
      name: "Portable Power Bank 20000mAh",
      category: "Electronics",
      currentStock: 38,
      unitPrice: 39.99,
      supplier: "Apex Tech Direct",
      leadTime: 8,
      safetyStock: 8
    },
    {
      id: "PRD-016",
      name: "Organic Wildflower Honey (500g)",
      category: "Groceries",
      currentStock: 70,
      unitPrice: 11.50,
      supplier: "NatureHarvest Organics",
      leadTime: 4,
      safetyStock: 10
    }
  ];

  const DEFAULT_SETTINGS = {
    targetCoverageDays: 10,
    analysisDays: 30,
    theme: 'dark',
    geminiBackendUrl: ''
  };

  /**
   * Generates default realistic 30-day sales data calibrated to exact velocity requirements
   */
  function generateDefaultSales() {
    const targets = {
      "PRD-001": 90,   // Sunscreen: exact 90 sold in 30 days = avg 3.0/day
      "PRD-002": 120,  // Earbuds: 120 / 30 = 4.0/day
      "PRD-003": 60,   // Green Tea: 60 / 30 = 2.0/day
      "PRD-004": 150,  // USB-C: 150 / 30 = 5.0/day
      "PRD-005": 75,   // Cleanser: 75 / 30 = 2.5/day
      "PRD-006": 60,   // Coffee Mug: 60 / 30 = 2.0/day
      "PRD-007": 90,   // Water Bottle: 90 / 30 = 3.0/day
      "PRD-008": 54,   // Pillow: 54 / 30 = 1.8/day
      "PRD-009": 45,   // Tracker: 45 / 30 = 1.5/day
      "PRD-010": 36,   // Lavender Oil: 36 / 30 = 1.2/day
      "PRD-011": 120,  // T-Shirt: 120 / 30 = 4.0/day
      "PRD-012": 24,   // Headphones: 24 / 30 = 0.8/day
      "PRD-013": 30,   // Cutting Board: 30 / 30 = 1.0/day
      "PRD-014": 66,   // Vitamin C: 66 / 30 = 2.2/day
      "PRD-015": 48,   // Power Bank: 48 / 30 = 1.6/day
      "PRD-016": 72    // Honey: 72 / 30 = 2.4/day
    };

    const sales = [];
    const prodMap = {};
    DEFAULT_INVENTORY.forEach(p => prodMap[p.id] = p);

    const now = new Date();
    let txnId = 1001;

    Object.keys(targets).forEach(pid => {
      const prod = prodMap[pid];
      const totalUnits = targets[pid];
      
      // Seed distribution across 30 days
      const days = 30;
      const baseUnitsPerDay = Math.floor(totalUnits / days);
      let remainder = totalUnits - (baseUnitsPerDay * days);

      for (let d = days - 1; d >= 0; d--) {
        const txDate = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
        let units = baseUnitsPerDay;
        if (remainder > 0 && Math.random() > 0.4) {
          units += 1;
          remainder--;
        }
        if (d === 0 && remainder > 0) {
          units += remainder;
          remainder = 0;
        }

        if (units > 0) {
          sales.push({
            transactionId: `TXN-${txnId++}`,
            date: txDate.toISOString().split('T')[0],
            productId: pid,
            productName: prod.name,
            category: prod.category,
            unitsSold: units,
            unitPrice: prod.unitPrice,
            totalRevenue: Math.round(units * prod.unitPrice * 100) / 100
          });
        }
      }
    });

    sales.sort((a, b) => a.date.localeCompare(b.date));
    return sales;
  }

  // Initialization check
  function init() {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(DEFAULT_INVENTORY));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(generateDefaultSales()));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }
    } catch (e) {
      console.warn('LocalStorage unavailable or restricted:', e);
    }
  }

  // Run initialization
  init();

  return {
    getInventory() {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
        if (data) return JSON.parse(data);
      } catch (e) {
        console.error('Error reading inventory from LocalStorage:', e);
      }
      return JSON.parse(JSON.stringify(DEFAULT_INVENTORY));
    },

    saveInventory(inventory) {
      try {
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
        return true;
      } catch (e) {
        console.error('Error saving inventory:', e);
        return false;
      }
    },

    addProduct(product) {
      const inventory = this.getInventory();
      // ID check
      if (inventory.some(p => p.id.toUpperCase() === product.id.toUpperCase())) {
        throw new Error(`Product with ID "${product.id}" already exists.`);
      }
      inventory.push(product);
      this.saveInventory(inventory);
      return inventory;
    },

    updateProduct(product) {
      const inventory = this.getInventory();
      const index = inventory.findIndex(p => p.id === product.id);
      if (index === -1) {
        throw new Error(`Product with ID "${product.id}" not found.`);
      }
      inventory[index] = { ...inventory[index], ...product };
      this.saveInventory(inventory);
      return inventory;
    },

    deleteProduct(productId) {
      let inventory = this.getInventory();
      const beforeLen = inventory.length;
      inventory = inventory.filter(p => p.id !== productId);
      if (inventory.length === beforeLen) {
        throw new Error(`Product with ID "${productId}" not found.`);
      }
      this.saveInventory(inventory);
      return inventory;
    },

    getSales() {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.SALES);
        if (data) return JSON.parse(data);
      } catch (e) {
        console.error('Error reading sales from LocalStorage:', e);
      }
      return generateDefaultSales();
    },

    saveSales(sales) {
      try {
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
        return true;
      } catch (e) {
        console.error('Error saving sales:', e);
        return false;
      }
    },

    addSale(sale) {
      const sales = this.getSales();
      if (!sale.transactionId) {
        sale.transactionId = `TXN-${Date.now()}`;
      }
      sales.push(sale);
      this.saveSales(sales);
      return sales;
    },

    getSettings() {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      } catch (e) {
        console.error('Error reading settings:', e);
      }
      return { ...DEFAULT_SETTINGS };
    },

    saveSettings(settings) {
      try {
        const current = this.getSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
        return updated;
      } catch (e) {
        console.error('Error saving settings:', e);
        return DEFAULT_SETTINGS;
      }
    },

    resetToDefault() {
      try {
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(DEFAULT_INVENTORY));
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(generateDefaultSales()));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        return true;
      } catch (e) {
        console.error('Error resetting default data:', e);
        return false;
      }
    },

    // CSV and Data Helper Functions
    exportToCSV(filename, rows) {
      if (!rows || !rows.length) return;
      const separator = ',';
      const keys = Object.keys(rows[0]);
      const csvContent =
        keys.join(separator) +
        '\n' +
        rows.map(row => {
          return keys.map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          }).join(separator);
        }).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    exportToExcel(filename, sheetsData) {
      if (typeof XLSX === 'undefined') {
        throw new Error('SheetJS (XLSX) library is not loaded. Cannot export Excel.');
      }
      const wb = XLSX.utils.book_new();
      Object.keys(sheetsData).forEach(sheetName => {
        const ws = XLSX.utils.json_to_sheet(sheetsData[sheetName]);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });
      XLSX.writeFile(wb, filename);
    },

    parseCSV(text) {
      const lines = text.trim().split(/\r\n|\n/);
      if (lines.length < 2) throw new Error("CSV file does not contain enough data.");

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const records = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple regex to parse CSV with potential quotes
        const values = [];
        let inQuotes = false;
        let currentValue = '';

        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === '"' && (c === 0 || line[c - 1] !== '\\')) {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(currentValue.trim().replace(/^"|"$/g, ''));
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.trim().replace(/^"|"$/g, ''));

        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = values[idx] !== undefined ? values[idx] : '';
        });
        records.push(obj);
      }
      return records;
    }
  };
})();
