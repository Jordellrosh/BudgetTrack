document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const registerError = document.getElementById("registerError");
  const darkModeToggle = document.getElementById("darkModeToggle");

  // 1) Handle localStorage-based registration
  let users = JSON.parse(localStorage.getItem("users")) || [];

  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const userNameVal = document.getElementById("userName").value.trim();
    const emailVal = document.getElementById("email").value.trim();
    const passwordVal = document.getElementById("password").value.trim();
    const confirmPassVal = document.getElementById("confirmPassword").value.trim();

    // Check password match
    if (passwordVal !== confirmPassVal) {
      registerError.style.display = "block";
      registerError.textContent = "Passwords do not match!";
      return;
    }

    // Check if email is already registered
    const existingUser = users.find(u => u.email === emailVal);
    if (existingUser) {
      registerError.style.display = "block";
      registerError.textContent = "Email is already registered!";
      return;
    }

    // If all good, create new user
    registerError.style.display = "none";
    const newUser = {
      userName: userNameVal,
      email: emailVal,
      password: passwordVal
    };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration successful!");
    window.location.href = "login.html"; // or whichever page
  });

  // 2) Dark Mode Toggle
  // Check localStorage to see if user previously enabled dark mode
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }

  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark);
  });
});
