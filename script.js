document.getElementById('agregarProducto').addEventListener('click', agregarProducto);
document.getElementById('facturar').addEventListener('click', facturar);
document.getElementById("searchInput").addEventListener("input", filterTable);
document.getElementById("minPriceInput").addEventListener("input", filterTable);
document.getElementById("maxPriceInput").addEventListener("input", filterTable);
document.getElementById("cancelDeleteButton").addEventListener("click", () => {
  $("#deleteConfirmationModal").modal("hide");
});

document.getElementById("deleteSalesButton").addEventListener("click", () => {
  $("#deleteConfirmationModal").modal("show");
});

document.getElementById("confirmDeleteButton").addEventListener("click", () => {
  deleteSales();
  $("#deleteConfirmationModal").modal("hide");
});

document.addEventListener("DOMContentLoaded", () => {
	
	cargarEstadoAutoguardado();
  console.log('DOMContentLoaded');
  cargarProductos();
  loadSavedTexts();
  loadSalesFromLocalStorage();
  mostrarOcultarBotonFacturar();
	const productos = document.querySelector('.productos');
productos.style.backgroundColor = '#fff';
 
  const exportarDatosBtn = document.querySelector("#historialVentasModal .btn-primary");
  exportarDatosBtn.addEventListener("click", exportarDatos);

  document.querySelector("#historialVentasModal .btn-close").addEventListener("click", closeModal);
  document.querySelector("#historialVentasModal .btn-secondary").addEventListener("click", closeModal);


  const facturarRapidaModal = $("#facturarapida1");

  
   const cargarFacturacionRapidaBtn = document.getElementById("cargarFacturacionRapida");
  cargarFacturacionRapidaBtn.addEventListener("click", cargarValoresFacturacionRapida);
  



});

document.getElementById('buscarProducto').addEventListener('input', filtrarProductos);
document.getElementById('siguienteCliente').addEventListener('click', siguienteCliente);
document.getElementById('save-btn').addEventListener('click', saveOptions);
document.getElementById('reset-final-text-btn').addEventListener('click', resetFinalText);
document.getElementById('reset-quick-text-1-btn').addEventListener('click', resetQuickText1);
document.getElementById('reset-quick-text-2-btn').addEventListener('click', resetQuickText2);
document.getElementById('reset-quick-text-3-btn').addEventListener('click', resetQuickText3);



if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    }, function(error) {
      console.log('Service Worker registration failed:', error);
    });
  });
}

let productoId = 0;

function agregarProducto() {
 
   agregarProductoSinNotificacion();
    mostrarNotificacion('Producto agregado correctamente', 'success', '');

    if (autoguardarProductos.checked) {
    guardarProductos();
  }
	
}

function esProductoDuplicado(nombreProducto) {
    const listaProductos = document.getElementById('listaProductos');
    const productos = listaProductos.querySelectorAll('.nombreProducto');
    return Array.from(productos).some(producto => producto.textContent === nombreProducto);
}


function mostrarNotificacion(mensaje, tipo, icono) {
  const notificacion = document.createElement('div');
  notificacion.classList.add('alert', `alert-${tipo}`, 'text-center', 'd-flex', 'align-items-center', 'justify-content-center');
  notificacion.innerHTML = `<i class="fas ${icono} me-2"></i>${mensaje}`;

  const notificacionContenedor = document.getElementById('notificacionContenedor');
  notificacionContenedor.appendChild(notificacion);

  setTimeout(() => {
    notificacion.classList.add('fadeOut');
    setTimeout(() => {
      notificacion.remove();
    }, 1000);
  }, 3000);
  
  notificacion.classList.add('alert-custom');
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

    const facturacionDiv = document.querySelector('.facturacion');
    if (total !== 0) {
        facturacionDiv.style.backgroundColor = '#EAEDF290';
		 playFacturarSound();
    } else {
        facturacionDiv.style.backgroundColor = '#fafafa';
    }		
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
   showNotification('Los cambios se han guardado y aplicado correctamente', 3000, 'success', 'fa fa-check');

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
        agregarProductoSinNotificacion();
    });
}




function agregarProductoSinNotificacion() {
   
   const nombreProducto = document.getElementById('nombreProducto').value.trim();
    const precio = document.getElementById('precio').value;

    if (esProductoDuplicado(nombreProducto)) {
        alert('No se pueden agregar productos con el mismo nombre.');
        return;
    }

    if (nombreProducto.length < 2) {
        alert('El nombre del producto debe tener al menos 2 caracteres.');
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
  const buscarProducto = document.getElementById('buscarProducto');
  const siguienteCliente = document.getElementById('siguienteCliente');
  const productosAFacturar = document.querySelector('#productosAFacturar span');
  const facturacion = document.querySelector('.facturacion');

  if (listaProductos.children.length === 0) {
    botonFacturar.style.display = 'none';
    buscarProducto.style.display = 'none';
    siguienteCliente.style.display = 'none';
    productosAFacturar.classList.add('zoom');
    productosAFacturar.textContent = "Agregue productos para comenzar";
    facturacion.style.display = 'none';
  } else {
    botonFacturar.style.display = 'block';
    buscarProducto.style.display = 'block';
    siguienteCliente.style.display = 'block';
    productosAFacturar.classList.remove('zoom');
    productosAFacturar.textContent = "Productos a Facturar";
    facturacion.style.display = 'block';
  }
}

const botonToggleAgregarProducto = document.getElementById('toggleAgregarProducto');
const contenidoFormularioAgregarProducto = document.querySelector('.contenidoFormulario');
const tarjetasProducto = document.querySelectorAll('.producto-card');

botonToggleAgregarProducto.addEventListener('click', () => {
  contenidoFormularioAgregarProducto.classList.toggle('mostrar');
  botonToggleAgregarProducto.innerHTML = contenidoFormularioAgregarProducto.classList.contains('mostrar') ? '<i class="fas fa-chevron-up"></i> Ocultar Menú' : '<i class="fas fa-chevron-down"></i> Agregar Producto';

  if (contenidoFormularioAgregarProducto.classList.contains('mostrar')) {
    const seccionFacturacion = document.querySelector('.facturacion');
    document.querySelectorAll('.producto-card').forEach(tarjeta => tarjeta.style.backgroundColor = '#b4bbc817');
    botonToggleAgregarProducto.classList.add('toggle-active');
    const buscarProducto = document.getElementById('buscarProducto');
    const productosAFacturar = document.getElementById('productosAFacturar');
    const botonFacturar = document.getElementById('facturar');
    const botonSiguienteCliente = document.getElementById('siguienteCliente');
    seccionFacturacion.style.display = 'none';
	const productos = document.querySelector('.productos');
productos.style.backgroundColor = '#fafafa';

    buscarProducto.style.display = 'none';
    productosAFacturar.style.display = 'none';
    botonFacturar.style.display = 'none';
    botonSiguienteCliente.style.display = 'none';
  } else {
    const seccionFacturacion = document.querySelector('.facturacion');
    const buscarProducto = document.getElementById('buscarProducto');
    document.querySelectorAll('.producto-card').forEach(tarjeta => tarjeta.style.backgroundColor = '#efefef40');
    botonToggleAgregarProducto.classList.remove('toggle-active');
    const productosAFacturar = document.getElementById('productosAFacturar');
    const botonFacturar = document.getElementById('facturar');
    const botonSiguienteCliente = document.getElementById('siguienteCliente');
    seccionFacturacion.style.display = 'block';
    buscarProducto.style.display = 'block';
	const productos = document.querySelector('.productos');
productos.style.backgroundColor = '#fff';

    productosAFacturar.style.display = 'block';
    botonFacturar.style.display = 'block';
    botonSiguienteCliente.style.display = 'block';
  }
});





function mostrarOcultarBotonFacturar() {
  const listaProductos = document.getElementById('listaProductos');
  const botonFacturar = document.getElementById('facturar');
  const buscarProducto = document.getElementById('buscarProducto');
  const siguienteCliente = document.getElementById('siguienteCliente');
  const productosAFacturar = document.querySelector('#productosAFacturar span');
  const facturacion = document.querySelector('.facturacion');

  if (listaProductos.children.length === 0) {
    botonFacturar.style.display = 'none';
    buscarProducto.style.display = 'none';
    siguienteCliente.style.display = 'none';
    productosAFacturar.classList.add('zoom');
    productosAFacturar.textContent = "Agregue productos para comenzar";
    facturacion.style.display = 'none';
  } else {
    botonFacturar.style.display = 'block';
    buscarProducto.style.display = 'block';
    siguienteCliente.style.display = 'block';
    productosAFacturar.classList.remove('zoom');
    productosAFacturar.textContent = "Productos a Facturar";
    facturacion.style.display = 'block';
  }
}

mostrarOcultarBotonFacturar();






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
  const total = parseFloat(document.getElementById("total").textContent);


  if (total === 0) {
    mostrarNotificacion("‎ No se pueden facturar $0. Por favor, agregue productos a la factura.", "warning", "fa-exclamation-circle");
    return;
  }
  
  const inputsCantidad = document.querySelectorAll(".producto-card input.cantidad");
  const detalleFacturacion = document.getElementById("detalleFacturacion");
  let factura = {
    fecha: new Date(),
    productos: [],
    total: total
  };

  inputsCantidad.forEach((input, index) => {
    const cantidad = parseInt(input.value);
    if (cantidad > 0) {
      const productoCard = input.closest(".producto-card");
      const nombreProducto = productoCard.querySelector(".nombreProducto").textContent;
      const precioTexto = productoCard.querySelector(".precio").textContent;
      const precioProducto = parseFloat(precioTexto.replace("$", ""));
      factura.productos.push({
        nombre: nombreProducto,
        precio: precioProducto,
        cantidad: cantidad
      });
    }
    input.value = 0;
  });

  detalleFacturacion.innerHTML = "";
  const botonSiguienteCliente = document.getElementById("siguienteCliente");
  botonSiguienteCliente.disabled = true;
  document.getElementById("total").innerText = "0.00";
  document.getElementById("cantidadProductos").innerText = "";
  generarTablaHistorial(factura);
  playSiguienteClienteSound()
  mostrarNotificacion("‎ Factura realizada. Gracias por su compra", "success", "fa-check");
   
    const facturacionDiv = document.querySelector('.facturacion');
       facturacionDiv.style.backgroundColor = '#fafafa';

}



function generarTablaHistorial(factura) {
	
  const tableBody = document.getElementById("historialVentasTbody");
  const row = document.createElement("tr");
  const fechaCell = document.createElement("td");
  fechaCell.textContent = factura.fecha.toLocaleString();
  row.appendChild(fechaCell);
  const productosCell = document.createElement("td");
  productosCell.innerHTML = factura.productos
    .map(
      (producto, index) =>
        `${producto.nombre} ($${producto.precio.toFixed(2)}) x${producto.cantidad}`
    )
    .join(", ");
  row.appendChild(productosCell);

  const totalCell = document.createElement("td");
  totalCell.textContent = `$${factura.total.toFixed(2)}`;
  row.appendChild(totalCell);
  tableBody.appendChild(row);
  saveSalesToLocalStorage();
  updateSalesTable();
  updatePagination();
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


window.onclick = function (event) {
  if (event.target == modalContainer) {
    modalContainer.style.display = "none";
  }
};




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
  var finalTextInput = document.getElementById("final-text-input");
  var quickText1Input = document.getElementById("quick-text-1-input");
  var quickText2Input = document.getElementById("quick-text-2-input");
  var quickText3Input = document.getElementById("quick-text-3-input");

  localStorage.setItem("message", messageInput.value);
  localStorage.setItem("endMessage", endMessageInput.value);
  localStorage.setItem("finalText", finalTextInput.value);
  localStorage.setItem("quickText1", quickText1Input.value);
  localStorage.setItem("quickText2", quickText2Input.value);
  localStorage.setItem("quickText3", quickText3Input.value);
  localStorage.setItem("facturarSound", document.getElementById("facturarSound").value);
  localStorage.setItem("finalizarSound", document.getElementById("finalizarSound").value);
  localStorage.setItem("volumenFacturar", document.getElementById("volumenFacturar").value);
  localStorage.setItem("volumenFinalizar", document.getElementById("volumenFinalizar").value);

  showNotification(`Cambios en los textos y configuraciones de sonido guardados correctamente`);
  closeModal();
 
});


resetBtn.onclick = function() {
  messageInput.value = "/do La factura mostraría: ";
};

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
     localStorage.setItem("facturarSound", document.getElementById("facturarSound").value);
  localStorage.setItem("finalizarSound", document.getElementById("finalizarSound").value);
  localStorage.setItem("volumenFacturar", document.getElementById("volumenFacturar").value);
  localStorage.setItem("volumenFinalizar", document.getElementById("volumenFinalizar").value);

  showNotification(`Cambios en los textos y configuraciones de sonido guardados correctamente`);
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
    finalText: document.getElementById("final-text-input").value,
    quickText1: document.getElementById("quick-text-1-input").value,
    quickText2: document.getElementById("quick-text-2-input").value,
    quickText3: document.getElementById("quick-text-3-input").value,
	 facturarSound: document.getElementById("facturarSound").value,
    finalizarSound: document.getElementById("finalizarSound").value,
    volumenFacturar: document.getElementById("volumenFacturar").value,
    volumenFinalizar: document.getElementById("volumenFinalizar").value,
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
    document.getElementById("final-text-input").value = config.finalText;
    document.getElementById("quick-text-1-input").value = config.quickText1;
    document.getElementById("quick-text-2-input").value = config.quickText2;
    document.getElementById("quick-text-3-input").value = config.quickText3;

    localStorage.setItem("message", config.message);
    localStorage.setItem("endMessage", config.endMessage);
    localStorage.setItem("finalText", config.finalText);
    localStorage.setItem("quickText1", config.quickText1);
    localStorage.setItem("quickText2", config.quickText2);
    localStorage.setItem("quickText3", config.quickText3);
	
	document.getElementById("facturarSound").value = config.facturarSound;
    document.getElementById("finalizarSound").value = config.finalizarSound;
    document.getElementById("volumenFacturar").value = config.volumenFacturar;
    document.getElementById("volumenFinalizar").value = config.volumenFinalizar;

    localStorage.setItem("facturarSound", config.facturarSound);
    localStorage.setItem("finalizarSound", config.finalizarSound);
    localStorage.setItem("volumenFacturar", config.volumenFacturar);
    localStorage.setItem("volumenFinalizar", config.volumenFinalizar);
	
  };

  reader.readAsText(input.files[0]);
}

document.getElementById("exportarConfig").addEventListener("click", exportarConfig);
document.getElementById("importarConfig").addEventListener("click", function () {
  document.getElementById("archivoConfig").click();
});
document.getElementById("archivoConfig").addEventListener("change", importarConfig);





document.getElementById("facturar").addEventListener("click", function () {
  facturar();

  const totalFacturado = parseFloat(document.getElementById("total").textContent);

  if (totalFacturado > 0) {
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
      itemsFacturados = itemsFacturados.slice(0, -3); 
    }

    const total = document.getElementById("total").textContent;
    const textoFactura = `${messageInput.value} ${itemsFacturados} ${finalTextInput.value}$${total} ${endMessageInput.value}`;

    navigator.clipboard.writeText(textoFactura).then(() => {
      console.log('Texto copiado al portapapeles:', textoFactura);
    }, (err) => {
      console.error('Error al copiar el texto:', err);
    });
  }
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



function exportarDatos() {
  const table = document.querySelector("#historialVentasTbody");
  const rows = Array.from(table.querySelectorAll("tr"));
  const csvContent = rows
    .map((row) => {
      const cells = Array.from(row.querySelectorAll("td"));
      return cells.map((cell) => `"${cell.textContent.replace(/"/g, '""')}"`).join(",");
    })
    .join("\n");

  const csvFile = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const fileName = "historial_ventas.csv";
  const link = document.createElement("a");

  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(csvFile, fileName);
  } else {
    link.href = URL.createObjectURL(csvFile);
    link.setAttribute("download", fileName);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}


const facturarSoundSelect = document.getElementById('facturarSound');
const playFacturarButton = document.getElementById('playFacturarButton');
const volumenFacturarSlider = document.getElementById('volumenFacturar');

const sounds = [
  "https://raw.githubusercontent.com/maxii1996/BaduCalculator-Online/main/Resources/Factura1.wav",
  "https://raw.githubusercontent.com/maxii1996/BaduCalculator-Online/main/Resources/Factura2.wav",
  "https://raw.githubusercontent.com/maxii1996/BaduCalculator-Online/main/Resources/Factura3.wav",
  "https://raw.githubusercontent.com/maxii1996/BaduCalculator-Online/main/Resources/Factura4.wav",
  "https://raw.githubusercontent.com/maxii1996/BaduCalculator-Online/main/Resources/Factura5.wav",
];

let audio;

if (facturarSoundSelect && playFacturarButton && volumenFacturarSlider) {
  playFacturarButton.addEventListener('click', () => {
    const soundIndex = parseInt(facturarSoundSelect.value) - 1;
    const soundUrl = sounds[soundIndex];
    audio = new Audio(soundUrl); 
    audio.volume = volumenFacturarSlider.value / 100;
    audio.play();
  });

  volumenFacturarSlider.addEventListener('input', () => {
    if (audio) { 
      audio.volume = volumenFacturarSlider.value / 100;
    }
  });
}

const finalizarSoundSelect = document.getElementById('finalizarSound');
const playFinalizarButton = document.getElementById('playFinalizarButton');
const volumenFinalizarSlider = document.getElementById('volumenFinalizar');

const finalizarSounds = [
  "https://raw.githubusercontent.com/maxii1996/BaduCalculator-Online/main/Resources/Final1.wav",
  "https://raw.githubusercontent.com/maxii1996/BaduCalculator-Online/main/Resources/Final2.wav",
  "https://raw.githubusercontent.com/maxii1996/BaduCalculator-Online/main/Resources/Final3.wav",
];

let finalizarAudio; 

if (finalizarSoundSelect && playFinalizarButton && volumenFinalizarSlider) {
  playFinalizarButton.addEventListener('click', () => {
    const soundIndex = parseInt(finalizarSoundSelect.value) - 1;
    const soundUrl = finalizarSounds[soundIndex];
    finalizarAudio = new Audio(soundUrl);
    finalizarAudio.volume = volumenFinalizarSlider.value / 100;
    finalizarAudio.play();
  });

  volumenFinalizarSlider.addEventListener('input', () => {
    if (finalizarAudio) { 
      finalizarAudio.volume = volumenFinalizarSlider.value / 100;
    }
  });
}


function playFacturarSound() {
    const facturarSoundSelect = document.getElementById('facturarSound');
    const playFacturarButton = document.getElementById('playFacturarButton');
    const volumenFacturarSlider = document.getElementById('volumenFacturar');

 const sounds = [
  "https://raw.githubusercontent.com/maxii1996/BaduCalculator-Online/main/Resources/Factura1.wav",
  "https://raw.githubusercontent.com/maxii1996/BaduCalculator-Online/main/Resources/Factura2.wav",
  "https://raw.githubusercontent.com/maxii1996/BaduCalculator-Online/main/Resources/Factura3.wav",
  "https://raw.githubusercontent.com/maxii1996/BaduCalculator-Online/main/Resources/Factura4.wav",
  "https://raw.githubusercontent.com/maxii1996/BaduCalculator-Online/main/Resources/Factura5.wav",
];


    if (facturarSoundSelect && playFacturarButton && volumenFacturarSlider) {
      const soundIndex = parseInt(facturarSoundSelect.value) - 1;
      const soundUrl = sounds[soundIndex];
      const audio = new Audio(soundUrl);
      audio.volume = volumenFacturarSlider.value / 100;
      audio.play();
    }
}


function playSiguienteClienteSound() {
    const facturarSoundSelect = document.getElementById('facturarSound');
    const playFacturarButton = document.getElementById('playFacturarButton');
    const volumenFacturarSlider = document.getElementById('volumenFacturar');

    const sounds = [
  "https://raw.githubusercontent.com/maxii1996/BaduCalculator-Online/main/Resources/Final1.wav",
  "https://raw.githubusercontent.com/maxii1996/BaduCalculator-Online/main/Resources/Final2.wav",
  "https://raw.githubusercontent.com/maxii1996/BaduCalculator-Online/main/Resources/Final3.wav",
    ];

    if (facturarSoundSelect && playFacturarButton && volumenFacturarSlider) {
      const soundIndex = parseInt(finalizarSoundSelect.value) - 1;
    const soundUrl = finalizarSounds[soundIndex];
    const audio = new Audio(soundUrl);
    audio.volume = volumenFinalizarSlider.value / 100;
    audio.play();
    }
}


function loadSavedTexts() {
  var messageInput = document.getElementById("message-input");
  var endMessageInput = document.getElementById("end-message-input");
  var finalTextInput = document.getElementById("final-text-input");
  var quickText1Input = document.getElementById("quick-text-1-input");
  var quickText2Input = document.getElementById("quick-text-2-input");
  var quickText3Input = document.getElementById("quick-text-3-input");

  messageInput.value = localStorage.getItem("message") || messageInput.value;
  endMessageInput.value = localStorage.getItem("endMessage") || endMessageInput.value;
  finalTextInput.value = localStorage.getItem("finalText") || finalTextInput.value;
  quickText1Input.value = localStorage.getItem("quickText1") || quickText1Input.value;
  quickText2Input.value = localStorage.getItem("quickText2") || quickText2Input.value;
  quickText3Input.value = localStorage.getItem("quickText3") || quickText3Input.value;

document.getElementById("facturarSound").value = localStorage.getItem("facturarSound") || "1";
document.getElementById("finalizarSound").value = localStorage.getItem("finalizarSound") || "1";
document.getElementById("volumenFacturar").value = localStorage.getItem("volumenFacturar") || "50";
document.getElementById("volumenFinalizar").value = localStorage.getItem("volumenFinalizar") || "50";

}

function saveSalesToLocalStorage() {
  const tableBody = document.getElementById("historialVentasTbody");
  localStorage.setItem('salesHistory', tableBody.innerHTML);
}

function loadSalesFromLocalStorage() {
  const tableBody = document.getElementById("historialVentasTbody");
  const savedSalesHistory = localStorage.getItem('salesHistory');
  if (savedSalesHistory) {
    tableBody.innerHTML = savedSalesHistory;
  }
    updateSalesTable();
  updatePagination();
}

function closeHistorialVentasModal() {
  $('#historialVentasModal').modal('hide');
}

const closeButtons = document.querySelectorAll("#historialVentasModal .btn-close, #historialVentasModal .btn-secondary");
closeButtons.forEach(button => {
  button.addEventListener('click', closeHistorialVentasModal);
});


function facturarRapido() {
guardarConfiguracionFacturacionRapida();
}

document.getElementById('facturacionRapidaBtn').addEventListener('click', () => {
  $('#facturarapida1').modal('show');
    actualizarFacturacionRapida();
  cargarConfiguracionFacturacionRapida(); 
});


function guardarConfiguracionFacturacionRapida() {
	
  const facturacionRapidaInputs = document.querySelectorAll('.facturacion-rapida-cantidad');
  let configuracion = {};

  facturacionRapidaInputs.forEach(input => {
    const nombreProducto = input.getAttribute('data-producto');
    configuracion[nombreProducto] = input.value;
  });

  console.log('Guardando configuración:', configuracion); 
  localStorage.setItem("configuracionFacturacionRapida", JSON.stringify(configuracion));
  
  
  const notificationFast = document.getElementById('NotificationFast');
  notificationFast.classList.remove('d-none');


  setTimeout(() => {
    notificationFast.classList.add('d-none');
  }, 3000);
}

const aplicarBtn = document.querySelector("#facturarapida1 .btn-primary");
aplicarBtn.addEventListener("click", () => {
  facturarRapido();
  guardarConfiguracionFacturacionRapida();
    resetearValoresFacturacionComun();

});


function cargarValoresFacturacionRapida(configuracion) {
  const listaProductos = document.getElementById('listaProductos');
  const productos = listaProductos.querySelectorAll('.producto-card');

  productos.forEach(producto => {
    const nombreProducto = producto.querySelector('.nombreProducto').textContent;
    if (configuracion.hasOwnProperty(nombreProducto)) {
      producto.querySelector('.cantidad').value = configuracion[nombreProducto];
    }
  });
}


function cargarConfiguracionFacturacionRapida() {
   const configuracion = JSON.parse(localStorage.getItem("configuracionFacturacionRapida"));
  console.log('Cargando configuración:', configuracion); 

if (configuracion) {
    cargarValoresFacturacionRapida(configuracion);
  } 
}


function actualizarFacturacionRapida() {
  const listaProductos = document.getElementById('listaProductos');
  const productos = listaProductos.querySelectorAll('.producto-card');
  const facturacionRapidaProductos = document.getElementById('facturacionRapidaProductos');

  facturacionRapidaProductos.innerHTML = '';

  productos.forEach((producto, index) => {
    const nombreProducto = producto.querySelector('.nombreProducto').textContent;
    const cantidad = parseInt(producto.querySelector('.cantidad').value);

    const col = document.createElement('div');
    col.classList.add('col-md-4');

    const formGroup = document.createElement('div');
    formGroup.classList.add('form-group');

    const label = document.createElement('label');
    label.textContent = nombreProducto;
    formGroup.appendChild(label);

    const input = document.createElement('input');
input.type = 'number';
input.min = '0';
input.max = '999999'; 
input.value = cantidad;
input.classList.add('form-control', 'facturacion-rapida-cantidad');
input.setAttribute('data-producto', nombreProducto);


input.addEventListener('change', function() {
    if (this.value > 999999) {
        this.value = 999999;
        alert('El valor máximo permitido es 999999');
    }
});

formGroup.appendChild(input);

    col.appendChild(formGroup);
    facturacionRapidaProductos.appendChild(col);

    if ((index + 1) % 3 === 0) {
      const clearfix = document.createElement('div');
      clearfix.classList.add('clearfix');
      facturacionRapidaProductos.appendChild(clearfix);
    }
  });
}

function resetearValoresFacturacionComun() {
  const listaProductos = document.getElementById('listaProductos');
  const productos = listaProductos.querySelectorAll('.producto-card');

  productos.forEach(producto => {
    producto.querySelector('.cantidad').value = 0;
  });
}


document.querySelector("#facturarapida1 .btn.btn-secondary").addEventListener("click", () => {
  resetearValoresFacturacionComun();
});


document.getElementById('facturacionRapidaBtn').addEventListener('click', () => {
  actualizarFacturacionRapida();
  $('#facturarapida1').modal('show');
});

document.getElementById('cargarFacturacionRapida').addEventListener('click', () => {
  cargarConfiguracionFacturacionRapida();
});

 document.getElementById('cargarFacturacionRapida').addEventListener('click', function() {
    const button = this;
    const text = button.querySelector('.original-text');

    text.textContent = 'Cargado';

    setTimeout(function() {
      text.textContent = 'Factura Rápida';
    }, 1000);
  });


const facturacionRapidaBtn = document.getElementById('facturacionRapidaBtn');
const facturarapida1 = document.getElementById('facturarapida1');

facturacionRapidaBtn.addEventListener('click', function () {

  const listaProductos = document.getElementById('listaProductos');
  const productos = listaProductos.querySelectorAll('.producto-card');
  const hayProductos = productos.length > 0;
  const mensajeContainer = facturarapida1.querySelector('.mensaje-container');
  const aplicarFacturacionRapida = document.getElementById('aplicarFacturacionRapida');

  if (hayProductos) {
    mensajeContainer.style.display = 'none';
    aplicarFacturacionRapida.style.display = 'block';
  } else {
    mensajeContainer.style.display = 'block';
    aplicarFacturacionRapida.style.display = 'none';
  }
});


const restablecerFacturacionRapida = document.getElementById('restablecerFacturacionRapida');

restablecerFacturacionRapida.addEventListener('click', function () {
  const confirmacion = confirm('¿Quieres restablecer todos los valores de los campos?');

  if (confirmacion) {
    const facturacionRapidaProductos = document.getElementById('facturacionRapidaProductos');
    const inputs = facturacionRapidaProductos.querySelectorAll('.facturacion-rapida-cantidad');

    inputs.forEach(input => {
      input.value = 0;
    });
  }
});



function filterTable() {
  const searchInput = document.getElementById("searchInput");
  const searchValue = searchInput.value.toLowerCase();
  const minPriceInput = document.getElementById("minPriceInput");
  const maxPriceInput = document.getElementById("maxPriceInput");
  const minPrice = parseFloat(minPriceInput.value) || -Infinity;
  const maxPrice = parseFloat(maxPriceInput.value) || Infinity;
  const table = document.getElementById("historialVentasTbody");
  const rows = table.querySelectorAll("tr");

  rows.forEach(row => {
    const productosCell = row.querySelector("td:nth-child(2)");
    const productosText = productosCell.textContent.toLowerCase();
    const totalCell = row.querySelector("td:nth-child(3)");
    const total = parseFloat(totalCell.textContent.replace("$", ""));

    if (productosText.includes(searchValue) && total >= minPrice && total <= maxPrice) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

function deleteSales() {
  const tableBody = document.getElementById("historialVentasTbody");
  tableBody.innerHTML = "";
  saveSalesToLocalStorage();
}

const itemsPerPage = 10;
let currentPage = 1;

function updateSalesTable() {
  const tableBody = document.getElementById("historialVentasTbody");
  const sales = Array.from(tableBody.children);
  sales.forEach((sale, index) => {
    sale.style.display = index >= (currentPage - 1) * itemsPerPage && index < currentPage * itemsPerPage ? "" : "none";
  });
}

function updatePagination() {
  const tableBody = document.getElementById("historialVentasTbody");
  const totalPages = Math.ceil(tableBody.children.length / itemsPerPage);
  const pagination = document.getElementById("salesPagination");
  
  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.classList.add("page-item");
    if (i === currentPage) li.classList.add("active");
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      updateSalesTable();
      updatePagination();
    });
    pagination.appendChild(li);
  }
}

const autoguardarProductos = document.getElementById('autoguardarProductos');

autoguardarProductos.addEventListener('change', () => {
  guardarEstadoAutoguardado();

  if (autoguardarProductos.checked) {
    guardarProductos();
  }
});

function guardarEstadoAutoguardado() {
  const autoguardadoActivo = autoguardarProductos.checked;
  localStorage.setItem('autoguardadoActivo', autoguardadoActivo);
}

function cargarEstadoAutoguardado() {
  const autoguardadoActivo = localStorage.getItem('autoguardadoActivo');

  if (autoguardadoActivo === 'true') {
    autoguardarProductos.checked = true;
  } else {
    autoguardarProductos.checked = false;
  }
}



init();
