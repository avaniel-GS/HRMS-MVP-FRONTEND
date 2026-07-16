const employee_add_btn = document.getElementById("employee_add");
const add_employee_section = document.getElementById("add_employee_form");
const add_employee_form = document.getElementById("employee_form");
const hamburger_btn = document.getElementById("hamburger_btn");
const aside = document.querySelector("aside");
const aside_buttons = document.querySelectorAll(".aside-btn");
const employee_cards = document.getElementById("employee_cards");

function escapeHtml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function renderEmployeeCard(employee) {
    if (!employee_cards) return;

    const emptyState = employee_cards.querySelector(".employee-card-empty");
    if (emptyState) {
        emptyState.remove();
    }

    const card = document.createElement("article");
    card.className = "employee-item-card";
    card.innerHTML = `
        <div class="employee-item-header">
            <div class="employee-item-icon">
                <p>${escapeHtml(employee.name[0])}</p>
            </div>
            <span class="employee-item-title">${escapeHtml(employee.name || "Unnamed employee")}</span>
            <span class="employee-item-id">#${escapeHtml(employee.id ?? "")}</span>
        </div>
        <div class="employee-item-detail">
            <span class="employee-item-value">${escapeHtml(employee.role || "-")}</span>
        </div>
        <div class="employee-item-detail">
            <img src="assets/department-icon.svg" alt="Department icon" class="employee-item-label">
            <span class="employee-item-value">${escapeHtml(employee.department || "-")}</span>
        </div>
        <div class="employee-item-detail">
            <img src="assets/email-icon.svg" alt="Email icon" class="employee-item-label">
            <span class="employee-item-value">${escapeHtml(employee.email || "-")}</span>
        </div>
        <div class="employee-item-detail">
            <img src="assets/date_of_joining-icon.svg" alt="Date of joining icon" class="employee-item-label">
            <span class="employee-item-value">${escapeHtml(employee.date_of_joining || "-")}</span>
        </div>
    `;

    employee_cards.prepend(card);
}

employee_add_btn.addEventListener("click", function() {
    add_employee_section.style.display = "flex";
})

const employee_close_btn = document.getElementById("cancel-btn");
employee_close_btn.addEventListener("click", function(){
    add_employee_section.style.display = "none";
})

if (hamburger_btn && aside) {
    hamburger_btn.addEventListener("click", function() {
        aside.classList.toggle("open");
        document.body.classList.toggle("menu-open");
    });

    aside_buttons.forEach(function(button) {
        button.addEventListener("click", function() {
            if (window.innerWidth <= 430) {
                aside.classList.remove("open");
                document.body.classList.remove("menu-open");
            }
        });
    });

    document.addEventListener("click", function(event) {
        if (window.innerWidth <= 430 && aside.classList.contains("open") && !aside.contains(event.target) && !hamburger_btn.contains(event.target)) {
            aside.classList.remove("open");
            document.body.classList.remove("menu-open");
        }
    });

    window.addEventListener("resize", function() {
        if (window.innerWidth > 430) {
            aside.classList.remove("open");
            document.body.classList.remove("menu-open");
        }
    });
}

add_employee_form.addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData(add_employee_form);
    const data = {
        name: formData.get("name")?.toString().trim() || "",
        role: formData.get("role")?.toString().trim() || "",
        department: formData.get("department")?.toString().trim() || "",
        email: formData.get("email")?.toString().trim() || "",
        date_of_joining: formData.get("date_of_joining")?.toString() || ""
    };

    fetch("http://127.0.0.1:8000/api/add_employee", {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(async response => {
        const text = await response.text();
        let responseData = {};

        try {
            responseData = text ? JSON.parse(text) : {};
        } catch (error) {
            responseData = { raw: text };
        }

        if (!response.ok) {
            throw new Error(response.status + ": " + JSON.stringify(responseData));
        }

        return { responseData, ok: response.ok };
    })
    .then(({ responseData, ok }) => {
        const message = responseData.message || responseData.detail || responseData.error || "";
        const isSuccess = ok || responseData.success === true || /success/i.test(message);

        if (isSuccess) {
            const employee = responseData.employee || responseData;

            alert("Employee added successfully!");
            add_employee_section.style.display = "none";
            add_employee_form.reset();

            if (employee && typeof employee === "object") {
                renderEmployeeCard(employee);
            }
        } else {
            alert("Error adding employee: " + (message || JSON.stringify(responseData)));
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred while adding the employee.");
    });
});