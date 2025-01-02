document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tab');
    const links = document.querySelectorAll('.sidebar a');

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

    // Example data for populating tables
    const stockData = [
        { product: 'Apples', category: 'Fruits', quantity: 150, price: '$1.00' },
        { product: 'Bread', category: 'Bakery', quantity: 80, price: '$2.50' }
    ];

    const attendanceData = [
        { name: 'John Doe', date: '2025-01-02', status: 'Present' },
        { name: 'Jane Smith', date: '2025-01-02', status: 'Absent' }
    ];

    populateTable('stockTable', stockData);
    populateTable('attendanceTable', attendanceData);
    

    // Show the popup
    addStockBtn.addEventListener('click', () => {
        popup.style.display = 'flex'; // Show the popup
    });
    
    // Close the popup
    closePopupBtn.addEventListener('click', () => {
        popup.style.display = 'none'; // Hide the popup
    });
    

    
    // Handle form submission for adding stock
    stockForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent form from refreshing the page
    
        // Get form values
        const product = document.getElementById('product').value;
        const category = document.getElementById('category').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        const price = parseFloat(document.getElementById('price').value);
    
        // Create stock item object
        const stockItem = { product, category, quantity, price };
    
        // Push stock item to stock data array
        stockData.push(stockItem);
    
        // Clear form inputs
        stockForm.reset();
    
        // Close the popup after adding stock
        popup.style.display = 'none';
    
        // Optionally, you can call a function to update your table here
        populateTable('stockTable', stockData);
    });
    
    // Function to populate a stock table (can be customized as needed)
    function populateTable(tableId, data) {
        const tbody = document.getElementById(tableId).querySelector('tbody');
        tbody.innerHTML = '';
        data.forEach((row, index) => {
            const tr = document.createElement('tr');
            for (const key in row) {
                const td = document.createElement('td');
                td.textContent = row[key];
                tr.appendChild(td);
            }
            const deleteTd = document.createElement('td');
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => {
                deleteRow(tableId, index);
            });
            deleteTd.appendChild(deleteBtn);
            tr.appendChild(deleteTd);
            tbody.appendChild(tr);
        });
    }









    function deleteRow(tableId, index) {
        const table = document.getElementById(tableId);
        const tbody = table.querySelector('tbody');
        tbody.deleteRow(index);
    }

    

    // Add new employee attendance
    document.getElementById('addEmployeeBtn').addEventListener('click', () => {
        const newEmployee = prompt('Enter new employee name:');
        if (newEmployee) {
            const status = prompt('Enter attendance status (Present/Absent):');
            const date = new Date().toLocaleDateString();
            attendanceData.push({ name: newEmployee, date, status });
            populateTable('attendanceTable', attendanceData);
        }
    });
});
