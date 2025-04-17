const baseUrl = "https://phlowise-amggdaagb5ancjfu.eastus-01.azurewebsites.net";

// LocalStorage keys
const STORAGE_KEYS = {
  OTP_TOKEN: "otpToken",
  LOGIN_TOKEN: "loginToken",
  OTP_PURPOSE: "otpPurpose",
  REGISTERED_COMPANY: "registeredCompany",
  LOGGED_IN_COMPANY: "loggedInCompany",
  AUTH_TOKEN: "authToken",
};

// Initialize event listeners for forms that exist on the current page
document.addEventListener("DOMContentLoaded", () => {
  // Registration
  if (document.getElementById("registerForm")) {
    document
      .getElementById("registerForm")
      .addEventListener("submit", handleRegister);
  }

  // Login
  if (document.getElementById("loginForm")) {
    document
      .getElementById("loginForm")
      .addEventListener("submit", handleLogin);
  }

  // Forgot Password
  if (document.getElementById("forgotForm")) {
    document
      .getElementById("forgotForm")
      .addEventListener("submit", handleForgotPassword);
  }

  // OTP Validation
  if (document.getElementById("otpForm")) {
    document
      .getElementById("otpForm")
      .addEventListener("submit", handleOtpValidation);
    checkOtpPageAccess(); // Verify user should be on this page
  }

  // Change Password
  if (document.getElementById("changeForm")) {
    document
      .getElementById("changeForm")
      .addEventListener("submit", handleChangePassword);
    checkAuthAccess(); // Verify user is authenticated
  }

  // Reset Password
  if (document.getElementById("resetForm")) {
    document
      .getElementById("resetForm")
      .addEventListener("submit", handleResetPassword);
    checkResetPasswordAccess(); // Verify user should be on this page
  }
});

// ========================
// 1. REGISTER COMPANY
// ========================
async function handleRegister(e) {
  e.preventDefault();
  showLoading("registerForm");

  const companyData = {
    companyName: document.getElementById("companyName").value,
    companyEmail: document.getElementById("companyEmail").value,
    companyPhoneNumber: document.getElementById("companyPhoneNumber").value,
    companyRegistered: true,
    password: document.getElementById("password").value,
  };

  try {
    const response = await fetch(`${baseUrl}/company/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(companyData),
    });

    const result = await response.json();
    console.log("Register Response:", result);

    if (response.ok) {
      showMessage("registerMessage", result.message, "success");
      localStorage.setItem(STORAGE_KEYS.OTP_TOKEN, result.token);
      // Redirect to OTP page after short delay
      setTimeout(() => (window.location.href = "otp-verification.html"), 1500);
    } else {
      showMessage(
        "registerMessage",
        result.message || "Registration failed.",
        "error"
      );
    }
  } catch (error) {
    showMessage("registerMessage", `Error: ${error.message}`, "error");
  } finally {
    hideLoading("registerForm");
  }
}

// ========================
// 2. LOGIN - Send OTP
// ========================
async function handleLogin(e) {
  e.preventDefault();
  showLoading("loginForm");

  const loginData = {
    email: document.getElementById("loginEmail").value,
    password: document.getElementById("loginPassword").value,
  };

  try {
    const response = await fetch(`${baseUrl}/company/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData),
    });

    const result = await response.json();
    console.log("Login Response:", result);

    if (response.ok) {
      showMessage("loginMessage", result.message, "success");
      localStorage.setItem(STORAGE_KEYS.otp-verification.html_PURPOSE, "login");
      localStorage.setItem(STORAGE_KEYS.LOGIN_TOKEN, result.token);
      // Redirect to OTP page after short delay
      setTimeout(() => (window.location.href = "otp-verification.html"), 1500);
    } else {
      showMessage("loginMessage", result.message || "Login failed.", "error");
    }
  } catch (error) {
    showMessage("loginMessage", `Error: ${error.message}`, "error");
  } finally {
    hideLoading("loginForm");
  }
}

// ========================
// 3. FORGOT PASSWORD - Send OTP
// ========================
async function handleForgotPassword(e) {
  e.preventDefault();
  showLoading("forgotForm");

  const email = document.getElementById("forgotEmail").value;

  try {
    const response = await fetch(`${baseUrl}/company/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    console.log("Forgot Password Response:", result);

    if (response.ok) {
      showMessage("forgotMessage", result.message, "success");
      localStorage.setItem(STORAGE_KEYS.OTP_PURPOSE, "forgot");
      localStorage.setItem(STORAGE_KEYS.LOGIN_TOKEN, result.token);
      // Redirect to OTP page after short delay
      setTimeout(() => (window.location.href = "otp-verification.html"), 1500);
    } else {
      showMessage(
        "forgotMessage",
        result.message || "Failed to send OTP.",
        "error"
      );
    }
  } catch (error) {
    showMessage("forgotMessage", `Error: ${error.message}`, "error");
  } finally {
    hideLoading("forgotForm");
  }
}

// ========================
// 4. OTP VALIDATION (Updated for your design)
// ========================
async function handleOtpValidation(e) {
  e.preventDefault();
  const errorElement = document.getElementById("errorMessage");
  const verifyButton = document.getElementById("verifyButton");

  // Combine all OTP digits
  const otp = Array.from(
    { length: 6 },
    (_, i) => document.getElementById(`otp${i + 1}`).value
  ).join("");

  // Validate OTP length
  if (otp.length !== 6) {
    errorElement.textContent = "Please enter a complete 6-digit code";
    errorElement.classList.remove("hidden");
    return;
  }

  // Show loading state
  verifyButton.disabled = true;
  verifyButton.innerHTML = '<span class="spinner"></span> Verifying...';

  const registerToken = localStorage.getItem(STORAGE_KEYS.OTP_TOKEN);

  // Check if OTP is for registration
  if (registerToken) {
    try {
      const response = await fetch(`${baseUrl}/company/register-validate-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regsiter_token: registerToken, otp }),
      });

      const result = await response.json();
      console.log("OTP Validation (Registration) Response:", result);

      if (response.ok) {
        errorElement.classList.add("hidden");
        localStorage.setItem(
          STORAGE_KEYS.REGISTERED_COMPANY,
          JSON.stringify(result)
        );
        localStorage.removeItem(STORAGE_KEYS.OTP_TOKEN);
        // Show success and redirect
        showToast("Company registered successfully!", "success");
        setTimeout(() => (window.location.href = "user-signin.html"), 2000);
      } else {
        errorElement.textContent = result.message || "OTP validation failed.";
        errorElement.classList.remove("hidden");
      }
    } catch (error) {
      errorElement.textContent = `Error: ${error.message}`;
      errorElement.classList.remove("hidden");
    } finally {
      verifyButton.disabled = false;
      verifyButton.textContent = "Verify Code";
    }
    return;
  }

  // Check if OTP is for login/forgot password
  const token = localStorage.getItem(STORAGE_KEYS.LOGIN_TOKEN);
  const purpose = localStorage.getItem(STORAGE_KEYS.OTP_PURPOSE);

  if (token) {
    try {
      const response = await fetch(`${baseUrl}/company/validate-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, otp }),
      });

      const result = await response.json();
      console.log("OTP Validation (Login/Forgot) Response:", result);

      if (response.ok) {
        errorElement.classList.add("hidden");
        localStorage.setItem(
          STORAGE_KEYS.LOGGED_IN_COMPANY,
          JSON.stringify(result)
        );
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, result.token);
        localStorage.removeItem(STORAGE_KEYS.LOGIN_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.OTP_PURPOSE);

        // Show success and redirect based on purpose
        const message =
          purpose === "forgot"
            ? "OTP verified! Redirecting to password reset..."
            : "Login successful!";
        showToast(message, "success");

        setTimeout(() => {
          window.location.href =
            purpose === "forgot"
              ? "setnew_password.html"
              : "change_password.html";
        }, 1500);
      } else {
        errorElement.textContent = result.message || "OTP validation failed.";
        errorElement.classList.remove("hidden");
      }
    } catch (error) {
      errorElement.textContent = `Error: ${error.message}`;
      errorElement.classList.remove("hidden");
    } finally {
      verifyButton.disabled = false;
      verifyButton.textContent = "Verify Code";
    }
    return;
  }

  // If no token is found
  errorElement.textContent = "No OTP request found. Please start over.";
  errorElement.classList.remove("hidden");
  verifyButton.disabled = false;
  verifyButton.textContent = "Verify Code";
}

// Add OTP input auto-focus functionality
function setupOtpInputs() {
  const otpInputs = document.querySelectorAll(".otp-field");

  otpInputs.forEach((input, index) => {
    // Allow only numeric input
    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
      if (e.target.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    // Handle backspace
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && e.target.value === "" && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });
}

// Update the DOMContentLoaded event listener to include OTP setup
document.addEventListener("DOMContentLoaded", () => {
  // ... (previous initialization code)

  // OTP Validation
  if (document.getElementById("otpForm")) {
    document
      .getElementById("otpForm")
      .addEventListener("submit", handleOtpValidation);
    setupOtpInputs();
    checkOtpPageAccess();
  }
});

// Helper function to show toast notifications
function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg ${
    type === "success" ? "bg-green-600" : "bg-red-600"
  } text-white`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("opacity-0", "transition-opacity", "duration-300");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ========================
// 5. CHANGE PASSWORD (Authenticated)
// ========================
async function handleChangePassword(e) {
  e.preventDefault();
  showLoading("changeForm");

  const changeData = {
    email: document.getElementById("changeEmail").value,
    oldPassword: document.getElementById("oldPassword").value,
    newPassword: document.getElementById("newPassword").value,
  };

  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

  if (!token) {
    showMessage("changeMessage", "Unauthorized. Please log in first.", "error");
    hideLoading("changeForm");
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/company/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(changeData),
    });

    const result = await response.json();
    console.log("Change Password Response:", result);

    if (response.ok) {
      showMessage("changeMessage", result.message, "success");
      // Clear form on success
      document.getElementById("changeForm").reset();
    } else {
      showMessage(
        "changeMessage",
        result.message || "Change password failed.",
        "error"
      );
    }
  } catch (error) {
    showMessage("changeMessage", `Error: ${error.message}`, "error");
  } finally {
    hideLoading("changeForm");
  }
}

// ========================
// 6. RESET PASSWORD (Authenticated)
// ========================
async function handleResetPassword(e) {
  e.preventDefault();
  showLoading("resetForm");

  const newPassword = document.getElementById("resetPassword").value;
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

  if (!token) {
    showMessage("resetMessage", "Unauthorized. Please log in first.", "error");
    hideLoading("resetForm");
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/company/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword }),
    });

    const result = await response.json();
    console.log("Reset Password Response:", result);

    if (response.ok) {
      showMessage("resetMessage", result.message, "success");
      // Clear form and redirect to login
      document.getElementById("resetForm").reset();
      setTimeout(() => (window.location.href = "login.html"), 1500);
    } else {
      showMessage(
        "resetMessage",
        result.message || "Reset password failed.",
        "error"
      );
    }
  } catch (error) {
    showMessage("resetMessage", `Error: ${error.message}`, "error");
  } finally {
    hideLoading("resetForm");
  }
}

// ========================
// HELPER FUNCTIONS
// ========================
function showMessage(elementId, message, type) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `<p class="${type}">${message}</p>`;
  }
}

function showLoading(formId) {
  const form = document.getElementById(formId);
  if (form) {
    const button = form.querySelector("button[type='submit']");
    if (button) {
      button.disabled = true;
      button.innerHTML = '<span class="spinner"></span> Processing...';
    }
  }
}

function hideLoading(formId) {
  const form = document.getElementById(formId);
  if (form) {
    const button = form.querySelector("button[type='submit']");
    if (button) {
      button.disabled = false;
      button.textContent = button.textContent
        .replace('<span class="spinner"></span> Processing...', "Submit")
        .replace("Processing...", "Submit");
    }
  }
}

// ========================
// PAGE ACCESS CHECKS
// ========================
function checkOtpPageAccess() {
  const registerToken = localStorage.getItem(STORAGE_KEYS.OTP_TOKEN);
  const loginToken = localStorage.getItem(STORAGE_KEYS.LOGIN_TOKEN);

  if (!registerToken && !loginToken) {
    showMessage(
      "otpMessage",
      "No OTP requested. Please start from registration or login.",
      "error"
    );
    // Redirect to registration after delay
    setTimeout(() => (window.location.href = "user-signup.html"), 2000);
  }
}

function checkAuthAccess() {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (!token) {
    showMessage("changeMessage", "Please login first.", "error");
    // Redirect to login after delay
    setTimeout(() => (window.location.href = "user-signin.html"), 1500);
  }
}

function checkResetPasswordAccess() {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const purpose = localStorage.getItem(STORAGE_KEYS.OTP_PURPOSE);

  if (!token || purpose !== "forgot") {
    showMessage(
      "resetMessage",
      "Please request password reset first.",
      "error"
    );
    // Redirect to forgot password after delay
    setTimeout(() => (window.location.href = "forgot_password.html"), 1500);
  }
}
