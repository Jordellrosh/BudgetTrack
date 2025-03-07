document.addEventListener("DOMContentLoaded", async () => {
  /*****************************************************
   * ICONS SETUP (Attach immediately so they always work)
   *****************************************************/
  // Dark Mode Toggle
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      localStorage.setItem("darkMode", isDark);
    });
  }

  // Notifications
  const bellIcon = document.getElementById("bellIcon");
  const notificationsDropdown = document.getElementById("notificationsDropdown");
  const notificationsList = document.getElementById("notificationsList");
  const notificationBadge = document.getElementById("notificationBadge");
  const clearNotificationsBtn = document.getElementById("clearNotificationsBtn");
  let notifications = []; // Now loaded from Supabase

  if (bellIcon && notificationsDropdown && notificationsList && notificationBadge && clearNotificationsBtn) {
    notificationsDropdown.style.display = "none";

    async function loadNotifications() {
      const currentUserID = "some-user-id"; // Replace with your auth-derived user ID
      const { data, error } = await supabase
        .from('Notification')
        .select('*')
        .eq('UserID', currentUserID);
      if (!error && data) {
        notifications = data.map(n => ({
          message: n.message,
          read: n.read,
          id: n.NotificationID
        }));
      } else {
        console.warn("Error or no notifications:", error);
      }
      renderNotifications();
    }

    function renderNotifications() {
      notificationsList.innerHTML = "";
      let unreadCount = 0;
      notifications.forEach(n => {
        if (!n.read) unreadCount++;
        const li = document.createElement("li");
        li.textContent = n.message;
        li.addEventListener("click", async () => {
          if (n.id) {
            await supabase
              .from('Notification')
              .update({ read: true })
              .eq('NotificationID', n.id);
          }
          n.read = true;
          renderNotifications();
        });
        notificationsList.appendChild(li);
      });
      notificationBadge.textContent = unreadCount;
      notificationBadge.style.display = (unreadCount === 0) ? "none" : "flex";
    }

    loadNotifications();

    bellIcon.addEventListener("click", () => {
      if (!notificationsDropdown.style.display || notificationsDropdown.style.display === "none") {
        notificationsDropdown.style.display = "block";
      } else {
        notificationsDropdown.style.display = "none";
      }
    });

    clearNotificationsBtn.addEventListener("click", async () => {
      const currentUserID = "some-user-id";
      await supabase
        .from('Notification')
        .delete()
        .eq('UserID', currentUserID);
      notifications = [];
      renderNotifications();
    });

    document.addEventListener("click", (e) => {
      if (!bellIcon.contains(e.target) && !notificationsDropdown.contains(e.target)) {
        notificationsDropdown.style.display = "none";
      }
    });
  }

  // Help Overlay
  const helpIcon = document.getElementById("helpIcon");
  const helpOverlay = document.getElementById("helpOverlay");
  const closeHelpBtn = document.getElementById("closeHelpBtn");
  if (helpIcon && helpOverlay && closeHelpBtn) {
    helpOverlay.style.display = "none";
    helpIcon.addEventListener("click", () => {
      helpOverlay.style.display = "flex";
    });
    closeHelpBtn.addEventListener("click", () => {
      helpOverlay.style.display = "none";
    });
  }

  /*****************************************************
   * WAVE + TOP BAR FIXES
   *****************************************************/
  // Make wave non-clickable
  const waveEls = document.querySelectorAll(".wave, .wave svg");
  waveEls.forEach(el => el.style.pointerEvents = "none");
  // Raise .top-bar z-index
  const topBar = document.querySelector(".top-bar");
  if (topBar) {
    topBar.style.position = "relative";
    topBar.style.zIndex = "9999";
  }

  /*****************************************************
   * USER GREETING (Load from "User" table)
   *****************************************************/
  let userName = localStorage.getItem("userName");
  async function loadUserGreeting() {
    const currentUserID = "some-user-id"; // Replace with actual user ID from auth
    const { data, error } = await supabase
      .from('User')
      .select('name')
      .eq('UserID', currentUserID)
      .single();
    if (!error && data) {
      userName = data.name;
      localStorage.setItem("userName", userName);
    } else if (!userName) {
      const sillyNames = [
        "Pickle Rick Infinity",
        "Banana Samurai",
        "Cosmic Avocado",
        "Captain Cucumber",
        "Quantum Panda"
      ];
      const randomIndex = Math.floor(Math.random() * sillyNames.length);
      userName = sillyNames[randomIndex];
      localStorage.setItem("userName", userName);
    }
    const userGreeting = document.getElementById("userGreeting");
    if (userGreeting) {
      userGreeting.textContent = userName;
    }
  }
  loadUserGreeting();

  /*****************************************************
   * ACCOUNTS (Load from "Account" table)
   *****************************************************/
  let accounts = [];
  const accountsTrack = document.getElementById("accountsTrack");
  const totalAccountsEl = document.getElementById("totalAccounts");
  const combinedBalanceEl = document.getElementById("combinedBalance");
  async function loadAccounts() {
    if (!accountsTrack) return;
    const currentUserID = "some-user-id";
    const { data, error } = await supabase
      .from('Account')
      .select('*')
      .eq('UserID', currentUserID);
    if (!error && data) {
      accounts = data.map(acc => ({
        name: acc.AccountName,
        balance: acc.CurrentBalance,
        interestRate: acc.InterestRate,
        lastTx: acc.lastTx
      }));
    } else {
      console.warn("Error or no accounts found:", error);
    }
    renderAccounts();
  }

  function renderAccounts() {
    accountsTrack.innerHTML = "";
    let totalBalance = 0;
    accounts.forEach(acc => {
      totalBalance += acc.balance;
      const card = document.createElement("div");
      card.classList.add("card", "tilt-item", "account-card");
      card.innerHTML = `
          <div class="account-brand">BudgetTrack</div>
          <h2>${acc.name || "Untitled"}</h2>
          <div class="hover-details">
            <h4>Additional Info</h4>
            <p>Interest Rate: ${acc.interestRate || "N/A"}</p>
            <p>Last Tx: ${acc.lastTx || "N/A"}</p>
          </div>
          <div class="card-content">
            <span>Balance: $${acc.balance.toFixed(2)}</span>
          </div>
      `;
      accountsTrack.appendChild(card);
    });
    if (totalAccountsEl) totalAccountsEl.textContent = accounts.length;
    if (combinedBalanceEl) combinedBalanceEl.textContent = `$${totalBalance.toFixed(2)}`;
  }

  if (accountsTrack) {
    const arrowLeft = document.getElementById("arrowLeft");
    const arrowRight = document.getElementById("arrowRight");
    let currentOffset = 0;
    if (arrowLeft) {
      arrowLeft.addEventListener("click", () => {
        const cardWidth = 400;
        currentOffset -= cardWidth;
        if (currentOffset < 0) currentOffset = 0;
        accountsTrack.style.transform = `translateX(-${currentOffset}px)`;
      });
    }
    if (arrowRight) {
      arrowRight.addEventListener("click", () => {
        const cardWidth = 400;
        currentOffset += cardWidth;
        accountsTrack.style.transform = `translateX(-${currentOffset}px)`;
      });
    }
    loadAccounts();
  }

  /*****************************************************
   * Global Transaction Arrays
   *****************************************************/
  let latestTransactions = [];
  let upcomingTransactions = [];

  /*****************************************************
   * TRANSACTIONS (Load from "Transaction" table)
   *****************************************************/
  const latestTBody = document.getElementById("latestTransactionsBody");
  const upcomingTBody = document.getElementById("upcomingTransactionsBody");
  const filterInput = document.getElementById("txFilterInput");
  const sortSelect = document.getElementById("txSortSelect");

  async function loadTransactions() {
    if (!latestTBody || !upcomingTBody) return;
    const currentUserID = "some-user-id";
    const { data, error } = await supabase
      .from('Transaction')
      .select('*')
      .eq('UserID', currentUserID);
    if (!error && data) {
      const now = new Date();
      latestTransactions = [];
      upcomingTransactions = [];
      data.forEach(tx => {
        const txDate = new Date(tx.date);
        const transaction = {
          name: tx.name,
          amount: tx.amount,
          category: tx.category,
          date: tx.date,
          status: tx.status
        };
        if (txDate > now) upcomingTransactions.push(transaction);
        else latestTransactions.push(transaction);
      });
    } else {
      console.warn("Error or no transactions found:", error);
    }
    updateUI();
  }

  async function addTransaction(nameVal, amountVal, dateVal, catVal) {
    const currentUserID = "some-user-id";
    const now = new Date();
    let status = "Completed";
    if (dateVal > now) {
      status = `Due in ${Math.ceil((dateVal - now) / (1000 * 60 * 60 * 24))} days`;
    }
    const { error } = await supabase
      .from('Transaction')
      .insert([{
        UserID: currentUserID,
        name: nameVal,
        amount: amountVal,
        category: catVal,
        date: dateVal.toISOString(),
        status: status
      }]);
    if (error) {
      console.error("Error adding transaction:", error);
    } else {
      await loadTransactions();
    }
  }

  if (latestTBody && upcomingTBody && filterInput && sortSelect) {
    const btnAddTx = document.getElementById("btnAddTx");
    if (btnAddTx) {
      btnAddTx.addEventListener("click", async () => {
        const nameVal = document.getElementById("txName").value.trim();
        const amountVal = parseFloat(document.getElementById("txAmount").value);
        const dateValRaw = document.getElementById("txDate").value;
        const catVal = document.getElementById("txCategory").value.trim() || "Misc";
        if (!nameVal || isNaN(amountVal) || !dateValRaw) {
          alert("Please enter a valid description, amount, and date.");
          return;
        }
        await addTransaction(nameVal, amountVal, new Date(dateValRaw), catVal);
        document.getElementById("txName").value = "";
        document.getElementById("txAmount").value = "";
        document.getElementById("txDate").value = "";
        document.getElementById("txCategory").value = "";
      });
    }
    filterInput.addEventListener("input", updateUI);
    sortSelect.addEventListener("change", updateUI);
    function updateUI() {
      const allTx = [...latestTransactions, ...upcomingTransactions];
      const filterVal = filterInput ? filterInput.value.toLowerCase() : "";
      let filteredLatest = latestTransactions.filter(tx => {
        return (
          tx.name.toLowerCase().includes(filterVal) ||
          tx.category.toLowerCase().includes(filterVal)
        );
      });
      const sortVal = sortSelect ? sortSelect.value : "";
      if (sortVal === "name") {
        filteredLatest.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortVal === "amount") {
        filteredLatest.sort((a, b) => a.amount - b.amount);
      } else if (sortVal === "date") {
        filteredLatest.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      if (latestTBody) {
        latestTBody.innerHTML = "";
        filteredLatest.forEach(tx => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${tx.name}</td>
            <td>$${tx.amount.toFixed(2)}</td>
            <td>${tx.category}</td>
            <td>${tx.status}</td>
          `;
          latestTBody.appendChild(row);
        });
      }
      if (upcomingTBody) {
        upcomingTBody.innerHTML = "";
        upcomingTransactions.forEach(tx => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${tx.name}</td>
            <td>$${tx.amount.toFixed(2)}</td>
            <td>${tx.category}</td>
            <td>${tx.status}</td>
          `;
          upcomingTBody.appendChild(row);
        });
      }
      const totalIncome = allTx.reduce((acc, tx) => tx.amount > 0 ? acc + tx.amount : acc, 0);
      const totalExpenses = allTx.reduce((acc, tx) => tx.amount < 0 ? acc + Math.abs(tx.amount) : acc, 0);
      const totalIncomeEl = document.getElementById("totalIncome");
      if (totalIncomeEl) {
        totalIncomeEl.textContent = `$${totalIncome.toFixed(2)}`;
      }
      const totalExpensesEl = document.getElementById("totalExpenses");
      if (totalExpensesEl) {
        totalExpensesEl.textContent = `$${totalExpenses.toFixed(2)}`;
      }
      updatePieChart(allTx);
      updateNetWorth();
      updateGoals(allTx);
    }
    updateUI();
    loadTransactions();
  }

  /*****************************************************
   * BUDGET PIE CHART
   *****************************************************/
  let budgetChart;
  function updatePieChart(allTx) {
    const budgetPieEl = document.getElementById("budgetPie");
    if (!budgetPieEl) return;
    const ctx = budgetPieEl.getContext("2d");
    const categoryTotals = {};
    allTx.forEach(tx => {
      const cat = tx.category || "Misc";
      const amt = Math.abs(tx.amount);
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = 0;
      }
      categoryTotals[cat] += amt;
    });
    const categoryLabels = Object.keys(categoryTotals);
    const categoryData = Object.values(categoryTotals);
    if (categoryLabels.length === 0) {
      if (budgetChart) budgetChart.destroy();
      const chartLegend = document.getElementById("chartLegend");
      if (chartLegend) chartLegend.textContent = "No transactions yet.";
      return;
    }
    const gradients = categoryLabels.map(() => {
      let grad = ctx.createLinearGradient(0, 0, 200, 200);
      grad.addColorStop(0, randomColor());
      grad.addColorStop(1, randomColor());
      return grad;
    });
    if (budgetChart) budgetChart.destroy();
    budgetChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: categoryLabels,
        datasets: [{
          data: categoryData,
          backgroundColor: gradients,
          borderWidth: 2,
          borderRadius: 8,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "35%",
        plugins: {
          legend: {
            display: true,
            position: "bottom"
          }
        }
      }
    });
    const legendEl = document.getElementById("chartLegend");
    if (legendEl) {
      legendEl.innerHTML = categoryLabels.map(lbl => {
        return `<span style="color:#444;font-weight:bold">&#11044;</span> ${lbl}`;
      }).join(" &nbsp; ");
    }
  }
  function randomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r},${g},${b})`;
  }

  /*****************************************************
   * NET WORTH LINE CHART
   *****************************************************/
  let netWorthChart;
  let netWorthData = [];
  function updateNetWorth() {
    const netWorthEl = document.getElementById("netWorthChart");
    if (!netWorthEl) return;
    const allTx = [...latestTransactions, ...upcomingTransactions];
    let totalIncome = 0;
    let totalExpenses = 0;
    allTx.forEach(tx => {
      if (tx.amount > 0) totalIncome += tx.amount;
      else totalExpenses += Math.abs(tx.amount);
    });
    const totalAccountsBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const net = totalAccountsBalance + (totalIncome - totalExpenses);
    netWorthData.push({ time: new Date().toLocaleTimeString(), value: net });
    const ctx = netWorthEl.getContext("2d");
    if (netWorthChart) netWorthChart.destroy();
    netWorthChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: netWorthData.map(d => d.time),
        datasets: [{
          label: "Net Worth",
          data: netWorthData.map(d => d.value),
          borderColor: "#ff6384",
          backgroundColor: "rgba(255,99,132,0.2)",
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
  setInterval(() => {
    updateNetWorth();
  }, 60000);

  /*****************************************************
   * GOALS
   *****************************************************/
  const goalAmount = 10000;
  const goalAmountEl = document.getElementById("goalAmount");
  if (goalAmountEl) {
    goalAmountEl.textContent = goalAmount;
  }
  const currentSavingsEl = document.getElementById("currentSavings");
  const progressFill = document.getElementById("progressFill");
  function updateGoals(allTx) {
    let savings = 0;
    allTx.forEach(tx => {
      if (tx.amount > 0) {
        savings += tx.amount;
      }
    });
    if (currentSavingsEl) {
      currentSavingsEl.textContent = savings.toFixed(2);
    }
    if (progressFill) {
      const pct = Math.min((savings / goalAmount) * 100, 100);
      progressFill.style.width = pct + "%";
    }
  }

  /*****************************************************
   * UPDATE UI (Called whenever data changes)
   *****************************************************/
  function updateUI() {
    const allTx = [...latestTransactions, ...upcomingTransactions];
    const filterVal = filterInput ? filterInput.value.toLowerCase() : "";
    let filteredLatest = latestTransactions.filter(tx => {
      return (
        tx.name.toLowerCase().includes(filterVal) ||
        tx.category.toLowerCase().includes(filterVal)
      );
    });
    const sortVal = sortSelect ? sortSelect.value : "";
    if (sortVal === "name") {
      filteredLatest.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortVal === "amount") {
      filteredLatest.sort((a, b) => a.amount - b.amount);
    } else if (sortVal === "date") {
      filteredLatest.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    if (latestTBody) {
      latestTBody.innerHTML = "";
      filteredLatest.forEach(tx => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${tx.name}</td>
          <td>$${tx.amount.toFixed(2)}</td>
          <td>${tx.category}</td>
          <td>${tx.status}</td>
        `;
        latestTBody.appendChild(row);
      });
    }
    if (upcomingTBody) {
      upcomingTBody.innerHTML = "";
      upcomingTransactions.forEach(tx => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${tx.name}</td>
          <td>$${tx.amount.toFixed(2)}</td>
          <td>${tx.category}</td>
          <td>${tx.status}</td>
        `;
        upcomingTBody.appendChild(row);
      });
    }
    const totalIncome = allTx.reduce((acc, tx) => tx.amount > 0 ? acc + tx.amount : acc, 0);
    const totalExpenses = allTx.reduce((acc, tx) => tx.amount < 0 ? acc + Math.abs(tx.amount) : acc, 0);
    const totalIncomeEl = document.getElementById("totalIncome");
    if (totalIncomeEl) {
      totalIncomeEl.textContent = `$${totalIncome.toFixed(2)}`;
    }
    const totalExpensesEl = document.getElementById("totalExpenses");
    if (totalExpensesEl) {
      totalExpensesEl.textContent = `$${totalExpenses.toFixed(2)}`;
    }
    updatePieChart(allTx);
    updateNetWorth();
    updateGoals(allTx);
  }
  updateUI();

  /*****************************************************
   * CALENDAR
   *****************************************************/
  const calendarGrid = document.getElementById("calendarGrid");
  const calendarMonthEl = document.getElementById("calendarMonth");
  if (calendarGrid && calendarMonthEl) {
    function renderCalendar() {
      const now = new Date();
      const year = now.getFullYear();
      const monthIndex = now.getMonth();
      const dayToday = now.getDate();
      const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
      ];
      calendarMonthEl.textContent = `${monthNames[monthIndex]} ${year}`;
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const firstDay = new Date(year, monthIndex, 1).getDay();
      calendarGrid.innerHTML = "";
      for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement("div");
        blank.style.opacity = "0";
        calendarGrid.appendChild(blank);
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const dayDiv = document.createElement("div");
        dayDiv.textContent = d;
        if (d === dayToday) {
          dayDiv.classList.add("today");
        }
        dayDiv.addEventListener("click", () => {
          alert(`You clicked ${monthNames[monthIndex]} ${d}, ${year}`);
        });
        calendarGrid.appendChild(dayDiv);
      }
    }
    renderCalendar();
  }
});
