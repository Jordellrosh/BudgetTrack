/* =============================
   transactions.js (Advanced)
============================= */

document.addEventListener("DOMContentLoaded", () => {
    // 1) ADVANCED TRANSACTIONS ARRAY
    let advancedTransactions = [
      {
        id: 1,
        name: "Groceries",
        amount: -75,
        category: "Food",
        status: "Completed",
        account: "Checking",
        date: "2023-02-01",
        attachments: [],
        notes: ""
      },
      {
        id: 2,
        name: "Salary",
        amount: 2000,
        category: "Income",
        status: "Completed",
        account: "Checking",
        date: "2023-02-05",
        attachments: [],
        notes: ""
      },
      {
        id: 3,
        name: "Electric Bill",
        amount: -60,
        category: "Bills",
        status: "Due in 3 days",
        account: "Checking",
        date: "2023-02-20",
        attachments: [],
        notes: ""
      },
      {
        id: 4,
        name: "Streaming Service",
        amount: -15,
        category: "Entertainment",
        status: "Completed",
        account: "Credit Card",
        date: "2023-02-10",
        attachments: [],
        notes: ""
      }
    ];
  
    // 2) DOM REFERENCES
    const advancedTxBody = document.getElementById("advancedTxBody");
    const selectAllCb = document.getElementById("selectAllCb");
  
    // Filters
    const filterStart = document.getElementById("filterStart");
    const filterEnd = document.getElementById("filterEnd");
    const filterCategory = document.getElementById("filterCategory");
    const filterAccount = document.getElementById("filterAccount");
  
    // Batch actions
    const batchDeleteBtn = document.getElementById("batchDeleteBtn");
    const batchCategoryBtn = document.getElementById("batchCategoryBtn");
    const batchMarkCompletedBtn = document.getElementById("batchMarkCompletedBtn");
  
    // Recurring & scheduled placeholders
    const showRecurringBtn = document.getElementById("showRecurringBtn");
    const showScheduledBtn = document.getElementById("showScheduledBtn");
    const recurringUl = document.getElementById("recurringList");
    const scheduledUl = document.getElementById("scheduledList");
  
    // CSV import/export
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    const importCsvBtn = document.getElementById("importCsvBtn");
    const importCsvInput = document.getElementById("importCsvInput");
  
    // Attachments & notes
    const attachReceiptBtn = document.getElementById("attachReceiptBtn");
    const addNotesBtn = document.getElementById("addNotesBtn");
  
    // Example recurring & scheduled
    let recurringListData = [
      { id: 101, name: "Gym Membership", amount: -30, category: "Health", account: "Checking", interval: "Monthly" },
      { id: 102, name: "Car Insurance", amount: -100, category: "Bills", account: "Checking", interval: "Quarterly" }
    ];
    let scheduledListData = [
      { id: 201, name: "Credit Card Payment", amount: -200, category: "Debt", account: "Credit Card", date: "2023-03-05" },
      { id: 202, name: "Freelance Payment", amount: 300, category: "Income", account: "Checking", date: "2023-03-10" }
    ];
  
    /*****************************************************
     * RENDER ADVANCED TRANSACTIONS TABLE
     *****************************************************/
    function renderAdvancedTx() {
      if (!advancedTxBody) return;
  
      // Filter logic
      const startDate = filterStart?.value ? new Date(filterStart.value) : null;
      const endDate = filterEnd?.value ? new Date(filterEnd.value) : null;
      const catVal = filterCategory?.value || "";
      const accVal = filterAccount?.value || "";
  
      let filtered = advancedTransactions.filter(tx => {
        if (startDate && new Date(tx.date) < startDate) return false;
        if (endDate && new Date(tx.date) > endDate) return false;
        if (catVal && tx.category !== catVal) return false;
        if (accVal && tx.account !== accVal) return false;
        return true;
      });
  
      advancedTxBody.innerHTML = "";
  
      filtered.forEach(tx => {
        const row = document.createElement("tr");
        // Optionally add a .new-row class if the transaction is newly inserted or meets some condition
        // For demonstration, let's add .new-row if the transaction is ID > 4 (meaning newly added)
        if (tx.id > 4) {
          row.classList.add("new-row");
        }
  
        row.innerHTML = `
          <td><input type="checkbox" class="rowCb" data-id="${tx.id}" /></td>
          <td class="editable name-cell" data-id="${tx.id}">${tx.name}</td>
          <td class="editable amount-cell" data-id="${tx.id}">$${tx.amount.toFixed(2)}</td>
          <td class="editable category-cell" data-id="${tx.id}">${tx.category}</td>
          <td>${tx.status}</td>
          <td class="editable account-cell" data-id="${tx.id}">${tx.account}</td>
          <td>
            <button class="btn-split" data-id="${tx.id}">Split</button>
            <button class="btn-attach" data-id="${tx.id}">Attach</button>
            <button class="btn-notes" data-id="${tx.id}">Notes</button>
          </td>
        `;
        advancedTxBody.appendChild(row);
      });
    }
  
    // Inline editing
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("editable")) {
        const cell = e.target;
        const txId = cell.dataset.id;
        const originalValue = cell.textContent;
        let inputEl;
  
        if (cell.classList.contains("amount-cell")) {
          // numeric
          inputEl = document.createElement("input");
          inputEl.type = "number";
          inputEl.value = parseFloat(originalValue.replace("$","")) || 0;
        } else if (cell.classList.contains("category-cell") || cell.classList.contains("account-cell")) {
          // select
          inputEl = document.createElement("select");
          let options = [];
          if (cell.classList.contains("category-cell")) {
            options = ["Food","Bills","Entertainment","Income","Debt","Misc"];
          } else {
            options = ["Checking","Savings","Credit Card","Investment","Cash"];
          }
          options.forEach(opt => {
            const optEl = document.createElement("option");
            optEl.value = opt;
            optEl.textContent = opt;
            if (opt === originalValue) optEl.selected = true;
            inputEl.appendChild(optEl);
          });
        } else {
          // text input for name
          inputEl = document.createElement("input");
          inputEl.type = "text";
          inputEl.value = originalValue;
        }
  
        cell.innerHTML = "";
        cell.appendChild(inputEl);
        inputEl.focus();
  
        inputEl.addEventListener("blur", () => {
          const newVal = inputEl.value;
          if (cell.classList.contains("amount-cell")) {
            cell.textContent = `$${parseFloat(newVal).toFixed(2)}`;
          } else {
            cell.textContent = newVal;
          }
          // update advancedTransactions
          const txObj = advancedTransactions.find(t => t.id === parseInt(txId));
          if (txObj) {
            if (cell.classList.contains("name-cell")) txObj.name = newVal;
            if (cell.classList.contains("amount-cell")) txObj.amount = parseFloat(newVal);
            if (cell.classList.contains("category-cell")) txObj.category = newVal;
            if (cell.classList.contains("account-cell")) txObj.account = newVal;
          }
        });
      }
    });
  
    // Split, attach, notes placeholders
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-split")) {
        const id = parseInt(e.target.dataset.id);
        const tx = advancedTransactions.find(t => t.id === id);
        if (tx) {
          alert(`Split transaction placeholder for: ${tx.name}. 
  Open a modal to handle splitting into multiple categories.`);
        }
      }
      if (e.target.classList.contains("btn-attach")) {
        const id = parseInt(e.target.dataset.id);
        const tx = advancedTransactions.find(t => t.id === id);
        if (tx) {
          alert(`Attach receipt placeholder for: ${tx.name}. 
  Open a file dialog or store attachments in tx.attachments array.`);
        }
      }
      if (e.target.classList.contains("btn-notes")) {
        const id = parseInt(e.target.dataset.id);
        const tx = advancedTransactions.find(t => t.id === id);
        if (tx) {
          const note = prompt("Enter notes:", tx.notes || "");
          if (note !== null) tx.notes = note;
        }
      }
    });
  
    // Batch actions
    function getSelectedTxIds() {
      const cbs = document.querySelectorAll(".rowCb:checked");
      return Array.from(cbs).map(cb => parseInt(cb.dataset.id));
    }
    if (batchDeleteBtn) {
      batchDeleteBtn.addEventListener("click", () => {
        const ids = getSelectedTxIds();
        if (!ids.length) return;
        advancedTransactions = advancedTransactions.filter(tx => !ids.includes(tx.id));
        renderAdvancedTx();
      });
    }
    if (batchCategoryBtn) {
      batchCategoryBtn.addEventListener("click", () => {
        const newCat = prompt("Enter new category for selected:");
        if (!newCat) return;
        const ids = getSelectedTxIds();
        advancedTransactions.forEach(tx => {
          if (ids.includes(tx.id)) tx.category = newCat;
        });
        renderAdvancedTx();
      });
    }
    if (batchMarkCompletedBtn) {
      batchMarkCompletedBtn.addEventListener("click", () => {
        const ids = getSelectedTxIds();
        advancedTransactions.forEach(tx => {
          if (ids.includes(tx.id)) tx.status = "Completed";
        });
        renderAdvancedTx();
      });
    }
    if (selectAllCb) {
      selectAllCb.addEventListener("change", () => {
        const cbs = document.querySelectorAll(".rowCb");
        cbs.forEach(cb => cb.checked = selectAllCb.checked);
      });
    }
  
    // Recurring & scheduled placeholders
    function renderRecurring() {
      if (!recurringUl) return;
      recurringUl.innerHTML = "";
      recurringListData.forEach(r => {
        const li = document.createElement("li");
        li.textContent = `${r.name} ($${r.amount}) - ${r.interval} in ${r.account}`;
        recurringUl.appendChild(li);
      });
    }
    function renderScheduled() {
      if (!scheduledUl) return;
      scheduledUl.innerHTML = "";
      scheduledListData.forEach(s => {
        const li = document.createElement("li");
        li.textContent = `${s.name} ($${s.amount}) on ${s.date} in ${s.account}`;
        scheduledUl.appendChild(li);
      });
    }
  
    if (showRecurringBtn) {
      showRecurringBtn.addEventListener("click", () => {
        if (!recurringUl.style.display || recurringUl.style.display === "none") {
          recurringUl.style.display = "block";
        } else {
          recurringUl.style.display = "none";
        }
      });
    }
    if (showScheduledBtn) {
      showScheduledBtn.addEventListener("click", () => {
        if (!scheduledUl.style.display || scheduledUl.style.display === "none") {
          scheduledUl.style.display = "block";
        } else {
          scheduledUl.style.display = "none";
        }
      });
    }
  
    // CSV export/import
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener("click", () => {
        let csv = "Name,Amount,Category,Status,Account,Date\n";
        advancedTransactions.forEach(tx => {
          csv += `${tx.name},${tx.amount},${tx.category},${tx.status},${tx.account},${tx.date}\n`;
        });
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "transactions.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
    if (importCsvBtn && importCsvInput) {
      importCsvBtn.addEventListener("click", () => {
        importCsvInput.click();
      });
      importCsvInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
          const lines = evt.target.result.split("\n");
          // skip header line
          for (let i=1; i<lines.length; i++){
            const line = lines[i].trim();
            if (!line) continue;
            const [name, amount, category, status, account, date] = line.split(",");
            advancedTransactions.push({
              id: Date.now() + i,
              name: name || "Unnamed",
              amount: parseFloat(amount) || 0,
              category: category || "Misc",
              status: status || "Completed",
              account: account || "Checking",
              date: date || new Date().toISOString().slice(0,10),
              attachments: [],
              notes: ""
            });
          }
          renderAdvancedTx();
        };
        reader.readAsText(file);
      });
    }
  
    // Attachments & notes placeholders
    function getSelectedAdvancedTx() {
      const cbs = document.querySelectorAll(".rowCb:checked");
      const ids = Array.from(cbs).map(cb => parseInt(cb.dataset.id));
      return advancedTransactions.filter(tx => ids.includes(tx.id));
    }
    if (attachReceiptBtn) {
      attachReceiptBtn.addEventListener("click", () => {
        const selectedTx = getSelectedAdvancedTx();
        if (!selectedTx.length) return alert("No transactions selected.");
        alert(`Attach receipt placeholder for ${selectedTx.length} transaction(s). 
  Open a file dialog or store attachments in each tx.attachments array.`);
      });
    }
    if (addNotesBtn) {
      addNotesBtn.addEventListener("click", () => {
        const selectedTx = getSelectedAdvancedTx();
        if (!selectedTx.length) return alert("No transactions selected.");
        const note = prompt("Enter notes for selected transactions:", "");
        if (note !== null) {
          selectedTx.forEach(tx => {
            tx.notes = note;
          });
        }
      });
    }
  
    /*****************************************************
     * RENDER EVERYTHING
     *****************************************************/
    function renderEverything() {
      renderAdvancedTx();
  
      // Simple Category Overview chart
      const catOverviewCtx = document.getElementById("categoryOverviewChart");
      const catOverviewLegend = document.getElementById("categoryOverviewLegend");
      if (catOverviewCtx && catOverviewLegend) {
        const catTotals = {};
        advancedTransactions.forEach(tx => {
          const c = tx.category || "Misc";
          catTotals[c] = (catTotals[c] || 0) + Math.abs(tx.amount);
        });
        const labels = Object.keys(catTotals);
        const data = Object.values(catTotals);
  
        if (window.categoryChart) {
          window.categoryChart.destroy();
        }
        window.categoryChart = new Chart(catOverviewCtx, {
          type: "doughnut",
          data: {
            labels,
            datasets: [{
              data,
              backgroundColor: labels.map(() => randomColor()),
              borderWidth: 2,
              hoverOffset: 15
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "35%",
            plugins: {
              legend: { display: true, position: "bottom" }
            }
          }
        });
        catOverviewLegend.innerHTML = labels.map(lbl => {
          return `<span style="color:#444;font-weight:bold">&#11044;</span> ${lbl}`;
        }).join(" &nbsp; ");
      }
  
      // Render recurring & scheduled
      renderRecurring();
      renderScheduled();
    }
  
    renderEverything();
  
    // re-render table on filter changes
    [filterStart, filterEnd, filterCategory, filterAccount].forEach(el => {
      if (el) el.addEventListener("change", renderEverything);
    });
  
    // random color helper
    function randomColor() {
      const r = Math.floor(Math.random()*255);
      const g = Math.floor(Math.random()*255);
      const b = Math.floor(Math.random()*255);
      return `rgb(${r},${g},${b})`;
    }
  });
  