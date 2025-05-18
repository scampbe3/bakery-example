// backend/models/product.js
const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

/**
 * Product model ─ one table row per catalogue item
 *
 * quantity  ▸ current inventory count   (added for low-stock alerts)
 * featured  ▸ true shows up in the homepage carousel
 * category  ▸ used by the filter pills
 */
const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
  },

  /* existing flags */
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  category: { type: DataTypes.STRING },

  /* ─────────── NEW FIELD ─────────── */
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 20,          // seed value if none supplied
  },
});

module.exports = Product;
