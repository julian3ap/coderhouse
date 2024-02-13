const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const cartsFilePath = path.join(__dirname, '..', 'data', 'carritos.json');

// Crear un nuevo carrito vacío
router.post('/', (req, res) => {
  const newCart = { id: generateId(), products: [] };
  fs.readFile(cartsFilePath, 'utf-8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const carts = JSON.parse(data);
    carts.push(newCart);
    fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2), (err) => {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.status(201).json(newCart);
    });
  });
});

// Obtener un carrito por su ID
router.get('/:id', (req, res) => {
  const cartId = req.params.id;
  fs.readFile(cartsFilePath, 'utf-8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const carts = JSON.parse(data);
    const cart = carts.find(cart => cart.id === cartId);
    if (!cart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }
    res.json(cart);
  });
});

// Agregar un producto a un carrito por su ID
router.post('/:id/products/:productId', (req, res) => {
  const cartId = req.params.id;
  const productId = req.params.productId;
  fs.readFile(cartsFilePath, 'utf-8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    let carts = JSON.parse(data);
    const index = carts.findIndex(cart => cart.id === cartId);
    if (index === -1) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }
    carts[index].products.push(productId);
    fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2), (err) => {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(carts[index]);
    });
  });
});

// Eliminar un producto de un carrito por su ID
router.delete('/:id/products/:productId', (req, res) => {
  const cartId = req.params.id;
  const productId = req.params.productId;
  fs.readFile(cartsFilePath, 'utf-8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    let carts = JSON.parse(data);
    const index = carts.findIndex(cart => cart.id === cartId);
    if (index === -1) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }
    const productIndex = carts[index].products.indexOf(productId);
    if (productIndex === -1) {
      res.status(404).json({ error: 'Product not found in cart' });
      return;
    }
    carts[index].products.splice(productIndex, 1);
    fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2), (err) => {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(carts[index]);
    });
  });
});

// Función para generar un nuevo ID único
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

module.exports = router;