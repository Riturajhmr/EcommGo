const Product = require('../models/Product');

// GET /api/products - Get all products (5-10 mock items)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    
    // If no products exist, seed some mock products
    if (products.length === 0) {
      const mockProducts = [
        { product_name: 'Wireless Headphones', price: 299, category: 'Audio', rating: 4.5, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
        { product_name: 'Smart Watch', price: 199, category: 'Wearables', rating: 4.8, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
        { product_name: 'Gaming Monitor', price: 449, category: 'Electronics', rating: 4.7, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400' },
        { product_name: 'Wireless Mouse', price: 89, category: 'Gaming', rating: 4.6, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400' },
        { product_name: 'Bluetooth Speaker', price: 129, category: 'Audio', rating: 4.5, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400' },
        { product_name: 'Mechanical Keyboard', price: 159, category: 'Gaming', rating: 4.4, image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400' },
        { product_name: 'USB-C Hub', price: 79, category: 'Accessories', rating: 4.3, image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400' },
        { product_name: 'Laptop Stand', price: 49, category: 'Accessories', rating: 4.2, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400' }
      ];

      for (const prod of mockProducts) {
        prod.product_id = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await Product.create(prod);
      }

      const newProducts = await Product.find({});
      return res.json(newProducts);
    }

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// GET /api/products/search?name=query
exports.searchProducts = async (req, res) => {
  try {
    const query = req.query.name;
    if (!query) {
      return res.status(400).json({ Error: 'Invalid Search Index' });
    }

    const products = await Product.find({
      product_name: { $regex: query, $options: 'i' }
    });

    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
};

