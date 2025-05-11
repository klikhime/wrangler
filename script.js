document.addEventListener("DOMContentLoaded", function () {
  // Load data from API
  fetchItems();

  // Handle form submission
  document
    .getElementById("add-item-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("item-name").value;
      const description = document.getElementById("item-description").value;

      addItem(name, description);
    });
});

async function fetchItems() {
  const dataList = document.getElementById("data-list");
  dataList.innerHTML = "<p>Loading data...</p>";

  try {
    console.log("Fetching items from API...");
    const response = await fetch("/api/items");

    console.log("API response status:", response.status);

    if (!response.ok) {
      // Try to read error details from response
      let errorDetails = "";
      try {
        const errorData = await response.json();
        errorDetails = errorData.error || errorData.details || "";
      } catch (e) {
        // If parsing fails, use status text
        errorDetails = response.statusText;
      }

      throw new Error(`Server error: ${errorDetails}`);
    }

    const data = await response.json();
    console.log("API data received:", data);

    // Check if items property exists and is an array
    if (!data.items || !Array.isArray(data.items)) {
      dataList.innerHTML = "<p>Invalid data format received from server.</p>";
      console.error("Invalid data format:", data);
      return;
    }

    if (data.items.length === 0) {
      dataList.innerHTML = "<p>Tidak ada data.</p>";
      return;
    }

    let html = "";
    data.items.forEach((item) => {
      html += `
              <div class="data-item">
                  <h4>${item.name || "No Name"}</h4>
                  <p>${item.description || "No Description"}</p>
                  <small>Created: ${
                    item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : "Unknown date"
                  }</small>
              </div>
          `;
    });

    dataList.innerHTML = html;
  } catch (error) {
    console.error("Error fetching data:", error);
    dataList.innerHTML = `<p>Error loading data: ${error.message}. Please try again later.</p>`;
  }
}

async function addItem(name, description) {
  try {
    console.log("Adding new item:", { name, description });

    const response = await fetch("/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ name, description }),
    });

    console.log("Add item response status:", response.status);

    if (!response.ok) {
      // Try to read error details from response
      let errorDetails = "";
      try {
        const errorData = await response.json();
        errorDetails = errorData.error || errorData.details || "";
      } catch (e) {
        // If parsing fails, use status text
        errorDetails = response.statusText;
      }

      throw new Error(`Server error: ${errorDetails}`);
    }

    // Clear form
    document.getElementById("item-name").value = "";
    document.getElementById("item-description").value = "";

    // Show success message
    alert("Item berhasil ditambahkan!");

    // Refresh data
    fetchItems();
  } catch (error) {
    console.error("Error adding item:", error);
    alert(`Error adding item: ${error.message}. Please try again.`);
  }
}
