// --- ESTADO Y REFERENCIAS ---
let carrito = JSON.parse(localStorage.getItem('miCarrito')) || [];
const btnComprar = document.getElementById('btnComprar');
const cartTrigger = document.getElementById('cartTrigger');
const cartDropdown = document.getElementById('cartDropdown');
const container = document.getElementById('cartItemsContainer');
const countLabel = document.getElementById('cartCount');
const contenedorProductos = document.getElementById('contenedorProductos');

// --- CARGA DINAMICA DE PRODUCTOS ---

// FUNCION PARA CARGAS LOS PRODUCTOS 
async function cargarProductos() {
    try {
        const respuesta = await fetch('productos.json');
        const productos = await respuesta.json();
        renderizarCards(productos);
    } catch (error) {
        console.error("Error cargando los productos:", error);
        if(contenedorProductos) {
            contenedorProductos.innerHTML += "<p>Error al cargar el catalogo de productos.</p>";
        }
    }
}

// Funcion para generar el html de las cards
function renderizarCards(lista) {
    if (!contenedorProductos) return;

    contenedorProductos.innerHTML = '<h2>Productos disponibles</h2>';
    
    lista.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'card-product';
    
        card.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <button class="btn-add"
                data-id="${producto.id}"
                data-nombre="${producto.nombre}"
                data-img="${producto.imagen}">
                Agregar al carrito
            </button>
        `;
        contenedorProductos.appendChild(card);
    });
    asignarEventosBotones();
}

function asignarEventosBotones() {
    const botonesNuevos = document.querySelectorAll('.btn-add');
    botonesNuevos.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-add');
            const nuevoProducto = {
                id: button.getAttribute('data-id'),
                nombre: button.getAttribute('data-nombre'),
                img: button.getAttribute('data-img')
            };
            agregarAlCarrito(nuevoProducto);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    renderCarrito();
});

cartTrigger.addEventListener('click', () => {
    const isVisible = cartDropdown.style.display === 'flex';
    if (!isVisible) {
        cartDropdown.style.display = 'flex';
        if (window.innerWidth <= 768) {
            document.body.style.overflow = 'hidden';
        }
    } else {
        cartDropdown.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

const closeCart = document.getElementById('closeCart');
if (closeCart) {
    closeCart.addEventListener('click', () => {
        cartDropdown.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

window.addEventListener('click', (e) => {
    if (cartDropdown.style.display === 'flex' &&
        !cartDropdown.contains(e.target) &&
        !cartTrigger.contains(e.target)) {
            cartDropdown.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
});

function mostrarAviso(mensaje) {
    const containerToast = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = mensaje;
    containerToast.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 6000);
}

function agregarAlCarrito(producto) {
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
        mostrarAviso(`⚠️ El producto "${producto.nombre}" ya está en tu carrito.`);
    } else {
        carrito.push(producto);
        renderCarrito();
        mostrarAviso(`✅ ${producto.nombre} agregado con éxito`);
    }
}

function renderCarrito() {
    localStorage.setItem('miCarrito', JSON.stringify(carrito));
    countLabel.innerText = carrito.length;

    if (carrito.length === 0) {
        container.innerHTML = '<p class="empty-msg">El carrito esta vacio</p>';
        return;    
    }
    container.innerHTML = carrito.map((prod, index) => `
    <div class="cart-product">
        <img src="${prod.img}" alt="${prod.nombre}">
        <h3>${prod.nombre}</h3>
        <button class="btn-remove" onclick="eliminarDelCarrito(${index})">X</button>
    </div>
    `).join('');
}

window.eliminarDelCarrito = function(index) {
    carrito.splice(index, 1);
    renderCarrito();
};

const numeroWhatsApp = "573107843769";

if(btnComprar) {
    btnComprar.addEventListener('click', () => {
        if (carrito.length === 0) {
            mostrarAviso("❌ No puedes enviar una cotización vacía.")
            return;
        }
        let mensaje = "Hola me gustaria cotizar los siguientes productos de su catalogo: \n\n";
        carrito.forEach((prod, index) => {
            mensaje += `${index + 1}. ${prod.nombre}\n`;
        });
        mensaje += "\nQuedo atento a su respuesta. Gracias.";

        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');

        carrito = [];
        localStorage.removeItem('miCarrito');
        renderCarrito();
        cartDropdown.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}