const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
const btnLogout = document.querySelector(".closeSesion");
const form = document.querySelector("form");
const contenedor = document.querySelector(".resumen-de-transacciones");
const mensajeVacio = document.querySelector(".mjs-sin-transacciones");
const selectCategoria = document.getElementById("categoria");
const radiosTipo = document.querySelectorAll("input[name='tipo']");
const inputMonto = document.getElementById("Number");

// cards
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

// 📦 datos
let transacciones = JSON.parse(localStorage.getItem(`tx_${usuario.email}`)) || [];

// 📂 categorías
const categorias = {
    gasto: ["Alimentación", "Transporte", "Vivienda", "Entretenimiento", "Salud", "Educación", "Otros"],
    ingreso: ["Salario", "Freelance", "Inversiones", "Regalos", "Otros"]
};

// 🔄 render categorías
function renderCategorias(tipo) {
    selectCategoria.innerHTML = "";

    categorias[tipo].forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        selectCategoria.appendChild(option);
    });
}

radiosTipo.forEach(radio => {
    radio.addEventListener("change", () => {
        renderCategorias(radio.id);
    });
});

renderCategorias("gasto");

// 🔢 solo números
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

                <div class="acciones">
                <img src="../assets/icons/edit.svg" class="btn-edit" data-id="${tx.id}">
                <img src="../assets/icons/delete.svg" class="btn-delete" data-id="${tx.id}">
            </div>
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
        contenedor.appendChild(crearTransaccionHTML(tx));
    });
}

// 📝 submit
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const monto = Number(document.getElementById("Number").value);
    const descripcion = document.getElementById("descripcion").value.trim();
    const categoria = document.getElementById("categoria").value;
    const tipo = document.querySelector("input[name='tipo']:checked").id;

    if (!monto || monto <= 0) {
        alert("Ingresa un monto válido");
        return;
    }

    if (!descripcion) {
        alert("Ingresa una descripción");
        return;
    }

    const nuevaTransaccion = {
        id: Date.now(),
        monto,
        descripcion,
        categoria: categoria || "General",
        tipo,
        fecha: new Date().toISOString()
    };

    transacciones.unshift(nuevaTransaccion);

    guardar();
    renderTransacciones();
    renderResumen();
    form.reset();
});

// 💾 guardar
function guardar() {
    localStorage.setItem(`tx_${usuario.email}`, JSON.stringify(transacciones));
}

// 🧮 resumen mensual
function calcularResumen() {
    let totalIngresos = 0;
    let totalGastos = 0;

    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();

    transacciones.forEach(tx => {
        const fecha = new Date(tx.fecha);

        if (
            fecha.getMonth() === mesActual &&
            fecha.getFullYear() === añoActual
        ) {
            if (tx.tipo === "ingreso") {
                totalIngresos += tx.monto;
            } else {
                totalGastos += tx.monto;
            }
        }
    });

    return {
        balance: totalIngresos - totalGastos,
        ingresos: totalIngresos,
        gastos: totalGastos
    };
}

// 🎯 pintar cards
function renderResumen() {
    const { balance, ingresos, gastos } = calcularResumen();

    balanceTotalEl.textContent = `$ ${balance.toLocaleString("es-CO")}`;
    ingresosEl.textContent = `$ ${ingresos.toLocaleString("es-CO")}`;
    gastosEl.textContent = `$ ${gastos.toLocaleString("es-CO")}`;

    const rendimientoEl = document.querySelector(".rendimiento");

    let porcentaje = gastos > 0 ? (balance / gastos) * 100 : 0;
    let signo = porcentaje >= 0 ? "+" : "-";

    rendimientoEl.textContent = `${signo}${Math.abs(porcentaje).toFixed(1)}%`;
}

// 🧠 EVENTOS EDITAR / BORRAR
contenedor.addEventListener("click", (e) => {
    const id = Number(e.target.dataset.id);

    // 🗑️ eliminar
    if (e.target.classList.contains("btn-delete")) {
        const confirmar = confirm("¿Seguro que quieres eliminar esta transacción?");

        if (confirmar) {
            transacciones = transacciones.filter(tx => tx.id !== id);
            guardar();
            renderTransacciones();
            renderResumen();
        }
    }

    // ✏️ editar
    if (e.target.classList.contains("btn-edit")) {
        const tx = transacciones.find(t => t.id === id);

        const nuevoMonto = prompt("Nuevo monto:", tx.monto);
        const nuevaDesc = prompt("Nueva descripción:", tx.descripcion);

        if (!nuevoMonto || !nuevaDesc) return;

        tx.monto = Number(nuevoMonto);
        tx.descripcion = nuevaDesc;

        guardar();
        renderTransacciones();
        renderResumen();
    }
});

// 🚀 init
renderTransacciones();
renderResumen();

// localStorage.removeItem(`tx_${usuario.email}`);