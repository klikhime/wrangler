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
  try {
    const response = await fetch("/api/items");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    const dataList = document.getElementById("data-list");

    if (data.items.length === 0) {
      dataList.innerHTML = "<p>Tidak ada data.</p>";
      return;
    }

    let html = "";
    data.items.forEach((item) => {
      html += `
                <div class="data-item">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <small>Created: ${new Date(
                      item.created_at
                    ).toLocaleString()}</small>
                </div>
            `;
    });

    dataList.innerHTML = html;
  } catch (error) {
    console.error("Error fetching data:", error);
    document.getElementById("data-list").innerHTML =
      "<p>Error loading data. Please try again later.</p>";
  }
}

async function addItem(name, description) {
  try {
    const response = await fetch("/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    // Clear form
    document.getElementById("item-name").value = "";
    document.getElementById("item-description").value = "";

    // Refresh data
    fetchItems();
  } catch (error) {
    console.error("Error adding item:", error);
    alert("Error adding item. Please try again.");
  }
}
