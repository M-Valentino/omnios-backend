const signUpForm = document.getElementById("signUpForm");
const signInForm = document.getElementById("signInForm");
const logoutButton = document.getElementById("logoutButton");
const verificationForm = document.getElementById("verificationForm");

if (signUpForm) {
  signUpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value; // Optional, depends on your backend
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Call your signup API
    try {
      const response = await fetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: email, email, password }), // Use user as email
      });
      const data = await response.json();
      if (response.ok) {
        alert("Sign up successful! Please verify your account.");
        window.location.href = "verify.html"; // Redirect to verification page
      } else {
        alert(data.error || "Sign up failed");
      }
    } catch (error) {
      alert("An error occurred: " + error.message);
    }
  });
}

if (signInForm) {
  signInForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Signed in successfully.");
        localStorage.setItem("authToken", JSON.stringify(data.result));

        window.location.href = "os.html";
      } else {
        alert(data.error || "Invalid login attempt. Please try again.");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("An error occurred while trying to log in. Please try again.");
    }
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.clear(); // Clear tokens
    window.location.href = "signin.html"; // Redirect to sign in page
  });
}

if (verificationForm) {
  verificationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const user = document.getElementById("username").value; // This should be the email
    const code = document.getElementById("verificationCode").value;

    // Call your verification API
    try {
      const response = await fetch("/auth/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, code }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Account verified successfully! You can now sign in.");
        window.location.href = "index.html"; // Redirect to sign in page
      } else {
        alert(data.error || "Verification failed");
      }
    } catch (error) {
      alert("An error occurred: " + error.message);
    }
  });
}
