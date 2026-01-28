let generatedOTP;

async function generateOTP() {
    const email = document.getElementById('email').value;
    const resultDisplay = document.getElementById('result');
    const otpDisplay = document.getElementById('otpDisplay');

    if (!email) {
        resultDisplay.innerText = "Please enter an email.";
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();

        if (data.exists) {
            generatedOTP = Math.floor(1000 + Math.random() * 9000);
            otpDisplay.innerText = "Your OTP is: " + generatedOTP;
            resultDisplay.innerText = "Email verified. OTP generated!";
            resultDisplay.style.color = "green";
        } else {
            resultDisplay.innerText = "Error: Email ID not found in database.";
            resultDisplay.style.color = "red";
            otpDisplay.innerText = "";
        }
    } catch (error) {
        resultDisplay.innerText = "Server error. Is Node running?";
    }
}

function verifyOTP() {
    const userInput = document.getElementById('otpInput').value;
    const resultDisplay = document.getElementById('result');

    if (userInput == generatedOTP && generatedOTP != null) {
        resultDisplay.innerText = "Login Successful!";
        resultDisplay.style.color = "green";
    } else {
        resultDisplay.innerText = "Invalid OTP.";
        resultDisplay.style.color = "red";
    }
}