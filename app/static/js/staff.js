document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("logoutBtn").addEventListener("click", function () {
    window.location.href = "/"; // Redirects to login.html
  });

  // Handle stock actions
  const stockTable = document
    .getElementById("stockTable")
    .getElementsByTagName("tbody")[0];
  const stockSearchInput = document.getElementById("stockSearch");
  const addStockBtn = document.getElementById("addStockBtn");
  const stockForm = document.getElementById("stockForm");
  const stockDetailsPopup = document.getElementById("stockDetailsPopup");
  const closeStockDetailsPopup = document.getElementById(
    "closeStockDetailsPopup"
  );
  const stockSubmitBtn = document.getElementById("stockSubmitBtn");
  const popup = document.getElementById("popup");
  const closePopupBtn = document.getElementById("closePopupBtn");
  const tabs = document.querySelectorAll(".tab");
  const links = document.querySelectorAll(".sidebar a");

  // Tab navigation functionality
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      tabs.forEach((tab) => tab.classList.remove("active"));
      links.forEach((l) => l.classList.remove("active"));

      const targetId = link.getAttribute("href").substring(1);
      document.getElementById(targetId).classList.add("active");
      link.classList.add("active");
    });
  });

  // Fetch all stocks and display
  function loadStocks() {
    fetch("api/stock")
      .then((response) => response.json())
      .then((stocks) => {
        stockTable.innerHTML = "";
        stocks.forEach((stock) => {
          const row = stockTable.insertRow();
          row.innerHTML = `
                          <td>${stock.productId}</td>
                          <td>${stock.productName}</td>
                          <td>${stock.brand}</td>
                          <td>${stock.category}</td>
                          <td>${stock.quantity}</td>
                          <td>${stock.price}</td>
                          <td>
                              <button class="view-btn" style="border-radius: 5px;" data-id="${stock.productId}">View</button>
                              <button class="edit-btn" style="border-radius: 5px;" data-id="${stock.productId}">Edit</button>
                              <button class="delete-btn" style="border-radius: 5px;" data-id="${stock.productId}">Delete</button>
                          </td>
                      `;
        });
      })
      .catch((err) => console.error("Error loading stocks:", err));
    document.getElementById("stockSearch").value = "";
  }

  // Search stocks
  stockSearchInput.addEventListener("input", function () {
    const query = stockSearchInput.value.toLowerCase();
    const rows = stockTable.getElementsByTagName("tr");
    Array.from(rows).forEach((row) => {
      const productName = row.cells[1].textContent.toLowerCase();
      if (productName.includes(query)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });

  document
    .getElementById("addstckbtn")
    .addEventListener("click", async function () {
      let productId = document.getElementById("addstckId").value.trim();
      let quantity = document.getElementById("addstckQuan").value.trim();

      if (!productId || !quantity) {
        Swal.fire({
          icon: 'warning',
          title: 'Oops!',
          text: '⚠️ Please fill in both Product ID and Quantity.',
          timer:1000,
          showConfirmButton: false
        });
        return;
      }

      let data = {
        productId: productId,
        quantity: parseInt(quantity),
      };

      try {
        let response = await fetch(`api/add_stock`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        // Handle non-JSON responses
        let result = await response.json();

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: `✅ ${result.message}`,
            confirmButtonColor: '#28a745', // green button
          });

          loadStocks();
          addstckId.value = "";
          addstckQuan.value = "";
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `❌ ${result.error || "Something went wrong."}`,
            confirmButtonColor: '#d33', // red button
          });

        }
      } catch (error) {
        console.error("Network Error:", error);
        Swal.fire({
          icon: 'error',
          title: 'Network Error',
          text: '❌ A network error occurred. Please try again.',
          confirmButtonColor: '#d33',
        });

      }
    });

  // Add new stock
  addStockBtn.addEventListener("click", function () {
    document.getElementById("popup").querySelector("h2").textContent =
      "Add Item";
    stockSubmitBtn.textContent = "Add Item";
    stockForm.reset();
    document.getElementById("formMode").value = "add"; // Set mode to "add"
    popup.style.display = "flex";
  });

  stockTable.addEventListener("click", function (e) {
    // Edit stock
    if (e.target.classList.contains("edit-btn")) {
      const productId = e.target.getAttribute("data-id");

      fetch(`api/stock/${productId}`)
        .then((response) => response.json())
        .then((stock) => {
          document.getElementById("formMode").value = "edit"; // Set mode to "edit"
          // Populate the form with stock details
          document.getElementById("id").value = stock.productId;
          document.getElementById("product").value = stock.productName;
          document.getElementById("brand").value = stock.brandName;
          document.getElementById("category").value = stock.categoryName;
          document.getElementById("quantity").value = stock.quantity;
          document.getElementById("price").value = stock.price;
          document.getElementById("popup").querySelector("h2").textContent =
            "Edit Stock";
          stockSubmitBtn.textContent = "Edit Stock";
          popup.style.display = "flex";
        });
    }

    // Delete stock
    if (e.target.classList.contains("delete-btn")) {
      const productId = e.target.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this stock item?")) {
        fetch(`api/stock/${productId}`, {
          method: "DELETE",
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Stock deleted:", data);
            loadStocks();
          })
          .catch((err) => console.error("Error deleting stock:", err));
      }
    }

    // View stock details
    if (e.target.classList.contains("view-btn")) {
      const productId = e.target.getAttribute("data-id");
      fetch(`api/stock/${productId}`)
        .then((response) => response.json())
        .then((stock) => {
          const stockDetails = document.getElementById("stockDetails");
          stockDetails.innerHTML = `
                      <p><strong>Product ID:</strong> ${stock.productId}</p>
                      <p><strong>Product:</strong> ${stock.productName}</p>
                      <p><strong>Brand:</strong> ${stock.brandName}</p>
                      <p><strong>Category:</strong> ${stock.categoryName}</p>
                      <p><strong>Quantity:</strong> ${stock.quantity}</p>
                      <p><strong>Price:</strong> ${stock.price}</p>
                  `;
          stockDetailsPopup.style.display = "flex";
        })
        .catch((err) => console.error("Error fetching stock details:", err));
    }
  });

  closePopupBtn.addEventListener("click", function () {
    popup.style.display = "none";
  });

  closeStockDetailsPopup.addEventListener("click", function () {
    stockDetailsPopup.style.display = "none";
  });

  // Handle form submission for both "Add" and "Edit"
  stockForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const formMode = document.getElementById("formMode").value; // Get form mode
    const productId = document.getElementById("id").value;
    const stockData = {
      productId: productId,
      product: document.getElementById("product").value,
      brand: document.getElementById("brand").value,
      category: document.getElementById("category").value,
      quantity: parseInt(document.getElementById("quantity").value),
      price: parseFloat(document.getElementById("price").value),
    };

    if (formMode === "add") {
      // Add new stock
      fetch("api/item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stockData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success === false) {
            Swal.fire({
              icon: 'error',
              title: 'Oops!',
              text: `❌ ${data.details}`,
              confirmButtonColor: '#d33',
            });

          } else {
            console.log("Stock added:", data);
            loadStocks();
            popup.style.display = "none";
          }
        })
        .catch((err) => console.error("Error adding stock:", err));
    } else if (formMode === "edit") {
      // Update existing stock
      fetch(`api/stock/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stockData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Stock updated:", data);
          loadStocks();
          popup.style.display = "none";
        })
        .catch((err) => console.error("Error updating stock:", err));
    }
  });

  // Handle employee actions

  const employeeTable = document
    .getElementById("attendanceTable")
    .getElementsByTagName("tbody")[0];

  // Load employees
  function loadEmployees() {
    fetch("api/employee")
      .then((response) => response.json())
      .then((employees) => {
        employeeTable.innerHTML = "";
        employees.forEach((employee) => {
          const row = employeeTable.insertRow();
          row.innerHTML = `
                          <td>${employee.employeeId}</td>
                          <td>${employee.employeeName}</td>
                          <td>${employee.mobileNumber}</td>
                          <td>${employee.joinDate}</td>
                          <td>${employee.DOB}</td>
                          <td>${employee.address}</td>
                          <td>
                              <button class="view-btn-emp" data-id="${employee.employeeId}">View</button>
                              <button class="edit-btn-emp" data-id="${employee.employeeId}">Edit</button>
                              <button class="delete-btn-emp" data-id="${employee.employeeId}">Delete</button>
                          </td>
                      `;
        });
      })
      .catch((err) => console.error("Error loading employees:", err));
  }

  // Add new employee
  addEmployeeBtn.addEventListener("click", function () {
    employeeForm.reset();
    employeePopup.style.display = "flex";
  });

  closeEmployeePopupBtn.addEventListener("click", function () {
    employeePopup.style.display = "none";
  });
  employeeForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const employeeId = document.getElementById("employeeId").value;

    const isEditing =
      document.getElementById("employeeSubmitBtn").textContent === "Update Employee";

    const newEmployee = {
      employeeId: employeeId,
      employeeName: document.getElementById("employeeName").value,
      mobileNumber: document.getElementById("mobileNumber").value,
      dob: document.getElementById("employeeDob").value,
      address: document.getElementById("employeeAddress").value,
      joinDate: document.getElementById("joinDate").value,
    };
    
    const url = isEditing
      ? `/staff/api/employee/${employeeId}`
      : "/staff/api/employee";

    const method = isEditing ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEmployee),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success === false) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.details || 'An unknown error occurred.',
          });

        } else {
          console.log(isEditing ? "Employee updated:" : "Employee added:", data);
          loadEmployees();
          employeePopup.style.display = "none";

          // Reset popup to default
          document.getElementById("employeePopup").querySelector("h2").textContent = "Add New Employee";
          document.getElementById("employeeSubmitBtn").textContent = "Add Employee";
          employeeForm.reset();
        }
      })
      .catch((err) => console.error("Error saving employee:", err));
  });

  // Delete employee
  employeeTable.addEventListener("click", function (e) {
    // Delete employee
    if (e.target.classList.contains("delete-btn-emp")) {
      const employeeId = e.target.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this employee?")) {
        fetch(`/staff/api/employee/${employeeId}`, {
          method: "DELETE",
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Employee deleted:", data);
            loadEmployees(); // Reload employee list after deletion
          })
          .catch((err) => console.error("Error deleting employee:", err));
      }
    }
    if (e.target.classList.contains("view-btn-emp")) {
      const employeeId = e.target.getAttribute("data-id");
      fetch(`/staff/api/employee/${employeeId}`, { method: "GET", })
        .then((response) => response.json())
        .then((employee) => {
          const employeeDetails = document.getElementById("employeeDetails");
          employeeDetails.innerHTML = `
              <p><strong>Employee ID:</strong> ${employee.employeeId}</p>
              <p><strong>Name:</strong> ${employee.employeeName}</p>
              <p><strong>Mobile Number:</strong> ${employee.mobileNumber}</p>
              <p><strong>Date of Birth:</strong> ${employee.DOB}</p>
              <p><strong>Address:</strong> ${employee.address}</p>
              <p><strong>Join Date:</strong> ${employee.joinDate}</p>
            `;

          // Show the details popup
          document.getElementById("employeeDetailsPopup").style.display =
            "flex";

          // Set up edit and delete buttons in the popup
          document
            .getElementById("editEmployeeBtn")
            .setAttribute("data-id", employee.employeeId);
          document
            .getElementById("deleteEmployeeBtn")
            .setAttribute("data-id", employee.employeeId);
        })
        .catch((err) => console.error("Error fetching employee details:", err));
    }

    // Handle Edit employee button click
    if (e.target.classList.contains("edit-btn-emp")) {
      const employeeId = e.target.getAttribute("data-id");

      fetch(`/staff/api/employee/${employeeId}`)
        .then((response) => response.json())
        .then((employee) => {
          console.log(employee); // 🔥 Check if DOB/joinDate is correct

          document.getElementById("employeePopup").querySelector("h2").textContent = "Edit Employee";
          document.getElementById("employeeSubmitBtn").textContent = "Update Employee";

          document.getElementById("employeeId").value = employee.employeeId;
          document.getElementById("employeeName").value = employee.employeeName;
          document.getElementById("mobileNumber").value = employee.mobileNumber;

          const dobISO = new Date(employee.DOB).toISOString().split('T')[0];
          const joinDateISO = new Date(employee.joinDate).toISOString().split('T')[0];

          document.getElementById("employeeDob").value = dobISO;
          document.getElementById("joinDate").value = joinDateISO;

          document.getElementById("employeeAddress").value = employee.address;

          document.getElementById("employeePopup").style.display = "flex";

          employeeForm.setAttribute("data-editing", "true");
          employeeForm.setAttribute("data-employee-id", employeeId);
        })
        .catch((error) => {
          console.error("Error fetching employee details:", error);
        });
    }



  });

  // Close employee details popup
  document
    .getElementById("closeEmployeeDetailsPopup")
    .addEventListener("click", function () {
      document.getElementById("employeeDetailsPopup").style.display = "none";
    });

  const attendanceSearchInput = document.getElementById("attendanceSearch");

  // Search employees
  attendanceSearchInput.addEventListener("input", function () {
    const query = attendanceSearchInput.value.toLowerCase();
    const rows = employeeTable.getElementsByTagName("tr");

    Array.from(rows).forEach((row) => {
      const employeeName = row.cells[1].textContent.toLowerCase();
      if (employeeName.includes(query)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });

  // Load employees and stocks on page load
  loadEmployees();
  loadStocks();
  // Get the button and popup
  const getAbsenteesBtn = document.getElementById("getAbsenteesBtn");
  const absenteesPopup = document.getElementById("absenteesPopup");
  const closeAbsenteesPopup = document.getElementById("closeAbsenteesPopup");
  const absenteesList = document.getElementById("absenteesList");

  // Function to open the absentees popup and populate the list by fetching data from the server
  function openAbsenteesPopup() {
    // Clear existing absentees list
    absenteesList.innerHTML = "";
    const attenDate = document.getElementById("attendDate").value;
    if (!attenDate) {
      Swal.fire({
        icon: 'warning',
        title: 'No Date Selected',
        text: '⚠️ Please select a date.',
        timer: 1000,
        showConfirmButton: false
      });
      return;
    }
    // console.log(attenDate);
    // Fetch absentee data from the server
    fetch(`/staff/api/get_absentees?date=${encodeURIComponent(attenDate)}`, {
      method: "GET", // Use GET to fetch data
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((absentees) => {
        // Check if there are any absentees
        if (absentees.length === 0) {
          absenteesList.textContent = "No absentees today.";
          return;
        }

        // Add each absentee to the list
        absentees.forEach((absentee) => {
          const absenteeItem = document.createElement("div");
          absenteeItem.textContent = `ID: ${absentee.employeeId} - Name: ${absentee.employeeName}`;
          absenteesList.appendChild(absenteeItem);
        });
      })
      .catch((error) => {
        console.error("Error fetching absentees:", error);
        absenteesList.textContent = "Failed to fetch absentee data.";
      });

    // Show the popup
    absenteesPopup.style.display = "flex";
  }

  // Event listener for Get Absentees button
  getAbsenteesBtn.addEventListener("click", openAbsenteesPopup);

  // Close the popup when the close button is clicked
  closeAbsenteesPopup.addEventListener("click", function () {
    absenteesPopup.style.display = "none";
  });

  //Close the popup when clicking outside of the popup content
  window.addEventListener("click", function (event) {
    if (event.target === absenteesPopup) {
      absenteesPopup.style.display = "none";
    }
  });


  // Get references to the input and button elements
  const attendanceIdInput = document.getElementById("attendanceId");
  const attendanceBtn = document.getElementById("attendanceBtn");

  // Event listener for the "Enter" button
  attendanceBtn.addEventListener("click", function () {
    const employeeId = attendanceIdInput.value.trim();

    if (employeeId === "") {
      Swal.fire({
        icon: 'warning',
        title: 'Oops!',
        html: '<strong>Please enter a valid <u>Employee ID</u>.</strong>',
        timer:1000,
        showConfirmButton: false
      });

      return;
    }

    // Send the employee ID to the server to record the attendance
    fetch("/staff/api/mark_attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeId: employeeId,
        date: new Date().toISOString().split("T")[0], // Send today's date in 'YYYY-MM-DD' format
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: '✅ Attendance recorded successfully',
            confirmButtonColor: '#28a745',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: '❌ Error recording attendance',
            confirmButtonColor: '#d33',
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire({
          icon: 'error',
          title: 'Network Error',
          text: '❌ Failed to record attendance',
          confirmButtonColor: '#d33',
        });
      });

  });

  let billItems = [];
  document.getElementById("billingSearch").value = "";

  // Function to handle the search action
  function searchProduct() {
    const productId = document.getElementById("billingSearch").value.trim();
    if (!productId) return;

    fetch(`/staff/api/stock/${productId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          Swal.fire({
            icon: 'error',
            title: 'Product Not Found',
            text: '❌ Product not found.',
            confirmButtonColor: '#d33',
          });
        } else if (data.quantity <= 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Out of Stock',
            text: '⚠️ The product is out of stock.',
            confirmButtonColor: '#f0ad4e',
          });
        } else {
          addProductToBill(data); // Continue your normal flow here
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: '❌ An error occurred while searching for the product.',
          confirmButtonColor: '#d33',
        });
      });
      

    document.getElementById("billingSearch").value = "";
  }

  document
    .getElementById("billingSearchBtn")
    .addEventListener("click", searchProduct);
  document
    .getElementById("billingSearch")
    .addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        searchProduct();
      }
    });

    function addProductToBill(product) {
      const availableQuantity = product.quantity;
    
      document.getElementById("billingSearch").value = "";
    
      const existingProductIndex = billItems.findIndex(
        (item) => item.productId === product.productId
      );
    
      if (existingProductIndex !== -1) {
        const existingProduct = billItems[existingProductIndex];
        
        Swal.fire({
          title: `Enter quantity for<br><strong>${product.productName}</strong>`,
          text: `Available quantity: ${availableQuantity}`,
          input: 'number',
          inputValue: existingProduct.quantity,
          inputAttributes: {
            min: 1,
            max: availableQuantity,
            step: 1
          },
          showCancelButton: true,
          confirmButtonText: 'Update',
          cancelButtonText: 'Cancel',
          preConfirm: (quantity) => {
            if (quantity <= 0 || quantity > availableQuantity) {
              Swal.showValidationMessage(
                `Please enter a valid quantity between 1 and ${availableQuantity}`
              );
            }
            return quantity;
          }
        }).then((result) => {
          if (result.isConfirmed) {
            const quantity = result.value;
            if (quantity > 0) {
              existingProduct.quantity = parseInt(quantity);
              existingProduct.total = existingProduct.price * existingProduct.quantity;
              updateBillTable();
            }
          }
        });
    
      } else {
        Swal.fire({
          title: `Enter quantity for<br><strong>${product.productName}</strong>`,
          text: `Available quantity: ${availableQuantity}`,
          input: 'number',
          inputValue: 1,
          inputAttributes: {
            min: 1,
            max: availableQuantity,
            step: 1
          },
          showCancelButton: true,
          confirmButtonText: 'Add to Bill',
          cancelButtonText: 'Cancel',
          preConfirm: (quantity) => {
            if (quantity <= 0 || quantity > availableQuantity) {
              Swal.showValidationMessage(
                `Please enter a valid quantity between 1 and ${availableQuantity}`
              );
            }
            return quantity;
          }
        }).then((result) => {
          if (result.isConfirmed) {
            const quantity = result.value;
            if (quantity > 0) {
              const total = product.price * quantity;
              billItems.push({
                productId: product.productId,
                productName: product.productName,
                price: product.price,
                quantity: parseInt(quantity),
                total: total,
              });
              updateBillTable();
            }
          }
        });
      }
    }
    

  // Update the billing table with items
  function updateBillTable() {
    const tableBody = document.querySelector("#billingTable tbody");
    tableBody.innerHTML = "";

    let totalAmount = 0;

    billItems.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                  <td>${item.productId}</td>
                  <td>${item.productName}</td>
                  <td>${item.price}</td>
                  <td>${item.quantity}</td>
                  <td>${item.total}</td>
                  <td><button class="remove-btn" data-product-id="${item.productId}">Remove</button></td>
              `;
      tableBody.appendChild(row);
      totalAmount += item.total;
    });

    document.getElementById("totalAmount").innerText = totalAmount.toFixed(2);

    document.querySelectorAll(".remove-btn").forEach((button) => {
      button.addEventListener("click", removeProductFromBill);
    });
  }

  // Remove product from bill
  function removeProductFromBill(event) {
    const productId = event.target.getAttribute("data-product-id");
    const productIndex = billItems.findIndex(
      (item) => item.productId === productId
    );

    if (productIndex !== -1) {
      billItems.splice(productIndex, 1);
      updateBillTable();
    }
  }

  // Event listener for generating the bill
  document
    .getElementById("generateBillBtn")
    .addEventListener("click", generateBill);

  // Generate bill
  function generateBill() {
    if (billItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Items',
        text: '⚠️ No items in the bill.',
        timer: 1000,
        showConfirmButton: false,
      });
      
      return;
    }

    const billData = { items: billItems };

    fetch("/staff/api/billing/generate_bill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(billData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.error,
            confirmButtonColor: '#d33', // Red button color
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Bill Generated',
            text: `✅ Bill generated successfully! Total: ₹${data.totalAmount}`,
            confirmButtonColor: '#28a745', // Green success color
          }).then(() => {
            billItems = [];
            updateBillTable();
            loadStocks();
          });
        }
      })
      .catch((error) => {
        console.error("Error generating bill:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: '❌ An error occurred while generating the bill.',
          confirmButtonColor: '#d33', // Red button color
        });
      });
      
  }

  document
    .getElementById("getTotalSalesBtn")
    .addEventListener("click", function () {
      const selectedDate = document.getElementById("salesDate").value;

      if (!selectedDate) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Date',
          text: '⚠️ Please select a date.',
          timer: 1500,  // Auto-close after 1.5 seconds
          showConfirmButton: false, // Hide the confirm button
        });
        
        
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
        Swal.fire({
          icon: 'warning',
          title: 'Missing Date',
          text: '⚠️ Please select a date.',
          timer: 1500,  // Auto-close after 1.5 seconds
          showConfirmButton: false, // Hide the confirm button
        });
        
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
      const selectedDate = document.getElementById("salesDate").value;

      if (selectedDate) {
        document.getElementById("totalSalesModal").style.display = "block";
      }
    });

  document
    .getElementById("getTopSellingItemsBtn")
    .addEventListener("click", function () {
      const selectedDate = document.getElementById("salesDate").value;

      if (selectedDate) {
        document.getElementById("topSellingModal").style.display = "block";
      }
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
});
