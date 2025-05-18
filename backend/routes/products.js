const express = require('express');
const { Op } = require('sequelize');     // ← NEW  (for LIKE / iLike queries)
const router  = express.Router();
const Product = require('../models/product');

/**
 * GET /api/products
 * Optional query params:
 *   ?featured=true        → featured items only
 *   ?q=laptop             → case-insensitive search (name or description)
 *   ?category=Keyboards   → exact category match
 */
router.get('/', async (req, res) => {
  try {
    const { featured, q, category } = req.query;
    const where = {};

    if (featured === 'true') where.featured = true;
    if (category)            where.category = category;

    if (q) {
      const likeOp = Product.sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;
      where[Op.or] = [
        { name:        { [likeOp]: `%${q}%` } },
        { description: { [likeOp]: `%${q}%` } },
      ];
    }

    const products = await Product.findAll({ where });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

/* ---------- SINGLE ITEM ---------- */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    product ? res.json(product)
            : res.status(404).json({ message: 'Product Not Found' });
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});

/* ---------- CREATE ---------- */
router.post('/', async (req, res) => {
  try {
    const { name, description, price, imageUrl, featured = false, category = null } = req.body;
    const newProduct = await Product.create({ name, description, price, imageUrl, featured, category });
    res.status(201).json(newProduct);
  } catch {
    res.status(400).json({ message: 'Bad Request' });
  }
});

/* ---------- UPDATE ---------- */
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, imageUrl, featured, category } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product Not Found' });

    // only update fields that were provided
    Object.assign(product, {
      name:        name        ?? product.name,
      description: description ?? product.description,
      price:       price       ?? product.price,
      imageUrl:    imageUrl    ?? product.imageUrl,
      featured:    featured    ?? product.featured,
      category:    category    ?? product.category,
    });
    await product.save();
    res.json(product);
  } catch {
    res.status(400).json({ message: 'Bad Request' });
  }
});

/* ---------- DELETE ---------- */
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product Not Found' });

    await product.destroy();
    res.json({ message: 'Product Deleted' });
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
