const API_BASE = "http://localhost:3008/api";
const PADRON_API = "http://127.0.0.1:8000";

function cerrarModal() {
    document.getElementById("cedulaModal").classList.remove("active");
}

function showErrorModal(title, msg) {
    document.getElementById("modalLoading").style.display = "none";
    document.getElementById("modalSuccess").style.display = "none";
    document.getElementById("modalError").style.display = "none";
    document.getElementById("modalErrorTitle").textContent = title;
    document.getElementById("modalErrorMsg").textContent = msg;
    document.getElementById("modalError").style.display = "block";
    document.getElementById("cedulaModal").classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    const btn = document.getElementById("btnRegister");
    const cedulaInput = document.getElementById("cedula");

    cedulaInput.addEventListener("blur", async () => {
        const cedula = cedulaInput.value.trim();

        if (cedula.length !== 9 || !cedula.match(/^\d+$/)) {
            showErrorModal("Cédula inválida", "La cédula debe tener exactamente 9 dígitos.");
            return;
        }

        const modal = document.getElementById("cedulaModal");
        document.getElementById("modalLoading").style.display = "block";
        document.getElementById("modalSuccess").style.display = "none";
        document.getElementById("modalError").style.display = "none";
        modal.classList.add("active");

        try {
            const resp = await fetch(`${API_BASE}/users/cedula/${cedula}`);
            document.getElementById("modalLoading").style.display = "none";

            if (!resp.ok) {
                showErrorModal("Cédula no encontrada", "La cédula no existe en el padrón electoral.");
                document.getElementById("name").value = "";
                document.getElementById("first_lastname").value = "";
                document.getElementById("second_lastname").value = "";
                return;
            }

            const person = await resp.json();
            document.getElementById("name").value = person.nombre;
            document.getElementById("first_lastname").value = person.primer_apellido;
            document.getElementById("second_lastname").value = person.segundo_apellido;

            const nombreCompleto = `${person.nombre} ${person.primer_apellido} ${person.segundo_apellido}`;
            document.getElementById("modalName").textContent = nombreCompleto;
            document.getElementById("modalSuccess").style.display = "block";

        } catch (err) {
            console.error(err);
            showErrorModal("Error de conexión", "No se pudo conectar al servicio del padrón.");
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const cedula = document.getElementById("cedula").value.trim();
        const phone = document.getElementById("phone").value.trim();

        if (cedula.length !== 9 || !cedula.match(/^\d+$/)) return showErrorModal("Cédula inválida", "La cédula debe tener exactamente 9 dígitos.");
        if (name.length < 2) return showErrorModal("Nombre inválido", "El nombre es muy corto.");
        if (!email.includes("@")) return showErrorModal("Correo inválido", "Por favor ingresa un correo electrónico válido.");
        if (password.length < 6) return showErrorModal("Contraseña inválida", "La contraseña debe tener mínimo 6 caracteres.");
        if (!phone) return showErrorModal("Teléfono requerido", "Por favor ingresa un número de teléfono.");

        btn.disabled = true;
        btn.textContent = "Registrando...";

        try {
            const resp = await fetch(`${API_BASE}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, cedula, phone })
            });

            if (!resp.ok) {
                if (resp.status === 409) {
                    showErrorModal("Usuario ya registrado", "El correo electrónico o la cédula ya están registrados.");
                } else if (resp.status === 400) {
                    showErrorModal("Datos inválidos", "La cédula no es válida o los datos son incorrectos.");
                } else {
                    showErrorModal("Error", "No se pudo completar el registro. Intenta más tarde.");
                }
                return;
            }

            document.getElementById("successModal").classList.add("active");

        } catch (err) {
            console.error(err);
            showErrorModal("Error de conexión", "No se pudo conectar al servidor.");
        } finally {
            btn.disabled = false;
            btn.textContent = "Registrarse";
        }
    });
});