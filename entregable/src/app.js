import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import { Server } from 'socket.io';
import ProductsManager from './managers/products"';

const app = express();
// puerto en el que se levanta el proyectoo
const PORT = 9090;

// instancia del product manager
const productsManager = new ProductsManager();

// se inicia la conexion con el servidor
const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${server.address().port}`);
});

// listen de errores
server.on("error", error => console.log(`Server error: ${error}`));

// se inicializa el webSocket y se le envia la conexion del servidor
const socketServer = new Server(server);

// Endpoint home
app.get("/", async (req, res) => {
    const id = req.params.id;
    const limit = req.query.limit;
    try {
        if (!!id) { // Doble admiracion para verificar el valor de la variable coomo booleano 
            // se retorna solo un producto en case de recibir un id
            res.send(await productsManager.getProductById(id));
        } else {
            // se renderiza la vista index con todos los porductos o un limite
            return res.render("index", { products: await productsManager.getAllProducts(limit) });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: -1, description: "Error fetching products" });
    }
});

// se renderiza la vista realtimeproducts
app.get("/realtimeproducts", async (req, res) => {
    return res.render("realtimeproducts");
});

// manejo de utilidades de WebSocket
socketServer.on('connection', (socket) => {
    console.log('User connected');
  
    socket.on('new-product', async (product) => {
        console.log('New product:', product);
        await productsManager.saveProduct(product);
        socket.emit('new-product-list', await productsManager.getAllProducts());
    });
  
    socket.on('delete-product', (productId) => {
        console.log('Delete product:', productId);
    });
  
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.engine("hbs", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "hbs");
app.use(express.static('public'));

// app.use('/static', express.static(__dirname + '/public'));
app.use(express.json());