const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    // capturar datos
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // obtener usuarios guardados
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // buscar coincidencia
    const usuarioEncontrado = usuarios.find(user => 
        user.email === email && user.password === password
    );

    if (usuarioEncontrado) {
        // guardar sesión activa
        localStorage.setItem("usuarioActivo", JSON.stringify(usuarioEncontrado));

        // redirigir al dashboard
        window.location.href = "dashboard.html";
    } else {
        alert("Correo o contraseña incorrectos");
    }
});