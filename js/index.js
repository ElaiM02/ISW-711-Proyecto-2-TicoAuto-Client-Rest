const VEHICLES_QUERY = `
    query GetVehicles($filter: VehicleFilterInput) {
        vehicles(filter: $filter) {
            data {
                id
                brand
                model
                year
                price
                description
                image
                status
                owner { name }
            }
        }
    }
`;

window.onload = function() {
    getVehicles();
};

async function getVehicles() {
    try {
        const data = await gqlQuery(VEHICLES_QUERY);
        renderVehicles(data.vehicles.data);
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
                <button onclick="viewVehicle('${vehicle.id}')">Ver Detalle</button>
            </div>
        `;
    }).join('');
}

function viewVehicle(id) {
    window.location.href = `vehicleDetail.html?id=${id}`;
}

async function searchVehicles() {
    try {
        const filter = {};
        const brand    = document.getElementById("brandFilter").value.trim();
        const model    = document.getElementById("modelFilter").value.trim();
        const minYear  = document.getElementById("minYearFilter").value;
        const maxYear  = document.getElementById("maxYearFilter").value;
        const minPrice = document.getElementById("minPriceFilter").value;
        const maxPrice = document.getElementById("maxPriceFilter").value;
        const status   = document.getElementById("statusFilter").value;

        if (brand)    filter.brand    = brand;
        if (model)    filter.model    = model;
        if (minYear)  filter.minYear  = Number(minYear);
        if (maxYear)  filter.maxYear  = Number(maxYear);
        if (minPrice) filter.minPrice = Number(minPrice);
        if (maxPrice) filter.maxPrice = Number(maxPrice);
        if (status)   filter.status   = status;

        const data = await gqlQuery(VEHICLES_QUERY, { filter });
        renderVehicles(data.vehicles.data);
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
