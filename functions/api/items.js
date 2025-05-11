export async function onRequest(context) {
  // Handle CORS
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle OPTIONS request for CORS preflight
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  if (context.request.method === "GET") {
    try {
      // Query the database
      const { results } = await context.env.DB.prepare(
        "SELECT * FROM items ORDER BY created_at DESC"
      ).all();

      // Return the results
      return Response.json(
        { items: results },
        {
          headers: corsHeaders,
        }
      );
    } catch (error) {
      return Response.json(
        { error: error.message },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  }

  if (context.request.method === "POST") {
    try {
      const { name, description } = await context.request.json();

      if (!name || !description) {
        return Response.json(
          { error: "Name and description are required" },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      // Insert into database
      const result = await context.env.DB.prepare(
        "INSERT INTO items (name, description) VALUES (?, ?)"
      )
        .bind(name, description)
        .run();

      return Response.json(
        { success: true, id: result.meta.last_row_id },
        {
          headers: corsHeaders,
        }
      );
    } catch (error) {
      return Response.json(
        { error: error.message },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  }

  // If the request method is not GET or POST
  return Response.json(
    { error: "Method not allowed" },
    {
      status: 405,
      headers: corsHeaders,
    }
  );
}
