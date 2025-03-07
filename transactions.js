document.addEventListener("DOMContentLoaded", () => {
  /*****************************************************
   * 0) INITIAL SETUP => empty array (no sample data)
   *****************************************************/
  let allTransactions = [];

  const monthSubtitle = document.getElementById("monthSubtitle");
  const transactionsHeading = document.getElementById("transactionsHeading");
  const now = new Date();
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const currentMonthName = monthNames[now.getMonth()];
  if (monthSubtitle) {
    monthSubtitle.textContent = `Track your ${currentMonthName} transactions`;
  }
  if (transactionsHeading) {
    transactionsHeading.textContent = `${currentMonthName} Transactions`;
  }

  /*****************************************************
   * 1) SPENDING OVER TIME (LINE CHART)
   *****************************************************/
  let spendingLineChart;
  const lineCtx = document.getElementById("spendingLineChart").getContext("2d");
  spendingLineChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Daily Spending",
          data: [],
          borderColor: "#6a5acd",
          backgroundColor: "rgba(106,90,205,0.2)",
          tension: 0.1,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7
        },
        {
          label: "Average",
          data: [],
          borderColor: "#ff9f9f",
          backgroundColor: "rgba(255,159,159,0.2)",
          tension: 0.1,
          fill: false,
          borderDash: [5,5]  // dashed line for average
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => {
              return `$${ctx.parsed.y.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  /*****************************************************
   * 2) HELPER => groupByDay
   *****************************************************/
  function groupByDay(txArray) {
    // returns { "YYYY-MM-DD": totalSpending }
    const dayTotals = {};
    txArray.forEach(tx => {
      const dateStr = tx.date.split("T")[0]; // "YYYY-MM-DD"
      const amt = Math.abs(tx.amount);
      if (!dayTotals[dateStr]) {
        dayTotals[dateStr] = 0;
      }
      dayTotals[dateStr] += amt;
    });
    return dayTotals;
  }

  /*****************************************************
   * 3) RENDER LINE CHART => highlight weekends or spikes
   *****************************************************/
  function renderLineChart(filteredTx) {
    const dayTotals = groupByDay(filteredTx);
    const sortedDates = Object.keys(dayTotals).sort();

    // Make an array of daily totals
    const dailyData = sortedDates.map(d => ({
      date: d,
      total: dayTotals[d]
    }));

    // For "Average" line => sum all totals / count
    let totalSpending = 0;
    dailyData.forEach(d => { totalSpending += d.total; });
    const avg = dailyData.length ? (totalSpending / dailyData.length) : 0;

    // X labels => sorted dates
    spendingLineChart.data.labels = sortedDates;
    // Y data => daily totals
    spendingLineChart.data.datasets[0].data = dailyData.map(d => d.total);
    // The "Average" line => same x, each y is avg
    spendingLineChart.data.datasets[1].data = sortedDates.map(() => avg);

    // Optional: color code weekends or big spikes
    // We'll do a quick check in 'pointBackgroundColor'
    spendingLineChart.data.datasets[0].pointBackgroundColor = dailyData.map(d => {
      const dayOfWeek = new Date(d.date).getDay(); // 0 = Sunday, 6 = Saturday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Weekend => color it orange
        return "#ffa45c";
      }
      // If spike => say > $1000 => color it red
      if (d.total > 1000) {
        return "#ff4444";
      }
      // Otherwise default => #6a5acd
      return "#6a5acd";
    });

    spendingLineChart.update();
  }

  /*****************************************************
   * 4) DATE RANGE FILTER
   *****************************************************/
  const dateStartEl = document.getElementById("dateStart");
  const dateEndEl = document.getElementById("dateEnd");
  const btnApplyDateRange = document.getElementById("btnApplyDateRange");
  const activeDateRangeLabel = document.getElementById("activeDateRange");

  if (btnApplyDateRange) {
    btnApplyDateRange.addEventListener("click", () => {
      updateUI();
    });
  }

  function isInDateRange(tx) {
    if (!dateStartEl.value && !dateEndEl.value) return true;
    const txDate = new Date(tx.date);

    if (dateStartEl.value) {
      const start = new Date(dateStartEl.value);
      if (txDate < start) return false;
    }
    if (dateEndEl.value) {
      const end = new Date(dateEndEl.value);
      end.setHours(23,59,59,999);
      if (txDate > end) return false;
    }
    return true;
  }

  /*****************************************************
   * 5) TRANSACTIONS TABLE
   *****************************************************/
  const transactionsBody = document.getElementById("transactionsBody");

  function renderTable(filteredTx) {
    transactionsBody.innerHTML = "";
    filteredTx.forEach(tx => {
      const row = document.createElement("tr");

      // Name
      const tdName = document.createElement("td");
      tdName.textContent = tx.name;
      row.appendChild(tdName);

      // Amount
      const tdAmount = document.createElement("td");
      tdAmount.textContent = `$${tx.amount.toFixed(2)}`;
      row.appendChild(tdAmount);

      // Category
      const tdCat = document.createElement("td");
      tdCat.textContent = tx.category;
      row.appendChild(tdCat);

      // Date
      const tdDate = document.createElement("td");
      tdDate.textContent = tx.date;
      row.appendChild(tdDate);

      // Status
      const tdStatus = document.createElement("td");
      tdStatus.textContent = tx.status;
      row.appendChild(tdStatus);

      // Recurring
      const tdRec = document.createElement("td");
      const recCheckbox = document.createElement("input");
      recCheckbox.type = "checkbox";
      recCheckbox.checked = tx.recurring;
      recCheckbox.addEventListener("change", () => {
        tx.recurring = recCheckbox.checked;
      });
      tdRec.appendChild(recCheckbox);
      row.appendChild(tdRec);

      transactionsBody.appendChild(row);
    });
  }

  /*****************************************************
   * 6) QUICK STATS BAR => total, highest, count
   *****************************************************/
  const statTotal = document.getElementById("statTotal").querySelector("p");
  const statHighest = document.getElementById("statHighest").querySelector("p");
  const statCount = document.getElementById("statCount").querySelector("p");

  function renderStats(filteredTx) {
    // total monthly spending
    let totalSpending = 0;
    filteredTx.forEach(tx => {
      if (tx.amount < 0) totalSpending += Math.abs(tx.amount);
      else totalSpending += tx.amount;
    });
    statTotal.textContent = `$${totalSpending.toFixed(2)}`;

    // highest spending day => groupByDay
    const dayTotals = groupByDay(filteredTx);
    let maxVal = 0;
    Object.keys(dayTotals).forEach(d => {
      if (dayTotals[d] > maxVal) maxVal = dayTotals[d];
    });
    statHighest.textContent = `$${maxVal.toFixed(2)}`;

    // number of transactions
    statCount.textContent = filteredTx.length.toString();
  }

  /*****************************************************
   * 7) ADD NEW TRANSACTION
   *****************************************************/
  const btnAddTx = document.getElementById("btnAddTx");
  const txNameEl = document.getElementById("txName");
  const txAmountEl = document.getElementById("txAmount");
  const txDateEl = document.getElementById("txDate");
  const txCatEl = document.getElementById("txCategory");
  const txRecurringEl = document.getElementById("txRecurring");

  if (btnAddTx) {
    btnAddTx.addEventListener("click", () => {
      const nameVal = txNameEl.value.trim() || "Untitled";
      const amtVal = parseFloat(txAmountEl.value) || 0;
      const dateVal = txDateEl.value || new Date().toISOString().split("T")[0];
      const catVal = txCatEl.value || "Misc";
      const recVal = txRecurringEl.checked;

      // Determine status
      const nowDate = new Date();
      const inputDate = new Date(dateVal);
      const status = (inputDate > nowDate) ? "Pending" : "Completed";

      allTransactions.push({
        name: nameVal,
        amount: amtVal,
        category: catVal,
        date: dateVal,
        status,
        recurring: recVal
      });

      // Clear form
      txNameEl.value = "";
      txAmountEl.value = "";
      txDateEl.value = "";
      txCatEl.value = "Misc";
      txRecurringEl.checked = false;

      updateUI();
    });
  }

  /*****************************************************
   * 8) UPDATE UI => Called whenever data changes
   *****************************************************/
  function updateUI() {
    const filtered = allTransactions.filter(tx => isInDateRange(tx));

    // Render table
    renderTable(filtered);

    // Render line chart
    renderLineChart(filtered);

    // Render quick stats
    renderStats(filtered);

    // Show active date range label
    const startVal = dateStartEl.value || "N/A";
    const endVal = dateEndEl.value || "N/A";
    const rangeLabel = (startVal === "N/A" && endVal === "N/A")
      ? "No date range applied."
      : `Showing data from ${startVal} to ${endVal}`;
    if (activeDateRangeLabel) {
      activeDateRangeLabel.textContent = rangeLabel;
    }
  }

  updateUI(); // initial call
});
