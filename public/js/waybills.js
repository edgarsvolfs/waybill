

let activeFilters = [];
// Function to add a new filter
function addFilter() {
    const searchInput = document.getElementById('search');
    const filterValue = searchInput.value.trim().toLowerCase();

    if (filterValue && !activeFilters.includes(filterValue)) {
        activeFilters.push(filterValue);
        displayActiveFilters();
        applyFilters();
        searchInput.value = ''; // Clear input after adding filter
    }
}

// Function to display active filters
function displayActiveFilters() {
    const filtersContainer = document.getElementById('active-filters');
    filtersContainer.innerHTML = '';

    activeFilters.forEach(filter => {
        const filterElement = document.createElement('span');
        filterElement.className = 'filter';
        filterElement.textContent = filter;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'x';
        removeButton.onclick = () => removeFilter(filter);

        filterElement.appendChild(removeButton);
        filtersContainer.appendChild(filterElement);
    });
}


// Function to remove a filter
function removeFilter(filter) {
    activeFilters = activeFilters.filter(f => f !== filter);
    displayActiveFilters();
    applyFilters();
}

// Function to filter and display items based on active filters
function applyFilters() {
    const itemsList = document.getElementById('items-list');

    // Remember which rows were checked before filtering
    const checkedRows = new Set();
    itemsList.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        checkedRows.add(checkbox.closest('tr'));
    });

    itemsList.querySelectorAll('tr').forEach(row => {
        const nameCell = row.querySelector('td:nth-child(1)');
        const dateCell = row.querySelector('td:nth-child(2)');
        const sumCell = row.querySelector('td:nth-child(3)');
        const createdByCell = row.querySelector('td:nth-child(4)');

        const name = nameCell.textContent.trim().toLowerCase();
        const date = dateCell.textContent.trim().toLowerCase();
        const sum = sumCell.textContent.trim().toLowerCase();
        const createdBy = createdByCell.textContent.trim().toLowerCase();

        const rowText = `${name} ${date} ${sum} ${createdBy}`;

        // Check if row should be displayed based on active filters
        const matchesFilters = activeFilters.every(filter => rowText.includes(filter));

        row.style.display = matchesFilters ? '' : 'none';
    });

    // Reapply checked state to visible rows that were previously checked
    checkedRows.forEach(row => {
        if (row.style.display !== 'none') {
            const checkbox = row.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = true;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await populateList(); // Populate the items list

    document.getElementById('add-filter').addEventListener('click', addFilter);
    document.getElementById('search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addFilter();
        }
    });
});




function getCookie(cookieName) {
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }

    return ""; // Return empty string if cookie not found
}




async function getDbFiles() {
    try {
        const requestData = {
            // Add your data here
            name: getCookie('name'),
            surname: getCookie('surname'),
            // Add more key-value pairs as needed
        };

        const response = await fetch('http://192.168.8.139:8000/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch files count');
        }

        const data = await response.json();
        return data.itemsData; // Return the array of itemsData from the response object
    } catch (error) {
        console.error('Error fetching files count:', error);
        return []; // Return empty array in case of error
    }

}


// function openFile(item) {
//     const url = `http://192.168.8.139:8000/files/${encodeURIComponent(item.name)}`;
//     //const url = `http://192.168.8.139:3000/files/${encodeURIComponent(item.name)}`;
//     const newWindow = window.open(url, '_blank'); // Open URL in a new tab or window

//     if (newWindow) {
//         // Focus the new window/tab if it was successfully opened
//         newWindow.focus();
//     } else {
//         // Handle if the new window/tab was blocked by the browser
//         alert('Please allow pop-ups to open the item.');
//     }
// }



function openFile(item) {
    const url = `http://192.168.8.139:8000/files`;
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename: item.name })
    })
    .then(response => {
        if (response.ok) {
            return response.blob();
        } else {
            throw new Error('File not found or not a PDF');
        }
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
            newWindow.focus();
        } else {
            alert('Please allow pop-ups to open the item.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error retrieving the file.');
    });
}





// Function to fetch data asynchronously
async function getItemsData() {
    try {
        const itemsData = await getDbFiles(); // Assuming getDbFiles() returns a promise
        return itemsData;
    } catch (error) {
        console.error('Error fetching data:', error);
        return []; // Return an empty array in case of error
    }
}

// Function to populate the list with fetched data
async function populateList() {
    const itemsList = document.getElementById('items-list');

    try {
        const itemsData = await getItemsData(); // Wait for items data to be fetched
        //itemsList.innerHTML = ''; // Clear current list

        itemsData.forEach(item => {
            const row = document.createElement('tr');

            const nameCell = document.createElement('td');
            nameCell.textContent = item.name;
            row.appendChild(nameCell);

            const dateCell = document.createElement('td');
            dateCell.textContent = item.date;
            row.appendChild(dateCell);

      
            ////
            // const sumWithVat = document.createElement('td');
            // dateCell.textContent = item.sumWithVat;
            // row.appendChild(dateCell);


            ////
            const createdByCell = document.createElement('td');
            createdByCell.textContent = item.createdBy;
            row.appendChild(createdByCell);

            
            const recieverCell = document.createElement('td');
            recieverCell.textContent = item.reciever;
            row.appendChild(recieverCell);

            const applyVATSumCell = document.createElement('td');
            applyVATSumCell.textContent = item.sum_without_VAT;
            row.appendChild(applyVATSumCell);

            const VATCell = document.createElement('td');
            VATCell.textContent = item.vat_amount;
            row.appendChild(VATCell);





            const sumCell = document.createElement('td');
            sumCell.textContent = item.sum;
            row.appendChild(sumCell);




            const actionCell = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.textContent = 'Rediģēt';
            editButton.className = 'open-button';
            editButton.onclick = () => editFile(item);
            actionCell.appendChild(editButton);
            row.appendChild(actionCell);





            const actionCell2 = document.createElement('td');
            const openButton = document.createElement('button');
            openButton.textContent = 'Atvērt';
            openButton.className = 'open-button';
            openButton.onclick = () => openFile(item);
            actionCell2.appendChild(openButton);
            row.appendChild(actionCell2);



            // Create a table cell for the checkbox
            const checkboxCell = document.createElement('td');

            // Create the checkbox input element
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';

            // Apply styles to center the checkbox
            checkbox.style.display = 'block'; // Set display to block to center horizontally
            checkbox.style.margin = 'auto'; // Set margin to auto for horizontal centering

            // Append the checkbox to the cell
            checkboxCell.appendChild(checkbox);

            // Append the checkbox cell to the row
            row.appendChild(checkboxCell);


            if(itemsList !== null){
                itemsList.appendChild(row);
            }
           //itemsList.appendChild(row);
        });
    } catch (error) {
        console.error('Error populating list:', error);
    }
}


let newWindow;

// function editFile(item) {
//     const url = `http://localhost:8000/editFile.html?filename=${encodeURIComponent(item.name)}`;
//     newWindow = window.open(url, '_blank'); // Open URL in a new tab or window

//     if (newWindow) {
//         // Focus the new window/tab if it was successfully opened
//         newWindow.focus();
//     } else {
//         // Handle if the new window/tab was blocked by the browser
//         alert('Please allow pop-ups to open the item.');
//     }
// }



function editFile(item) {
    fetch(`/generateToken?filename=${encodeURIComponent(item.name)}`)
        .then(response => response.json())
        .then(data => {
            const token = data.token;
            const url = `http://localhost:8000/editFile.html?token=${encodeURIComponent(token)}`;
            const newWindow = window.open(url, '_blank'); // Open URL in a new tab or window

            if (newWindow) {
                // Focus the new window/tab if it was successfully opened
                newWindow.focus();
            } else {
                // Handle if the new window/tab was blocked by the browser
                alert('Please allow pop-ups to open the item.');
            }
        })
        .catch(error => {
            console.error('Error generating token:', error);
        });
}










function closeEditFileWindow() {
    if (newWindow && !newWindow.closed) {
        newWindow.closeWindow(); // Call the close function defined in the child window
    }
}




function goBack() {
    // Implement your navigation logic to go back (e.g., window.history.back())
    window.history.back();
}



function exportToExcel() {
    const selectedRows = [];
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');

    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const rowIndex = Array.from(row.parentNode.children).indexOf(row);
        
        // Skip the first row (assuming the first row is the header row)
        if (rowIndex === 0) return;


        const rowData = {
            Dokumenta_Nr: row.cells[0].textContent,
            Datums: row.cells[1].textContent,
            Izveidoja: row.cells[2].textContent,
            Saņēmējs: row.cells[3].textContent,
            Ar_PVN_apl_summa: row.cells[4].textContent,     
            PVN: row.cells[5].textContent, 
            Summa: row.cells[6].textContent, 

        };
        selectedRows.push(rowData);
    });

    if (selectedRows.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(selectedRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Rows');
        XLSX.writeFile(workbook, 'selected_rows.xlsx');
    } else {
        alert('Please select rows to export.');
    }
}

let allChecked = false; // Variable to track the state of checkboxes

function checkAllCheckboxes() {
    const itemsList = document.getElementById('items-list');
    const rows = Array.from(itemsList.querySelectorAll('tr'));

    if (activeFilters.length === 0 ) {
        // If there are no active filters, toggle all checkboxes
        allChecked = !allChecked;
        rows.forEach(row => {
            const checkbox = row.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = allChecked;
            }
        });
    } else {
        // If there are active filters, only check visible checkboxes
        rows.forEach(row => {
            if (row.style.display !== 'none') {
                const checkbox = row.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = true;
                }
            }
        });
    }
}

let isAscending = true;

function sortItemsBySum() {
    const itemsList = document.getElementById('items-list');
    const rows = Array.from(itemsList.querySelectorAll('tr'));

    rows.sort((a, b) => {
        const sumA = parseFloat(a.querySelector('td:nth-child(7)').textContent.trim()) || 0;
        const sumB = parseFloat(b.querySelector('td:nth-child(7)').textContent.trim()) || 0;
        return isAscending ? sumA - sumB : sumB - sumA;
    });

    // Toggle the sort order for next click
    isAscending = !isAscending;

    // Clear the current list and append sorted rows
    itemsList.innerHTML = '';
    rows.forEach(row => itemsList.appendChild(row));
}

let isDateAscending = true;

function sortItemsByDate() {
    console.log('Sorting function called'); // Debug log

    const itemsList = document.getElementById('items-list');
    const rows = Array.from(itemsList.querySelectorAll('tr'));

    rows.sort((a, b) => {
        const dateA = parseDate(a.querySelector('td:nth-child(2)').textContent.trim());
        const dateB = parseDate(b.querySelector('td:nth-child(2)').textContent.trim());
        console.log(`Parsed dates: ${dateA} - ${dateB}`); // Debug log

        return isDateAscending ? dateA - dateB : dateB - dateA;
    });

    // Toggle the sort order for next click
    isDateAscending = !isDateAscending;

    // Clear the current list and append sorted rows
    itemsList.innerHTML = '';
    rows.forEach(row => itemsList.appendChild(row));
}

function parseDate(dateString) {
    console.log(`Parsing date: ${dateString}`); // Debug log

    // Handle dates formatted as "2024. gada 19. maijs"
    const parts = dateString.split(' ');
    const year = parts[0].replace('.', '');
    const day = parts[2].replace('.', '');
    const monthName = parts[3];
    const month = getMonthNumber(monthName);

    const date = new Date(`${year}-${month}-${day}`);
    console.log(`Parsed date object: ${date}`); // Debug log
    return date;
}

function getMonthNumber(monthName) {
    const months = {
        janvāris: '01', februāris: '02', marts: '03', aprīlis: '04',
        maijs: '05', jūnijs: '06', jūlijs: '07', augusts: '08',
        septembris: '09', oktobris: '10', novembris: '11', decembris: '12'
    };
    return months[monthName.toLowerCase()];
}



setTimeout(function () {
    document.getElementById("loadingScreen").style.display = "none";
}, 500);




populateList(); // Initial population of the list