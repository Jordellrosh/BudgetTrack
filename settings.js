document.addEventListener("DOMContentLoaded", () => {
    const settingsSavedMsg = document.getElementById("settingsSavedMsg");
  
    // ============ 1) LOAD EXISTING SETTINGS FROM localStorage ============
    const storedDisplayName = localStorage.getItem("displayName") || "";
    const storedEmail = localStorage.getItem("email") || "";
    const storedDarkMode = localStorage.getItem("darkMode") === "true";
    const storedLargeFont = localStorage.getItem("largeFont") === "true";
    const storedEmailAlerts = localStorage.getItem("emailAlerts") === "true";
    const storedInAppNotif = localStorage.getItem("inAppNotif") === "true";
    const storedTwoFactor = localStorage.getItem("twoFactor") === "true";
    const storedBetaFeatures = localStorage.getItem("betaFeatures") === "true";
    const storedDebugTools = localStorage.getItem("debugTools") === "true";
  
    // PROFILE
    const displayNameInput = document.getElementById("displayName");
    const emailFieldInput = document.getElementById("emailField");
    if (displayNameInput) displayNameInput.value = storedDisplayName;
    if (emailFieldInput) emailFieldInput.value = storedEmail;
  
    // APPEARANCE
    const darkModeCheckbox = document.getElementById("darkModeCheckbox");
    const largeFontCheckbox = document.getElementById("largeFontCheckbox");
    if (darkModeCheckbox) darkModeCheckbox.checked = storedDarkMode;
    if (largeFontCheckbox) {
      largeFontCheckbox.checked = storedLargeFont;
      // If largeFont is true, apply it
      if (storedLargeFont) {
        document.body.classList.add("large-font");
      }
    }
  
    // NOTIFICATIONS
    const emailAlertsCheckbox = document.getElementById("emailAlertsCheckbox");
    const inAppNotifCheckbox = document.getElementById("inAppNotifCheckbox");
    if (emailAlertsCheckbox) emailAlertsCheckbox.checked = storedEmailAlerts;
    if (inAppNotifCheckbox) inAppNotifCheckbox.checked = storedInAppNotif;
  
    // SECURITY
    const twoFactorCheckbox = document.getElementById("twoFactorCheckbox");
    if (twoFactorCheckbox) twoFactorCheckbox.checked = storedTwoFactor;
  
    // ADVANCED
    const betaFeaturesCheckbox = document.getElementById("betaFeaturesCheckbox");
    const debugToolsCheckbox = document.getElementById("debugToolsCheckbox");
    if (betaFeaturesCheckbox) betaFeaturesCheckbox.checked = storedBetaFeatures;
    if (debugToolsCheckbox) debugToolsCheckbox.checked = storedDebugTools;
  
    // If dark mode was stored, apply it
    if (storedDarkMode) {
      document.body.classList.add("dark-mode");
    }
  
    // ============ 2) "SAVE CHANGES" BUTTONS ============
    const saveButtons = document.querySelectorAll(".save-btn");
    saveButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const sectionId = btn.getAttribute("data-section");
        saveSectionSettings(sectionId);
      });
    });
  
    function saveSectionSettings(sectionId) {
      switch (sectionId) {
        case "profileSection":
          // Save displayName & email
          localStorage.setItem("displayName", displayNameInput.value.trim());
          localStorage.setItem("email", emailFieldInput.value.trim());
          // Possibly more logic (validate email, etc.)
          break;
  
        case "appearanceSection":
          // Save dark mode
          localStorage.setItem("darkMode", darkModeCheckbox.checked);
          // Save large font
          localStorage.setItem("largeFont", largeFontCheckbox.checked);
          // Apply large font class instantly
          document.body.classList.toggle("large-font", largeFontCheckbox.checked);
          break;
  
        case "notificationsSection":
          // Save email alerts & in-app notifications
          localStorage.setItem("emailAlerts", emailAlertsCheckbox.checked);
          localStorage.setItem("inAppNotif", inAppNotifCheckbox.checked);
          break;
  
        case "securitySection":
          // Save twoFactor
          localStorage.setItem("twoFactor", twoFactorCheckbox.checked);
          break;
  
        case "advancedSection":
          // Save betaFeatures & debugTools
          localStorage.setItem("betaFeatures", betaFeaturesCheckbox.checked);
          localStorage.setItem("debugTools", debugToolsCheckbox.checked);
          break;
  
        default:
          // Do nothing or handle other sections
          break;
      }
  
      // Show "Settings Saved" message
      showSettingsSavedMsg();
    }
  
    function showSettingsSavedMsg() {
      if (!settingsSavedMsg) return;
      settingsSavedMsg.style.display = "block";
  
      // Re-trigger fadeOut animation (if you want it to re-run)
      settingsSavedMsg.classList.remove("fadeAnim");
      // Force reflow (hack to restart animation)
      void settingsSavedMsg.offsetWidth;
      settingsSavedMsg.classList.add("fadeAnim");
  
      // Optionally hide after X seconds manually
      setTimeout(() => {
        settingsSavedMsg.style.display = "none";
      }, 3000);
    }
  
    // ============ 3) ADDITIONAL LOGIC ============
  
    // Example: "Change Password" placeholder
    const changePasswordBtn = document.getElementById("changePasswordBtn");
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener("click", () => {
        alert("Redirecting to password change flow... (placeholder)");
      });
    }
  
    // If you want immediate dark mode toggle from the wave hero top bar:
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
      darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isDark = document.body.classList.contains("dark-mode");
        localStorage.setItem("darkMode", isDark);
        // Also check the box if it exists
        if (darkModeCheckbox) {
          darkModeCheckbox.checked = isDark;
        }
      });
    }
  
    // Additional placeholders for help overlay, notifications, etc. can go here...
  });
  