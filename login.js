document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const darkModeToggle = document.getElementById("darkModeToggle");

  // Retrieve users from localStorage (if any)
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // 1) Handle Login Submission
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const emailVal = document.getElementById("email").value.trim();
    const passwordVal = document.getElementById("password").value.trim();

    // Find user by email
    const foundUser = users.find(u => u.email === emailVal);
    if (!foundUser) {
      loginError.style.display = "block";
      loginError.textContent = "User not found. Please register first.";
      return;
    }

    // Check password
    if (foundUser.password !== passwordVal) {
      loginError.style.display = "block";
      loginError.textContent = "Incorrect password. Try again.";
      return;
    }

    // If everything matches
    loginError.style.display = "none";
    alert(`Welcome back, ${foundUser.userName}!`);
    // Example: redirect to dashboard
    window.location.href = "index.html";
  });

  // 2) Dark Mode Toggle
  // Check if previously set to dark mode
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }

  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark);
  });
});
