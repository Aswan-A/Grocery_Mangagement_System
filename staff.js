document.addEventListener('DOMContentLoaded', function () {
    // Stock Management Variables
    const tabs = document.querySelectorAll('.tab');
    const links = document.querySelectorAll('.sidebar a');
    const addStockBtn = document.getElementById('addStockBtn');
    const popup = document.getElementById('popup');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const stockForm = document.getElementById('stockForm');
    const stockData = [
        { productId: 'P001', product: 'Apples', brand: 'Brand A', category: 'Fruits', quantity: 150, price: 1.00 },
        { productId: 'P002', product: 'Bread', brand: 'Brand B', category: 'Bakery', quantity: 80, price: 2.50 }
    ];
    let currentStockIndex = null;

    // Employee Management Variables
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    const employeePopup = document.getElementById('employeePopup');
    const closeEmployeePopupBtn = document.getElementById('closeEmployeePopupBtn');
    const employeeForm = document.getElementById('employeeForm');
    const employeeData = [
        { employeeId: 'E001', employeeName: 'John Doe', mobileNumber: '123-456-7890', joinDate: '2020-05-15' },
        { employeeId: 'E002', employeeName: 'Jane Smith', mobileNumber: '987-654-3210', joinDate: '2021-09-10' }
    ];
    let currentEmployeeIndex = null;

    // Employee Details Popup Variables
    const employeeDetailsPopup = document.getElementById('employeeDetailsPopup');
    const closeEmployeeDetailsPopup = document.getElementById('closeEmployeeDetailsPopup');
    const editEmployeeBtn = document.getElementById('editEmployeeBtn');
    const deleteEmployeeBtn = document.getElementById('deleteEmployeeBtn');

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
    populateTable('stockTable', stockData, 'stock');

    // Show the stock popup
    addStockBtn.addEventListener('click', () => {
        document.getElementById('popup').querySelector('h2').textContent = 'Add Stock'; 
                stockSubmitBtn.textContent = 'Add Stock';
        popup.style.display = 'flex'; // Show the popup
        stockForm.reset(); // Reset the form
        currentStockIndex = null; // Reset index for new stock
    });

    // Close the stock popup
    closePopupBtn.addEventListener('click', () => {
        popup.style.display = 'none'; // Hide the popup
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

        // Create stock item object
        const stockItem = { productId, product, brand, category, quantity, price };

        // If editing an existing stock item
        if (currentStockIndex !== null) {
            stockData[currentStockIndex] = stockItem;
        } else {
            // Push stock item to stock data array
            stockData.push(stockItem);
        }

        // Clear form inputs
        stockForm.reset();

        // Close the popup after adding/updating stock
        popup.style.display = 'none';

        // Update the stock table
        populateTable('stockTable', stockData, 'stock');
    });

    // Function to populate a stock table
    function populateTable(tableId, data, type) {
        const tbody = document.getElementById(tableId).querySelector('tbody');
        tbody.innerHTML = '';  // Clear the table body before repopulating

        data.forEach((row, index) => {
            const tr = document.createElement('tr');
            for (const key in row) {
                const td = document.createElement('td');
                td.textContent = row[key];
                tr.appendChild(td);
            }

            // Add the view button for stock or employee
            const actionsTd = document.createElement('td');
            const viewBtn = document.createElement('button');
            viewBtn.textContent = 'View';
            viewBtn.classList.add('btn', 'btn-info', 'btn-sm');
            viewBtn.addEventListener('click', () => {
                if (type === 'stock') {
                    showStockDetails(index);
                } else {
                    showEmployeeDetails(index);
                }
            });
            actionsTd.appendChild(viewBtn);
            tr.appendChild(actionsTd);

            tbody.appendChild(tr);
        });
    }

    // Show stock details in the popup
    function showStockDetails(index) {
        const stockItem = stockData[index];
        const stockDetails = document.getElementById('stockDetails');
        stockDetails.innerHTML = `
            <p><strong>Product ID:</strong> ${stockItem.productId}</p>
            <p><strong>Product Name:</strong> ${stockItem.product}</p>
            <p><strong>Brand:</strong> ${stockItem.brand}</p>
            <p><strong>Category:</strong> ${stockItem.category}</p>
            <p><strong>Quantity:</strong> ${stockItem.quantity}</p>
            <p><strong>Price:</strong> ${stockItem.price}</p>
        `;
        document.getElementById('stockDetailsPopup').style.display = 'flex';
        currentStockIndex = index; // Set current index for editing
    }

    // Edit stock functionality
    editStockBtn.addEventListener('click', () => {
        const stockItem = stockData[currentStockIndex];
        document.getElementById('id').value = stockItem.productId;
        document.getElementById('product').value = stockItem.product;
        document.getElementById('brand').value = stockItem.brand;
        document.getElementById('category').value = stockItem.category;
        document.getElementById('quantity').value = stockItem.quantity;
        document.getElementById('price').value = stockItem.price;
        document.getElementById('popup').querySelector('h2').textContent = 'Edit Stock'; 
                stockSubmitBtn.textContent = 'Edit Stock';
        popup.style.display = 'flex'; // Show the stock popup
        document.getElementById('stockDetailsPopup').style.display = 'none'; // Hide the details popup
    });

    // Close stock details popup
const closeStockDetailsPopup = document.getElementById('closeStockDetailsPopup');
closeStockDetailsPopup.addEventListener('click', () => {
    document.getElementById('stockDetailsPopup').style.display = 'none'; // Hide the stock details popup
});


    // Delete stock functionality
    deleteStockBtn.addEventListener('click', () => {
        stockData.splice(currentStockIndex, 1); // Remove the stock item
        document.getElementById('stockDetailsPopup').style.display = 'none'; // Hide the details popup
        populateTable('stockTable', stockData, 'stock'); // Update the table
    });

    // Employee Management - Add Employee
    addEmployeeBtn.addEventListener('click', () => {
        document.getElementById('employeePopup').querySelector('h2').textContent = 'Add Employee'; 
        employeeSubmitBtn.textContent = 'Add Employee';
        employeePopup.style.display = 'flex'; // Show the employee popup
        employeeForm.reset(); // Reset the form
        currentEmployeeIndex = null; // Reset the index for adding new employee
    });

    // Close the employee popup
    closeEmployeePopupBtn.addEventListener('click', () => {
        employeePopup.style.display = 'none'; // Hide the employee popup
    });

    // Handle form submission for adding employee
    employeeForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent form from refreshing the page

        // Get form values
        const employeeId = document.getElementById('employeeId').value;
        const employeeName = document.getElementById('employeeName').value;
        const mobileNumber = document.getElementById('mobileNumber').value;
        const joinDate = document.getElementById('joinDate').value;

        // Create employee item object
        const employeeItem = { employeeId, employeeName, mobileNumber, joinDate };

        // If editing an existing employee
        if (currentEmployeeIndex !== null) {
            employeeData[currentEmployeeIndex] = employeeItem;
        } else {
            // Push new employee to employee data array
            employeeData.push(employeeItem);
        }

        // Clear form inputs
        employeeForm.reset();

        // Close the employee popup after adding/updating employee
        employeePopup.style.display = 'none';

        // Update the employee table
        populateTable('attendanceTable', employeeData, 'employee');
    });

    // Populate employee attendance table
    populateTable('attendanceTable', employeeData, 'employee');

    // Show employee details in the popup
    function showEmployeeDetails(index) {
        const employeeItem = employeeData[index];
        const employeeDetails = document.getElementById('employeeDetails');
        employeeDetails.innerHTML = `
            <p><strong>Employee ID:</strong> ${employeeItem.employeeId}</p>
            <p><strong>Employee Name:</strong> ${employeeItem.employeeName}</p>
            <p><strong>Mobile Number:</strong> ${employeeItem.mobileNumber}</p>
            <p><strong>Join Date:</strong> ${employeeItem.joinDate}</p>
        `;
        document.getElementById('employeeDetailsPopup').style.display = 'flex';
        currentEmployeeIndex = index; // Set current index for editing
    }

    // Edit employee functionality
    editEmployeeBtn.addEventListener('click', () => {
        const employeeItem = employeeData[currentEmployeeIndex];
        document.getElementById('employeeId').value = employeeItem.employeeId;
        document.getElementById('employeeName').value = employeeItem.employeeName;
        document.getElementById('mobileNumber').value = employeeItem.mobileNumber;
        document.getElementById('joinDate').value = employeeItem.joinDate;
        document.getElementById('employeePopup').querySelector('h2').textContent = 'Edit Employee'; 
                employeeSubmitBtn.textContent = 'Edit Employee';
        employeePopup.style.display = 'flex'; // Show the employee popup
        document.getElementById('employeeDetailsPopup').style.display = 'none'; // Hide the details popup
    });

// Close employee details popup
closeEmployeeDetailsPopup.addEventListener('click', () => {
    document.getElementById('employeeDetailsPopup').style.display = 'none'; // Hide the employee details popup
});


    // Delete employee functionality
    deleteEmployeeBtn.addEventListener('click', () => {
        employeeData.splice(currentEmployeeIndex, 1); // Remove employee item
        document.getElementById('employeeDetailsPopup').style.display = 'none'; // Hide the details popup
        populateTable('attendanceTable', employeeData, 'employee'); // Update the table
    });

});
