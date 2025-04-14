document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.querySelectorAll('.tab');
  const links = document.querySelectorAll('.sidebar a');

  const stockFilter = document.getElementById('stockFilter');
  const attendanceFilter = document.getElementById('attendanceFilter');
  const salesFilter = document.getElementById('salesFilter');
  const stockSearchInput = document.getElementById("stockSearch");
  const dateFilter = document.getElementById('dateFilter');

  const attendanceSearch = document.getElementById("attendanceSearch");
  const salesSearch = document.getElementById("salesSearch");

  const today = new Date().toISOString().split("T")[0];
  const salesDate = document.getElementById("salesDateFilter");
  const attendDateInput = document.getElementById("attendDate");

  if (dateFilter) {
    dateFilter.value = today;
    dateFilter.setAttribute("max", today);
    dateFilter.addEventListener("change", loadAttendanceData);
  }

  if (salesDate) salesDate.setAttribute("max", today);
  if (attendDateInput) attendDateInput.setAttribute("max", today);
  salesDate.value=today;

  loadStocks();
  loadCategories();
  loadAttendanceData();
  loadSalesData();

  // STOCK
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

  // TABS & FILTER PANEL
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
      stockSearchInput.value = "";
    } else if (targetId === "attendance" && dateFilter) {
      dateFilter.value = today;
      filterAttendanceTable();
      if (attendanceSearch) attendanceSearch.value = "";
    } else if (targetId === "sales" && salesSearch) {
      salesSearch.value = "";
    }
  }

  // ATTENDANCE
  async function loadAttendanceData() {
    try {
      const selectedDate = dateFilter?.value;
      if (!selectedDate) return;
      const response = await fetch(`/manager/attendance/${selectedDate}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      populateTable("attendanceTable", data);
    } catch (error) {
      console.error("❌ Error loading attendance data:", error);
    }
  }

  function populateTable(tableId, data) {
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

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.employee_id}</td>
        <td>${row.employee_name}</td>
        <td>${formattedDate}</td>
        <td><span class="${statusClass}">${row.status}</span></td>
      `;
      tableBody.appendChild(tr);
    });

    filterAttendanceTable();
  }

  function filterAttendanceTable() {
    const selectedDate = dateFilter ? new Date(dateFilter.value) : null;
    const rows = document.querySelectorAll("#attendanceTable tbody tr");

    rows.forEach((row) => {
      const [day, month, year] = row.cells[2].textContent.split("/");
      const rowDate = new Date(`${year}-${month}-${day}`);
      const matchesDate = !selectedDate || rowDate.toDateString() === selectedDate.toDateString();
      row.style.display = matchesDate ? "" : "none";
    });
  }

  attendanceSearch?.addEventListener("input", () => {
    const searchValue = attendanceSearch.value.toLowerCase();
    const rows = document.querySelectorAll("#attendanceTable tbody tr");
    rows.forEach((row) => {
      const id = row.cells[0].textContent.toLowerCase();
      const name = row.cells[1].textContent.toLowerCase();
      const match = id.includes(searchValue) || name.includes(searchValue);
      row.style.display = match ? "" : "none";
    });
  });

  // SALES
  async function loadSalesData(filterDate = "") {
    try {
      const url = filterDate ? `/manager/api/sales?date=${filterDate}` : "/manager/api/sales";
      const response = await fetch(url);  
      if (!response.ok) throw new Error("Failed to fetch sales data.");
      const data = await response.json();
      populateSalesTable(data);
    } catch (error) {
      console.error("❌ Error loading sales data:", error);
    }
  }

  function populateSalesTable(sales) {
    const tableBody = document.querySelector("#salesTable tbody");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    sales.forEach((sale) => {
      let formattedDate = "Invalid Date";
      if (sale.Date) {
        const parsedDate = Date.parse(sale.Date);
        if (!isNaN(parsedDate)) {
          formattedDate = new Date(parsedDate).toLocaleDateString("en-GB");
        }
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${formattedDate}</td>
        <td>${sale.quantity ?? "N/A"}</td>
        <td>${sale.productName ?? "N/A"}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  document.getElementById("salesDateFilter")?.addEventListener("change", function () {
    const selectedDate = this.value;
    if (!selectedDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Date',
        text: '⚠️ Please select a date.',
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }
    loadSalesData(selectedDate);
  });
  

  salesSearch?.addEventListener("input", () => {
    const searchValue = salesSearch.value.toLowerCase();
    const rows = document.querySelectorAll("#salesTable tbody tr");
    rows.forEach((row) => {
      const date = row.cells[0].textContent.toLowerCase();
      const quantity = row.cells[1].textContent.toLowerCase();
      const productId = row.cells[2].textContent.toLowerCase();
      const match = date.includes(searchValue) || quantity.includes(searchValue) || productId.includes(searchValue);
      row.style.display = match ? "" : "none";
    });
  });

  // GET TOTAL SALES
  document.getElementById("getTotalSalesBtn")?.addEventListener("click", function () {
    const selectedDate = salesDate?.value;
    if (!selectedDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Date',
        text: '⚠️ Please select a date.',
        timer: 1000,
        showConfirmButton: false,
      });
      return;
    }
    

    fetch(`/staff/get_total_sales?date=${selectedDate}`)
      .then(response => response.json())
      .then(data => {
        document.getElementById("salesAmount").innerText = data.total_sales_amount || "0.00";
        document.getElementById("totalSalesModal").style.display = "block";
      })
      .catch(err => console.error("Error fetching total sales:", err));
  });

  // GET TOP SELLING ITEMS (TOP 5)
  document.getElementById("getTopSellingItemsBtn")?.addEventListener("click", function () {
    const selectedDate = salesDate?.value;
    if (!selectedDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Date',
        text: '⚠️ Please select a date.',
        timer: 1000,
        showConfirmButton: false,
      });
      return;
    }
    

    fetch(`/staff/get_top_selling_items?date=${selectedDate}`)
      .then(response => response.json())
      .then(data => {
        const itemList = document.getElementById("topSellingItems");
        itemList.innerHTML = "";
        data.top_selling_items.slice(0, 5).forEach((item, index) => {
          const li = document.createElement("li");
          li.textContent = `${index + 1}. ${item.productName} - ${item.total_quantity} sold`;
          itemList.appendChild(li);
        });
        document.getElementById("topSellingModal").style.display = "block";
      })
      .catch(err => console.error("Error fetching top selling items:", err));
  });

  // OUT OF STOCK
  document.getElementById("checkOutOfStockBtn")?.addEventListener("click", async function () {
    try {
      const response = await fetch("/manager/api/check_out_of_stock");
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const data = await response.json();
      displayOutOfStockItems(data);
      document.getElementById("outofstockModal").style.display = "block";
    } catch (error) {
      console.error("Error fetching out-of-stock items:", error);
    }
  });

  function displayOutOfStockItems(items) {
    const outOfStockList = document.getElementById("outOfStockList");
    outOfStockList.innerHTML = "";
    if (items.length === 0) {
      outOfStockList.innerHTML = "<p>All products are in stock!</p>";
      return;
    }
    const ul = document.createElement("ul");
    items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.productName} (Brand: ${item.brand})`;
      ul.appendChild(li);
    });
    outOfStockList.appendChild(ul);
  }

  // MODAL CLOSE
  document.querySelectorAll(".close").forEach((btn) =>
    btn.addEventListener("click", () => {
      btn.closest(".modal, .popup").style.display = "none";
    })
  );

  window.addEventListener("click", (event) => {
    document.querySelectorAll(".modal").forEach((modal) => {
      if (event.target === modal) modal.style.display = "none";
    });
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    window.location.href = "/";
  });
});
