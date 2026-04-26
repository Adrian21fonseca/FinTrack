const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    // capturar datos
    const nombre = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const terms = document.getElementById("terms").checked;

    // 🧠 1. VALIDAR NOMBRE (solo letras y espacios)
    const nombreValido = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    if (!nombreValido.test(nombre)) {
        alert("El nombre solo debe contener letras");
        return;
    }

    // 🧠 2. VALIDAR PASSWORD (mínimo 8 caracteres)
    if (password.length < 8) {
        alert("La contraseña debe tener al menos 8 caracteres");
        return;
    }

    // 🧠 3. VALIDAR COINCIDENCIA
    if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
    }

    // 🧠 4. VALIDAR TÉRMINOS
    if (!terms) {
        alert("Debes aceptar los términos y condiciones");
        return;
    }

    // 🧠 5. OBTENER USUARIOS
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // 🧠 6. VALIDAR SI YA EXISTE
    const existe = usuarios.some(user => user.email === email);

    if (existe) {
        alert("Este correo ya está registrado");
        return;
    }

    // 🧠 7. CREAR USUARIO
    const nuevoUsuario = {
        nombre,
        email,
        password
    };

    // 🧠 8. GUARDAR
    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // 🧠 9. GUARDAR SESIÓN DIRECTAMENTE (auto login)
    localStorage.setItem("usuarioActivo", JSON.stringify(nuevoUsuario));

    // 🧠 10. ÉXITO
    alert("Registro exitoso 🚀");

    // 🧠 11. REDIRECCIÓN
    window.location.href = "dashboard.html";
});