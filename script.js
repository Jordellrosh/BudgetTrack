document.addEventListener("DOMContentLoaded", () => {
  /*****************************************************
   * 0) WAVE + TOP BAR FIXES
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

  // Hide notifications & help overlay initially
  document.getElementById("notificationsDropdown").style.display = "none";
  document.getElementById("helpOverlay").style.display = "none";

  /*****************************************************
   * 1) USER GREETING
   *****************************************************/
  let userName = localStorage.getItem("userName");
  const sillyNames = [
    "Pickle Rick Infinity",
    "Banana Samurai",
    "Cosmic Avocado",
    "Captain Cucumber",
    "Quantum Panda"
  ];
  if (!userName) {
    const randomIndex = Math.floor(Math.random() * sillyNames.length);
    userName = sillyNames[randomIndex];
    // Save to localStorage if you want consistency
    localStorage.setItem("userName", userName);
  }
  document.getElementById("userGreeting").textContent = userName;

  /*****************************************************
   * 2) ACCOUNTS
   *****************************************************/
  let accounts = [
    { name: "Checking", balance: 2500, interestRate: "1.5%", lastTx: "+$300 deposit" },
    { name: "Savings", balance: 6000, interestRate: "2.0%", lastTx: "-$100 withdrawal" },
    { name: "Credit Card", balance: -1200, interestRate: "N/A", lastTx: "-$50 payment" },
    { name: "Investment", balance: 4000, interestRate: "3.2%", lastTx: "+$500 deposit" }
  ];
  const accountsTrack = document.getElementById("accountsTrack");
  const arrowLeft = document.getElementById("arrowLeft");
  const arrowRight = document.getElementById("arrowRight");
  let currentOffset = 0;

  function renderAccounts() {
    accountsTrack.innerHTML = "";
    let totalBalance = 0;
    accounts.forEach(acc => {
      totalBalance += acc.balance;
      const card = document.createElement("div");
      card.classList.add("card","tilt-item","account-card");
      card.innerHTML = `
        <div class="account-brand">BudgetTrack</div>
        <h2>${acc.name}</h2>
        <div class="hover-details">
          <h4>Additional Info</h4>
          <p>Interest Rate: ${acc.interestRate}</p>
          <p>Last Tx: ${acc.lastTx}</p>
        </div>
        <div class="card-content">
          <span>Balance: $${acc.balance.toFixed(2)}</span>
        </div>
      `;
      accountsTrack.appendChild(card);
    });
    document.getElementById("totalAccounts").textContent = accounts.length;
    document.getElementById("combinedBalance").textContent = `$${totalBalance.toFixed(2)}`;
  }
  renderAccounts();

  arrowLeft.addEventListener("click", () => {
    const cardWidth = 400;
    currentOffset -= cardWidth;
    if (currentOffset < 0) currentOffset = 0;
    accountsTrack.style.transform = `translateX(-${currentOffset}px)`;
  });
  arrowRight.addEventListener("click", () => {
    const cardWidth = 400;
    currentOffset += cardWidth;
    accountsTrack.style.transform = `translateX(-${currentOffset}px)`;
  });

  /*****************************************************
   * 3) TRANSACTIONS
   *****************************************************/
  let latestTransactions = [];
  let upcomingTransactions = [];

  const latestTBody = document.getElementById("latestTransactionsBody");
  const upcomingTBody = document.getElementById("upcomingTransactionsBody");
  const filterInput = document.getElementById("txFilterInput");
  const sortSelect = document.getElementById("txSortSelect");

  document.getElementById("btnAddTx").addEventListener("click", () => {
    const nameVal = document.getElementById("txName").value.trim();
    const amountVal = parseFloat(document.getElementById("txAmount").value);
    const dateVal = new Date(document.getElementById("txDate").value);
    const catVal = document.getElementById("txCategory").value.trim() || "Misc";

    if (!nameVal || isNaN(amountVal) || !document.getElementById("txDate").value) {
      alert("Please enter a valid description, amount, and date.");
      return;
    }

    const now = new Date();
    let status = "Completed";
    if (dateVal > now) {
      status = `Due in ${Math.ceil((dateVal - now)/(1000*60*60*24))} days`;
    }

    const tx = {
      name: nameVal,
      amount: amountVal,
      category: catVal,
      date: dateVal.toISOString(),
      status
    };

    if (dateVal > now) {
      upcomingTransactions.push(tx);
    } else {
      latestTransactions.push(tx);
    }

    // Clear form
    document.getElementById("txName").value = "";
    document.getElementById("txAmount").value = "";
    document.getElementById("txDate").value = "";
    document.getElementById("txCategory").value = "";

    updateUI();
  });

  filterInput.addEventListener("input", updateUI);
  sortSelect.addEventListener("change", updateUI);

  /*****************************************************
   * 4) BUDGET PIE CHART
   *****************************************************/
  let budgetChart;
  function updatePieChart(allTx) {
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
    const ctx = document.getElementById("budgetPie").getContext("2d");

    if (categoryLabels.length === 0) {
      if (budgetChart) budgetChart.destroy();
      document.getElementById("chartLegend").textContent = "No transactions yet.";
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
    legendEl.innerHTML = categoryLabels.map((lbl) => {
      return `<span style="color:#444;font-weight:bold">&#11044;</span> ${lbl}`;
    }).join(" &nbsp; ");
  }
  function randomColor() {
    const r = Math.floor(Math.random()*255);
    const g = Math.floor(Math.random()*255);
    const b = Math.floor(Math.random()*255);
    return `rgb(${r},${g},${b})`;
  }

  /*****************************************************
   * 5) NET WORTH LINE CHART
   *****************************************************/
  let netWorthChart;
  let netWorthData = [];
  function updateNetWorth() {
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
    const ctx = document.getElementById("netWorthChart").getContext("2d");
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
  // update net worth every minute
  setInterval(() => {
    updateNetWorth();
  }, 60000);

  /*****************************************************
   * 6) GOALS
   *****************************************************/
  const goalAmount = 10000;
  document.getElementById("goalAmount").textContent = goalAmount;
  const currentSavingsEl = document.getElementById("currentSavings");
  const progressFill = document.getElementById("progressFill");
  function updateGoals(allTx) {
    let savings = 0;
    allTx.forEach(tx => {
      if (tx.amount > 0) {
        savings += tx.amount;
      }
    });
    currentSavingsEl.textContent = savings.toFixed(2);
    const pct = Math.min((savings / goalAmount) * 100, 100);
    progressFill.style.width = pct + "%";
  }

  /*****************************************************
   * 7) UPDATE UI => Called whenever data changes
   *****************************************************/
  function updateUI() {
    const allTx = [...latestTransactions, ...upcomingTransactions];

    // Filter & sort for "Latest"
    const filterVal = filterInput.value.toLowerCase();
    let filteredLatest = latestTransactions.filter(tx => {
      return (
        tx.name.toLowerCase().includes(filterVal) ||
        tx.category.toLowerCase().includes(filterVal)
      );
    });
    const sortVal = sortSelect.value;
    if (sortVal === "name") {
      filteredLatest.sort((a,b) => a.name.localeCompare(b.name));
    } else if (sortVal === "amount") {
      filteredLatest.sort((a,b) => a.amount - b.amount);
    } else if (sortVal === "date") {
      filteredLatest.sort((a,b) => new Date(a.date) - new Date(b.date));
    }

    // Render "Latest" table
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

    // Render "Upcoming" table
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

    // total income & expenses
    let totalIncome = 0, totalExpenses = 0;
    allTx.forEach(tx => {
      if (tx.amount > 0) totalIncome += tx.amount;
      else totalExpenses += Math.abs(tx.amount);
    });
    document.getElementById("totalIncome").textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById("totalExpenses").textContent = `$${totalExpenses.toFixed(2)}`;

    // Update charts & goals
    updatePieChart(allTx);
    updateNetWorth();
    updateGoals(allTx);
  }
  updateUI(); // initial call

  /*****************************************************
   * 8) CALENDAR
   *****************************************************/
  const calendarGrid = document.getElementById("calendarGrid");
  const calendarMonthEl = document.getElementById("calendarMonth");
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
    const daysInMonth = new Date(year, monthIndex+1, 0).getDate();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    calendarGrid.innerHTML = "";

    for (let i=0; i<firstDay; i++) {
      const blank = document.createElement("div");
      blank.style.opacity = "0";
      calendarGrid.appendChild(blank);
    }
    for (let d=1; d<=daysInMonth; d++) {
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

  /*****************************************************
   * 9) DARK MODE
   *****************************************************/
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark);
  });

  /*****************************************************
   * 10) NOTIFICATIONS => 2 default
   *****************************************************/
  let notifications = [
    { message: "Welcome to BudgetTrack!", read: false },
    { message: "Generic reminder: Update your transactions!", read: false }
  ];
  const bellIcon = document.getElementById("bellIcon");
  const notificationsDropdown = document.getElementById("notificationsDropdown");
  const notificationsList = document.getElementById("notificationsList");
  const notificationBadge = document.getElementById("notificationBadge");
  const clearNotificationsBtn = document.getElementById("clearNotificationsBtn");

  function renderNotifications() {
    notificationsList.innerHTML = "";
    let unreadCount = 0;
    notifications.forEach(n => {
      if (!n.read) unreadCount++;
      const li = document.createElement("li");
      li.textContent = n.message;
      li.addEventListener("click", () => {
        n.read = true;
        renderNotifications();
      });
      notificationsList.appendChild(li);
    });
    notificationBadge.textContent = unreadCount;
    notificationBadge.style.display = (unreadCount === 0) ? "none" : "flex";
  }
  renderNotifications();

  bellIcon.addEventListener("click", () => {
    if (!notificationsDropdown.style.display || notificationsDropdown.style.display === "none") {
      notificationsDropdown.style.display = "block";
    } else {
      notificationsDropdown.style.display = "none";
    }
  });

  clearNotificationsBtn.addEventListener("click", () => {
    notifications = [];
    renderNotifications();
  });

  document.addEventListener("click", (e) => {
    // close notifications if clicked outside
    if (!bellIcon.contains(e.target) && !notificationsDropdown.contains(e.target)) {
      notificationsDropdown.style.display = "none";
    }
  });

  /*****************************************************
   * 11) HELP OVERLAY
   *****************************************************/
  const helpIcon = document.getElementById("helpIcon");
  const helpOverlay = document.getElementById("helpOverlay");
  const closeHelpBtn = document.getElementById("closeHelpBtn");

  helpIcon.addEventListener("click", () => {
    helpOverlay.style.display = "flex";
  });
  closeHelpBtn.addEventListener("click", () => {
    helpOverlay.style.display = "none";
  });
});
