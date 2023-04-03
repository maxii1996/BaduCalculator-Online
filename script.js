document.getElementById('agregarProducto').addEventListener('click', agregarProducto);
document.getElementById('facturar').addEventListener('click', facturar);
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    mostrarOcultarBotonFacturar();
});
document.getElementById('buscarProducto').addEventListener('input', filtrarProductos);
document.getElementById('siguienteCliente').addEventListener('click', siguienteCliente);

let productoId = 0;

function agregarProducto() {
    const nombreProducto = document.getElementById('nombreProducto').value;
    const precio = document.getElementById('precio').value;

    if (esProductoDuplicado(nombreProducto)) {
        alert('No se pueden agregar productos con el mismo nombre.');
        return;
    }

  
    if (precio == 0 || precio <= 0) {
        alert('No se pueden agregar productos con precio 0 o menor.');
        return;
    }

    const listaProductos = document.getElementById('listaProductos');
    const nuevoProducto = document.createElement('div');
    nuevoProducto.innerHTML = document.getElementById('productoTemplate').innerHTML.replace(/{id}/g, productoId).replace('{nombreProducto}', nombreProducto).replace('{precio}', precio);
    nuevoProducto.querySelector('.editarProducto').addEventListener('click', editarProducto);
    
   const listItem = nuevoProducto.querySelector(".inner-product");
    if (listItem) {
      listItem.className += productoId % 2 === 0 ? ' par' : ' impar';
    }
    listaProductos.appendChild(nuevoProducto);
    productoId++;
    mostrarOcultarBotonFacturar();
  
    document.getElementById('nombreProducto').value = '';
    document.getElementById('precio').value = '';
}


function esProductoDuplicado(nombreProducto) {
    const listaProductos = document.getElementById('listaProductos');
    const productos = listaProductos.querySelectorAll('.nombreProducto');
    return Array.from(productos).some(producto => producto.textContent === nombreProducto);
}


function mostrarNotificacion(mensaje, tipo, icono) {
    const notificacion = document.createElement('div');
    notificacion.classList.add('alert', `alert-${tipo}`, 'text-center', 'position-absolute', 'top-0', 'end-0', 'm-3', 'd-flex', 'align-items-center', 'justify-content-center');
    notificacion.innerHTML = `<i class="fas ${icono} me-2"></i>${mensaje}`;
    
    const notificacionContenedor = document.getElementById('notificacionContenedor');
    notificacionContenedor.appendChild(notificacion);

    setTimeout(() => {
        notificacion.remove();
    }, 3000);
}



function editarProducto(event) {
    const card = event.target.closest('.producto-card');
    const nombreProducto = card.querySelector('.nombreProducto');
    const precio = card.querySelector('.precio');
    const producto = card.closest('.producto-card');

    const editarProductoModal = new bootstrap.Modal(document.getElementById('editarProductoModal'));
    const confirmarEditarProducto = document.getElementById('confirmarEditarProducto');
    const cancelarEditarProducto = document.getElementById('cancelarEditarProducto');
    const eliminarProductoModal = document.getElementById('eliminarProductoModal');
    const cerrarEditarProducto = document.getElementById('cerrarEditarProducto');
    const nuevoNombreInput = document.getElementById('nuevoNombreProducto');
    const nuevoPrecioInput = document.getElementById('nuevoPrecioProducto');

    nuevoNombreInput.value = nombreProducto.textContent;
    nuevoPrecioInput.value = parseFloat(precio.textContent.substring(1));
    editarProductoModal.show();

    confirmarEditarProducto.onclick = () => {
        const nuevoNombreProducto = nuevoNombreInput.value;
        const nuevoPrecio = parseFloat(nuevoPrecioInput.value);

        if (nuevoNombreProducto && nuevoNombreProducto !== nombreProducto.textContent && !esProductoDuplicado(nuevoNombreProducto)) {
            nombreProducto.textContent = nuevoNombreProducto;
        } else if (nuevoNombreProducto && nuevoNombreProducto !== nombreProducto.textContent) {
            alert('No se pueden agregar productos con el mismo nombre.');
        }

        if (nuevoPrecio) {
            precio.textContent = `$${nuevoPrecio.toFixed(2)}`;
        }

        editarProductoModal.hide();
    };

    cancelarEditarProducto.onclick = () => {
        editarProductoModal.hide();
    };

    cerrarEditarProducto.onclick = () => {
        editarProductoModal.hide();
    };

    eliminarProductoModal.onclick = () => {
        if (confirm('¿Estás seguro de que deseas eliminar este producto? Se guardarán los cambios automaticamente.')) {
           producto.remove();
            mostrarNotificacion('Producto eliminado correctamente', 'success');
            mostrarOcultarBotonFacturar();
            editarProductoModal.hide();
					guardarProductos();
		  cargarProductos();
        }
    };
}


function actualizarPrecio(precioElement, nuevoPrecio) {
  precioElement.textContent = '$' + nuevoPrecio.toFixed(2);
}


function facturar() {
    const listaProductos = document.getElementById('listaProductos');
    const productos = listaProductos.querySelectorAll('.producto-card');
    const detalleFacturacion = document.getElementById('detalleFacturacion');
    let total = 0;
    let cantidadProductos = 0;

    detalleFacturacion.innerHTML = '';
    productos.forEach(producto => {
        const nombreProducto = producto.querySelector('.nombreProducto').textContent;
        const precio = parseFloat(producto.querySelector('.precio').textContent.substring(1));
        const cantidad = parseInt(producto.querySelector('.cantidad').value);

        if (cantidad > 0) {
            const subtotal = precio * cantidad;
            total += subtotal;
            cantidadProductos += cantidad;

            const detalle = document.createElement('li');
            detalle.innerHTML = `${nombreProducto} ($${precio}) x${cantidad} unidades = $${subtotal.toFixed(2)}`;
            detalleFacturacion.appendChild(detalle);
        }
    });

  const botonSiguienteCliente = document.getElementById("siguienteCliente");
  botonSiguienteCliente.disabled = false;

    document.getElementById('total').textContent = total.toFixed(2);
    document.getElementById('cantidadProductos').textContent = `Cantidad de Productos facturados: ${cantidadProductos}`;
}


document.getElementById('cargarProductos').addEventListener('click', cargarProductos);
document.getElementById('guardarProductos').addEventListener('click', guardarProductos);
document.getElementById('exportarProductos').addEventListener('click', exportarProductos);
document.getElementById('importarProductos').addEventListener('click', () => document.getElementById('archivoImportar').click());
document.getElementById('archivoImportar').addEventListener('change', importarProductos);

function guardarProductos() {
    const listaProductos = document.getElementById('listaProductos');
    const productos = Array.from(listaProductos.children).map(li => {
        const nombreProducto = li.querySelector('.nombreProducto');
        const precio = li.querySelector('.precio');

        if (nombreProducto && precio) {
            return {
                nombreProducto: nombreProducto.textContent,
                precio: parseFloat(precio.textContent.substring(1))
            };
        }
    }).filter(producto => producto);

    const productosJson = JSON.stringify(productos);
    localStorage.setItem('productos', productosJson);
    showNotification('Cambios guardados correctamente');
}


function cargarProductos() {
    const productosJson = localStorage.getItem('productos');
    if (!productosJson) {
        return;
    }

    const productos = JSON.parse(productosJson);
    const listaProductos = document.getElementById('listaProductos');
    listaProductos.innerHTML = '';

    productos.forEach(producto => {
        document.getElementById('nombreProducto').value = producto.nombreProducto;
        document.getElementById('precio').value = producto.precio;
        agregarProducto();
    });

    showNotification('Productos cargados correctamente.');
}


function exportarProductos() {
    const listaProductos = document.getElementById('listaProductos');
    const productos = Array.from(listaProductos.children).map(li => {
        const nombreProducto = li.querySelector('.nombreProducto').textContent;
        const precio = parseFloat(li.querySelector('.precio').textContent.substring(1));
        return { nombreProducto, precio };
    });

    const productosJson = JSON.stringify(productos);
    const blob = new Blob([productosJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'productos.json';
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Productos exportados en un archivo descargable');
}

function importarProductos(event) {
    const archivo = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const productos = JSON.parse(e.target.result);
        const listaProductos = document.getElementById('listaProductos');
        listaProductos.innerHTML = '';
        productos.forEach(producto => {
            document.getElementById('nombreProducto').value = producto.nombreProducto;
            document.getElementById('precio').value = producto.precio;
            agregarProducto();
        });

        showNotification('Productos importados correctamente');
    };
    reader.readAsText(archivo);
}

           
function mostrarOcultarBotonFacturar() {
    const listaProductos = document.getElementById('listaProductos');
    const botonFacturar = document.getElementById('facturar');
    if (listaProductos.children.length === 0) {
        botonFacturar.style.display = 'none';
    } else {
        botonFacturar.style.display = 'block';
    }
}

const botonToggleAgregarProducto = document.getElementById('toggleAgregarProducto');
const contenidoFormularioAgregarProducto = document.querySelector('.contenidoFormulario');

botonToggleAgregarProducto.addEventListener('click', () => {
    const estaVisible = contenidoFormularioAgregarProducto.style.display !== 'none';
    contenidoFormularioAgregarProducto.style.display = estaVisible ? 'none' : 'block';
    botonToggleAgregarProducto.innerHTML = estaVisible ? '&#x25BC;' : '&#x25B2;';
});

function showNotification(message, duration = 3000) {
  const notification = document.getElementById('notification');
  const notificationContent = document.getElementById('notification-content');

  notificationContent.innerHTML = '<i class="fa fa-ballot-check"></i>' + message;
  notification.style.display = 'block';

  setTimeout(() => {
    notification.style.display = 'none';
  }, duration);
}


function filtrarProductos() {
  const busqueda = this.value.toLowerCase();
  const listaProductos = document.getElementById('listaProductos');
  const productos = listaProductos.querySelectorAll('li');

  productos.forEach(producto => {
    const nombreProducto = producto.querySelector('.nombreProducto').textContent.toLowerCase();

    if (nombreProducto.includes(busqueda)) {
      producto.style.display = 'block';
    } else {
      producto.style.display = 'none';
    }
  });
}

const buscarProducto = document.getElementById('buscarProducto');
const listaProductos = document.getElementById('listaProductos');
buscarProducto.addEventListener('input', () => {
  const valorBusqueda = buscarProducto.value.trim().toLowerCase();
  listaProductos.childNodes.forEach((producto) => {
    if (producto.querySelector('.nombreProducto').textContent.trim().toLowerCase().includes(valorBusqueda)) {
      producto.style.display = 'block';
    } else {
      producto.style.display = 'none';
    }
  });
});


function siguienteCliente() {
  const inputsCantidad = document.querySelectorAll(".producto-card input.cantidad");
  inputsCantidad.forEach((input) => {
    input.value = 0;
  });
  const detalleFacturacion = document.getElementById("detalleFacturacion");
  detalleFacturacion.innerHTML = "";
  const botonSiguienteCliente = document.getElementById("siguienteCliente");
  botonSiguienteCliente.disabled = true;
   document.getElementById('total').innerText = '0.00';
    document.getElementById('cantidadProductos').innerText = '';
	document.getElementById('siguienteCliente').addEventListener('click', siguienteCliente);
  mostrarNotificacion("Factura realizada. Gracias por su compra", "success", "fa-check");
}


