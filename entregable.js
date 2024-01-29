// Se creará una instancia de la clase “ProductManager”
// Se llamará “getProducts” recién creada la instancia, debe devolver un arreglo vacío []
// Se llamará al método “addProduct” con los campos:
// title: “producto prueba”
// description:”Este es un producto prueba”
// price:200,
// thumbnail:”Sin imagen”
// code:”abc123”,
// stock:25
// El objeto debe agregarse satisfactoriamente con un id generado automáticamente SIN REPETIRSE
// Se llamará el método “getProducts” nuevamente, esta vez debe aparecer el producto recién agregado
// Se llamará al método “getProductById” y se corroborará que devuelva el producto con el id especificado, en caso de no existir, debe arrojar un error.
// Se llamará al método “updateProduct” y se intentará cambiar un campo de algún producto, se evaluará que no se elimine el id y que sí se haya hecho la actualización.
// Se llamará al método “deleteProduct”, se evaluará que realmente se elimine el producto o que arroje un error en caso de no existir.
const fs = require('fs');

class ProductManager {
  constructor(pathFile, nameFile) {
    this.products = [];
    this.idCounter = 1;
    this.fileName = nameFile;
    this.pathFile = pathFile;

    // Verificar si la carpeta existe o crearla
    if (!fs.existsSync(pathFile)) {
      fs.mkdirSync(pathFile, { recursive: true });
    }

    this.fullPath = this.pathFile + this.fileName;
    this.loadFromFile(); // Cargar productos desde el archivo al inicializar
  }

  getProductById(id) {
    const product = this.products.find((product) => product.id === id);

    if (product) {
      const { title, description, price, thumbnail, code, stock } = product;
      return `Id=${id}, title=${title}, description=${description}, price=${price}, thumbnail=${thumbnail}, code=${code}, stock=${stock}`;
    } else {
      return "error - Id not found";
    }
  }

  getProducts() {
    return this.products;
  }

  async addProduct(title, description, price, thumbnail, code, stock) {
    // Verificar si se proporcionan todas las variables necesarias
    if (!title || !description || !price || !thumbnail || !code || stock === undefined) {
      throw new Error("error - Missing required variables");
    }

    // Verificar si el código del producto ya existe
    const existingProduct = this.products.find((product) => product.code === code);
    if (existingProduct) {
      throw new Error("error - Product code already exists");
    }

    let id = this.idCounter;

    const newProduct = {
      id,
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
    };

    this.products.push(newProduct);
    this.idCounter++;

    await this.saveToFile(); // Guardar los productos en el archivo después de agregar uno nuevo
  }

  async removeProductById(id) {
    this.products = this.products.filter((product) => product.id !== id);
    await this.saveToFile(); // Guardar los productos en el archivo después de eliminar uno
  }

  async editProductById(id, newProductData) {
    const index = this.products.findIndex((product) => product.id === id);

    if (index !== -1) {
      // Actualizar los datos del producto con los nuevos datos proporcionados
      this.products[index] = { ...this.products[index], ...newProductData };
      await this.saveToFile(); // Guardar los productos en el archivo después de editar uno
    } else {
      throw new Error("error - Id not found");
    }
  }

  async loadFromFile() {
    try {
      if (fs.existsSync(this.fullPath)) {
        const data = await fs.promises.readFile(this.fullPath, 'utf-8');
        this.products = data.split('\n')
          .filter(line => line.trim() !== '')
          .map(JSON.parse);
        this.idCounter = Math.max(...this.products.map((product) => product.id), 0) + 1;
      } else {
        console.log('File not found. Creating a new file.');
        await this.saveToFile(); // Crear un nuevo archivo si no existe
      }
    } catch (error) {
      console.error('Error loading from file:', error);
    }
  }

  async saveToFile() {
    try {
      const data = this.products.map(JSON.stringify).join('\n');
      await fs.promises.writeFile(this.fullPath, data, 'utf-8');
    } catch (error) {
      console.error('Error saving to file:', error);
    }
  }
}

// Ejemplo de uso:
const productManager = new ProductManager('./data/', 'productos.txt');
productManager.addProduct('Producto1', 'Descripción1', 20.5, 'thumbnail1', 'code1', 100);
productManager.addProduct('Producto2', 'Descripción2', 15.2, 'thumbnail2', 'code2', 50);
console.log(productManager.getProducts());
productManager.editProductById(1, { price: 25.5, stock: 90 });
console.log(productManager.getProducts());
productManager.removeProductById(2);
console.log(productManager.getProducts());