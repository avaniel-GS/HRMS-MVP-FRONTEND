const employee_add_btn = document.getElementById("employee_add");
const add_employee_section = document.getElementById("add_employee_form");
const add_employee_form = document.getElementById("employee_form");
employee_add_btn.addEventListener("click", function() {
    add_employee_section.style.display = "flex";
})

const employee_close_btn = document.getElementById("cancel-btn");
employee_close_btn.addEventListener("click", function(){
    add_employee_section.style.display = "none";
})

add_employee_form.addEventListener("submit", function(event) {
    event.preventDefault();
    const formData = new FormData(add_employee_form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    fetch("http://127.0.0.1:8000/add_employee", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Employee added successfully!");
            add_employee_form.style.display = "none";
            add_employee_form.reset();
            // Optionally, you can refresh the employee list here
        } else {
            alert("Error adding employee: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred while adding the employee.");
    });
});