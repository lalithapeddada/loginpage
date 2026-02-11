let userEmail = "";

document.addEventListener("DOMContentLoaded", () => {

    const signinSection = document.getElementById("signinSection");
    const signupSection = document.getElementById("signupSection");
    const otpSection = document.getElementById("otpSection");

    const signinText = document.getElementById("signinText");
    const signupText = document.getElementById("signupText");

    // Switch to Sign Up
    signupText.addEventListener("click", () => {
        signinSection.classList.add("hidden");
        otpSection.classList.add("hidden");
        signupSection.classList.remove("hidden");

        signupText.classList.add("active");
        signinText.classList.remove("active");
    });

    // Switch to Sign In
    signinText.addEventListener("click", () => {
        signupSection.classList.add("hidden");
        otpSection.classList.add("hidden");
        signinSection.classList.remove("hidden");

        signinText.classList.add("active");
        signupText.classList.remove("active");
    });

    document.getElementById("continueBtn").addEventListener("click", checkEmail);
    document.getElementById("verifyBtn").addEventListener("click", verifyAndLogin);

    document.getElementById("backToEmailBtn").addEventListener("click", () => {
        otpSection.classList.add("hidden");
        signinSection.classList.remove("hidden");
    });

    document.getElementById("backToSigninBtn").addEventListener("click", () => {
        signupSection.classList.add("hidden");
        signinSection.classList.remove("hidden");
    });

    document.getElementById("signupSubmitBtn").addEventListener("click", registerEmployee);
});


// REGISTER
async function registerEmployee() {
    const empname = document.getElementById("signupName").value.trim();
    const empid = document.getElementById("signupId").value.trim();
    const empmail = document.getElementById("signupEmail").value.trim();
    const location = document.getElementById("signupLocation").value.trim();
    const dept = document.getElementById("signupDept").value.trim();
    const subdept = document.getElementById("signupSubdept").value.trim();
    const activeflag = document.getElementById("signupActiveflag").value.trim();
    const managerid = document.getElementById("signupManagerid").value.trim();
    const position = document.getElementById("signupPosition").value.trim();

    try {
        const response = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                empname,
                empid,
                empmail,
                location,
                dept,
                subdept,
                activeflag,
                managerid,
                position
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast("Registration successful!", "success");
            
            // Clear form fields
            document.getElementById("signupName").value = "";
            document.getElementById("signupId").value = "";
            document.getElementById("signupEmail").value = "";
            document.getElementById("signupLocation").value = "";
            document.getElementById("signupDept").value = "";
            document.getElementById("signupSubdept").value = "";
            document.getElementById("signupActiveflag").value = "";
            document.getElementById("signupManagerid").value = "";
            document.getElementById("signupPosition").value = "";

            // Switch to Sign In after 1 second
            setTimeout(() => {
                document.getElementById("signupSection").classList.add("hidden");
                document.getElementById("signinSection").classList.remove("hidden");

                document.getElementById("signinText").classList.add("active");
                document.getElementById("signupText").classList.remove("active");
            }, 1000);
        } else {
            showToast(data.message, "error");
        }

    } catch (err) {
        console.error(err);
        showToast("Server error", "error");
    }
}

// SEND OTP
async function checkEmail() {

    const email = document.getElementById("email").value.trim();
    const errorBox = document.getElementById("emailError");

    if (!email) {
        errorBox.innerText = "Please enter email";
        errorBox.style.display = "block";
        return;
    }

    errorBox.style.display = "none";

    try {
        const response = await fetch("http://localhost:3000/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!data.success) {
            showToast(data.message, "error");
            return;
        }

        userEmail = email;
        document.getElementById("displayEmail").innerText = `Code sent to: ${email}`;

        document.getElementById("signinSection").classList.add("hidden");
        document.getElementById("otpSection").classList.remove("hidden");

        showToast("OTP sent!", "success");

    } catch (err) {
        showToast("Server error", "error");
    }
}


// VERIFY OTP
async function verifyAndLogin() {

    const otp = document.getElementById("otpInput").value.trim();

    if (!otp) {
        showToast("Enter OTP", "error");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: userEmail,
                otp: otp
            })
        });

        const data = await response.json();

        if (!data.success) {
            showToast(data.message, "error");
            return;
        }

        localStorage.setItem("userEmail", userEmail);
        localStorage.setItem("userRole", data.role);

        showToast("Login successful!", "success");

        setTimeout(() => {
            if (data.role === "manager") {
                window.location.href = "manager.html";
            } else {
                window.location.href = "welcome.html";
            }
        }, 1000);

    } catch (err) {
        showToast("Server error", "error");
    }
}

document.getElementById("signupSubmitBtn")
    .addEventListener("click", registerEmployee);


// TOAST
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.style.backgroundColor = type === "success" ? "#2ecc71" : "#e74c3c";
    toast.className = "show";

    setTimeout(() => {
        toast.className = "";
    }, 3000);
}
