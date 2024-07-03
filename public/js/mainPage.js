function handleMainPageOption(option) {
    // Perform actions based on the selected option
    switch (option) {
        case 'option1':
            window.location.href = "http://localhost:8000/uploadFile.html";
            break;
        case 'option2':
            window.location.href = "http://localhost:8000/waybills.html";
            break;
        case 'option3':
            window.location.href = "http://localhost:8000/userList.html";
            break;
        default:
            break;
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

// Function to check if the user is an admin
async function isAdmin() {
    try {
        const requestData = {
            name: getCookie('name'),
            surname: getCookie('surname'),
        };

        const response = await fetch('http://192.168.8.139:8000/isAdmin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });
        const data = await response.json();
        return data.isAdmin; 
    } catch (error) {
        console.error('error:', error);
        return false; 
    }
}

// Function to fetch admin data asynchronously
async function getAdminData() {
    try {
        const isUserAdmin = await isAdmin(); // Use a different variable name to avoid conflict
        return isUserAdmin;
    } catch (error) {
        console.error('Error fetching data:', error);
        return false; // Return false in case of error
    }
}

window.onload = async function () {
    const isUserAdmin = await getAdminData(); // Use a different variable name to avoid conflict
    if (isUserAdmin) {
        document.getElementById('user-access-button').style.display = 'inline-block';
    }
}