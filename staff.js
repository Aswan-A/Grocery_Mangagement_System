document.addEventListener('DOMContentLoaded', function () {
    // Stock Management Variables
    const tabs = document.querySelectorAll('.tab');
    const links = document.querySelectorAll('.sidebar a');
    const addStockBtn = document.getElementById('addStockBtn');
    const popup = document.getElementById('popup');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const stockForm = document.getElementById('stockForm');
    const stockSubmitBtn = document.getElementById('stockSubmitBtn');
    const warningMessage = document.createElement('div'); // For displaying error messages
    const stockData = [
        { productId: 'P001', product: 'Apples', brand: 'Brand A', category: 'Fruits', quantity: 150, price: 1.00 },
        { productId: 'P002', product: 'Bread', brand: 'Brand B', category: 'Bakery', quantity: 80, price: 2.50 }
    ];
    const attendanceData = [
        { employeeName: 'John Doe', date: '2025-01-05', status: 'Present' },
        { employeeName: 'Jane Smith', date: '2025-01-05', status: 'Absent' }
    ];

    // Set up the warning message container
    warningMessage.style.color = 'red';
    warningMessage.style.marginBottom = '10px';
    warningMessage.style.fontSize = '14px';
    warningMessage.style.display = 'none'; // Initially hidden
    // Insert warning message above the form inside the popup
    popup.querySelector('.stockForm').insertBefore(warningMessage, stockSubmitBtn);

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

    // Populate stock table on page load
    populateTable('stockTable', stockData);
    populateTable('attendanceTable', attendanceData); // Add this line to populate employee table

    // Show the stock popup
    addStockBtn.addEventListener('click', () => {
        popup.style.display = 'flex'; // Show the popup
        warningMessage.style.display = 'none'; // Hide any previous warning messages
    });

    // Close the stock popup
    closePopupBtn.addEventListener('click', () => {
        popup.style.display = 'none'; // Hide the popup
        warningMessage.style.display = 'none'; // Hide warning message on close
    });

    // Handle form submission for adding stock
    stockForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent form from refreshing the page

        // Get form values
        const productId = document.getElementById('id').value;
        const product = document.getElementById('product').value;
        const brand = document.getElementById('brand').value;
        const category = document.getElementById('category').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        const price = parseFloat(document.getElementById('price').value);

        // Validation: Check for negative quantity or price
        if (quantity < 0 || price < 0) {
            // Show the appropriate warning message
            if (quantity < 0) {
                warningMessage.textContent = "Quantity cannot be negative.";
            } else if (price < 0) {
                warningMessage.textContent = "Price cannot be negative.";
            }
            warningMessage.style.display = 'block'; // Show the warning message
            return; // Prevent the form submission
        }

        // Create stock item object
        const stockItem = { productId, product, brand, category, quantity, price };

        // Push stock item to stock data array
        stockData.push(stockItem);

        // Clear form inputs
        stockForm.reset();

        // Close the popup after adding stock
        popup.style.display = 'none';

        // Optionally, you can call a function to update your table here
        populateTable('stockTable', stockData);
    });

    // Function to populate a stock or attendance table
    function populateTable(tableId, data) {
        const tbody = document.getElementById(tableId).querySelector('tbody');
        tbody.innerHTML = '';  // Clear the table body before repopulating

        data.forEach((row, index) => {
            const tr = document.createElement('tr');
            for (const key in row) {
                const td = document.createElement('td');
                td.textContent = row[key];
                tr.appendChild(td);
            }

            // Add delete button for stock and attendance tables
            const deleteTd = document.createElement('td');
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm');
            deleteBtn.addEventListener('click', () => {
                deleteRow(tableId, index);
            });
            deleteTd.appendChild(deleteBtn);
            tr.appendChild(deleteTd);
            tbody.appendChild(tr);
        });
    }

    // Function to delete a row
    function deleteRow(tableId, index) {
        const table = document.getElementById(tableId);
        const tbody = table.querySelector('tbody');
        tbody.deleteRow(index);
    }

    // Employee Attendance Variables
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    const employeePopup = document.getElementById('employeePopup');
    const closeEmployeePopupBtn = document.getElementById('closeEmployeePopupBtn');
    const employeeForm = document.getElementById('employeeForm');
    const employeeName = document.getElementById('employeeName');
    const attendanceDate = document.getElementById('attendanceDate');
    const attendanceStatus = document.getElementById('attendanceStatus');
    const attendanceTable = document.getElementById('attendanceTable').getElementsByTagName('tbody')[0];
    const warningMessageEmployee = document.getElementById('warningMessageEmployee');

    // Open employee popup when clicking "Add New Employee"
    addEmployeeBtn.addEventListener('click', () => {
        employeePopup.style.display = 'flex';
    });

    // Close employee popup
    closeEmployeePopupBtn.addEventListener('click', () => {
        employeePopup.style.display = 'none';
    });

    // Handle the employee form submission
    employeeForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent the default form submission

        // Get the values from the form
        const name = employeeName.value.trim();
        const date = attendanceDate.value.trim();
        const status = attendanceStatus.value;

        // Validation for empty fields
        if (!name || !date || !status) {
            warningMessageEmployee.textContent = 'Please fill out all fields.';
            warningMessageEmployee.style.display = 'block';
            return;
        } else {
            warningMessageEmployee.style.display = 'none'; // Hide warning if all fields are valid
        }

        // Create employee object
        const newEmployee = { employeeName: name, date: date, status: status };

        // Push employee data to the attendanceData array
        attendanceData.push(newEmployee);

        // Reset the form
        employeeForm.reset();

        // Close the popup
        employeePopup.style.display = 'none';

        // Populate employee table with updated data
        populateTable('attendanceTable', attendanceData);
    });

    // Optional: Handle Delete button click in the table
    attendanceTable.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('btn-danger')) {
            const row = e.target.closest('tr');
            row.remove(); // Remove the row from the table
        }
    });
});
