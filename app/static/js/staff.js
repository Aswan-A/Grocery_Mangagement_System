document.addEventListener("DOMContentLoaded", function () {

    // Handle stock actions
    const stockTable = document.getElementById('stockTable').getElementsByTagName('tbody')[0];
    const stockSearchInput = document.getElementById('stockSearch');
    const addStockBtn = document.getElementById('addStockBtn');
    const stockForm = document.getElementById('stockForm');
    const stockDetailsPopup = document.getElementById('stockDetailsPopup');
    const closeStockDetailsPopup = document.getElementById('closeStockDetailsPopup');
    const stockSubmitBtn = document.getElementById('stockSubmitBtn');
    const popup = document.getElementById('popup');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const tabs = document.querySelectorAll('.tab');
    const links = document.querySelectorAll('.sidebar a');

    // Tab navigation functionality
    links.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            tabs.forEach(tab => tab.classList.remove('active'));
            links.forEach(l => l.classList.remove('active'));

            const targetId = link.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active');
            link.classList.add('active');
        });
    });

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
                            <button class="view-btn" style="border-radius: 5px;" data-id="${stock.productId}">View</button>
                            <button class="edit-btn" style="border-radius: 5px;" data-id="${stock.productId}">Edit</button>
                            <button class="delete-btn" style="border-radius: 5px;" data-id="${stock.productId}">Delete</button>
                        </td>
                    `;
                });
            })
            .catch(err => console.error('Error loading stocks:', err));
        document.getElementById('stockSearch').value = '';
    }


    // Search stocks
    stockSearchInput.addEventListener('input', function () {
        const query = stockSearchInput.value.toLowerCase();
        const rows = stockTable.getElementsByTagName('tr');
        Array.from(rows).forEach(row => {
            const productName = row.cells[1].textContent.toLowerCase();
            if (productName.includes(query)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Add new stock
    addStockBtn.addEventListener('click', function () {
        document.getElementById('popup').querySelector('h2').textContent = 'Add Stock';
        stockSubmitBtn.textContent = 'Add Stock';
        stockForm.reset();
        document.getElementById('formMode').value = 'add'; // Set mode to "add"
        popup.style.display = 'flex';
    });

    stockTable.addEventListener('click', function (e) {
        // Edit stock
        if (e.target.classList.contains('edit-btn')) {
            const productId = e.target.getAttribute('data-id');

            fetch(`api/stock/${productId}`)
                .then(response => response.json())
                .then(stock => {
                    document.getElementById('formMode').value = 'edit'; // Set mode to "edit"
                    // Populate the form with stock details
                    document.getElementById('id').value = stock.productId;
                    document.getElementById('product').value = stock.productName;
                    document.getElementById('brand').value = stock.brand;
                    document.getElementById('category').value = stock.category;
                    document.getElementById('quantity').value = stock.quantity;
                    document.getElementById('price').value = stock.price;
                    document.getElementById('popup').querySelector('h2').textContent = 'Edit Stock';
                    stockSubmitBtn.textContent = 'Edit Stock';
                    popup.style.display = 'flex';
                })
        }

        // Delete stock
        if (e.target.classList.contains('delete-btn')) {
            const productId = e.target.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this stock item?')) {
                fetch(`api/stock/${productId}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Stock deleted:', data);
                        loadStocks();
                    })
                    .catch(err => console.error('Error deleting stock:', err));
            }
        }

        // View stock details
        if (e.target.classList.contains('view-btn')) {
            const productId = e.target.getAttribute('data-id');
            fetch(`api/stock/${productId}`)
                .then(response => response.json())
                .then(stock => {
                    const stockDetails = document.getElementById('stockDetails');
                    stockDetails.innerHTML = `
                    <p><strong>Product ID:</strong> ${stock.productId}</p>
                    <p><strong>Product:</strong> ${stock.productName}</p>
                    <p><strong>Brand:</strong> ${stock.brand}</p>
                    <p><strong>Category:</strong> ${stock.category}</p>
                    <p><strong>Quantity:</strong> ${stock.quantity}</p>
                    <p><strong>Price:</strong> ${stock.price}</p>
                `;
                    stockDetailsPopup.style.display = 'flex';
                })
                .catch(err => console.error('Error fetching stock details:', err));
        }
    });

    closePopupBtn.addEventListener('click', function () {
        popup.style.display = 'none';
    });

    closeStockDetailsPopup.addEventListener('click', function () {
        stockDetailsPopup.style.display = 'none';
    });

    // Handle form submission for both "Add" and "Edit"
    stockForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formMode = document.getElementById('formMode').value; // Get form mode
        const productId = document.getElementById('id').value;
        const stockData = {
            productId: productId,
            product: document.getElementById('product').value,
            brand: document.getElementById('brand').value,
            category: document.getElementById('category').value,
            quantity: parseInt(document.getElementById('quantity').value),
            price: parseFloat(document.getElementById('price').value),
        };

        if (formMode === 'add') {
            // Add new stock
            fetch('api/stock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(stockData),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Stock added:', data);
                    loadStocks();
                    popup.style.display = 'none';
                })
                .catch(err => console.error('Error adding stock:', err));
        } else if (formMode === 'edit') {
            // Update existing stock
            fetch(`api/stock/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(stockData),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Stock updated:', data);
                    loadStocks();
                    popup.style.display = 'none';
                })
                .catch(err => console.error('Error updating stock:', err));
        }
    });




    // Handle employee actions

    const employeeTable = document.getElementById('attendanceTable').getElementsByTagName('tbody')[0];

    // Load employees
    function loadEmployees() {
        fetch('api/employee')
            .then(response => response.json())
            .then(employees => {
                employeeTable.innerHTML = '';
                employees.forEach(employee => {
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
            .catch(err => console.error('Error loading employees:', err));
    }

// Add new employee
addEmployeeBtn.addEventListener('click', function () {
    employeePopup.style.display = 'flex';
});

closeEmployeePopupBtn.addEventListener('click', function () {
    employeePopup.style.display = 'none';
});

employeeForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const newEmployee = {
        employeeId: document.getElementById('employeeId').value,
        employeeName: document.getElementById('employeeName').value,
        mobileNumber: document.getElementById('mobileNumber').value,
        dob: document.getElementById('employeeDob').value,
        address: document.getElementById('employeeAddress').value,
        joinDate: document.getElementById('joinDate').value,
    };

    fetch('/staff/api/employee', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmployee),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Employee added:', data);
            loadEmployees();
            employeePopup.style.display = 'none';
        })
        .catch(err => console.error('Error adding employee:', err));
});

// Delete employee
employeeTable.addEventListener('click', function (e) {
    // Delete employee
    if (e.target.classList.contains('delete-btn-emp')) {
        const employeeId = e.target.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this employee?')) {
            fetch(`/staff/api/employee/${employeeId}`, {
                method: 'DELETE',
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Employee deleted:', data);
                    loadEmployees();  // Reload employee list after deletion
                })
                .catch(err => console.error('Error deleting employee:', err));
        }
    }
});


    const attendanceSearchInput = document.getElementById('attendanceSearch');

    // Search employees
    attendanceSearchInput.addEventListener('input', function () {
        const query = attendanceSearchInput.value.toLowerCase();
        const rows = employeeTable.getElementsByTagName('tr');
        
        Array.from(rows).forEach(row => {
            const employeeName = row.cells[1].textContent.toLowerCase();
            if (employeeName.includes(query)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });


    // Load employees and stocks on page load
    loadEmployees();
    loadStocks();
});
