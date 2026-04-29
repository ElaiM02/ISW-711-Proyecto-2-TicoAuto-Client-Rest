const API_BASE = "http://localhost:3008/api";
const getToken = () => sessionStorage.getItem("authToken");

let editVehicleId = null;
let conffirmCallback = null;

function showNotif(title, msg, icon = "ℹ️") {
    document.getElementById("notifIcon").textContent = icon;
    document.getElementById("notifTitle").textContent = title;
    document.getElementById("notifMsg").textContent = msg;
    document.getElementById("notifModal").classList.add("active");
}

function cerrarNotif() {
    document.getElementById("notifModal").classList.remove("active");
}

function showConfirm(title, msg, callback) {
    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmMsg").textContent = msg;
    document.getElementById("confirmModal").classList.add("active");
    confirmCallback = callback;
}

function confirmAceptar() {
    document.getElementById("confirmModal").classList.remove("active");
    if (confirmCallback) confirmCallback();
    confirmCallback = null;
}

function cerrarConfirm() {
    document.getElementById("confirmModal").classList.remove("active");
    confirmCallback = null;
}

document.addEventListener("DOMContentLoaded", () => {
    getVehicles();

    const form = document.getElementById("vehicleForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            createVehicle();
        });
    }
});

async function createVehicle() {
    try {
        const formData = new FormData();
        formData.append("brand", document.getElementById("brand").value);
        formData.append("model", document.getElementById("model").value);
        formData.append("year", document.getElementById("year").value);
        formData.append("price", document.getElementById("price").value);
        formData.append("description", document.getElementById("description").value);

        const image = document.getElementById("image").files[0];
        if (image) formData.append("image", image);

        const url = editVehicleId ? `${API_BASE}/vehicles/${editVehicleId}` : `${API_BASE}/vehicles`;
        const method = editVehicleId ? "PATCH" : "POST";

        const response = await fetch(url, {
            method,
            headers: { "Authorization": `Bearer ${getToken()}` },
            body: formData
        });

        if (response.ok) {
            showNotif(
                editVehicleId ? "Vehículo actualizado" : "Vehículo creado",
                editVehicleId ? "Los cambios fueron guardados exitosamente." : "Tu vehículo fue publicado exitosamente.",
                "✅"
            );          
            resetForm();
            getVehicles();
        } else {
            showNotif("Error", "No se pudo guardar el vehículo. Intenta de nuevo.", "❌");
        }
    } catch (error) {
        console.error(error);
        showNotif("Error", "No se pudo conectar al servidor.", "❌");
    }
}

function resetForm() {
    document.getElementById("vehicleForm").reset();
    document.getElementById("previewImage").style.display = "none";
    document.getElementById("formTitle").innerText = "Agregar vehículo";
    document.getElementById("saveBtn").innerText = "Guardar vehículo";
    document.getElementById("cancelEdit").style.display = "none";
    editVehicleId = null;
}

async function getVehicles(){
    try {
        const response = await fetch(`${API_BASE}/vehicles/me`, {
            headers: { "Authorization": `Bearer ${getToken()}` }
        });
        const result = await response.json();
        const vehicles = result.data;

        if (!vehicles || vehicles.length === 0) {
            document.getElementById("vehicleList").innerHTML = "<tr><td colspan='6'>No tienes vehículos registrados</td></tr>";
            return;
        }

        document.getElementById("vehicleList").innerHTML = vehicles.map(v => `
        <div class="vehicle-card">
            <div class="vehicle-img-container">
                <img src="${v.image ? `http://localhost:3008/uploads/${v.image}` : 'https://via.placeholder.com/300x180'}" class="vehicle-img">
                <span class="badge ${v.status === 'sold' ? 'badge-sold' : 'badge-available'}">
                    ${v.status === 'sold' ? 'Vendido' : 'Disponible'}
                </span>
            </div>
            <div class="vehicle-card-body">
                <h3>${v.brand} ${v.model}</h3>
                <p>${v.year} • $${v.price.toLocaleString()}</p>
                <div class="card-actions">
                    <button onclick="viewVehicle('${v._id}')">Ver Detalle</button>
                    <button class="btn-edit" onclick="editVehicle('${v._id}')">Editar</button>
                    <button class="btn-delete" onclick="deleteVehicle('${v._id}')">Eliminar</button>
                    <button class="btn-sold" onclick="markAsSold('${v._id}')">
                        ${v.status === 'sold' ? 'Marcar disponible' : 'Marcar vendido'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    } catch (error) {
        console.error(error);
        showNotif("Error", "No se pudieron cargar los vehículos.", "❌");
    }
}

function viewVehicle(id) {
    window.location.href = `VehicleDetail.html?id=${id}`;
}

async function editVehicle(id){
    try {
        const response = await fetch(`${API_BASE}/vehicles/${id}`, {
            headers: { "Authorization": `Bearer ${getToken()}` }
        });

        if (!response.ok) {
            showNotif("Error", "No se pudo cargar el vehículo.", "❌");
            return;
        }

        const vehicle = await response.json();

        document.getElementById("brand").value = vehicle.brand;
        document.getElementById("model").value = vehicle.model;
        document.getElementById("year").value = vehicle.year;
        document.getElementById("price").value = vehicle.price;
        document.getElementById("description").value = vehicle.description || "";

        const preview = document.getElementById("previewImage");
        if (vehicle.image) {
            preview.src = `http://localhost:3008/uploads/${vehicle.image}`;
            preview.style.display = "block";
        }

        editVehicleId = vehicle._id;
        document.getElementById("formTitle").innerText = "Editar vehículo";
        document.getElementById("saveBtn").innerText = "Actualizar vehículo";
        document.getElementById("cancelEdit").style.display = "inline";
    } catch (error) {
        console.error(error);
        showNotif("Error", "No se pudo conectar al servidor.", "❌");
    }
}

async function deleteVehicle(id){
    showConfirm(
        "Eliminar vehículo",
        "¿Estás seguro de que deseas eliminar este vehículo? Esta acción no se puede deshacer.",
        async () => {
            try {
                const response = await fetch(`${API_BASE}/vehicles/${id}`, {
                    method: "DELETE",
                    headers: {"Authorization": `Bearer ${getToken()}`}
                });

                if(response.ok){
                showNotif("Vehículo eliminado", "El vehículo fue eliminado exitosamente.", "🗑️");
                    getVehicles();
                } else {
                    showNotif("Error", "No se pudo eliminar el vehículo.", "❌");
                }
            } catch (error) {
                console.error(error);
                showNotif("Error", "No se pudo conectar al servidor.", "❌");
            }
        }
    );
}

async function markAsSold(id) {
    try {
        const response = await fetch(`${API_BASE}/vehicles/${id}/sold`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${getToken()}` }
        });

        if (response.ok) {
            getVehicles();
        } else {
            showNotif("Error", "No se pudo cambiar el estado del vehículo.", "❌");
        }
    } catch (error) {
        console.error(error);
        showNotif("Error", "No se pudo conectar al servidor.", "❌");
    }
}