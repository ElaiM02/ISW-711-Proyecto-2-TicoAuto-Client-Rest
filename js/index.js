const API_BASE= "http://localhost:3008/api";

window.onload = function() {
    getVehicles();
};

async function getVehicles() {
    try {
        const response = await fetch(`${API_BASE}/vehicles`);
        const data = await response.json();
        renderVehicles(data.data);
    } catch (error) {
        console.error(error);
        alert('No se pudieron cargar los vehículos');
    }
}

function renderVehicles(list) {
    const container = document.getElementById('vehicleContainer');

     if (!list || list.length === 0) {
    container.innerHTML = "<p>No hay vehículos disponibles</p>";
    return;
     }
    
    container.innerHTML = list.map(vehicle => {
        const imageUrl = vehicle.image
            ? `http://localhost:3008/uploads/${vehicle.image}`
            : "https://via.placeholder.com/400";
        const isSold = vehicle.status === 'sold';

        return `
            <div class="vehicle-card">
                <div class="vehicle-img-container">
                    <img src="${imageUrl}" class="vehicle-img">
                    <span class="badge ${isSold ? 'badge-sold' : 'badge-available'}">
                        ${isSold ? 'Vendido' : 'Disponible'}
                    </span>
                </div>
                <h3>${vehicle.brand} ${vehicle.model}</h3>
                <p class="desc">${vehicle.description || "Sin descripción"}</p>
                <p><b>Año:</b> ${vehicle.year}</p>
                <p><b>Precio:</b> $${vehicle.price}</p>
                <button onclick="viewVehicle('${vehicle._id}')">Ver Detalle</button>
            </div>
        `;
    }).join('');
}
    
function viewVehicle(id) {
    window.location.href = `vehicleDetail.html?id=${id}`;
}

async function searchVehicles(){
    try {
        const params = new URLSearchParams();

        const filters = {
            brand: document.getElementById("brandFilter").value,
            model: document.getElementById("modelFilter").value,
            minYear: document.getElementById("minYearFilter").value,
            maxYear: document.getElementById("maxYearFilter").value,
            minPrice: document.getElementById("minPriceFilter").value,
            maxPrice: document.getElementById("maxPriceFilter").value,
            status: document.getElementById("statusFilter").value
        };

        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });

        const url = `${API_BASE}/vehicles${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url);
        const data = await response.json();

        renderVehicles(data.data);
    } catch (error) {
        console.error(error);
        alert('Error al buscar vehículos');
    }
}

function clearFilters() {
    ["brandFilter", "modelFilter", "minYearFilter", "maxYearFilter", 
     "minPriceFilter", "maxPriceFilter", "statusFilter"].forEach(id => {
        document.getElementById(id).value = "";
    });
    getVehicles();
}