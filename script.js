document.getElementById('agregarProducto').addEventListener('click', agregarProducto);
document.getElementById('facturar').addEventListener('click', facturar);


document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    mostrarOcultarBotonFacturar();
});

let productoId = 0;

function agregarProducto() {
    const nombreProducto = document.getElementById('nombreProducto').value;
    const precio = document.getElementById('precio').value;

    if (esProductoDuplicado(nombreProducto)) {
        alert('No se pueden agregar productos con el mismo nombre.');
        return;
    }

    // Validación para evitar agregar productos con precio 0
    if (precio == 0 || precio <= 0) {
        alert('No se pueden agregar productos con precio 0 o menor.');
        return;
    }

    const listaProductos = document.getElementById('listaProductos');
    const nuevoProducto = document.createElement('div');
    nuevoProducto.innerHTML = document.getElementById('productoTemplate').innerHTML.replace(/{id}/g, productoId).replace('{nombreProducto}', nombreProducto).replace('{precio}', precio);
    nuevoProducto.querySelector('.editarProducto').addEventListener('click', editarProducto);
    
    listaProductos.appendChild(nuevoProducto);
    productoId++;
    mostrarOcultarBotonFacturar();
  
    // Limpia los campos del formulario después de agregar un nuevo producto
    document.getElementById('nombreProducto').value = '';
    document.getElementById('precio').value = '';
}


function esProductoDuplicado(nombreProducto) {
    const listaProductos = document.getElementById('listaProductos');
    const productos = listaProductos.querySelectorAll('.nombreProducto');
    return Array.from(productos).some(producto => producto.textContent === nombreProducto);
}


function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.createElement('div');
    notificacion.classList.add('alert', `alert-${tipo}`, 'text-center', 'position-fixed', 'bottom-0', 'end-0', 'm-3');
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.remove();
    }, 3000);
}




function editarProducto(event) {
    const li = event.target.closest('li');
    const nombreProducto = li.querySelector('.nombreProducto');
    const precio = li.querySelector('.precio');

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
        if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            li.remove();
            mostrarNotificacion('Producto eliminado correctamente', 'success');
            mostrarOcultarBotonFacturar();
            editarProductoModal.hide(); // Asegurarse de que se cierre el modal después de eliminar el producto
        }
    };
}







function actualizarPrecio(precioElement, nuevoPrecio) {
  precioElement.textContent = '$' + nuevoPrecio.toFixed(2);
}


function eliminarProducto() {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este producto de la lista?');

    if (confirmacion) {
        const producto = this.closest('li');
        const separador = producto.nextElementSibling;
        producto.parentNode.removeChild(producto);
        if (separador) {
            separador.parentNode.removeChild(separador);
        }
        const elementoAnterior = producto.previousElementSibling;
        if (elementoAnterior) {
            elementoAnterior.remove();
        }
        this.closest('li');
        producto.remove();
        mostrarOcultarBotonFacturar();

        // Mostrar notificación de éxito al eliminar el producto
        showNotification('Producto eliminado correctamente');
    }
}




function facturar() {
    const listaProductos = document.getElementById('listaProductos');
    const productos = listaProductos.querySelectorAll('li');
    const detalleFacturacion = document.getElementById('detalleFacturacion');
    let total = 0;
    let cantidadProductos = 0;

    detalleFacturacion.innerHTML = ''; // Limpiar el detalle de facturación anterior
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

    // Mostrar notificación de éxito al guardar los productos
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

    // Mostrar notificación de éxito al cargar los productos
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

    // Mostrar notificación de éxito al exportar los productos
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

        // Mostrar notificación de éxito al importar los productos
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

    notificationContent.textContent = message;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, duration);
}
