const API_BASE = "http://localhost:3008/api";
const getToken = () => sessionStorage.getItem("authToken");

let vehicleId = null;
let ownerId = null;

const VEHICLE_QUERY = `
    query GetVehicle($id: ID!) {
        vehicle(id: $id) {
            id
            brand
            model
            year
            price
            description
            image
            status
            owner { id name }
        }
    }
`;

const QUESTIONS_QUERY = `
    query GetQuestionsByVehicle($vehicleId: ID!) {
        questionsByVehicle(vehicleId: $vehicleId) {
            data {
                id
                question
                createdAt
                user { id name }
                answer {
                    answer
                    createdAt
                    user { name }
                }
            }
        }
    }
`;

function showNotif(title, msg, icon = "ℹ️") {
    document.getElementById("notifIcon").textContent = icon;
    document.getElementById("notifTitle").textContent = title;
    document.getElementById("notifMsg").textContent = msg;
    document.getElementById("notifModal").classList.add("active");
}

function cerrarNotif() {
    document.getElementById("notifModal").classList.remove("active");
}

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    vehicleId = params.get("id");

    if (!vehicleId) {
        document.getElementById("vehicleDetail").innerHTML = "No hay ID";
        return;
    }

    await loadVehicle(vehicleId);
    loadQuestions();
});

function getUserIdFromToken() {
    const token = getToken();
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.userId;
    } catch (error) {
        return null;
    }
}

function formatDate(value) {
    if (!value) return '';
    const asNumber = Number(value);
    const date = Number.isFinite(asNumber) ? new Date(asNumber) : new Date(value);
    return isNaN(date.getTime()) ? '' : date.toLocaleString();
}

async function loadVehicle(id) {
    try {
        const data = await gqlQuery(VEHICLE_QUERY, { id });
        const v = data.vehicle;

        if (!v) throw new Error("Vehículo no encontrado");

        ownerId = v.owner?.id || null;

        const imgSrc = v.image
            ? `http://localhost:3008/uploads/${v.image}`
            : "https://via.placeholder.com/400";

        document.getElementById("vehicleDetail").innerHTML = `
            <img src="${imgSrc}" />
            <h2>${v.brand} ${v.model}</h2>
            <p><b>Año:</b> ${v.year}</p>
            <p><b>Precio:</b> $${v.price}</p>
            <p>${v.description || "Sin descripción"}</p>
            <p><b>Propietario:</b> ${v.owner?.name || "No disponible"}</p>
        `;
    } catch (error) {
        console.error(error);
        showNotif("Error", "No se pudo cargar el vehículo.", "❌");
    }
}

async function loadQuestions() {
  try {
    const token = getToken();
    const userId = getUserIdFromToken();

    if (!token) {
        document.getElementById("questionList").innerHTML = "<p>Inicia sesión para ver las preguntas.</p>";
        return;
    }

    const data = await gqlQuery(QUESTIONS_QUERY, { vehicleId });
    const questions = data.questionsByVehicle.data;

    const container = document.getElementById("questionList");
    const input = document.getElementById("questionInput");
    const questionSection = document.getElementById("questionSection");

    if (userId && ownerId && userId !== ownerId) {
        questionSection.style.display = "block";
    } else {
        questionSection.style.display = "none";
    }

    if (questions.length === 0) {
      container.innerHTML = "<p>No hay preguntas aún</p>";
      return;
    }

    const alreadyAsked = questions.some(q => q.user?.id === userId && !q.answer);
    if (alreadyAsked && input) input.disabled = true;

    let html = "";

    if (alreadyAsked) {
        html += `<p style="color:red;">Ya hiciste una pregunta. Espera la respuesta del propietario.</p>`;
    }

    questions.forEach(q => {
        html += `
            <div class="question-card">
                <p>
                    <b>${q.user?.name || "Usuario"}:</b> ${q.question}
                    ${q.user?.id === userId ? '<span style="color:green;"> (Tu pregunta)</span>' : ''}
                </p>
                <small>${formatDate(q.createdAt)}</small>
      `;

        if (q.answer) {
            html += `
                <div class="answer">
                    <p><b>${q.answer.user?.name || "Propietario"} respondió:</b> ${q.answer.answer}</p>
                    <small>${formatDate(q.answer.createdAt)}</small>
                </div>
            `;
        }

        if (!q.answer && userId === ownerId) {
            html += `
                <textarea id="answer-${q.id}" placeholder="Responder..."></textarea>
                <button class="answer-btn" onclick="createAnswer('${q.id}')">Responder</button>
            `;
        }
        html += `</div>`;
    });

    container.innerHTML = html;

    } catch (error) {
        console.error(error);
    }
}

async function createQuestion() {
    const token = getToken();
    if (!token) {
        showNotif("Sesión requerida", "Debes iniciar sesión para hacer una pregunta.", "🔒");
        return;
    }

    const input = document.getElementById("questionInput");
    const question = input.value;

    if (!question.trim()) {
        showNotif("Campo vacío", "Por favor escribe una pregunta antes de enviar.", "⚠️");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/vehicles/${vehicleId}/questions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ question })
        });

        if (!response.ok) {
            showNotif("Error", "No se pudo enviar la pregunta. Intenta de nuevo.", "❌");
            return;
        }

        input.value = "";
        loadQuestions();

    } catch (error) {
        console.error(error);
        showNotif("Error", "No se pudo conectar al servidor.", "❌");
    }
}

async function createAnswer(questionId) {
    const token = getToken();
    if (!token) {
        showNotif("Sesión requerida", "Debes iniciar sesión para responder.", "🔒");
        return;
    }

    const textarea = document.getElementById(`answer-${questionId}`);
    const answer = textarea.value;

    if (!answer.trim()) {
        showNotif("Campo vacío", "Por favor escribe una respuesta antes de enviar.", "⚠️");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/questions/${questionId}/answers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ answer })
            });

            if (!response.ok) {
            showNotif("Error", "No se pudo enviar la respuesta. Intenta de nuevo.", "❌");
            return;
        }
        loadQuestions();
    } catch (error) {
        console.error(error);
        showNotif("Error", "No se pudo conectar al servidor.", "❌");
    }
}

function shareVehicle() {
    const url = window.location.href;   
    navigator.clipboard.writeText(url).then(() => {
        showNotif("¡Enlace copiado!", "El enlace del vehículo fue copiado al portapapeles.", "🔗");
    }).catch(() => {
        showNotif("Compartir vehículo", url, "🔗");
    });
}