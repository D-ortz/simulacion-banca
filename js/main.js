let usuarioActivo = null;
let datosUsuarios = [];

async function cargarDatos() {
  const guardados = localStorage.getItem("usuarios");

  if (guardados) {
    datosUsuarios = JSON.parse(guardados);
  } else {
    const res = await fetch("data/usuarios.json");
    datosUsuarios = await res.json();
    localStorage.setItem("usuarios", JSON.stringify(datosUsuarios)); // Guarda los datos por primera vez
  }
}


function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  const encontrado = datosUsuarios.find(u => u.usuario === user && u.password === pass);
  if (encontrado) {
    usuarioActivo = encontrado;
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("mainSection").style.display = "block";
    document.getElementById("userNameDisplay").textContent = user;
  } else {
    Swal.fire("Error", "Usuario o contraseña incorrectos", "error");
  }
}

function mostrarSaldo() {
  document.getElementById("output").innerHTML = `<h3>Saldo actual: $${usuarioActivo.saldo}</h3>`;
}


function mostrarTransferencia() {
  const beneficiarios = usuarioActivo.beneficiarios;
  if (beneficiarios.length === 0) {
    Swal.fire("Sin beneficiarios", "Debes agregar un beneficiario primero", "warning");
    return;
  }

  let opciones = "";
  beneficiarios.forEach((b, i) => {
    opciones += `<option value="${i}">${b.nombre} - ${b.cuenta}</option>`;
  });

  document.getElementById("output").innerHTML = `
    <h3>Transferencia</h3>
    <label>Selecciona beneficiario:</label>
    <select id="beneficiarioSelect">${opciones}</select>
    <label>Monto a transferir:</label>
    <input type="number" id="montoTransferir" min="1" />
    <button onclick="realizarTransferencia()">Enviar</button>
  `;
}

function realizarTransferencia() {
  const indice = document.getElementById("beneficiarioSelect").value;
  const monto = parseFloat(document.getElementById("montoTransferir").value);

  if (isNaN(monto) || monto <= 0) {
    Swal.fire("Error", "Ingresa un monto válido", "error");
    return;
  }

  if (monto > usuarioActivo.saldo) {
    Swal.fire("Fondos insuficientes", "No tienes suficiente saldo", "error");
    return;
  }

  const beneficiario = usuarioActivo.beneficiarios[indice];
  usuarioActivo.saldo -= monto;
  usuarioActivo.movimientos.push({
    tipo: `Transferencia a ${beneficiario.nombre}`,
    monto: monto,
    fecha: new Date().toISOString().split("T")[0]
  });

  Swal.fire("Éxito", `Transferiste $${monto} a ${beneficiario.nombre}`, "success");
  mostrarSaldo();
}

function mostrarAgregarBeneficiario() {
  document.getElementById("output").innerHTML = `
    <h3>Agregar Beneficiario</h3>
    <label>Nombre:</label>
    <input type="text" id="nuevoNombre" />
    <label>Número de cuenta:</label>
    <input type="text" id="nuevaCuenta" />
    <button onclick="agregarBeneficiario()">Agregar</button>
  `;
}

function agregarBeneficiario() {
  const nombre = document.getElementById("nuevoNombre").value.trim();
  const cuenta = document.getElementById("nuevaCuenta").value.trim();

  if (nombre === "" || cuenta === "") {
    Swal.fire("Error", "Todos los campos son obligatorios", "error");
    return;
  }

  usuarioActivo.beneficiarios.push({ nombre, cuenta });
  guardarDatosUsuario();
  Swal.fire("Listo", `Beneficiario ${nombre} agregado correctamente`, "success");
}

function mostrarDeposito() {
  document.getElementById("output").innerHTML = `
    <h3>Depósito</h3>
    <label>Monto a depositar:</label>
    <input type="number" id="montoDeposito" min="1" />
    <button onclick="realizarDeposito()">Depositar</button>
  `;
}

function realizarDeposito() {
  const monto = parseFloat(document.getElementById("montoDeposito").value);
  if (isNaN(monto) || monto <= 0) {
    Swal.fire("Error", "Monto inválido", "error");
    return;
  }

  usuarioActivo.saldo += monto;
  usuarioActivo.movimientos.push({
    tipo: "Depósito",
    monto,
    fecha: new Date().toISOString().split("T")[0]
  });


  guardarDatosUsuario();
  Swal.fire("Depósito exitoso", `Se depositaron $${monto}`, "success");
  mostrarSaldo();
}


function mostrarRetiro() {
  document.getElementById("output").innerHTML = `
    <h3>Retiro</h3>
    <label>Monto a retirar:</label>
    <input type="number" id="montoRetiro" min="1" />
    <button onclick="realizarRetiro()">Retirar</button>
  `;
}

function realizarRetiro() {
  const monto = parseFloat(document.getElementById("montoRetiro").value);
  if (isNaN(monto) || monto <= 0) {
    Swal.fire("Error", "Monto inválido", "error");
    return;
  }

  if (monto > usuarioActivo.saldo) {
    Swal.fire("Fondos insuficientes", "No tienes suficiente saldo", "error");
    return;
  }

  usuarioActivo.saldo -= monto;
  usuarioActivo.movimientos.push({
    tipo: "Retiro",
    monto,
    fecha: new Date().toISOString().split("T")[0]
  });

  guardarDatosUsuario();
  Swal.fire("Retiro exitoso", `Retiraste $${monto}`, "success");
  mostrarSaldo();
}



function mostrarHistorial() {
  const movimientos = usuarioActivo.movimientos;
  if (movimientos.length === 0) {
    document.getElementById("output").innerHTML = "<h3>Sin movimientos</h3>";
    return;
  }

  let html = "<h3>Historial de movimientos</h3><ul>";
  movimientos.forEach(m => {
    html += `<li>${m.fecha}: ${m.tipo} - $${m.monto}</li>`;
  });
  html += "</ul>";

  document.getElementById("output").innerHTML = html;
}

function guardarDatosUsuario() {
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const index = usuarios.findIndex(u => u.usuario === usuarioActivo.usuario);
  if (index !== -1) {
    usuarios[index] = usuarioActivo;
  } else {
    usuarios.push(usuarioActivo);
  }
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));
}



window.onload = cargarDatos;
