setTimeout(function () {
    addRow();
    var today = new Date();
    var today_plus_10 = new Date();
    today_plus_10.setDate(today.getDate() + 10);
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    var formattedDate = today.toLocaleDateString('lv-LV', options);
    var formattedDate2 = today_plus_10.toLocaleDateString('lv-LV', options);

    document.getElementById('todaysDate').textContent = formattedDate;
    document.getElementById('delivery_date').value = formattedDate;
    document.getElementById('payment_date_due').value = formattedDate2;
    //var fileCount = getFilesCount();
    //console.log('count ', fileCount);
    //const paddedNumber = String(fileCount).padStart(4, '0');
    //document.getElementById('waybill_number').value = paddedNumber;

    //switchStyles();

    getFilesCount().then(data => {
        const paddedNumber = String(data).padStart(4, '0');
        document.getElementById('waybill_number').textContent += paddedNumber;
    })
    adjustAllTextareas();
    document.getElementById("loadingScreen").style.display = "none";

}, 800);


// window.onload = function () {
//     addRow();
//     var today = new Date();
//     var today_plus_10 = new Date();
//     today_plus_10.setDate(today.getDate() + 10);
//     var options = { year: 'numeric', month: 'long', day: 'numeric' };
//     var formattedDate = today.toLocaleDateString('lv-LV', options);
//     var formattedDate2 = today_plus_10.toLocaleDateString('lv-LV', options);

//     document.getElementById('todaysDate').textContent = formattedDate;
//     document.getElementById('delivery_date').value = formattedDate;
//     document.getElementById('payment_date_due').value = formattedDate2;
//     //var fileCount = getFilesCount();
//     //console.log('count ', fileCount);
//     //const paddedNumber = String(fileCount).padStart(4, '0');
//     //document.getElementById('waybill_number').value = paddedNumber;

//     //switchStyles();

//     getFilesCount().then(data => {
//         const paddedNumber = String(data).padStart(4, '0');
//         document.getElementById('waybill_number').textContent += paddedNumber;
//     })
//     adjustAllTextareas();
//     document.getElementById("loadingScreen").style.display = "none";

// };


function adjustAllTextareas() {
    document.querySelectorAll('textarea').forEach(textarea => {
        textAreaAdjust(textarea);
    });
}


// const signInWithGoogle = async () => {
//     const provider = new GoogleAuthProvider(); // Use 'GoogleAuthProvider' directly
//     provider.setCustomParameters({ prompt: 'select_account' });
//     try {
//         await signInWithPopup(auth, provider); // Use 'provider' directly here
//         console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
//     } catch (error) {
//         alert(error.message);
//     }
// };



function textAreaAdjust(element) {
    //element.style.height = "1px";
    element.style.height = (element.scrollHeight) + "px";
}



function numberToWords(n) {
    if (n < 0)
        return false;

    single_digit = ['', 'viens', 'divi', 'trīs', 'četri', 'pieci', 'seši', 'septiņi', 'astoņi', 'deviņi']
    double_digit = ['desmit', 'vienpadsmit', 'divpadsmit', 'trīspadsmit', 'četrpadsmit', 'piecpadsmit', 'sešdpadsmit', 'septiņpadsmit', 'astoņpadsmit', 'deviņpadsmit']
    below_hundred = ['divdesmit', 'trīsdesmit', 'četrdesmit', 'piecdesmit', 'sešdesmit', 'septiņdesmit', 'astoņdesmit', 'deviņdesmit']

    if (n === 0) return '0';

    function translate(n) {
        let word = "";
        if (n < 10) {
            word = single_digit[n] + ' ';
        } else if (n < 20) {
            word = double_digit[n - 10] + ' ';
        } else if (n < 100) {
            let rem = translate(n % 10);
            word = below_hundred[(n - n % 10) / 10 - 2] + ' ' + rem;
        } else if (n < 1000) {
            let hundreds = Math.trunc(n / 100);
            word = single_digit[hundreds] + ' ' + (hundreds === 1 ? 'simts ' : 'simti ') + translate(n % 100);
        } else if (n < 1000000) {
            let thousands = Math.trunc(n / 1000);
            word = translate(thousands).trim() + ' ' + (thousands === 1 ? 'tūkstotis ' : 'tūkstoši ') + translate(n % 1000);
        } else {
            let millions = Math.trunc(n / 1000000);
            word = translate(millions).trim() + ' ' + (millions === 1 ? 'miljons ' : 'miljoni ') + translate(n % 1000000);
        }
        return word;
    }

    let result = translate(n);
    return result.trim() + ' ';
}


function sumArray(arr) {
    return arr.reduce((total, num) => total + Number(num), 0).toFixed(2);
}


var discount_amount_arr = [];
var ar_pvn_apl_summa = [];
// var ar_pvn_apl_summa_calc = [];
var ar_pvn_neapl_summa = [];
var pvn_values = [];




function addRow() {

    var table = document.getElementById("myTable").getElementsByTagName('tbody')[0];
    var newRow = table.insertRow(table.rows.length);
    var cells = [
        newRow.insertCell(0),
        newRow.insertCell(1),
        newRow.insertCell(2),
        newRow.insertCell(3),
        newRow.insertCell(4),
        newRow.insertCell(5),
        newRow.insertCell(6) //,
        // newRow.insertCell(7)
    ];

    // cells[0].innerHTML = '<textarea class="textarea_table" id="table_input_code_' + table.rows.length + '" oninput="textAreaAdjust(this)"></textarea>';
    cells[0].innerHTML = '<textarea class="textarea_table input_wider" id="table_input_name_' + table.rows.length + '" oninput="textAreaAdjust(this)"></textarea>';
    cells[1].innerHTML = '<textarea class="textarea_table" id="table_input_unit_of_measure_' + table.rows.length + '" oninput="textAreaAdjust(this)"></textarea>';
    cells[2].innerHTML = '<textarea class="textarea_table" type="number" id="table_input_amount_' + table.rows.length + '" oninput="textAreaAdjust(this)"></textarea>';
    cells[3].innerHTML = '<textarea class="textarea_table" type="number" id="table_input_price_' + table.rows.length + '" oninput="textAreaAdjust(this)"></textarea>';
    cells[4].innerHTML = '<textarea class="textarea_table" type="number" id="table_input_discount_' + table.rows.length + '" oninput="textAreaAdjust(this)"></textarea>';
    cells[5].innerHTML = '<textarea class="textarea_table" type="number" id="table_input_vat_number_' + table.rows.length + '" oninput="textAreaAdjust(this)"></textarea>';
    cells[6].innerHTML = '<textarea class="textarea_table" type="number" id="table_input_total_' + table.rows.length + '" oninput="textAreaAdjust(this)"></textarea>';
    console.log("addded " + ' table_input_amount_' + table.rows.length);
    // function textAreaAdjust(textarea) {
    //     textarea.style.height = 'auto';
    //     textarea.style.height = (textarea.scrollHeight) + 'px';
    // }




    cells[2].querySelector('textarea').addEventListener('input', (function (rowIndex) { // DAUDZUMS
        return function () {
            let daudzums = cells[2].querySelector('textarea').value;
            let cena = cells[3].querySelector('textarea').value;
            let atlaide = cells[4].querySelector('textarea').value;
            let pvn = cells[5].querySelector('textarea').value;

            calculate_fields(rowIndex, daudzums, cena, atlaide, pvn);

        };
    })(table.rows.length)); // Pass table.rows.length to create a closure

    cells[3].querySelector('textarea').addEventListener('input', (function (rowIndex) { //CENA
        return function () {
            let daudzums = cells[2].querySelector('textarea').value;
            let cena = cells[3].querySelector('textarea').value;
            let atlaide = cells[4].querySelector('textarea').value;
            let pvn = cells[5].querySelector('textarea').value;
            calculate_fields(rowIndex, daudzums, cena, atlaide, pvn);

        };
    })(table.rows.length));

    cells[4].querySelector('textarea').addEventListener('input', (function (rowIndex) { // ATLAIDE
        return function () {
            let daudzums = cells[2].querySelector('textarea').value;
            let cena = cells[3].querySelector('textarea').value;
            let atlaide = cells[4].querySelector('textarea').value;
            let pvn = cells[5].querySelector('textarea').value;
            calculate_fields(rowIndex, daudzums, cena, atlaide, pvn);

        };
    })(table.rows.length));

    cells[5].querySelector('textarea').addEventListener('input', (function (rowIndex) { // PVN
        return function () {
            let daudzums = cells[2].querySelector('textarea').value;
            let cena = cells[3].querySelector('textarea').value;
            let atlaide = cells[4].querySelector('textarea').value;
            let pvn = cells[5].querySelector('textarea').value;
            calculate_fields(rowIndex, daudzums, cena, atlaide, pvn);

        };
    })(table.rows.length));



    function calculate_fields(rowIndex, daudzums, cena, atlaide, pvn) {
        daudzums = Number(daudzums);
        cena = Number(cena);
        atlaide = Number(atlaide);
        pvn = Number(pvn);


        if (daudzums, cena, atlaide != null) {

            let summa_ar_atlaidi = (((daudzums * cena) / 100) * (100 - atlaide)).toFixed(2);
            // console.log(summa_ar_atlaidi);
            cells[6].querySelector('textarea').value = summa_ar_atlaidi; //SUMMA
            discount_amount_arr[rowIndex] = ((daudzums * cena) / 100) * atlaide; // Ievieto atlaides daudzumu discount_amount_arr
            document.getElementById('discount_table_display').textContent = sumArray(discount_amount_arr);

            pvn_values[rowIndex] = pvn;
            let filtered_pvn_values = pvn_values.filter(value => !isNaN(value));
            if (pvn == 0) {
                ar_pvn_apl_summa[rowIndex] = 0;
                ar_pvn_neapl_summa[rowIndex] = summa_ar_atlaidi;

            } else if (pvn) {
                ar_pvn_apl_summa[rowIndex] = summa_ar_atlaidi;
                ar_pvn_neapl_summa[rowIndex] = 0;
            }



            document.getElementById('no_vat_value_table_display').textContent = sumArray(ar_pvn_neapl_summa);
            document.getElementById('with_vat_value_table_display').textContent = sumArray(ar_pvn_apl_summa);

            // if (sumArray(ar_pvn_apl_summa) > 1) {
            document.getElementById('vat_number_table_display').textContent = ((sumArray(ar_pvn_apl_summa) / 100) * (100 + Math.max(...filtered_pvn_values))).toFixed(2);
            // }
            let total_cost = (Number(((sumArray(ar_pvn_apl_summa) / 100) * (100 + Math.max(...filtered_pvn_values))).toFixed(2)) + Number(sumArray(ar_pvn_neapl_summa))).toFixed(2);

            let vat_amount = Number(((sumArray(ar_pvn_apl_summa) / 100) * (Math.max(...filtered_pvn_values))).toFixed(2)).toFixed(2);
            document.getElementById('vat_amount').innerHTML = "PVN " + Math.max(...filtered_pvn_values) + "% (EUR)";
            document.getElementById('vat_amount_table_display').textContent = vat_amount;
            document.getElementById('total_cost_table_display').textContent = total_cost;
            document.getElementById('total_cost_table2_display').textContent = total_cost;
            let eiro = Math.floor(total_cost);
            let centi = Math.round((total_cost - eiro) * 100);

            eiro = numberToWords(eiro);
            centi = numberToWords(centi);
            if (centi.includes('viens')) {
                centi += ' cents';
            }
            else {
                centi += ' centi';
            }

            let number_to_word = capitalizeFirstLetter(eiro) + " eiro un " + capitalizeFirstLetter(centi);
            document.getElementById('total_cost_to_words').textContent = number_to_word;

        }
    }

}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function removeLastRow() {
    var table = document.getElementById("myTable").getElementsByTagName('tbody')[0];

    if (table.rows.length > 2) {
        table.deleteRow(-1); // Remove the last row

        // Adjust arrays
        if (discount_amount_arr.length >= table.rows.length) {
            discount_amount_arr.pop();
        }
        if (ar_pvn_apl_summa.length >= table.rows.length) {
            ar_pvn_apl_summa.pop();
        }
        if (ar_pvn_neapl_summa.length >= table.rows.length) {
            ar_pvn_neapl_summa.pop();
        }
        if (pvn_values.length >= table.rows.length) {
            pvn_values.pop();
        }

        // Trigger input event on a specific element to recalculate

        var elementToTrigger = document.getElementById('table_input_amount_2');
        elementToTrigger.dispatchEvent(new Event('input', { bubbles: true }));
    }
}



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


function generatePDF() {

    document.getElementById("loadingScreen").style.display = "flex";
    document.getElementById("add_table_row").style.visibility = "hidden";
    document.getElementById("remove_table_row").style.visibility = "hidden";
    document.getElementById("submit").style.visibility = "hidden";
    document.getElementById("backButton").style.visibility = "hidden";


    setTimeout(function () {
        switchStyles();

        decreaseTextareaSize();
        //checkAllRowsHeight();
        html2pdf().from(document.body).set({
            html2canvas: { scale: 4 },
            margin: 1,
            jsPDF: { format: 'a4' }
        }).output('blob').then(function (pdf) {




            window.history.back();
            handlePDF(pdf);
        });


    }, 1000);
}

// window.onload = function () {
//     document.getElementById("loadingScreen").style.display = "none";
//     document.body.classList.remove('blur');
// };



function getFilesCount() {
    return fetch('http://192.168.8.139:8000/filesCount')
        //return fetch('http://192.168.8.139:3000/filesCount')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch files count');
            }
            return response.json();
            //return data.count();
        })
        .then(data => {
            console.log('Number of files in the database:', data.count);
            return data.count;
        })
        .catch(error => {
            console.error('Error fetching files count:', error);
        });
}

function getRowCount() { //get row count in table
    var table = document.getElementById("myTable").getElementsByTagName('tbody')[0];
    var rowCount = table.rows.length;
    return rowCount;
}








function handlePDF(pdf) {

    function appendData(dataName, dataId) {
        data.append(dataName, document.getElementById(dataId).value);
    }
    function appendDataSameNameId(dataNameId) {
        data.append(dataNameId, document.getElementById(dataNameId).value);
    }

    let data = new FormData();
    data.append('file', pdf);
    var today = new Date();
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    var formattedDate = today.toLocaleDateString('lv-LV', options);
    var createdBy = getCookie('name') + " " + getCookie('surname');
    data.append('dateSubmitted', formattedDate);
    data.append('deliverer', document.getElementById('deliverer').value);
    data.append('createdBy', createdBy);
    data.append('costSum', document.getElementById('total_cost_table_display').textContent);


    appendDataSameNameId('reciever');
    appendDataSameNameId('reg_number_reciever');
    appendDataSameNameId('address_reciever');
    appendDataSameNameId('vat_number_reciever');
    appendDataSameNameId('bank_reciever');
    appendDataSameNameId('bank_account_reciever');
    //appendDataSameNameId('recieving_location');
    appendDataSameNameId('deal_description');
    appendDataSameNameId('recieving_location');
    appendDataSameNameId('payment_date_due');
    appendDataSameNameId('delivery_date');
    var rowCount = getRowCount();
    data.append('row_number', String(rowCount));
    appendDataSameNameId('payment_method');
    //data.append('row_number', rowCount());
    var array_sum = sumArray(ar_pvn_apl_summa);

    data.append('sum_without_VAT', array_sum);
    const numericValues = pvn_values
        .map(value => parseFloat(value)) // Convert each value to a number
        .filter(value => !isNaN(value)); // Remove NaN values    
    var vat_amount = Number(((sumArray(ar_pvn_apl_summa) / 100) * (Math.max(...numericValues))).toFixed(2)).toFixed(2);
    data.append('vat_amount', vat_amount);

    try {
        for (let i = 2; i <= rowCount; i++) {
            // appendDataSameNameId('table_input_code_' + i);
            appendDataSameNameId('table_input_name_' + i);
            appendDataSameNameId('table_input_unit_of_measure_' + i);
            appendDataSameNameId('table_input_amount_' + i);
            appendDataSameNameId('table_input_price_' + i);
            appendDataSameNameId('table_input_discount_' + i);
            appendDataSameNameId('table_input_vat_number_' + i);
            appendDataSameNameId('table_input_total_' + i);

        }
    } catch (error) {
        console.log(error);
    }



    fetch('http://192.168.8.139:8000/upload', {
        //fetch('http://192.168.8.139:3000/upload', {    
        method: 'POST',
        body: data
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to upload PDF file');
            }
            return response.json();
        })
        .then(data => {
            console.log('PDF file uploaded successfully:', data);
            alert('Pavadzīme iesniegta'); //////////////////////////////////////////////////////////////


        })
        .catch(error => {
            console.error('Error uploading PDF file:', error);
        });
}

function goBack() {
    // Implement your navigation logic to go back (e.g., window.history.back())
    window.history.back();
}

function switchStyles() {
    var currentStyleSheet = document.getElementById("styleSheet");
    if (currentStyleSheet.getAttribute("href") === "css/testPretty.css") {
        currentStyleSheet.setAttribute("href", "css/testUpload.css");
    } else {
        currentStyleSheet.setAttribute("href", "css/testPretty.css");
    }
}


function decreaseTextareaSize() {
    // Select all textarea elements
    const textareas = document.querySelectorAll('textarea');

    // Iterate over each textarea element
    textareas.forEach(textarea => {

        const currentHeight = parseFloat(window.getComputedStyle(textarea).height);

        if (textarea.closest('table')) {
            // const newHeight = currentHeight-5;
            // textarea.style.height = newHeight + 'px';
            return;
        }

        const newHeight = currentHeight - 15;

        textarea.style.height = newHeight + 'px';
    });
}



// function checkRowHeight(row) {
//     var cells = row.getElementsByTagName('textarea');
//     var headers = document.getElementById("myTable").getElementsByTagName('th');
//     currentRowOver = false;

//     for (var i = 0; i < cells.length; i++) {
//         var cell = cells[i];
//         var headerWidth = headers[i].offsetWidth;

//         // Estimate the width of the text content
//         var textWidth = getTextWidth(cell.value, cell.style.font);
//         textWidth = textWidth * 2.6;
//         console.log('textWidth ' + textWidth + ' vs headerWIdthh' + headerWidth);
        
//         if (textWidth <= headerWidth) {
//             cell.style.height = '15px'; // Adjust to your desired height
//         }
//         else {
//             currentRowOver = true;
//         }
        
//         if(i == cells.length -1 && currentRowOver == false){

//         }
//     }
// }

// function getTextWidth(text, font) {
//     // Create a temporary canvas element to measure text width
//     var canvas = document.createElement("canvas");
//     var context = canvas.getContext("2d");
//     context.font = font;
//     var metrics = context.measureText(text);
//     return metrics.width;
// }

// function checkAllRowsHeight() {
//     var table = document.getElementById("myTable").getElementsByTagName('tbody')[0];
//     var rows = table.getElementsByTagName('tr');
//     for (var i = 0; i < rows.length; i++) {
//         checkRowHeight(rows[i]);
//     }
// }

