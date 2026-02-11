/*SESSION CHECK*/
const userEmail = localStorage.getItem("userEmail");

if (!userEmail) {
    window.location.replace("index.html");
}

/*GLOBALS*/
const toast = document.getElementById("toast");
const loginBtnContainer = document.getElementById("actionButtons");
const logoutBtn = document.getElementById("logoutBtn");

/*FETCH MANAGER PROFILE AND LOAD TABS*/
fetch(`http://localhost:3000/get-profile?email=${encodeURIComponent(userEmail)}`)
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            showToast("Session expired. Please login again.", "error");
            localStorage.clear();
            setTimeout(() => window.location.replace("index.html"), 1500);
            return;
        }

        const user = data.user;

        // Top welcome text
        document.getElementById("welcomeText").innerText = `Welcome, ${user.empname}`;

        // Profile data
        document.getElementById("disp_name").innerText = user.empname;
        document.getElementById("disp_id").innerText = user.empid;
        document.getElementById("disp_mail").innerText = user.empmail;
        document.getElementById("disp_dept").innerText = user.dept;
        document.getElementById("disp_subdept").innerText = user.subdept;
        document.getElementById("disp_pos").innerText = user.position;
        document.getElementById("disp_loc").innerText = user.location;
        document.getElementById("disp_mgr").innerText = user.managerid;

        // Show buttons
        loginBtnContainer.style.display = "block";
        logoutBtn.style.display = "inline-block";

        // Load data for all tabs
        loadActiveEmployees();
        loadInactiveEmployees();
        loadPendingApprovals();
    })
    .catch(() => {
        showToast("Server not reachable", "error");
    });

/* TAB SWITCHING FUNCTION */
function openTab(tabName, element) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.style.display = 'none';
    });

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Show the selected tab content
    document.getElementById(tabName).style.display = 'block';
    
    // Add active class to clicked button
    element.classList.add('active');
}

/* LOAD ACTIVE EMPLOYEES (activeflag = 1) */
function loadActiveEmployees() {
    fetch('http://localhost:3000/get-employees-by-status?status=1')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const tbody = document.getElementById('activeTable');
                tbody.innerHTML = '';
                
                data.employees.forEach(employee => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${employee.empid}</td>
                        <td>${employee.empname}</td>
                        <td>${employee.empmail}</td>
                        <td>${employee.dept}</td>
                        <td>${employee.position}</td>
                        <td>
                            <button class="btn-remove" onclick="deactivateEmployee(${employee.empid})">
                                Deactivate
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                document.getElementById('activeTable').innerHTML = 
                    '<tr><td colspan="6" style="text-align:center;">No active employees found</td></tr>';
            }
        })
        .catch(() => {
            document.getElementById('activeTable').innerHTML = 
                '<tr><td colspan="6" style="text-align:center;color:#ff5252">Error loading data</td></tr>';
        });
}

/* LOAD INACTIVE EMPLOYEES (activeflag = 0) */
function loadInactiveEmployees() {
    fetch('http://localhost:3000/get-employees-by-status?status=0')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const tbody = document.getElementById('inactiveTable');
                tbody.innerHTML = '';
                
                data.employees.forEach(employee => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${employee.empid}</td>
                        <td>${employee.empname}</td>
                        <td>${employee.empmail}</td>
                        <td>${employee.dept}</td>
                        <td>${employee.position}</td>
                        <td>
                            <button class="btn-add" onclick="activateEmployee(${employee.empid})">
                                Activate
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                document.getElementById('inactiveTable').innerHTML = 
                    '<tr><td colspan="6" style="text-align:center;">No inactive employees found</td></tr>';
            }
        })
        .catch(() => {
            document.getElementById('inactiveTable').innerHTML = 
                '<tr><td colspan="6" style="text-align:center;color:#ff5252">Error loading data</td></tr>';
        });
}

/* LOAD PENDING APPROVALS (activeflag = 2) */
function loadPendingApprovals() {
    fetch('http://localhost:3000/get-employees-by-status?status=2')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const tbody = document.getElementById('approvalTable');
                tbody.innerHTML = '';
                
                data.employees.forEach(employee => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${employee.empid}</td>
                        <td>${employee.empname}</td>
                        <td>${employee.empmail}</td>
                        <td>${employee.dept}</td>
                        <td>${employee.position}</td>
                        <td>${employee.created_at ? new Date(employee.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td>
                            <button class="btn-approve" onclick="approveEmployee(${employee.empid})">
                                Approve
                            </button>
                            <button class="btn-remove" onclick="rejectEmployee(${employee.empid})">
                                Reject
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                document.getElementById('approvalTable').innerHTML = 
                    '<tr><td colspan="7" style="text-align:center;">No pending approvals</td></tr>';
            }
        })
        .catch(() => {
            document.getElementById('approvalTable').innerHTML = 
                '<tr><td colspan="7" style="text-align:center;color:#ff5252">Error loading data</td></tr>';
        });
}

/* TABLE FILTERING */
function filterTable(tableId, searchText) {
    const table = document.getElementById(tableId);
    const rows = table.getElementsByTagName('tr');
    const searchLower = searchText.toLowerCase();
    
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let found = false;
        
        for (let j = 0; j < cells.length; j++) {
            if (cells[j].textContent.toLowerCase().includes(searchLower)) {
                found = true;
                break;
            }
        }
        
        rows[i].style.display = found ? '' : 'none';
    }
}

/* EMPLOYEE ACTIONS */
function deactivateEmployee(empid) {
    if (confirm('Are you sure you want to deactivate this employee?')) {
        fetch('http://localhost:3000/update-employee-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ empid: empid, activeflag: 0 })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast('Employee deactivated successfully', 'success');
                loadActiveEmployees();
                loadInactiveEmployees();
            } else {
                showToast(data.message || 'Failed to deactivate', 'error');
            }
        })
        .catch(() => {
            showToast('Server error', 'error');
        });
    }
}

function activateEmployee(empid) {
    if (confirm('Are you sure you want to activate this employee?')) {
        fetch('http://localhost:3000/update-employee-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ empid: empid, activeflag: 1 })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast('Employee activated successfully', 'success');
                loadActiveEmployees();
                loadInactiveEmployees();
            } else {
                showToast(data.message || 'Failed to activate', 'error');
            }
        })
        .catch(() => {
            showToast('Server error', 'error');
        });
    }
}

function approveEmployee(empid) {
    if (confirm('Approve this employee?')) {
        fetch('http://localhost:3000/update-employee-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ empid: empid, activeflag: 1 })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast('Employee approved successfully', 'success');
                loadPendingApprovals();
                loadActiveEmployees();
            } else {
                showToast(data.message || 'Failed to approve', 'error');
            }
        })
        .catch(() => {
            showToast('Server error', 'error');
        });
    }
}

function rejectEmployee(empid) {
    if (confirm('Reject this employee? This will deactivate their account.')) {
        fetch('http://localhost:3000/update-employee-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ empid: empid, activeflag: 0 })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast('Employee rejected successfully', 'success');
                loadPendingApprovals();
                loadInactiveEmployees();
            } else {
                showToast(data.message || 'Failed to reject', 'error');
            }
        })
        .catch(() => {
            showToast('Server error', 'error');
        });
    }
}

/*MARK LOGIN*/
function markLogin() {
    fetch("http://localhost:3000/mark-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast("Login attendance recorded", "success");
        } else {
            showToast("Already logged in today", "error");
        }
    })
    .catch(() => {
        showToast("Login failed. Try again.", "error");
    });
}

/* MARK LOGOUT ATTENDANCE */
function markLogout() {
    fetch("http://localhost:3000/mark-logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast("Logout attendance recorded", "success");
            document.getElementById("logoutBtn").disabled = true;
            document.getElementById("logoutBtn").style.opacity = "0.5";
        } else {
            showToast(data.message, "error");
        }
    })
    .catch(() => {
        showToast("Server error. Try again.", "error");
    });
}

/* SYSTEM EXIT */
function systemExit() {
    localStorage.clear();
    window.location.replace("index.html");
}

/* CALENDAR FUNCTIONS (Keep existing code) */
const today = new Date();
document.getElementById("inlineDate").innerText = today.toDateString();

function toggleCalendar() {
    const cal = document.getElementById("calendarBox");
    cal.style.display = cal.style.display === "block" ? "none" : "block";
}

window.addEventListener("click", (e) => {
    const cal = document.getElementById("calendarBox");
    const icon = document.querySelector(".calendar-icon");
    if (!cal.contains(e.target) && !icon.contains(e.target)) {
        cal.style.display = "none";
    }
});

let currentViewDate = new Date();
const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
];

function renderCalendar() {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    const today = new Date();

    document.getElementById("monthYear").innerText =
        `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const calendarDays = document.getElementById("calendarDays");

    calendarDays.innerHTML = "";

    for (let i = 0; i < firstDay; i++) {
        calendarDays.appendChild(document.createElement("div"));
    }

    for (let d = 1; d <= lastDate; d++) {
        const div = document.createElement("div");
        div.innerText = d;

        const currentDate = new Date(year, month, d);
        const day = currentDate.getDay();

        if (day === 0 || day === 6) div.classList.add("weekend");

        if (
            d === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {
            div.classList.add("today");
        }

        div.addEventListener("click", () => {
            document
                .querySelectorAll(".days div")
                .forEach(el => el.classList.remove("selected"));
            div.classList.add("selected");
        });

        calendarDays.appendChild(div);
    }
}

function changeMonth(offset) {
    currentViewDate.setMonth(currentViewDate.getMonth() + offset);
    renderCalendar();
}

renderCalendar();

/* AUTO LOGOUT ON INACTIVITY */
let logoutTimer;
const IDLE_TIME = 2 * 60 * 1000;

function resetTimer() {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
        showToast("Session expired due to inactivity", "error");
        markLogout();
    }, IDLE_TIME);
}

window.addEventListener("load", resetTimer);

["mousemove", "click", "keypress", "scroll", "touchstart"].forEach(event => {
    document.addEventListener(event, resetTimer);
});

/* TOAST FUNCTION */
function showToast(message, type = "success") {
    toast.innerText = message;
    toast.style.backgroundColor = type === "success" ? "#00c853" : "#ff5252";
    toast.className = "show";

    setTimeout(() => {
        toast.className = "";
    }, 3000);
}