const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
const btnLogout = document.querySelector(".closeSesion");
const form = document.querySelector("form");
const contenedor = document.querySelector(".resumen-de-transacciones");
const mensajeVacio = document.querySelector(".mjs-sin-transacciones");
const selectCategoria = document.getElementById("categoria");
const radiosTipo = document.querySelectorAll("input[name='tipo']");
const inputMonto = document.getElementById("Number");

// 🆕 NUEVO: referencias a las cards
const balanceTotalEl = document.querySelector(".card-cuenta-total .Saldo-total");
const ingresosEl = document.querySelector(".card-cuenta-enAlta .Saldo-total");
const gastosEl = document.querySelector(".card-cuenta-enBaja .Saldo-total");

// 🔐 protección
if (!usuario) {
    window.location.href = "login.html";
}

// 🔓 logout
btnLogout.addEventListener("click", () => {
    localStorage.removeItem("usuarioActivo");
    window.location.href = "login.html";
});

// 📦 cargar transacciones del usuario
let transacciones = JSON.parse(localStorage.getItem(`tx_${usuario.email}`)) || [];

// 📂 categorías
const categorias = {
    gasto: ["Alimentación", "Transporte", "Vivienda", "Entretenimiento", "Salud", "Educación", "Otros"],
    ingreso: ["Salario", "Freelance", "Inversiones", "Regalos", "Otros"]
};

// 🧠 render categorías
function renderCategorias(tipo) {
    selectCategoria.innerHTML = "";

    categorias[tipo].forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        selectCategoria.appendChild(option);
    });
}

// 🔄 cambio de tipo
radiosTipo.forEach(radio => {
    radio.addEventListener("change", () => {
        renderCategorias(radio.id);
    });
});

// carga inicial
renderCategorias("gasto");

// 🔢 input solo números
inputMonto.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "");
});

// 🧱 crear HTML
function crearTransaccionHTML(tx) {
    const div = document.createElement("div");

    div.classList.add(
        tx.tipo === "ingreso"
        ? "transaccion-resiente-ingreso"
        : "transaccion-resiente-gasto"
    );

    div.style.display = "block";

    div.innerHTML = `
        <div class="Descripcion-Tipo">
        <div class="texto-descriptivo">
            <p class="descripcion">${tx.descripcion}</p>
            <div class="tipo-fecha">
            <p class="tipo">${tx.categoria}</p>
            <span>•</span>
            <p class="fecha">${new Date(tx.fecha).toLocaleDateString()}</p>
            </div>
        </div>

        <div class="coste-transaccion">
            <p class="monto">
            ${tx.tipo === "ingreso" ? "+ $" : "- $"}
            ${Number(tx.monto).toLocaleString("es-CO")}
            </p>
        </div>
        </div>
    `;

    return div;
}

// 🧠 render
function renderTransacciones() {
    contenedor.innerHTML = "";

    if (transacciones.length === 0) {
        mensajeVacio.style.display = "flex";
        contenedor.appendChild(mensajeVacio);
        return;
    }

    mensajeVacio.style.display = "none";

    transacciones.forEach(tx => {
        const elemento = crearTransaccionHTML(tx);
        contenedor.appendChild(elemento);
    });
}

// 📝 submit
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const monto = Number(document.getElementById("Number").value);
    const descripcion = document.getElementById("descripcion").value.trim();
    const categoria = document.getElementById("categoria").value;
    const tipo = document.querySelector("input[name='tipo']:checked").id;

    // ✅ validaciones
    if (!monto || monto <= 0) {
        alert("Ingresa un monto válido");
        return;
    }

    if (!descripcion) {
        alert("Ingresa una descripción");
        return;
    }

    const nuevaTransaccion = {
        monto,
        descripcion,
        categoria: categoria || "General",
        tipo,
        fecha: new Date().toISOString()
    };

    transacciones.unshift(nuevaTransaccion);

    // 💾 guardar por usuario
    localStorage.setItem(`tx_${usuario.email}`, JSON.stringify(transacciones));

    renderTransacciones();
    renderResumen();
    form.reset();
});

// 🆕 NUEVO: calcular ingresos, gastos y balance
function calcularResumen() {
  let totalIngresos = 0;
  let totalGastos = 0;

  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const añoActual = hoy.getFullYear();

  transacciones.forEach(tx => {
    const fechaTx = parseFecha(tx.fecha);

    const esMismoMes =
      fechaTx.getMonth() === mesActual &&
      fechaTx.getFullYear() === añoActual;

    if (esMismoMes) {
      if (tx.tipo === "ingreso") {
        totalIngresos += tx.monto;
      } else {
        totalGastos += tx.monto;
      }
    }
  });

  const balance = totalIngresos - totalGastos;

  return {
    balance,
    ingresos: totalIngresos,
    gastos: totalGastos
  };
}

// 🆕 NUEVO: pintar los datos en las cards
function renderResumen() {
  const { balance, ingresos, gastos } = calcularResumen();

  balanceTotalEl.textContent = `$ ${balance.toLocaleString("es-CO")}`;
  ingresosEl.textContent = `$ ${ingresos.toLocaleString("es-CO")}`;
  gastosEl.textContent = `$ ${gastos.toLocaleString("es-CO")}`;

  const rendimientoEl = document.querySelector(".rendimiento");

let porcentaje = 0;

if (gastos > 0) {
  porcentaje = (balance / gastos) * 100;
}

const signo = porcentaje >= 0 ? "+" : "-";

rendimientoEl.textContent = `${signo}${Math.abs(porcentaje).toFixed(1)}%`;
}

function parseFecha(fecha) {
  // si ya es formato ISO → funciona normal
  if (fecha.includes("T")) {
    return new Date(fecha);
  }

  // si es formato viejo "25/4/2026"
  const partes = fecha.split("/");
  const dia = partes[0];
  const mes = partes[1] - 1;
  const año = partes[2];

  return new Date(año, mes, dia);
}

// 🚀 render inicial
renderTransacciones();
renderResumen();
