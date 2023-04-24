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
  cargarCategoriasSelect('categoriaProductoAgregar');
  cargarCategoriasSelect('filtrarCategorias');

  const productos = document.querySelector('.productos');
  productos.style.backgroundColor = '#fff';

  const exportarDatosBtn = document.querySelector("#historialVentasModal .btn-primary");
  exportarDatosBtn.addEventListener("click", exportarDatos);

  document.querySelector("#historialVentasModal .btn-close").addEventListener("click", closeModal);
  document.querySelector("#historialVentasModal .btn-secondary").addEventListener("click", closeModal);

  const facturarRapidaModal = $("#facturarapida1");
  const cargarFacturacionRapidaBtn = document.getElementById("cargarFacturacionRapida");
  cargarFacturacionRapidaBtn.addEventListener("click", cargarValoresFacturacionRapida);

  $("#listaProductos").sortable({
    placeholder: "placeholder",
    forcePlaceholderSize: true,
    stop: () => {
      guardarOrdenTarjetas();
      guardarProductos();
    }
  });

  const abrirAdministrarCategorias = document.getElementById('abrirAdministrarCategorias');
  const administrarCategoriasModalElement = document.getElementById('administrarCategoriasModal');
  const administrarCategoriasModal = new bootstrap.Modal(administrarCategoriasModalElement);

  abrirAdministrarCategorias.addEventListener('click', function () {
    const categoriasContainer = document.getElementById('categoriasContainer');
    categoriasContainer.innerHTML = '';
    cargarCategorias();
    administrarCategoriasModal.show();
  });

  document.getElementById('cancelarEliminarCategoria').addEventListener('click', cerrarConfirmarEliminarCategoriaModal);
  document.getElementById('agregarCategoria').removeEventListener('click', agregarCategoria);
  document.getElementById('agregarCategoria').addEventListener('click', agregarCategoriaBtnHandler);
  document.getElementById('guardarCategorias').addEventListener('click', () => {
    guardarCategorias();
    cargarCategoriasSelect('filtrarCategorias');
  });
   document.getElementById('cancelarAdministrarCategorias').addEventListener('click', cerrarAdministrarCategorias);
  document.getElementById('cerrarAdministrarCategorias').addEventListener('click', cerrarAdministrarCategorias);
  document.getElementById('buscarProducto').addEventListener('input', filtrarProductos);
  document.getElementById('siguienteCliente').addEventListener('click', siguienteCliente);
  document.getElementById('save-btn').addEventListener('click', saveOptions);
  document.getElementById('reset-final-text-btn').addEventListener('click', resetFinalText);
  document.getElementById('reset-quick-text-1-btn').addEventListener('click', resetQuickText1);
  document.getElementById('reset-quick-text-2-btn').addEventListener('click', resetQuickText2);
  document.getElementById('reset-quick-text-3-btn').addEventListener('click', resetQuickText3);

  document.getElementById('confirmarEliminarCategoria').addEventListener('click', () => {
    if (categoriaAEliminar) {
      categoriaAEliminar.remove();
      categoriaAEliminar = null;
    }
    cerrarConfirmarEliminarCategoriaModal();
  });
  
});

let productoId = 0;

function agregarProducto() {
  mostrarOcultarBotonFacturar(); 
  const categoriaSeleccionada = document.getElementById('categoriaProductoAgregar').value;
  if (agregarProductoSinNotificacion(categoriaSeleccionada)) {
    mostrarNotificacion('Producto agregado correctamente', 'success', '');

    if (autoguardarProductos.checked) {
      guardarProductos();
    }

    showStep(0);
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
  cargarCategoriasSelect('categoriaProducto');
  actualizarCategoriaSelect(producto);
  editarProductoModal.show();

  confirmarEditarProducto.onclick = () => {
    const nuevoNombreProducto = nuevoNombreInput.value.trim();
    const nuevoPrecio = parseFloat(nuevoPrecioInput.value);
    const nuevaCategoriaProducto = document.getElementById('categoriaProducto').value;
    if (nuevaCategoriaProducto) {
      const categoriaNombre = producto.querySelector('.categoriaNombre');
      categoriaNombre.textContent = nuevaCategoriaProducto;

      const nuevoColorCategoria = obtenerColorCategoria(nuevaCategoriaProducto);
      categoriaNombre.style.backgroundColor = nuevoColorCategoria;
      categoriaNombre.style.color = 'white';
      producto.querySelector('.categoriaProducto').textContent = nuevaCategoriaProducto;
    }

    if (nuevoNombreProducto.length < 2) {
      alert('El nombre del producto debe tener al menos 2 caracteres.');
      return;
    }

    if (nuevoPrecio == 0 || nuevoPrecio <= 0) {
      alert('No se pueden agregar productos con precio 0 o menor.');
      return;
    }

    if (nuevoNombreProducto && nuevoNombreProducto !== nombreProducto.textContent && !esProductoDuplicado(nuevoNombreProducto)) {
      nombreProducto.textContent = nuevoNombreProducto;
    } else if (nuevoNombreProducto && nuevoNombreProducto !== nombreProducto.textContent) {
      alert('No se pueden agregar productos con el mismo nombre.');
    }

    if (nuevoPrecio) {
      precio.textContent = `$${nuevoPrecio.toFixed(2)}`;
    }

    if (nuevaCategoriaProducto) {
      producto.querySelector('.categoriaProducto').textContent = nuevaCategoriaProducto;
    }
    guardarProductos();
    editarProductoModal.hide();
  };

  cancelarEditarProducto.onclick = () => {
    editarProductoModal.hide();
  };

  cerrarEditarProducto.onclick = () => {
    editarProductoModal.hide();
  };

  eliminarProductoModal.onclick = () => {
    eliminarProducto(producto, editarProductoModal);
  };
}




function eliminarProducto(producto, editarProductoModal) {
  const confirmDeleteSingleModal = $("#confirmDeleteSingleModal");
  const confirmDeleteSingleBtn = document.getElementById("confirmDeleteSingle");

  confirmDeleteSingleModal.modal("show");
  confirmDeleteSingleBtn.addEventListener("click", () => {

    producto.remove();
    mostrarNotificacion('Producto eliminado correctamente', 'success');
    mostrarOcultarBotonFacturar();
    cerrarEditarProductoModal();
    guardarProductos();
    cargarProductos();
    confirmDeleteSingleModal.modal("hide");
    cerrarEditarProducto.click();
  });
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
      detalle.innerHTML = `${nombreProducto} ($${precio}) x${cantidad} unid. = $${subtotal.toFixed(2)}`;
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
    const categoriaProducto = li.querySelector('.categoriaProducto');

    if (nombreProducto && precio && categoriaProducto) {
      return {
        nombreProducto: nombreProducto.textContent,
        precio: parseFloat(precio.textContent.substring(1)),
        categoria: categoriaProducto.textContent,
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

  const tarjetasOrdenJson = localStorage.getItem('tarjetasOrden');
  let tarjetasOrden = [];
  if (tarjetasOrdenJson) {
    tarjetasOrden = JSON.parse(tarjetasOrdenJson);
  }

  if (tarjetasOrden.length > 0) {
    productos.sort((a, b) => {
      const indexA = tarjetasOrden.indexOf(a.nombreProducto);
      const indexB = tarjetasOrden.indexOf(b.nombreProducto);
      return indexA - indexB;
    });
  }

  const listaProductos = document.getElementById('listaProductos');
  listaProductos.innerHTML = '';

  productos.forEach(producto => {
    document.getElementById('nombreProducto').value = producto.nombreProducto;
    document.getElementById('precio').value = producto.precio;
    document.getElementById('categoriaProducto').value = producto.categoria;
    agregarProductoSinNotificacion(producto.categoria);
  });

  cargarOrdenTarjetas();
}


function agregarProductoSinNotificacion(categoria) {
  const nombreProducto = document.getElementById('nombreProducto').value.trim();
  const precio = document.getElementById('precio').value;
  const categoriaColor = obtenerColorCategoria(categoria);


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
  nuevoProducto.innerHTML = document
    .getElementById('productoTemplate')
    .innerHTML.replace(/{id}/g, productoId)
    .replace('{nombreProducto}', nombreProducto)
    .replace('{precio}', precio)
    .replace('{categoria}', categoria || '')
    .replace('{categoriaNombre}', categoria || '')
    .replace('{categoriaColor}', categoriaColor || '');


  nuevoProducto.querySelector('.editarProducto').addEventListener('click', editarProducto);

  const listItem = nuevoProducto.querySelector(".producto-grid-item");
  if (listItem) {
    listItem.className += productoId % 2 === 0 ? ' par' : ' impar';
  }
  listaProductos.appendChild(nuevoProducto);
  productoId++;
  mostrarOcultarBotonFacturar();

  document.getElementById('nombreProducto').value = '';
  document.getElementById('precio').value = '';

  return true;
}

function obtenerColorCategoria(categoria) {
  const categorias = JSON.parse(localStorage.getItem('categorias')) || [];
  const categoriaEncontrada = categorias.find(cat => cat.nombre === categoria);
  return categoriaEncontrada ? categoriaEncontrada.color : '#000000';
}


function exportarProductos() {
  const listaProductos = document.getElementById('listaProductos');
  const productos = Array.from(listaProductos.children).map(li => {
    const nombreProducto = li.querySelector('.nombreProducto').textContent;
    const precio = parseFloat(li.querySelector('.precio').textContent.substring(1));
    const categoriaProducto = li.querySelector('.categoriaProducto').textContent;
    return { nombreProducto, precio, categoria: categoriaProducto };
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
      document.getElementById('categoriaProducto').value = producto.categoria;
      agregarProducto();
    });

    showNotification('Productos importados correctamente');
  };
  reader.readAsText(archivo);
}




const botonToggleAgregarProducto = document.getElementById('toggleAgregarProducto');
const contenidoFormularioAgregarProducto = document.querySelector('.contenidoFormulario');
const tarjetasProducto = document.querySelectorAll('.producto-card');

botonToggleAgregarProducto.addEventListener('click', () => {
  contenidoFormularioAgregarProducto.classList.toggle('mostrar');
  botonToggleAgregarProducto.innerHTML = contenidoFormularioAgregarProducto.classList.contains('mostrar') ? '<i class="fas fa-chevron-up"></i> Ocultar Menú' : '<i class="fas fa-chevron-down"></i> Agregar Producto';

  const hayProductos = document.getElementById('listaProductos').children.length > 0;
  const menuDesplegado = contenidoFormularioAgregarProducto.classList.contains('mostrar');
  actualizarTextoProductosAFacturar(menuDesplegado, hayProductos);
  
  if (contenidoFormularioAgregarProducto.classList.contains('mostrar')) {
    const seccionFacturacion = document.querySelector('.facturacion');
    document.querySelectorAll('.producto-card').forEach(tarjeta => tarjeta.style.backgroundColor = '#b4bbc817');
    botonToggleAgregarProducto.classList.add('toggle-active');
    const buscarProducto = document.getElementById('buscarProducto');
    const productosAFacturar = document.getElementById('productosAFacturar');
    const botonFacturar = document.getElementById('facturar');
    const botonSiguienteCliente = document.getElementById('siguienteCliente');
    seccionFacturacion.style.display = 'none';
    filtrarCategorias.style.display = 'none';

    const productos = document.querySelector('.productos');
    productos.style.backgroundColor = '#fafafa';

    buscarProducto.style.display = 'none';
    productosAFacturar.style.display = 'none';
    botonFacturar.style.display = 'none';
    botonSiguienteCliente.style.display = 'none';
  } else {
    mostrarOcultarBotonFacturar();
  }
});



function mostrarOcultarBotonFacturar() {
  const listaProductos = document.getElementById('listaProductos');
  const botonFacturar = document.getElementById('facturar');
  const buscarProducto = document.getElementById('buscarProducto');
  const filtrarCategorias = document.getElementById('filtrarCategorias');
  const siguienteCliente = document.getElementById('siguienteCliente');
  const facturacion = document.querySelector('.facturacion');
  const contenedorBuscarFiltrar = document.getElementById('contenedorBuscarFiltrar');

  const menuDesplegado = contenidoFormularioAgregarProducto.classList.contains('mostrar');
  const hayProductos = listaProductos.children.length > 0;

  actualizarTextoProductosAFacturar(menuDesplegado, hayProductos);

  if (!hayProductos || menuDesplegado) {
    botonFacturar.style.display = 'none';
    buscarProducto.style.display = 'none';
    filtrarCategorias.style.display = 'none';
    siguienteCliente.style.display = 'none';
    facturacion.style.display = 'none';
    contenedorBuscarFiltrar.style.display = 'none';
  } else {
    botonFacturar.style.display = 'block';
    buscarProducto.style.display = 'block';
    filtrarCategorias.style.display = 'block';
    siguienteCliente.style.display = 'block';
    facturacion.style.display = 'block';
    contenedorBuscarFiltrar.style.display = 'block';
  }
}





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

modalBtn.onclick = function () {
  modalContainer.style.display = "block";
}

closeModalBtn.onclick = function () {
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

resetBtn.onclick = function () {
  messageInput.value = "/do La factura mostraría: ";
}

resetEndMessageBtn.onclick = function () {
  endMessageInput.value = defaultEndMessage;
}

optionsBtn.onclick = function () {
  modalContainer.style.display = "block";
}

modalContainer.addEventListener("click", function (event) {
  event.stopPropagation();
});

var resetEndMessageBtn = document.getElementById("reset-end-message-btn");
resetEndMessageBtn.addEventListener("click", function () {
  var endMessageInput = document.getElementById("end-message-input");
  endMessageInput.value = "Favor de abonar el importe al tendero más cercano. Gracias por su compra.";
});

var saveBtn = document.getElementById("save-btn");
saveBtn.addEventListener("click", function () {
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


resetBtn.onclick = function () {
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
      const cantidad = item.textContent.split(" x")[1].split(" unid.")[0];
      const subtotal = item.textContent.split(" = $")[1];
      itemsFacturados += `${detalleProducto} x${cantidad} unid. ($${subtotal}) + `;
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
  if (event.altKey) {
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


    input.addEventListener('change', function () {
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

document.getElementById('cargarFacturacionRapida').addEventListener('click', function () {
  const button = this;
  const text = button.querySelector('.original-text');

  text.textContent = 'Cargado';

  setTimeout(function () {
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

let allProductCards = [];

function cargarOrdenTarjetas() {
  const listaProductos = document.getElementById('listaProductos');
  const tarjetasOrdenJson = localStorage.getItem('tarjetasOrden');

  if (tarjetasOrdenJson) {
    const tarjetasOrden = JSON.parse(tarjetasOrdenJson);

    allProductCards = Array.from(listaProductos.children);

    const tarjetasOrdenadas = tarjetasOrden.map((nombreProducto) => {
      return allProductCards.find((producto) => {
        return producto.querySelector('.nombreProducto').textContent === nombreProducto;
      });
    }).filter(tarjeta => tarjeta);

    tarjetasOrdenadas.forEach((tarjeta) => {
      listaProductos.appendChild(tarjeta);
    });
  } else {
    allProductCards = Array.from(listaProductos.children);
  }
}




function guardarOrdenTarjetas() {
  const tarjetas = document.querySelectorAll("#listaProductos .producto-card");
  const ordenTarjetas = Array.from(tarjetas).map(tarjeta => tarjeta.dataset.id);
  localStorage.setItem("ordenTarjetas", JSON.stringify(ordenTarjetas));
  console.log("Guardando orden de tarjetas:", ordenTarjetas);
}


const eliminarProductoModal = document.getElementById("eliminarProductoModal");
const confirmaDeleteAll = $("#confirmDeleteAllModal");
const confirmarDeleteAllBtn = document.getElementById("confirmDeleteAll");

let timeoutID;
let startTime;
const fillDuration = 3000;

function setButtonProgress(progress) {
  eliminarProductoModal.innerHTML = `Eliminar<div style="position: absolute; top: 0; left: 0; width: ${progress * 100}%; height: 100%; background-color: rgba(0, 0, 0, 0.2);"></div>`;
}

eliminarProductoModal.addEventListener("mousedown", () => {
  startTime = Date.now();
  setButtonProgress(0);
  timeoutID = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    const progress = elapsedTime / fillDuration;
    if (progress >= 1) {
      clearInterval(timeoutID);
      setButtonProgress(0);
      confirmaDeleteAll.modal("show");
    } else {
      setButtonProgress(progress);
    }
  }, 100);
});

eliminarProductoModal.addEventListener("mouseleave", () => {
  clearInterval(timeoutID);
  setButtonProgress(0);
});



eliminarProductoModal.addEventListener("mouseup", () => {
  clearInterval(timeoutID);
  setButtonProgress(0);
});

let editarProductoModal;


confirmarDeleteAllBtn.addEventListener("click", () => {
  const listaProductos = document.getElementById("listaProductos");
  listaProductos.innerHTML = "";
  confirmaDeleteAll.modal("hide");
  guardarProductos();
  cerrarEditarProducto.click();
  cerrarEditarProductoModal();
});


function cerrarEditarProductoModal() {
  $('#editarProductoModal').modal('hide');
}


function agregarCategoria(nombre = '', color = '#000000') {
  const categoriaTemplate = `
    <div class="categoria mb-2 d-flex">
      <input type="text" class="form-control nombreCategoria" value="${nombre}" placeholder="Nueva Categoría" maxlength="12">
      <input type="color" class="form-control colorCategoria" value="${color}">
      <!-- Agrega este botón -->
      <button class="btn btn-danger eliminarCategoria ml-2">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  const categoriasContainer = document.getElementById('categoriasContainer');
  categoriasContainer.insertAdjacentHTML('beforeend', categoriaTemplate);

  const eliminarCategoriaBtn = categoriasContainer.querySelector('.categoria:last-child .eliminarCategoria');
  eliminarCategoriaBtn.addEventListener('click', eliminarCategoria);
}

function cerrarAdministrarCategorias() {
  if (administrarCategoriasModal) {
    administrarCategoriasModal.hide();
  }
}

function abrirAdministrarCategorias() {
  if (!administrarCategoriasModal) {
    administrarCategoriasModal = new bootstrap.Modal(document.getElementById('administrarCategoriasModal'), {
      backdrop: 'static',
      keyboard: false
    });
  }
  
  cargarCategorias();
  administrarCategoriasModal.show();
}



function agregarCategoriaBtnHandler() {
  agregarCategoria('Nueva Categoría');
}

function guardarCategorias() {
  const categoriasContainer = document.getElementById('categoriasContainer');
  const categorias = Array.from(categoriasContainer.querySelectorAll('.categoria'));
  const categoriasData = categorias.map(categoria => {
    return {
      nombre: categoria.querySelector('.nombreCategoria').value,
      color: categoria.querySelector('.colorCategoria').value
    };
  });

  localStorage.setItem('categorias', JSON.stringify(categoriasData));
  cerrarAdministrarCategorias();
  actualizarCategoriasProductos();
  cargarCategoriasSelect('categoriaProductoAgregar');

  const categoriasNotificacion = document.getElementById('categoriasNotificacion');
  categoriasNotificacion.classList.remove('d-none');
  setTimeout(() => {
    categoriasNotificacion.classList.add('d-none');
  }, 3000);


}

function cargarCategorias() {
  const categoriasContainer = document.getElementById('categoriasContainer');
  categoriasContainer.innerHTML = '';
  
  const categoriasData = JSON.parse(localStorage.getItem('categorias')) || [];

  categoriasData.forEach(categoriaData => {
    agregarCategoria(categoriaData.nombre, categoriaData.color);
  });
}


let categoriaAEliminar = null;

function eliminarCategoria(event) {
  categoriaAEliminar = event.target.closest('.categoria');
  if (categoriaAEliminar) {
    abrirConfirmarEliminarCategoriaModal();
  }
}

let confirmarEliminarCategoriaModal = null;

function abrirConfirmarEliminarCategoriaModal() {
  if (!confirmarEliminarCategoriaModal) {
    confirmarEliminarCategoriaModal = new bootstrap.Modal(document.getElementById('confirmarEliminarCategoriaModal'), {
      backdrop: 'static',
      keyboard: false
    });
  }
  confirmarEliminarCategoriaModal.show();
}

function cerrarConfirmarEliminarCategoriaModal() {
  if (confirmarEliminarCategoriaModal) {
    confirmarEliminarCategoriaModal.hide();
  }
}

function cargarCategoriasSelect(selectElementId) {
  const categoriasSelect = document.getElementById(selectElementId);
  categoriasSelect.innerHTML = '';

  if (selectElementId === 'filtrarCategorias') {
    const todasCategoriasOption = document.createElement('option');
    todasCategoriasOption.value = '';
    todasCategoriasOption.textContent = 'Todas las categorías';
    categoriasSelect.appendChild(todasCategoriasOption);
  } else {
    const sinCategoriaOption = document.createElement('option');
    sinCategoriaOption.value = '';
    sinCategoriaOption.textContent = 'Sin Categoría';
    categoriasSelect.appendChild(sinCategoriaOption);
  }

  const categorias = JSON.parse(localStorage.getItem('categorias')) || [];
  categorias.forEach(categoria => {
    const option = document.createElement('option');
    option.value = categoria.nombre;
    option.textContent = categoria.nombre;
    categoriasSelect.appendChild(option);
  });
}



function actualizarCategoriaSelect(producto) {
  const categoriaProducto = producto.querySelector('.categoriaProducto').textContent;
  const categoriaSelect = document.getElementById('categoriaProducto');
  categoriaSelect.value = categoriaProducto;
}


function actualizarCategoriasProductos() {
  const categorias = JSON.parse(localStorage.getItem('categorias')) || [];
  const productos = document.querySelectorAll('.producto-card');

  productos.forEach(producto => {
    const categoriaProducto = producto.querySelector('.categoriaProducto').textContent;
    const categoriaEncontrada = categorias.find(cat => cat.nombre === categoriaProducto);

    if (categoriaEncontrada) {
      const categoriaNombre = producto.querySelector('.categoriaNombre');
      categoriaNombre.textContent = categoriaEncontrada.nombre;
      categoriaNombre.style.backgroundColor = categoriaEncontrada.color;
      categoriaNombre.style.color = 'white';
    }
  });
}

function showStep(index) {
  const steps = $(".step");
  steps.css("transform", `translateX(-${index * 100}%)`);
}

function esProductoDuplicado(nombreProducto) {
  const listaProductos = document.getElementById('listaProductos');
  const productos = listaProductos.querySelectorAll('.nombreProducto');
  return Array.from(productos).some(producto => producto.textContent === nombreProducto);
}

$(document).ready(function () {
  $("#next1").click(function () {
    const nuevoNombreProducto = $("#nombreProducto").val().trim();
    const errorMsg1 = $("#errorMsg1");
    errorMsg1.hide();

    if (nuevoNombreProducto.length < 2) {
      errorMsg1.text("El nombre del producto debe tener al menos 2 caracteres.");
      errorMsg1.show();
      return;
    }

    if (esProductoDuplicado(nuevoNombreProducto)) {
      errorMsg1.text("El producto ingresado ya existe.");
      errorMsg1.show();
      return;
    }

    showStep(1);
  });

  $("#back1").click(function () {
    showStep(0);
  });

  $("#next2").click(function () {
    const nuevoPrecio = parseFloat($("#precio").val());
    const errorMsg2 = $("#errorMsg2");
    errorMsg2.hide();

    if (isNaN(nuevoPrecio) || nuevoPrecio < 1) {
      errorMsg2.text("No se pueden agregar productos con precio 0 o menor.");
      errorMsg2.show();
      return;
    }
    showStep(2);
  });

  $("#back2").click(function () {
    showStep(1);
  });
});

document.getElementById("categoriaLink").addEventListener("click", abrirAdministrarCategorias);

let administrarCategoriasModal;

document.getElementById('filtrarCategorias').addEventListener('change', filtrarProductosPorCategoria);

function filtrarProductosPorCategoria() {
  const categoriaSeleccionada = document.getElementById('filtrarCategorias').value;
  const productos = document.querySelectorAll('.producto-card');

  productos.forEach(producto => {
    const categoriaProducto = producto.querySelector('.categoriaProducto').textContent;

    if (categoriaSeleccionada === '' || categoriaProducto === categoriaSeleccionada) {
      producto.style.display = 'block';
    } else {
      producto.style.display = 'none';
    }
  });
}



function actualizarTextoProductosAFacturar(menuDesplegado, hayProductos) {
  const productosAFacturar = document.getElementById('productosAFacturar');

  if (!menuDesplegado && hayProductos) {
    productosAFacturar.style.display = '';
    productosAFacturar.querySelector('span').classList.remove('zoom');
    productosAFacturar.querySelector('span').textContent = "Productos a Facturar";
  } else if (!menuDesplegado && !hayProductos) {
    productosAFacturar.style.display = '';
    productosAFacturar.querySelector('span').classList.add('zoom');
    productosAFacturar.querySelector('span').textContent = "Agregue productos para comenzar";
  } else {
    productosAFacturar.style.display = 'none';
  }
}

document.getElementById('filtrarCategorias').addEventListener('change', filterAndReorderProducts);

function filterAndReorderProducts() {
  const selectedCategory = document.getElementById('filtrarCategorias').value;
  const listaProductos = document.getElementById('listaProductos');

  allProductCards.forEach(card => {
    const productCategory = card.querySelector('.categoriaProducto').textContent;
    if (selectedCategory === '' || productCategory === selectedCategory) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}




init();
