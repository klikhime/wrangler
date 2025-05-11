// functions/api/items.js
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

  // Log untuk debugging
  console.log("API request received:", context.request.method);
  console.log("Database binding exists:", !!context.env.DB);

  if (context.request.method === "GET") {
    try {
      // Query the database - gunakan try-catch terpisah untuk isolasi error
      let results;
      try {
        const stmt = await context.env.DB.prepare(
          "SELECT * FROM items ORDER BY created_at DESC"
        );
        const queryResult = await stmt.all();
        results = queryResult.results || [];
        console.log("Query results:", results);
      } catch (dbError) {
        console.error("Database error:", dbError);
        return Response.json(
          {
            error: "Database error",
            details: dbError.message || "Unknown database error",
          },
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }

      // Return the results
      return Response.json(
        { items: results || [] },
        {
          headers: corsHeaders,
        }
      );
    } catch (error) {
      console.error("General error:", error);
      return Response.json(
        {
          error: "Server error",
          details: error.message || "Unknown error",
        },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  }

  if (context.request.method === "POST") {
    try {
      // Parse request body
      let requestData;
      try {
        requestData = await context.request.json();
      } catch (parseError) {
        return Response.json(
          { error: "Invalid JSON in request body" },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      const { name, description } = requestData;

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
      let result;
      try {
        const stmt = await context.env.DB.prepare(
          "INSERT INTO items (name, description) VALUES (?, ?)"
        );
        result = await stmt.bind(name, description).run();
      } catch (dbError) {
        console.error("Database insert error:", dbError);
        return Response.json(
          {
            error: "Database insert failed",
            details: dbError.message || "Unknown database error",
          },
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }

      return Response.json(
        {
          success: true,
          id: result?.meta?.last_row_id || null,
        },
        {
          headers: corsHeaders,
        }
      );
    } catch (error) {
      console.error("General POST error:", error);
      return Response.json(
        {
          error: "Server error",
          details: error.message || "Unknown error",
        },
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
