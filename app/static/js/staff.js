document.addEventListener("DOMContentLoaded", function () {
    // Handle stock actions
    const stockTable = document.getElementById('stockTable').getElementsByTagName('tbody')[0];
    // const stockSearchInput = document.getElementById('stockSearch');
    // const addStockBtn = document.getElementById('addStockBtn');
    // const stockForm = document.getElementById('stockForm');
    // const stockDetailsPopup = document.getElementById('stockDetailsPopup');
    // const closeStockDetailsPopup = document.getElementById('closeStockDetailsPopup');
    // const stockSubmitBtn = document.getElementById('stockSubmitBtn');
    // const stockUpdateBtn = document.getElementById('updateStockBtn');
    // const deleteStockBtn = document.getElementById('deleteStockBtn');
    
    // const popup = document.getElementById('popup');
    // const closePopupBtn = document.getElementById('closePopupBtn');
    
    // // Handle employee actions
    // const employeeTable = document.getElementById('attendanceTable').getElementsByTagName('tbody')[0];
    // const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    // const employeePopup = document.getElementById('employeePopup');
    // const closeEmployeePopupBtn = document.getElementById('closeEmployeePopupBtn');
    // const employeeForm = document.getElementById('employeeForm');
    // const employeeDetailsPopup = document.getElementById('employeeDetailsPopup');
    // const closeEmployeeDetailsPopup = document.getElementById('closeEmployeeDetailsPopup');
    
    // Fetch all stocks and display
    function loadStocks() {
        fetch('api/stock')
            .then(response => response.json())
            .then(stocks => {
                stockTable.innerHTML = '';
                stocks.forEach(stock => {
                    const row = stockTable.insertRow();
                    row.innerHTML = `
                        <td>${stock.productId}</td>
                        <td>${stock.productName}</td>
                        <td>${stock.brand}</td>
                        <td>${stock.category}</td>
                        <td>${stock.quantity}</td>
                        <td>${stock.price}</td>
                        <td>
                            <button class="view-btn" data-id="${stock.productId}">View</button>
                            <button class="edit-btn" data-id="${stock.productId}">Edit</button>
                            <button class="delete-btn" data-id="${stock.productId}">Delete</button>
                        </td>
                    `;
                });
            })
            .catch(err => console.error('Error loading stocks:', err));
    }

    // // Search stocks
    // stockSearchInput.addEventListener('input', function () {
    //     const query = stockSearchInput.value.toLowerCase();
    //     const rows = stockTable.getElementsByTagName('tr');
    //     Array.from(rows).forEach(row => {
    //         const productName = row.cells[1].textContent.toLowerCase();
    //         if (productName.includes(query)) {
    //             row.style.display = '';
    //         } else {
    //             row.style.display = 'none';
    //         }
    //     });
    // });

    // // Add new stock
    // addStockBtn.addEventListener('click', function () {
    //     popup.style.display = 'block';
    // });

    // closePopupBtn.addEventListener('click', function () {
    //     popup.style.display = 'none';
    // });

    // stockForm.addEventListener('submit', function (e) {
    //     e.preventDefault();
    //     const newStock = {
    //         productId: document.getElementById('id').value,
    //         product: document.getElementById('product').value,
    //         brand: document.getElementById('brand').value,
    //         category: document.getElementById('category').value,
    //         quantity: document.getElementById('quantity').value,
    //         price: document.getElementById('price').value,
    //     };

    //     fetch('/api/stock', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(newStock),
    //     })
    //         .then(response => response.json())
    //         .then(data => {
    //             console.log('Stock added:', data);
    //             loadStocks();
    //             popup.style.display = 'none';
    //         })
    //         .catch(err => console.error('Error adding stock:', err));
    // });

    // // View stock details
    // stockTable.addEventListener('click', function (e) {
    //     if (e.target.classList.contains('view-btn')) {
    //         const productId = e.target.getAttribute('data-id');
    //         fetch(`/api/stock/${productId}`)
    //             .then(response => response.json())
    //             .then(stock => {
    //                 const stockDetails = document.getElementById('stockDetails');
    //                 stockDetails.innerHTML = `
    //                     <p><strong>Product ID:</strong> ${stock.productId}</p>
    //                     <p><strong>Product:</strong> ${stock.product}</p>
    //                     <p><strong>Brand:</strong> ${stock.brand}</p>
    //                     <p><strong>Category:</strong> ${stock.category}</p>
    //                     <p><strong>Quantity:</strong> ${stock.quantity}</p>
    //                     <p><strong>Price:</strong> ${stock.price}</p>
    //                 `;
    //                 stockDetailsPopup.style.display = 'block';
    //             });
    //     }

    //     // Edit stock
    //     if (e.target.classList.contains('edit-btn')) {
    //         const productId = e.target.getAttribute('data-id');
    //         fetch(`/api/stock/${productId}`)
    //             .then(response => response.json())
    //             .then(stock => {
    //                 document.getElementById('id').value = stock.productId;
    //                 document.getElementById('product').value = stock.product;
    //                 document.getElementById('brand').value = stock.brand;
    //                 document.getElementById('category').value = stock.category;
    //                 document.getElementById('quantity').value = stock.quantity;
    //                 document.getElementById('price').value = stock.price;
    //                 popup.style.display = 'block';

    //                 stockSubmitBtn.style.display = 'none';
    //                 stockUpdateBtn.style.display = 'block';

    //                 stockUpdateBtn.addEventListener('click', function () {
    //                     const updatedStock = {
    //                         productId: stock.productId,
    //                         product: document.getElementById('product').value,
    //                         brand: document.getElementById('brand').value,
    //                         category: document.getElementById('category').value,
    //                         quantity: document.getElementById('quantity').value,
    //                         price: document.getElementById('price').value,
    //                     };

    //                     fetch(`/api/stock/${stock.productId}`, {
    //                         method: 'PUT',
    //                         headers: {
    //                             'Content-Type': 'application/json',
    //                         },
    //                         body: JSON.stringify(updatedStock),
    //                     })
    //                         .then(response => response.json())
    //                         .then(data => {
    //                             console.log('Stock updated:', data);
    //                             loadStocks();
    //                             popup.style.display = 'none';
    //                         })
    //                         .catch(err => console.error('Error updating stock:', err));
    //                 });
    //             });
    //     }

    //     // Delete stock
    //     if (e.target.classList.contains('delete-btn')) {
    //         const productId = e.target.getAttribute('data-id');
    //         if (confirm('Are you sure you want to delete this stock item?')) {
    //             fetch(`/api/stock/${productId}`, {
    //                 method: 'DELETE',
    //             })
    //                 .then(response => response.json())
    //                 .then(data => {
    //                     console.log('Stock deleted:', data);
    //                     loadStocks();
    //                 })
    //                 .catch(err => console.error('Error deleting stock:', err));
    //         }
    //     }
    // });

    // // Load employees
    // function loadEmployees() {
    //     fetch('/api/employee')
    //         .then(response => response.json())
    //         .then(employees => {
    //             employeeTable.innerHTML = '';
    //             employees.forEach(employee => {
    //                 const row = employeeTable.insertRow();
    //                 row.innerHTML = `
    //                     <td>${employee.employeeId}</td>
    //                     <td>${employee.employeeName}</td>
    //                     <td>${employee.mobileNumber}</td>
    //                     <td>${employee.joinDate}</td>
    //                     <td>${employee.dob}</td>
    //                     <td>${employee.address}</td>
    //                     <td>
    //                         <button class="view-btn" data-id="${employee.employeeId}">View</button>
    //                         <button class="edit-btn" data-id="${employee.employeeId}">Edit</button>
    //                         <button class="delete-btn" data-id="${employee.employeeId}">Delete</button>
    //                     </td>
    //                 `;
    //             });
    //         })
    //         .catch(err => console.error('Error loading employees:', err));
    // }

    // // Add new employee
    // addEmployeeBtn.addEventListener('click', function () {
    //     employeePopup.style.display = 'block';
    // });

    // closeEmployeePopupBtn.addEventListener('click', function () {
    //     employeePopup.style.display = 'none';
    // });

    // employeeForm.addEventListener('submit', function (e) {
    //     e.preventDefault();
    //     const newEmployee = {
    //         employeeId: document.getElementById('employeeId').value,
    //         employeeName: document.getElementById('employeeName').value,
    //         mobileNumber: document.getElementById('mobileNumber').value,
    //         dob: document.getElementById('employeeDob').value,
    //         address: document.getElementById('employeeAddress').value,
    //         joinDate: document.getElementById('joinDate').value,
    //     };

    //     fetch('/api/employee', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(newEmployee),
    //     })
    //         .then(response => response.json())
    //         .then(data => {
    //             console.log('Employee added:', data);
    //             loadEmployees();
    //             employeePopup.style.display = 'none';
    //         })
    //         .catch(err => console.error('Error adding employee:', err));
    // });

    // // Load employees on page load
    // loadEmployees();
    loadStocks();
});
