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

    // Sample stock data array

// Get the modal and buttons
const addStockBtn = document.getElementById('addStockBtn');
const closePopupBtn = document.getElementById('closePopupBtn');
const popup = document.getElementById('popup');
const stockForm = document.getElementById('stockForm');

// Open the popup for adding stock
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
    const table = document.getElementById(tableId);
    table.innerHTML = ''; // Clear existing table data

    // Create new table rows based on the stock data
    data.forEach(item => {
        const row = table.insertRow();
        row.insertCell(0).textContent = item.product;
        row.insertCell(1).textContent = item.category;
        row.insertCell(2).textContent = item.quantity;
        row.insertCell(3).textContent = item.price;
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
