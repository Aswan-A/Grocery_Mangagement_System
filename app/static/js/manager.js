document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tab');
    const links = document.querySelectorAll('.sidebar a');
    const stockFilter = document.getElementById('stockFilter');
    const attendanceFilter = document.getElementById('attendanceFilter');
    const salesFilter = document.getElementById('salesFilter');
    const attendanceSearch = document.getElementById('attendanceSearch');
    const dateFilter = document.getElementById('dateFilter');

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

    // Load attendance data when the page loads
    loadAttendanceData();

    // Function to populate a table with fetched data
    function populateTable(tableId, data) {
        const tableBody = document.querySelector(`#${tableId} tbody`);
        if (!tableBody) {
            console.error(`Table with ID '${tableId}' not found.`);
            return;
        }
        tableBody.innerHTML = ''; // Clear existing rows

        data.forEach(row => {
            let formattedDate = "Invalid Date"; // Default fallback

            if (row.date) {  
                let parsedDate = Date.parse(row.date);
                if (!isNaN(parsedDate)) {
                    let dateObj = new Date(parsedDate);
                    let day = String(dateObj.getDate()).padStart(2, '0');
                    let month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    let year = String(dateObj.getFullYear()).slice(-2);
                    formattedDate = `${day}/${month}/${year}`; // Convert to dd/mm/yy format
                } else {
                    console.error("Invalid date format received:", row.date);
                }
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.employeeId}</td>
                <td>${formattedDate}</td>
                <td>${row.status}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Function to fetch and load attendance data
    async function loadAttendanceData() {
        try {
            console.log("Fetching attendance data...");
            const response = await fetch('/manager/api/attendance');

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            console.log("Attendance Data:", data);

            populateTable('attendanceTable', data);

        } catch (error) {
            console.error('Error loading attendance data:', error);
        }
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
            document.getElementById('dateFilter').value = '';
            filterAttendanceTable();
        } else if (targetId === 'sales') {
            document.getElementById('salesSearch').value = '';
        }
    }

    // Function to filter attendance table based on search input
    function filterAttendanceTable() {
        const searchValue = attendanceSearch.value.toLowerCase();
        const rows = document.querySelectorAll('#attendanceTable tbody tr');

        rows.forEach(row => {
            const employeeId = row.cells[0].textContent.toLowerCase();
            const date = row.cells[1].textContent.toLowerCase();
            const status = row.cells[2].textContent.toLowerCase();

            if (employeeId.includes(searchValue) || date.includes(searchValue) || status.includes(searchValue)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    // Function to filter attendance table by selected date
    function filterAttendanceByDate() {
        const selectedDate = dateFilter.value; // Format: YYYY-MM-DD
        const rows = document.querySelectorAll('#attendanceTable tbody tr');

        if (!selectedDate) {
            rows.forEach(row => (row.style.display = '')); // Show all rows if input is empty
            return;
        }

        // Convert selectedDate (YYYY-MM-DD) to dd/mm/yy format
        const dateParts = selectedDate.split('-'); // [YYYY, MM, DD]
        const formattedSelectedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0].slice(-2)}`; // Convert to dd/mm/yy

        rows.forEach(row => {
            const rowDate = row.cells[1].textContent.trim(); // Date from table in dd/mm/yy format

            if (rowDate === formattedSelectedDate) {
                row.style.display = ''; // Show row if date matches
            } else {
                row.style.display = 'none'; // Hide non-matching rows
            }
        });
    }

    // Attach event listeners to search and date input
    attendanceSearch.addEventListener('input', filterAttendanceTable);
    dateFilter.addEventListener('input', filterAttendanceByDate);
});
