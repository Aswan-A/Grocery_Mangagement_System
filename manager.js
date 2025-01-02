document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tab');
    const links = document.querySelectorAll('.sidebar a');

    // Tab Navigation
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

    const salesData = [
        { date: '2025-01-01', sales: '$500.00', category: 'Groceries' }
    ];

    populateTable('stockTable', stockData);
    populateTable('attendanceTable', attendanceData);
    populateTable('salesTable', salesData);

    function populateTable(tableId, data) {
        const tbody = document.getElementById(tableId).querySelector('tbody');
        tbody.innerHTML = '';  // Clear existing rows
        data.forEach(row => {
            const tr = document.createElement('tr');
            for (const key in row) {
                const td = document.createElement('td');
                td.textContent = row[key];
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        });
    }
});
