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
            window.location.href = "http://localhost:8000/test.html";
            break;
        default:
            break;
    }
}