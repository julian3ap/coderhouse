const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(express.json());

const productsFilePath = path.join(__dirname, 'data', 'productos.txt');

app.get('/products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || undefined;
    const data = await fs.readFile(productsFilePath, 'utf-8');
    const products = data.split('\n').filter(line => line.trim() !== '').map(JSON.parse);
    
    if (limit) {
      res.json(products.slice(0, limit));
    } else {
      res.json(products);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await fs.readFile(productsFilePath, 'utf-8');
    const products = data.split('\n').filter(line => line.trim() !== '').map(JSON.parse);
    
    const product = products.find(product => product.id === id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});