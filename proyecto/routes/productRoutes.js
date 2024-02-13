const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const productsFilePath = path.join(__dirname, '..', 'data', 'productos.json');

// Obtener todos los productos
router.get('/', (req, res) => {
  fs.readFile(productsFilePath, 'utf-8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const products = JSON.parse(data);
    res.json(products);
  });
});

// Obtener un producto por su ID
router.get('/:id', (req, res) => {
  const productId = req.params.id;
  fs.readFile(productsFilePath, 'utf-8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const products = JSON.parse(data);
    const product = products.find(product => product.id === productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  });
});

// Crear un nuevo producto
router.post('/', (req, res) => {
  const newProduct = req.body;
  fs.readFile(productsFilePath, 'utf-8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const products = JSON.parse(data);
    newProduct.id = generateId(products); // Función para generar un nuevo ID único
    products.push(newProduct);
    fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.status(201).json(newProduct);
    });
  });
});

// Actualizar un producto por su ID
router.put('/:id', (req, res) => {
  const productId = req.params.id;
  const updatedProduct = req.body;
  fs.readFile(productsFilePath, 'utf-8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    let products = JSON.parse(data);
    const index = products.findIndex(product => product.id === productId);
    if (index === -1) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    products[index] = { ...products[index], ...updatedProduct };
    fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(products[index]);
    });
  });
});

// Eliminar un producto por su ID
router.delete('/:id', (req, res) => {
  const productId = req.params.id;
  fs.readFile(productsFilePath, 'utf-8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    let products = JSON.parse(data);
    const index = products.findIndex(product => product.id === productId);
    if (index === -1) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const deletedProduct = products.splice(index, 1)[0];
    fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(deletedProduct);
    });
  });
});

// Función para generar un nuevo ID único
function generateId(products) {
  const maxId = products.reduce((max, product) => (product.id > max ? product.id : max), 0);
  return maxId + 1;
}

module.exports = router;