document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.querySelectorAll('.tab');
  const links = document.querySelectorAll('.sidebar a');

  const stockFilter = document.getElementById('stockFilter');
  const attendanceFilter = document.getElementById('attendanceFilter');
  const salesFilter = document.getElementById('salesFilter');

  const attendanceSearch = document.getElementById('attendanceSearch');
  const dateFilter = document.getElementById('dateFilter');


  loadStocks();

  function loadStocks() {
    fetch("/manager/api/stock")
      .then((response) => response.json())
      .then((stocks) => {
        populateStocksTable(stocks);
      })
      .catch((err) => console.error("Error loading stocks:", err));
    document.getElementById("stockSearch").value = "";
  }
  
  // ✅ Populate Stocks Table
  function populateStocksTable(stocks) {
    const tableBody = document.querySelector("#stockTable tbody");
    if (!tableBody) {
      console.error("Stock table not found.");
      return;
    }
    tableBody.innerHTML = ""; // Clear previous data
  
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











  // Absentee List Elements
  const getAbsenteesBtn = document.getElementById("getAbsenteesBtn");
  const absenteesPopup = document.getElementById("absenteesPopup");
  const closeAbsenteesPopup = document.getElementById("closeAbsenteesPopup");
  const absenteesList = document.getElementById("absenteesList");
  const attendDateInput = document.getElementById("attendDate");

  document.getElementById("logoutBtn").addEventListener("click", function () {
    window.location.href = "/"; // Redirects to login.html
  });


  // Initially hide all filter sections
  if (stockFilter) stockFilter.style.display = "none";
  if (attendanceFilter) attendanceFilter.style.display = "none";
  if (salesFilter) salesFilter.style.display = "none";

  // ✅ Set default active tab to 'stocks' safely
  const defaultTab = document.getElementById("stocks");
  const defaultLink = document.getElementById("stocksLink");
  if (defaultTab) defaultTab.classList.add("active");
  if (defaultLink) defaultLink.classList.add("active");
  if (stockFilter) stockFilter.style.display = "block";

  // ✅ Tab Navigation Logic
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const targetId = link.getAttribute("href");
      if (!targetId) return; // Ensure href exists

      const tabId = targetId.substring(1);
      const targetTab = document.getElementById(tabId);
      if (!targetTab) {
        console.error(`Tab with ID '${tabId}' not found.`);
        return;
      }

      // Deactivate all tabs & links
      tabs.forEach((tab) => tab.classList.remove("active"));
      links.forEach((l) => l.classList.remove("active"));

      // Activate clicked tab
      targetTab.classList.add("active");
      link.classList.add("active");

      manageFilters(tabId);
      resetSearchInput(tabId);
    });
  });

  // ✅ Load attendance data on page load
  loadAttendanceData();

  // ✅ Function to populate a table with fetched data
  function populateTable(tableId, data) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    if (!tableBody) {
      console.error(`Table with ID '${tableId}' not found.`);
      return;
    }
    tableBody.innerHTML = ""; // Clear existing rows

    data.forEach((row) => {
      let formattedDate = "Invalid Date";
      if (row.date) {
        let parsedDate = Date.parse(row.date);
        if (!isNaN(parsedDate)) {
          let dateObj = new Date(parsedDate);
          formattedDate = dateObj.toLocaleDateString("en-GB"); // Convert to dd/mm/yyyy format
        } else {
          console.error("Invalid date format received:", row.date);
        }
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${row.employeeId}</td>
                <td>${row.employeeName}</td> 
                <td>${formattedDate}</td>
                <td>${row.status}</td>
            `;
      tableBody.appendChild(tr);
    });
  }

  // ✅ Fetch and load attendance data
  async function loadAttendanceData() {
    try {
      console.log("Fetching attendance data...");
      const response = await fetch("/manager/api/attendance");

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      console.log("Attendance Data:", data);

      populateTable("attendanceTable", data);
    } catch (error) {
      console.error("Error loading attendance data:", error);
    }
  }

  // ✅ Manage visibility of filter sections based on active tab
  function manageFilters(targetId) {
    if (stockFilter) stockFilter.style.display = "none";
    if (attendanceFilter) attendanceFilter.style.display = "none";
    if (salesFilter) salesFilter.style.display = "none";

    if (targetId === "stocks" && stockFilter) {
      stockFilter.style.display = "block";
    } else if (targetId === "attendance" && attendanceFilter) {
      attendanceFilter.style.display = "block";
    } else if (targetId === "sales" && salesFilter) {
      salesFilter.style.display = "block";
    }
  }

  // ✅ Reset search fields when switching tabs
  function resetSearchInput(targetId) {
    if (targetId === "stocks") {
      const stockSearch = document.getElementById("stockSearch");
      if (stockSearch) stockSearch.value = "";
    } else if (targetId === "attendance") {
      if (attendanceSearch) attendanceSearch.value = "";
      if (dateFilter) dateFilter.value = "";
      filterAttendanceTable();
    } else if (targetId === "sales") {
      const salesSearch = document.getElementById("salesSearch");
      if (salesSearch) salesSearch.value = "";
    }
  }

  // ✅ Filter attendance table based on search input
  function filterAttendanceTable() {
    if (!attendanceSearch) return;
    const searchValue = attendanceSearch.value.toLowerCase();
    const rows = document.querySelectorAll("#attendanceTable tbody tr");

    rows.forEach((row) => {
      const employeeId = row.cells[0].textContent.toLowerCase();
      const employeeName = row.cells[1].textContent.toLowerCase();
      const date = row.cells[2].textContent.toLowerCase();
      const status = row.cells[3].textContent.toLowerCase();

      row.style.display =
        employeeId.includes(searchValue) ||
          employeeName.includes(searchValue) ||
          date.includes(searchValue) ||
          status.includes(searchValue)
          ? ""
          : "none";
    });
  }

  // ✅ Fetch and display absentees
  function openAbsenteesPopup() {
    if (!attendDateInput) {
      console.error("Attendance date input not found.");
      return;
    }

    const selectedDate = attendDateInput.value;
    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }

    absenteesList.innerHTML = "Loading absentees...";

    fetch(`/staff/api/get_absentees?date=${encodeURIComponent(selectedDate)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then(response => response.json())
      .then(absentees => {
        absenteesList.innerHTML = "";

        if (absentees.length === 0) {
          absenteesList.textContent = "No absentees today.";
          return;
        }

        absentees.forEach(absentee => {
          const absenteeItem = document.createElement("div");
          absenteeItem.textContent = `ID: ${absentee.employeeId} - Name: ${absentee.employeeName}`;
          absenteesList.appendChild(absenteeItem);
        });
      })
      .catch(error => {
        console.error("Error fetching absentees:", error);
        absenteesList.textContent = "Failed to fetch absentee data.";
      });

    if (absenteesPopup) absenteesPopup.style.display = "flex";
  }

  // ✅ Attach event listeners if elements exist
  if (getAbsenteesBtn)
    getAbsenteesBtn.addEventListener("click", openAbsenteesPopup);
  if (closeAbsenteesPopup)
    closeAbsenteesPopup.addEventListener("click", () => {
      if (absenteesPopup) absenteesPopup.style.display = "none";
    });

  attendanceSearch?.addEventListener("input", filterAttendanceTable);
  dateFilter?.addEventListener("input", filterAttendanceTable);

  document
    .getElementById("getTotalSalesBtn")
    .addEventListener("click", function () {
      const selectedDate = document.getElementById("salesDate").value;

      if (!selectedDate) {
        alert("Please select a date.");
        return;
      }

      fetch(`/staff/get_total_sales?date=${selectedDate}`)
        .then((response) => response.json())
        .then((data) => {
          document.getElementById("salesAmount").innerText =
            data.total_sales_amount || "0.00";
        })
        .catch((error) =>
          console.error("Error fetching total sales amount:", error)
        );
    });

  document
    .getElementById("getTopSellingItemsBtn")
    .addEventListener("click", function () {
      const selectedDate = document.getElementById("salesDate").value;

      if (!selectedDate) {
        alert("Please select a date.");
        return;
      }

      fetch(`/staff/get_top_selling_items?date=${selectedDate}`)
        .then((response) => response.json())
        .then((data) => {
          const itemList = document.getElementById("topSellingItems");
          itemList.innerHTML = ""; // Clear previous data

          data.top_selling_items.forEach((item, index) => {
            const listItem = document.createElement("li");
            listItem.textContent = `${index + 1}. ${item.productName} - ${item.total_quantity
              } sold`;
            itemList.appendChild(listItem);
          });
        })
        .catch((error) =>
          console.error("Error fetching top-selling items:", error)
        );
    });

  document
    .getElementById("getTotalSalesBtn")
    .addEventListener("click", function () {
      document.getElementById("totalSalesModal").style.display = "block";
    });

  document
    .getElementById("getTopSellingItemsBtn")
    .addEventListener("click", function () {
      document.getElementById("topSellingModal").style.display = "block";
    });

  // Function to close modal
  function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".close").forEach(function (closeBtn) {
      closeBtn.addEventListener("click", function () {
        this.closest(".modal, .popup").style.display = "none";
      });
    });
  });

  // Close modal when clicking outside content
  window.onclick = function (event) {
    let modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    });
  };

  let today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD
  document.getElementById("salesDate").setAttribute("max", today);
  document.getElementById("attendDate").setAttribute("max", today);

  document
    .getElementById("checkOutOfStockBtn")
    .addEventListener("click", async function () {
      try {
        const response = await fetch("/manager/api/check_out_of_stock");
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);

        const data = await response.json();
        displayOutOfStockItems(data);
      } catch (error) {
        console.error("Error fetching out-of-stock items:", error);
      }
    });

  function displayOutOfStockItems(items) {
    const outOfStockList = document.getElementById("outOfStockList");
    outOfStockList.innerHTML = ""; // Clear previous results

    if (items.length === 0) {
      outOfStockList.innerHTML = "<p>All products are in stock!</p>";
      return;
    }

    const ul = document.createElement("ul");
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.productName} (Brand: ${item.brand})`;
      ul.appendChild(li);
    });

    outOfStockList.appendChild(ul);
  }







  const outOfStockModal = document.getElementById("outofstockModal");
  const openOutOfStockBtn = document.getElementById("checkOutOfStockBtn");
  const closeOutOfStockBtn = document.getElementById("closeOutOfStock");

  // Open modal when button is clicked
  openOutOfStockBtn.addEventListener("click", () => {
    outOfStockModal.style.display = "block";
  });

  // Close modal when (X) button is clicked
  closeOutOfStockBtn.addEventListener("click", () => {
    outOfStockModal.style.display = "none";
  });

  // Close modal when clicking outside the modal content
  window.addEventListener("click", (event) => {
    if (event.target === outOfStockModal) {
      outOfStockModal.style.display = "none";
    }
  });











  // ✅ Load sales data on page load
loadSalesData();

// ✅ Function to populate the sales table with fetched data
function populateSalesTable(sales) {
    const tableBody = document.querySelector("#salesTable tbody");
    if (!tableBody) {
      console.error("Sales table not found.");
      return;
    }
    tableBody.innerHTML = ""; // Clear previous data
  
    sales.forEach((sale) => {
      let formattedDate = "Invalid Date";
      if (sale.Date) {  // Change from sale.date to sale.Date
        let parsedDate = Date.parse(sale.Date);
        if (!isNaN(parsedDate)) {
          let dateObj = new Date(parsedDate);
          formattedDate = dateObj.toLocaleDateString("en-GB"); // Convert to dd/mm/yyyy format
        } else {
          console.error("Invalid date format received:", sale.Date);
        }
      }
  
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${formattedDate}</td>
        <td>${sale.quantity}</td> <!-- Use quantity instead of totalSales -->
        <td>${sale.productId}</td> <!-- Use productId instead of category -->
      `;
      tableBody.appendChild(tr);
    });
  }
  

// ✅ Fetch and load sales data
async function loadSalesData() {
  try {
    console.log("Fetching sales data...");
    const response = await fetch("/manager/api/sales");

    if (!response.ok)
      throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    console.log("Sales Data:", data);

    populateSalesTable(data);
  } catch (error) {
    console.error("Error loading sales data:", error);
  }
}

});
