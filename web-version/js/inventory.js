/**
 * StockWise AI - Inventory Management Module
 * Handles product listing, searching, filtering, sorting, adding, editing, and deleting.
 */

const InventoryManager = (() => {
  let currentSort = { column: 'id', direction: 'asc' };
  let currentFilter = { category: 'all', status: 'all', search: '' };

  /**
   * Validates product input fields
   * @param {Object} product 
   * @param {Boolean} isEdit 
   * @returns {Array} Array of error messages (empty if valid)
   */
  function validateProduct(product, isEdit = false) {
    const errors = [];

    if (!product.id || !product.id.trim()) {
      errors.push("Product ID is required (e.g., PRD-017).");
    }

    if (!product.name || !product.name.trim()) {
      errors.push("Product Name is required.");
    }

    if (!product.category || !product.category.trim()) {
      errors.push("Category is required.");
    }

    if (isNaN(product.currentStock) || product.currentStock < 0) {
      errors.push("Current Stock must be a non-negative number.");
    }

    if (isNaN(product.unitPrice) || product.unitPrice <= 0) {
      errors.push("Unit Price must be a positive number.");
    }

    if (!product.supplier || !product.supplier.trim()) {
      errors.push("Supplier name is required.");
    }

    if (isNaN(product.leadTime) || product.leadTime < 1) {
      errors.push("Lead Time must be at least 1 day.");
    }

    if (isNaN(product.safetyStock) || product.safetyStock < 0) {
      errors.push("Safety Stock must be a non-negative number.");
    }

    // Check duplicate ID if adding new
    if (!isEdit) {
      const inventory = Storage.getInventory();
      if (inventory.some(p => p.id.toUpperCase() === product.id.trim().toUpperCase())) {
        errors.push(`Product ID "${product.id.trim()}" is already in use.`);
      }
    }

    return errors;
  }

  /**
   * Returns list of unique categories
   */
  function getCategories() {
    const inventory = Storage.getInventory();
    const set = new Set(inventory.map(p => p.category).filter(Boolean));
    return Array.from(set).sort();
  }

  /**
   * Filters and sorts inventory items
   */
  function getProcessedInventory(calculatedProducts) {
    let list = [...calculatedProducts];

    // Search filter
    if (currentFilter.search) {
      const q = currentFilter.search.toLowerCase().trim();
      list = list.filter(p => 
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (currentFilter.category && currentFilter.category !== 'all') {
      list = list.filter(p => p.category === currentFilter.category);
    }

    // Status filter
    if (currentFilter.status && currentFilter.status !== 'all') {
      list = list.filter(p => p.status === currentFilter.status);
    }

    // Sorting
    list.sort((a, b) => {
      let valA = a[currentSort.column];
      let valB = b[currentSort.column];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
      if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }

  function setSort(column) {
    if (currentSort.column === column) {
      currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      currentSort.column = column;
      currentSort.direction = 'asc';
    }
  }

  function setFilter(key, value) {
    currentFilter[key] = value;
  }

  function getFilter() {
    return { ...currentFilter };
  }

  function getSort() {
    return { ...currentSort };
  }

  return {
    validateProduct,
    getCategories,
    getProcessedInventory,
    setSort,
    setFilter,
    getFilter,
    getSort
  };
})();
