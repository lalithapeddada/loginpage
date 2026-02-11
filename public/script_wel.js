/*SESSION CHECK*/
const userEmail = localStorage.getItem("userEmail");
/*let = logoutTimer;*/

if (!userEmail) {
    window.location.replace("index.html");
}

/*GLOBALS*/
const toast = document.getElementById("toast");
const loginBtnContainer = document.getElementById("actionButtons");
const logoutBtn = document.getElementById("logoutBtn");

/*FETCH EMPLOYEE PROFILE*/
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
    })
    .catch(() => {
        showToast("Server not reachable", "error");
    });

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

/*MARK LOGOUT*/
/* SYSTEM EXIT (Top Bar Button) */
function systemExit() {
    // Simply clear session and go home
    localStorage.clear();
    window.location.replace("index.html");
}

/* MARK LOGOUT ATTENDANCE (Action Area Button) */
function markLogout() {
    fetch("http://localhost:3000/mark-logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Success: Show Green Toast
            showToast("Logout attendance recorded", "success");
            
            // Optional: Disable the button so they don't click it again
            document.getElementById("logoutBtn").disabled = true;
            document.getElementById("logoutBtn").style.opacity = "0.5";
        } else {
            // Failure (Already logged out): Show Red Toast
            showToast(data.message, "error");
        }
    })
    .catch(() => {
        showToast("Server error. Try again.", "error");
    });
}
/*INLINE DATE (TOP BAR)*/
const today = new Date();
document.getElementById("inlineDate").innerText = today.toDateString();

/*CALENDAR TOGGLE*/
function toggleCalendar() {
    const cal = document.getElementById("calendarBox");
    cal.style.display = cal.style.display === "block" ? "none" : "block";
}

// Close calendar when clicking outside
window.addEventListener("click", (e) => {
    const cal = document.getElementById("calendarBox");
    const icon = document.querySelector(".calendar-icon");
    if (!cal.contains(e.target) && !icon.contains(e.target)) {
        cal.style.display = "none";
    }
});

/*CALENDAR LOGIC*/
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
const IDLE_TIME = 2 * 60 * 1000; // 2 minutes

function resetTimer() {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
        showToast("Session expired due to inactivity", "error");

        // mark logout in backend
        markLogout();
    }, IDLE_TIME);
}

// Start timer on page load
window.addEventListener("load", resetTimer);

// Reset timer on user activity
["mousemove", "click", "keypress", "scroll", "touchstart"].forEach(event => {
    document.addEventListener(event, resetTimer);
});



/*toast*/
function showToast(message, type = "success") {
    toast.innerText = message;
    toast.style.backgroundColor = type === "success" ? "#00c853" : "#ff5252";
    toast.className = "show";

    setTimeout(() => {
        toast.className = "";
    }, 3000);
}

