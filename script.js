const employee_add_btn = document.getElementById("employee_add");
const add_employee_section = document.getElementById("add_employee_form");
const add_employee_form = document.getElementById("employee_form");
const hamburger_btn = document.getElementById("hamburger_btn");
const aside = document.querySelector("aside");
const aside_buttons = document.querySelectorAll(".aside-btn");
const employee_cards = document.getElementById("employee_cards");
const employee_close_btn = document.getElementById("cancel-btn");

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

    const displayName = String(employee?.name || "").trim() || "Unnamed employee";
    const firstLetter = displayName.charAt(0).toUpperCase() || "U";

    const card = document.createElement("article");
    card.className = "employee-item-card";
    card.innerHTML = `
        <div class="employee-item-header">
            <div class="employee-item-icon">
                <p>${escapeHtml(firstLetter)}</p>
            </div>
            <div class="employee-item-title">
                <span class="employee-item-name">${escapeHtml(displayName)}</span>
                <span class="employee-item-role">${escapeHtml(employee?.role || "-")}</span>
            </div>
            <span class="employee-item-id">#${escapeHtml(employee?.id ?? "")}</span>
        </div>
        <div class="employee-item-detail">
            <img src="assets/department-icon.svg" alt="Department icon" class="employee-item-label">
            <span class="employee-item-value">${escapeHtml(employee?.department || "-")}</span>
        </div>
        <div class="employee-item-detail">
            <img src="assets/email-icon.svg" alt="Email icon" class="employee-item-label">
            <span class="employee-item-value">${escapeHtml(employee?.email || "-")}</span>
        </div>
        <div class="employee-item-detail">
            <img src="assets/date_of_joining-icon.svg" alt="Date of joining icon" class="employee-item-label">
            <span class="employee-item-value">${escapeHtml(employee?.date_of_joining || "-")}</span>
        </div>
    `;

    employee_cards.prepend(card);

    while (employee_cards.children.length > 4) {
        employee_cards.removeChild(employee_cards.lastElementChild);
    }
}

function renderEmployeeCards(employees) {
    if (!employee_cards) return;

    employee_cards.innerHTML = "";

    const normalizedEmployees = Array.isArray(employees) ? employees.filter(Boolean) : [];
    if (!normalizedEmployees.length) {
        employee_cards.innerHTML = '<div class="employee-card-empty"></div>';
        return;
    }

    normalizedEmployees.slice(-4).forEach((employee) => {
        renderEmployeeCard(employee);
    });
}

function parseJsonResponse(text) {
    if (!text) return {};

    try {
        return JSON.parse(text);
    } catch (error) {
        return { raw: text };
    }
}

function loadEmployees() {
    return fetch("http://127.0.0.1:8000/api/get_employees", {
        method: "GET",
        mode: "cors",
        headers: {
            "Accept": "application/json"
        }
    })
    .then(async response => {
        const text = await response.text();
        const responseData = parseJsonResponse(text);

        if (!response.ok) {
            throw new Error(response.status + ": " + JSON.stringify(responseData));
        }

        return responseData;
    })
    .then((responseData) => {
        renderEmployeeCards(Array.isArray(responseData) ? responseData : []);
    })
    .catch((error) => {
        console.error("Error loading employees:", error);
    });
}

if (employee_add_btn) {
    employee_add_btn.addEventListener("click", function() {
        add_employee_section.style.display = "flex";
    });
}

if (employee_close_btn) {
    employee_close_btn.addEventListener("click", function() {
        add_employee_section.style.display = "none";
    });
}

if (hamburger_btn && aside) {
    hamburger_btn.addEventListener("click", function() {
        aside.classList.toggle("open");
        document.body.classList.toggle("menu-open");
    });

    aside_buttons.forEach(function(button) {
        button.addEventListener("click", function() {
            if (window.innerWidth <= 768) {
                aside.classList.remove("open");
                document.body.classList.remove("menu-open");
            }
        });
    });

    document.addEventListener("click", function(event) {
        if (window.innerWidth <= 768 && aside.classList.contains("open") && !aside.contains(event.target) && !hamburger_btn.contains(event.target)) {
            aside.classList.remove("open");
            document.body.classList.remove("menu-open");
        }
    });

    window.addEventListener("resize", function() {
        if (window.innerWidth > 768) {
            aside.classList.remove("open");
            document.body.classList.remove("menu-open");
        }
    });
}

if (add_employee_form) {
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
            const responseData = parseJsonResponse(text);

            if (!response.ok) {
                throw new Error(response.status + ": " + JSON.stringify(responseData));
            }

            return responseData;
        })
        .then((responseData) => {
            const message = responseData.message || responseData.detail || responseData.error || "";
            const isSuccess = responseData.success === true || /success/i.test(message);

            if (!isSuccess) {
                alert("Error adding employee: " + (message || JSON.stringify(responseData)));
                return;
            }

            alert("Employee added successfully!");
            add_employee_section.style.display = "none";
            add_employee_form.reset();
            get_employee_headcount();
            get_department_count();
            return loadEmployees();
        })
        .catch(error => {
            console.error("Error:", error);
            alert("An error occurred while adding the employee.");
        });
    });
}

function extractCountValue(value) {
    if (value == null || value === "") return "";
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
            return Number(trimmed);
        }
        return trimmed === "" ? "" : trimmed;
    }
    if (Array.isArray(value)) {
        for (const item of value) {
            const extracted = extractCountValue(item);
            if (extracted !== "" && extracted != null) return extracted;
        }
        return "";
    }
    if (typeof value === "object") {
        const candidateKeys = ["department_count", "departmentCount", "Count", "count", "head_count", "headCount", "total", "value"];
        for (const key of candidateKeys) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                const extracted = extractCountValue(value[key]);
                if (extracted !== "" && extracted != null) return extracted;
            }
        }
        return "";
    }
    return "";
}

function get_employee_headcount() {
    return fetch("http://127.0.0.1:8000/api/get_head_count",{
            method: "GET",
            mode: "cors",
            headers: {
                "Accept": "application/json"   
            }
        
        })
    .then(async response => {
            const head_count = await response.text();
            const responseData = parseJsonResponse(head_count);

            if (!response.ok) {
                throw new Error(response.status + ": " + JSON.stringify(responseData));
            }
            return responseData;
        })
        .then((responseData) => {
            const totalHeadcountElement = document.getElementById("total-headcount");
            if (!totalHeadcountElement) return;

            const rawCount = extractCountValue(responseData);
            const numericCount = Number(rawCount);

            const setHeadcountText = (value) => {
                totalHeadcountElement.textContent = value;
            };

            if (Number.isFinite(numericCount) && numericCount >= 0) {
                setHeadcountText(Math.floor(numericCount));
            } else {
                setHeadcountText(String(rawCount));
            }
        })
}

function get_department_count() {
    return fetch("http://127.0.0.1:8000/api/get_department_count", {
        method: "GET",
        mode: "cors",
        headers: {
            "Accept": "application/json"
        }
    })
    .then(async response => {
        const departmentCountText = await response.text();
        const responseData = parseJsonResponse(departmentCountText);

        if (!response.ok) {
            throw new Error(response.status + ": " + JSON.stringify(responseData));
        }

        return responseData;
    })
    .then((responseData) => {
        const departmentCountElement = document.getElementById("dept-count");
        if (!departmentCountElement) return;

        const rawCount = extractCountValue(responseData);
        const numericCount = Number(rawCount);

        const setDepartmentCountText = (value) => {
            departmentCountElement.textContent = value;
        };

        if (Number.isFinite(numericCount) && numericCount >= 0) {
            setDepartmentCountText(Math.floor(numericCount));
        } else {
            setDepartmentCountText(String(rawCount));
        }
    })
    .catch((error) => {
        console.error("Error loading department count:", error);
    });
}

loadEmployees();
get_employee_headcount();
get_department_count();