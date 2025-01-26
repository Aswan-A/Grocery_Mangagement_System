document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tab');
    const links = document.querySelectorAll('.sidebar a');
    const stockFilter = document.getElementById('stockFilter');
    const attendanceFilter = document.getElementById('attendanceFilter');
    const salesFilter = document.getElementById('salesFilter');

    // Initially hide all filter sections
    stockFilter.style.display = 'none';
    attendanceFilter.style.display = 'none';
    salesFilter.style.display = 'none';

    // Set the default active tab to 'stocks' and show the stock filter
    document.getElementById('stocks').classList.add('active');
    document.getElementById('stocksLink').classList.add('active');
    stockFilter.style.display = 'block'; // Show the stock filter by default

    // Tab Navigation
    links.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();

            tabs.forEach(tab => tab.classList.remove('active'));
            links.forEach(l => l.classList.remove('active'));

            const targetId = link.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active');
            link.classList.add('active');

            // Manage visibility of filters based on the tab
            manageFilters(targetId);
            resetSearchInput(targetId); // Reset search when switching tabs
        });
    });

    // Example data for populating tables
    let stockData = [
        { product: 'Apples', category: 'Fruits', quantity: 150, price: '$1.00' },
        { product: 'Bread', category: 'Bakery', quantity: 80, price: '$2.50' },
        { product: 'Bananas', category: 'Fruits', quantity: 120, price: '$0.60' },
        { product: 'Cake', category: 'Bakery', quantity: 50, price: '$3.00' }
    ];

    let attendanceData = [
        { name: 'John Doe', date: '2025-01-02', status: 'Present' },
        { name: 'Jane Smith', date: '2025-01-02', status: 'Absent' },
        { name: 'Sam Johnson', date: '2025-01-01', status: 'Present' },
        { name: 'Lisa White', date: '2025-01-01', status: 'Present' }
    ];

    const salesData = [
        { date: '2025-01-01', sales: '$500.00', category: 'Groceries' }
    ];

    populateTable('stockTable', stockData);
    populateTable('attendanceTable', attendanceData);
    populateTable('salesTable', salesData);

    // Filter Event Listeners
    document.getElementById('categoryFilter').addEventListener('change', function() {
        applyFiltersAndSearch();
    });

    document.getElementById('dateFilter').addEventListener('change', function() {
        applyFiltersAndSearch();
    });

    document.getElementById('salesDateFilter').addEventListener('change', function() {
        applyFiltersAndSearch();
    });

    // Search Event Listeners
    document.getElementById('stockSearch').addEventListener('input', function() {
        applyFiltersAndSearch();
    });

    document.getElementById('attendanceSearch').addEventListener('input', function() {
        applyFiltersAndSearch();
    });

    document.getElementById('salesSearch').addEventListener('input', function() {
        applyFiltersAndSearch();
    });

    // Function to populate the table with data
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

    // Manage visibility of filter sections based on the active tab
    function manageFilters(targetId) {
        stockFilter.style.display = 'none';
        attendanceFilter.style.display = 'none';
        salesFilter.style.display = 'none';

        if (targetId === 'stocks') {
            stockFilter.style.display = 'block';
        } else if (targetId === 'attendance') {
            attendanceFilter.style.display = 'block';
        } else if (targetId === 'sales') {
            salesFilter.style.display = 'block';
        }
    }

    // Reset the search field when switching tabs
    function resetSearchInput(targetId) {
        if (targetId === 'stocks') {
            document.getElementById('stockSearch').value = '';
        } else if (targetId === 'attendance') {
            document.getElementById('attendanceSearch').value = '';
        } else if (targetId === 'sales') {
            document.getElementById('salesSearch').value = '';
        }
    }

    // Apply filters and search together
    function applyFiltersAndSearch() {
        const activeTab = document.querySelector('.tab.active').id;

        let filteredData;
        if (activeTab === 'stocks') {
            filteredData = filterStocks(stockData);
            searchAndPopulateTable('stockTable', filteredData);
        } else if (activeTab === 'attendance') {
            filteredData = filterAttendance(attendanceData);
            searchAndPopulateTable('attendanceTable', filteredData);
        } else if (activeTab === 'sales') {
            filteredData = filterSales(salesData);
            searchAndPopulateTable('salesTable', filteredData);
        }
    }

    // Filter function for Stocks
    function filterStocks(data) {
        const categoryFilter = document.getElementById('categoryFilter').value;
        return data.filter(stock => {
            return categoryFilter === '' || stock.category === categoryFilter;
        });
    }

    // Filter function for Attendance
    function filterAttendance(data) {
        const dateFilter = document.getElementById('dateFilter').value;
        return data.filter(attendance => {
            return dateFilter === '' || attendance.date === dateFilter;
        });
    }

    // Filter function for Sales
    function filterSales(data) {
        const salesDateFilter = document.getElementById('salesDateFilter').value;
        return data.filter(sale => {
            return salesDateFilter === '' || sale.date === salesDateFilter;
        });
    }

    // Search function and populate filtered data to table
    function searchAndPopulateTable(tableId, data) {
        const searchTerm = document.getElementById(tableId.replace('Table', 'Search')).value.toLowerCase();

        // Perform search on filtered data
        const filteredAndSearchedData = data.filter(item => {
            return Object.values(item).some(value => value.toString().toLowerCase().includes(searchTerm));
        });

        // Populate the table with the final filtered and searched data
        populateTable(tableId, filteredAndSearchedData);
    }
});
