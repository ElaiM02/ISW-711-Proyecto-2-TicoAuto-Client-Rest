// Helper para llamadas GraphQL
const GRAPHQL_URL = "http://localhost:4000/graphql";

/**
 * @param {string} query
 * @param {object} variables
 * @returns {Promise<object>}
 * @throws
 */
async function gqlQuery(query, variables = {}) {
    const token = sessionStorage.getItem("authToken");

    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables })
    });

    const result = await response.json();

    if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
    }

    return result.data;
}
