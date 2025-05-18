const router  = require('express').Router();
const Product = require('../models/product');

/* GET /api/inventory → all products with qty */
router.get('/inventory', async (_req, res)=>{
  const list = await Product.findAll({ attributes:['id','name','price','quantity'] });
  res.json(list);
});

/* PUT /api/inventory/:id  { quantity } */
router.put('/inventory/:id', async (req, res)=>{
  const { quantity } = req.body;
  const p = await Product.findByPk(req.params.id);
  if(!p) return res.status(404).json({message:'Product not found'});
  p.quantity = Math.max(0, parseInt(quantity,10)||0);
  await p.save();
  res.json({success:true});
});

module.exports = router;
