document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.querySelectorAll('.tab');
  const links = document.querySelectorAll('.sidebar a');

  const stockFilter = document.getElementById('stockFilter');
  const attendanceFilter = document.getElementById('attendanceFilter');
  const salesFilter = document.getElementById('salesFilter');
  const stockSearchInput = document.getElementById("stockSearch");

  const dateFilter = document.getElementById('dateFilter');

  loadStocks();
  loadCategories();

  // 🟢 Set today's date in the filter
  if (dateFilter) {
    dateFilter.value = new Date().toISOString().split("T")[0];
    dateFilter.setAttribute("max", new Date().toISOString().split("T")[0]);
    dateFilter.addEventListener("change", loadAttendanceData);
  }

  loadAttendanceData(); // ✅ Load attendance of today on page load

  function loadStocks() {
    fetch("/manager/api/stock")
      .then((response) => response.json())
      .then((stocks) => populateStocksTable(stocks))
      .catch((err) => console.error("Error loading stocks:", err));
    document.getElementById("stockSearch").value = "";
  }

  function populateStocksTable(stocks) {
    const tableBody = document.querySelector("#stockTable tbody");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    stocks.forEach((stock) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${stock.productName}</td>
        <td>${stock.category}</td>
        <td>${stock.quantity}</td>
        <td>${stock.price}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  stockSearchInput.addEventListener("input", function () {
    const query = stockSearchInput.value.toLowerCase();
    const rows = stockTable.getElementsByTagName("tr");
    Array.from(rows).forEach((row) => {
      const productName = row.cells[0].textContent.toLowerCase();
      row.style.display = productName.includes(query) ? "" : "none";
    });
  });

  function loadCategories() {
    fetch("/manager/api/categories")
      .then(response => response.json())
      .then(categories => {
        const categoryFilter = document.getElementById("categoryFilter");
        categoryFilter.innerHTML = '<option value="">All</option>';
        categories.forEach(cat => {
          const option = document.createElement("option");
          option.value = cat.categoryName;
          option.textContent = cat.categoryName;
          categoryFilter.appendChild(option);
        });
      })
      .catch(err => console.error("Error loading categories:", err));
  }

  document.getElementById("categoryFilter").addEventListener("change", function () {
    const selectedCategory = this.value.toLowerCase();
    const rows = stockTable.getElementsByTagName("tr");
    Array.from(rows).forEach((row) => {
      const category = row.cells[1].textContent.toLowerCase();
      row.style.display = category.includes(selectedCategory) ? "" : "none";
    });
  });

  document.getElementById("logoutBtn").addEventListener("click", function () {
    window.location.href = "/";
  });

  if (stockFilter) stockFilter.style.display = "none";
  if (attendanceFilter) attendanceFilter.style.display = "none";
  if (salesFilter) salesFilter.style.display = "none";

  const defaultTab = document.getElementById("stocks");
  const defaultLink = document.getElementById("stocksLink");
  if (defaultTab) defaultTab.classList.add("active");
  if (defaultLink) defaultLink.classList.add("active");
  if (stockFilter) stockFilter.style.display = "block";

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = link.getAttribute("href")?.substring(1);
      const targetTab = document.getElementById(targetId);
      if (!targetTab) return;

      tabs.forEach((tab) => tab.classList.remove("active"));
      links.forEach((l) => l.classList.remove("active"));

      targetTab.classList.add("active");
      link.classList.add("active");

      manageFilters(targetId);
      resetSearchInput(targetId);
    });
  });

  async function loadAttendanceData() {
    try {
      const selectedDate = dateFilter?.value;
      if (!selectedDate) {
        console.warn("⚠️ No date selected, skipping fetch.");
        return;
      }

      const response = await fetch(`/manager/attendance/${selectedDate}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      console.log("✅ Attendance Data:", data);
      populateTable("attendanceTable", data);
    } catch (error) {
      console.error("❌ Error loading attendance data:", error);
    }
  }

  function populateTable(tableId, data) {
    console.log("📋 Populating table with data:", data); // DEBUG

    const tableBody = document.querySelector(`#${tableId} tbody`);
    if (!tableBody) return;

    tableBody.innerHTML = "";

    data.forEach((row) => {
      let formattedDate = "Invalid Date";
      if (row.date) {
        const parsedDate = Date.parse(row.date);
        if (!isNaN(parsedDate)) {
          formattedDate = new Date(parsedDate).toLocaleDateString("en-GB");
        }
      }

      const statusClass = row.status.toLowerCase() === "present"
        ? "status-label status-present"
        : "status-label status-absent";

      const statusLabel = `<span class="${statusClass}">${row.status}</span>`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.employee_id}</td>
        <td>${row.employee_name}</td>
        <td>${formattedDate}</td>
        <td>${statusLabel}</td>
      `;
      tableBody.appendChild(tr);
    });

    filterAttendanceTable();
  }

  function manageFilters(targetId) {
    if (stockFilter) stockFilter.style.display = "none";
    if (attendanceFilter) attendanceFilter.style.display = "none";
    if (salesFilter) salesFilter.style.display = "none";

    if (targetId === "stocks") stockFilter.style.display = "block";
    else if (targetId === "attendance") attendanceFilter.style.display = "block";
    else if (targetId === "sales") salesFilter.style.display = "block";
  }

  function resetSearchInput(targetId) {
    if (targetId === "stocks") {
      document.getElementById("stockSearch").value = "";
    } else if (targetId === "attendance") {
      if (dateFilter) {
        dateFilter.value = new Date().toISOString().split("T")[0];
        filterAttendanceTable();
      }
    } else if (targetId === "sales") {
      const salesSearch = document.getElementById("salesSearch");
      if (salesSearch) salesSearch.value = "";
    }
  }

  function filterAttendanceTable() {
    const selectedDate = dateFilter ? new Date(dateFilter.value) : null;
    const rows = document.querySelectorAll("#attendanceTable tbody tr");

    rows.forEach((row) => {
      const rowDateParts = row.cells[2].textContent.split("/");
      const rowDate = new Date(`${rowDateParts[2]}-${rowDateParts[1]}-${rowDateParts[0]}`); // from dd/mm/yyyy

      const matchesDate = !selectedDate || rowDate.toDateString() === selectedDate.toDateString();
      row.style.display = matchesDate ? "" : "none";
    });
  }
});
