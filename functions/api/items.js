// functions/api/items.js
export default {
  async fetch(request, env, context) {
    const url = new URL(request.url);
    // Only handle /api/items requests
    if (url.pathname !== "/api/items") {
      return new Response("Not Found", { status: 404 });
    }
    // Common headers including CORS and Content-Type
    const commonHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    };

    // Handle OPTIONS request for CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: commonHeaders,
        status: 204,
      });
    }

    try {
      if (request.method === "GET") {
        const stmt = env.DB.prepare(
          "SELECT * FROM items ORDER BY created_at DESC"
        );
        const { results } = await stmt.all();

        return new Response(JSON.stringify({ items: results || [] }), {
          headers: commonHeaders,
        });
      }

      if (request.method === "POST") {
        const requestData = await request.json();
        const { name, description } = requestData;

        if (!name || !description) {
          return new Response(
            JSON.stringify({
              error: "Name and description are required",
            }),
            {
              status: 400,
              headers: commonHeaders,
            }
          );
        }

        const stmt = env.DB.prepare(
          "INSERT INTO items (name, description) VALUES (?, ?) RETURNING *"
        );
        const result = await stmt.bind(name, description).run();

        return new Response(
          JSON.stringify({
            success: true,
            id: result?.meta?.last_row_id || null,
          }),
          {
            headers: commonHeaders,
          }
        );
      }

      // Method not allowed
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: commonHeaders,
      });
    } catch (error) {
      console.error("Error:", error);
      return new Response(
        JSON.stringify({
          error: "Server error",
          details: error.message,
        }),
        {
          status: 500,
          headers: commonHeaders,
        }
      );
    }
  },
};
