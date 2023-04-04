document.getElementById('agregarProducto').addEventListener('click', agregarProducto);
document.getElementById('facturar').addEventListener('click', facturar);
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    mostrarOcultarBotonFacturar();
});
document.getElementById('buscarProducto').addEventListener('input', filtrarProductos);
document.getElementById('siguienteCliente').addEventListener('click', siguienteCliente);
document.getElementById('save-btn').addEventListener('click', saveOptions);
document.getElementById('reset-final-text-btn').addEventListener('click', resetFinalText);
document.getElementById('reset-quick-text-1-btn').addEventListener('click', resetQuickText1);
document.getElementById('reset-quick-text-2-btn').addEventListener('click', resetQuickText2);
document.getElementById('reset-quick-text-3-btn').addEventListener('click', resetQuickText3);


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

const historialVentasTbody = document.getElementById('historial-ventas-tbody');
  const fechaHora = new Date();

  productos.forEach(producto => {
    // ... (código existente) ...

    if (cantidad > 0) {
      // ... (código existente) ...

      // Agrega la venta al historial
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${Math.floor(Math.random() * 1000000)}</td>
        <td>${fechaHora.toLocaleString()}</td>
        <td>${nombreProducto}</td>
        <td>${cantidad}</td>
        <td>$${precio.toFixed(2)}</td>
        <td>$${subtotal.toFixed(2)}</td>
      `;
      historialVentasTbody.appendChild(tr);
    }
  });



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


var modalBtn = document.getElementById("modal-btn");
var modalContainer = document.getElementById("modal-container");
var closeModalBtn = document.getElementById("close-modal-btn");
var messageInput = document.getElementById("message-input");
var endMessageInput = document.getElementById("end-message-input");
var resetBtn = document.getElementById("reset-btn");
var resetEndMessageBtn = document.getElementById("reset-end-message-btn");
var saveBtn = document.getElementById("save-btn");
var modalContainer = document.getElementById("modal-container");
var savedValue = localStorage.getItem("savedMessage");
var savedEndMessage = localStorage.getItem("savedEndMessage");
var optionsBtn = document.getElementById("modal-btn");
var modalContainer = document.getElementById("modal-container");

modalBtn.onclick = function() {
  modalContainer.style.display = "block";
}

closeModalBtn.onclick = function() {
  modalContainer.style.display = "none";
}


window.onclick = function(event) {
  if (event.target == modalContainer) {
    modalContainer.style.display = "none";
  }
}

if (savedValue !== null) {
  messageInput.value = savedValue;
}

if (savedEndMessage !== null) {
  endMessageInput.value = savedEndMessage;
}

resetBtn.onclick = function() {
  messageInput.value = "/do La factura mostraría: ";
}

resetEndMessageBtn.onclick = function() {
  endMessageInput.value = defaultEndMessage;
}

optionsBtn.onclick = function() {
  modalContainer.style.display = "block";
}

modalContainer.addEventListener("click", function(event) {
  event.stopPropagation();
});

var resetEndMessageBtn = document.getElementById("reset-end-message-btn");
resetEndMessageBtn.addEventListener("click", function() {
  var endMessageInput = document.getElementById("end-message-input");
  endMessageInput.value = "Favor de abonar el importe al tendero más cercano. Gracias por su compra.";
});

var saveBtn = document.getElementById("save-btn");
saveBtn.addEventListener("click", function() {
  var messageInput = document.getElementById("message-input");
  var endMessageInput = document.getElementById("end-message-input");
  localStorage.setItem("message", messageInput.value);
  localStorage.setItem("endMessage", endMessageInput.value);
  closeModal();
});

resetBtn.onclick = function() {
  messageInput.value = "/do La factura mostraría: ";
};

// BLOQUEA EL CIERRE CON EL CLICK
function closeModal() {
  var modalContainer = document.getElementById("modal-container");
  modalContainer.style.display = "none";
}

function saveOptions() {
    localStorage.setItem('message', document.getElementById('message-input').value);
    localStorage.setItem('endMessage', document.getElementById('end-message-input').value);
	localStorage.setItem('finalText', document.getElementById('final-text-input').value);
    localStorage.setItem('quickText1', document.getElementById('quick-text-1-input').value);
    localStorage.setItem('quickText2', document.getElementById('quick-text-2-input').value);
    localStorage.setItem('quickText3', document.getElementById('quick-text-3-input').value);
    closeModal();
}

function init() {
   
    const messageInput = document.getElementById('message-input');
    const endMessageInput = document.getElementById('end-message-input');
    messageInput.value = localStorage.getItem('message') || '/do La factura mostraría';
    endMessageInput.value = localStorage.getItem('endMessage') || 'Favor de abonar el importe al tendero más cercano. Gracias por su compra.';
const finalTextInput = document.getElementById('final-text-input');
  finalTextInput.value = localStorage.getItem('finalText') || '>> TOTAL A PAGAR: ';
  
  const quickText1Input = document.getElementById('quick-text-1-input');
  quickText1Input.value = localStorage.getItem('quickText1') || '';

  const quickText2Input = document.getElementById('quick-text-2-input');
  quickText2Input.value = localStorage.getItem('quickText2') || '';

  const quickText3Input = document.getElementById('quick-text-3-input');
  quickText3Input.value = localStorage.getItem('quickText3') || '';
  
}

function resetFinalText() {
  document.getElementById('final-text-input').value = '>> TOTAL A PAGAR: ';
}

function resetQuickText1() {
  document.getElementById('quick-text-1-input').value = '';
}

function resetQuickText2() {
  document.getElementById('quick-text-2-input').value = '';
}

function resetQuickText3() {
  document.getElementById('quick-text-3-input').value = '';
}

function exportarConfig() {
  const config = {
    message: document.getElementById("message-input").value,
    endMessage: document.getElementById("end-message-input").value,
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "config.json");
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function importarConfig(event) {
  const input = event.target;
  const reader = new FileReader();

  reader.onload = function () {
    const config = JSON.parse(reader.result);
    document.getElementById("message-input").value = config.message;
    document.getElementById("end-message-input").value = config.endMessage;
    localStorage.setItem("message", config.message);
    localStorage.setItem("endMessage", config.endMessage);
  };

  reader.readAsText(input.files[0]);
}

document.getElementById("exportarConfig").addEventListener("click", exportarConfig);
document.getElementById("importarConfig").addEventListener("click", function () {
  document.getElementById("archivoConfig").click();
});
document.getElementById("archivoConfig").addEventListener("change", importarConfig);





document.getElementById("facturar").addEventListener("click", function () {
  facturar(); // Llamar a la función facturar() para actualizar el detalle de facturación.

  const messageInput = document.getElementById('message-input');
  const finalTextInput = document.getElementById('final-text-input');
  const endMessageInput = document.getElementById('end-message-input');

  let itemsFacturados = '';

  const detalleFacturacion = document.getElementById('detalleFacturacion').children;

  for (const item of Array.from(detalleFacturacion)) {
    const detalleProducto = item.textContent.split(" (")[0];
    const cantidad = item.textContent.split(" x")[1].split(" unidades")[0];
    const subtotal = item.textContent.split(" = $")[1];
    itemsFacturados += `${detalleProducto} x${cantidad} unidades ($${subtotal}) + `;
  }

  if (itemsFacturados.length > 0) {
    itemsFacturados = itemsFacturados.slice(0, -3); // Eliminar el último '+ ' de la cadena.
  }

  const total = document.getElementById("total").textContent;
  const textoFactura = `${messageInput.value} ${itemsFacturados} ${finalTextInput.value}$${total} ${endMessageInput.value}`;

  navigator.clipboard.writeText(textoFactura).then(() => {
    console.log('Texto copiado al portapapeles:', textoFactura);
  }, (err) => {
    console.error('Error al copiar el texto:', err);
  });
});




document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey) {
    let textQuickNumber = null;

    if (event.key === '1') {
      textQuickNumber = 1;
    } else if (event.key === '2') {
      textQuickNumber = 2;
    } else if (event.key === '3') {
      textQuickNumber = 3;
    }

    if (textQuickNumber) {
      const inputElement = document.getElementById(`quick-text-${textQuickNumber}-input`);
      const text = inputElement.value;
      navigator.clipboard.writeText(text).then(() => {
        showNotification(`Texto Rápido ${textQuickNumber} copiado al portapapeles.`);
      }).catch(err => {
        console.error('Error al copiar el texto rápido al portapapeles:', err);
      });
    }
  }
});


const openHistorialVentasBtn = document.getElementById('open-historial-ventas');
const closeHistorialVentasBtn = document.getElementById('close-historial-ventas-modal');
const historialVentasModal = document.getElementById('historial-ventas-modal');

openHistorialVentasBtn.addEventListener('click', () => {
  historialVentasModal.style.display = 'block';
});

closeHistorialVentasBtn.addEventListener('click', () => {
  historialVentasModal.style.display = 'none';
});








init();
