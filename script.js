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

            return loadEmployees();
        })
        .catch(error => {
            console.error("Error:", error);
            alert("An error occurred while adding the employee.");
        });
    });
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

            const extractCount = (value) => {
                if (value == null) return "";
                if (typeof value === "number" || typeof value === "string") return value;
                if (Array.isArray(value)) {
                    const flat = value.flat(Infinity).find(item => typeof item === "number" || typeof item === "string");
                    return flat ?? "";
                }
                if (typeof value === "object") {
                    const candidate = value.head_count ?? value.count ?? value.total ?? value.value ?? value.Count;
                    return extractCount(candidate);
                }
                return "";
            };

            const rawCount = extractCount(responseData);
            const numericCount = Number(rawCount);

            const setHeadcountText = (value) => {
                if ("value" in totalHeadcountElement) {
                    totalHeadcountElement.value = value;
                } else {
                    totalHeadcountElement.innerText = value;
                }
            };

            const animateHeadcount = (start, end) => {
                const stepCount = Math.max(1, end - start);
                const duration = 1200;
                const interval = Math.max(40, Math.floor(duration / stepCount));
                let current = start;

                setHeadcountText(current);
                const timer = setInterval(() => {
                    current += 1;
                    setHeadcountText(current);
                    if (current >= end) {
                        clearInterval(timer);
                    }
                }, interval);
            };

            if (Number.isFinite(numericCount) && numericCount >= 0) {
                const count = Math.floor(numericCount);
                const delta = Math.min(Math.max(1, Math.ceil(count * 0.2)), 20);
                const start = Math.max(0, count - delta);
                animateHeadcount(start, count);
            } else {
                setHeadcountText(String(rawCount));
            }
        })
}

loadEmployees();
get_employee_headcount();