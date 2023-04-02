document.getElementById('agregarProducto').addEventListener('click', agregarProducto);
document.getElementById('facturar').addEventListener('click', facturar);
document.addEventListener('DOMContentLoaded', cargarProductos);
document.addEventListener('DOMContentLoaded', mostrarOcultarBotonFacturar);


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
    nuevoProducto.querySelector('.eliminarProducto').addEventListener('click', eliminarProducto);
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

function editarProducto(event) {
    const li = event.target.closest('li');
    const nombreProducto = li.querySelector('.nombreProducto');
    const precio = li.querySelector('.precio');

    const nuevoNombreProducto = prompt('Editar nombre del producto:', nombreProducto.textContent);
    if (nuevoNombreProducto && !esProductoDuplicado(nuevoNombreProducto)) {
        nombreProducto.textContent = nuevoNombreProducto;
    } else if (nuevoNombreProducto) {
        alert('No se pueden agregar productos con el mismo nombre.');
        return;
    }

    const nuevoPrecio = prompt('Editar precio del producto:', precio.textContent);
    if (nuevoPrecio) {
        precio.textContent = nuevoPrecio;
    }
}

function eliminarProducto() {
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
    const productos = Array.from(listaProductos.querySelectorAll('li')).map(li => {
        const nombreProducto = li.querySelector('.nombreProducto').textContent;
        const precio = parseFloat(li.querySelector('.precio').textContent);
        return { nombreProducto, precio };
    });

    const productosJson = JSON.stringify(productos);
    localStorage.setItem('productos', productosJson);
}



function cargarProductos() {
    const productosJson = localStorage.getItem('productos');
    if (!productosJson) {
        return;
    }

    const productos = JSON.parse(productosJson);

    productos.forEach(producto => {
        document.getElementById('nombreProducto').value = producto.nombreProducto;
        document.getElementById('precio').value = producto.precio;
        agregarProducto();
		   mostrarOcultarBotonFacturar();
		   
    });
}


function exportarProductos() {
    const listaProductos = document.getElementById('listaProductos');
    const productos = JSON.stringify(Array.from(listaProductos.children).map(li => li.textContent));
    const blob = new Blob([productos], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'productos.json';
    link.click();
    URL.revokeObjectURL(url);
}

function importarProductos(event) {
    const archivo = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const productos = JSON.parse(e.target.result);
        const listaProductos = document.getElementById('listaProductos');
        listaProductos.innerHTML = '';
        productos.forEach(producto => {
            const nuevoProducto = document.createElement('li');
            nuevoProducto.textContent = producto;
			listaProductos.appendChild(nuevoProducto);
});
};
 mostrarOcultarBotonFacturar();
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
