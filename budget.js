/*******************************************************
 * budget.js - Simplified Advanced
 *
 * Single Bar Chart => "Spent vs Allocated"
 * Wizard always accessible via top "Launch Wizard" button
 * Add/Edit/Remove categories
 * No repeated re-renders => no infinite growth
 *******************************************************/
document.addEventListener("DOMContentLoaded", () => {
    /*****************************************************
     * 0) STATE => budgets, wizard data
     *****************************************************/
    let budgets = [];
    let nextID = 1; // for local
    let editID = null;
  
    // Wizard
    let monthlyIncome = 0;
    let recommendedCats = [];
  
    // Chart
    let barChart = null;
  
    /*****************************************************
     * 1) DOM Elements
     *****************************************************/
    const btnLaunchWizard = document.getElementById("btnLaunchWizard");
    const dateRangeSelect = document.getElementById("budgetDateRange");
  
    // Category list
    const categoryListEl = document.getElementById("categoryList");
  
    // Single bar chart
    const budgetBarEl = document.getElementById("spentVsAllocChart");
  
    // Wizard modal
    const wizardModal = document.getElementById("wizardModal");
    const wizardContent = wizardModal.querySelector(".wizard-content");
  
    const wizardStep1 = document.getElementById("wizardStep1");
    const wizardStep2 = document.getElementById("wizardStep2");
    const wizardStep3 = document.getElementById("wizardStep3");
  
    const wizardIncomeInput = document.getElementById("wizardIncome");
    const wizardCatList = document.getElementById("wizardCatList");
    const wizardReviewList = document.getElementById("wizardReviewList");
    const wizardReviewText = document.getElementById("wizardReviewText");
  
    const btnNextStep1 = document.getElementById("btnNextStep1");
    const btnPrevStep2 = document.getElementById("btnPrevStep2");
    const btnNextStep2 = document.getElementById("btnNextStep2");
    const btnPrevStep3 = document.getElementById("btnPrevStep3");
    const btnFinishWizard = document.getElementById("btnFinishWizard");
  
    // We'll create a "Cancel Wizard" button at runtime
    let btnCancelWizard = null;
  
    // Add/Edit modal
    const budgetModal = document.getElementById("budgetModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalCatName = document.getElementById("modalCatName");
    const modalCatAllocated = document.getElementById("modalCatAllocated");
    const modalCatPeriod = document.getElementById("modalCatPeriod");
    const btnSaveBudget = document.getElementById("btnSaveBudget");
    const btnCancelBudget = document.getElementById("btnCancelBudget");
  
    /*****************************************************
     * 2) INIT => load DB, add wizard cancel, render
     *****************************************************/
    async function init() {
      await loadBudgetsFromDB();
  
      addWizardCancelButton();
      renderPage();
    }
  
    async function loadBudgetsFromDB() {
      // e.g. supabase call
      // For local dev:
      budgets = [];
      nextID = 1;
    }
  
    function addWizardCancelButton() {
      btnCancelWizard = document.createElement("button");
      btnCancelWizard.textContent = "Cancel Wizard";
      btnCancelWizard.style.position = "absolute";
      btnCancelWizard.style.top = "10px";
      btnCancelWizard.style.right = "10px";
      btnCancelWizard.style.background = "#f44336";
      btnCancelWizard.style.color = "#fff";
      btnCancelWizard.style.border = "none";
      btnCancelWizard.style.padding = "6px 12px";
      btnCancelWizard.style.borderRadius = "6px";
      btnCancelWizard.style.cursor = "pointer";
      btnCancelWizard.addEventListener("click", closeWizard);
      wizardContent.style.position = "relative";
      wizardContent.appendChild(btnCancelWizard);
    }
  
    /*****************************************************
     * 3) RENDER => categories, chart
     *****************************************************/
    function renderPage() {
      renderCategories();
      renderBarChart();
    }
  
    /*****************************************************
     * 3a) Render Categories => each tile
     *****************************************************/
    function renderCategories() {
      categoryListEl.innerHTML = "";
  
      // Add Budget button
      const addBtn = document.createElement("button");
      addBtn.classList.add("add-budget-btn");
      addBtn.textContent = "+ Add Budget Category";
      addBtn.addEventListener("click", openModalForNew);
      categoryListEl.appendChild(addBtn);
  
      // If no budgets => show message
      if (budgets.length === 0) {
        const msg = document.createElement("p");
        msg.textContent = "No budget categories yet. Add one or launch the wizard!";
        msg.style.marginTop = "10px";
        categoryListEl.appendChild(msg);
        return;
      }
  
      // Otherwise, list each budget
      budgets.forEach(b => {
        const tile = document.createElement("div");
        tile.classList.add("budget-category-tile");
  
        // header
        const header = document.createElement("div");
        header.classList.add("tile-header");
  
        const title = document.createElement("h3");
        title.textContent = b.category || "Untitled";
  
        const iconsDiv = document.createElement("div");
        iconsDiv.classList.add("tile-icons");
  
        // edit
        const editIcon = document.createElement("i");
        editIcon.classList.add("fa", "fa-edit");
        editIcon.title = "Edit Budget";
        editIcon.addEventListener("click", (e) => {
          e.stopPropagation();
          openModalForEdit(b);
        });
  
        // delete
        const delIcon = document.createElement("i");
        delIcon.classList.add("fa", "fa-trash");
        delIcon.title = "Delete Budget";
        delIcon.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (confirm(`Delete ${b.category}?`)) {
            await deleteBudgetFromDB(b.id);
            renderPage();
          }
        });
  
        iconsDiv.appendChild(editIcon);
        iconsDiv.appendChild(delIcon);
  
        header.appendChild(title);
        header.appendChild(iconsDiv);
  
        // stats
        const stats = document.createElement("div");
        stats.classList.add("tile-stats");
  
        const allocatedDiv = document.createElement("div");
        allocatedDiv.innerHTML = `<strong>Allocated</strong> <span>${formatCurrency(b.allocated || 0)}</span>`;
  
        const spentDiv = document.createElement("div");
        spentDiv.innerHTML = `<strong>Spent</strong> <span>${formatCurrency(b.spent || 0)}</span>`;
  
        const remainingVal = (b.allocated || 0) - (b.spent || 0);
        const remainingDiv = document.createElement("div");
        remainingDiv.innerHTML = `<strong>Remaining</strong> <span>${formatCurrency(remainingVal)}</span>`;
  
        stats.appendChild(allocatedDiv);
        stats.appendChild(spentDiv);
        stats.appendChild(remainingDiv);
  
        // progress
        const progressContainer = document.createElement("div");
        progressContainer.classList.add("progress-bar");
  
        const progressFill = document.createElement("div");
        progressFill.classList.add("progress-fill");
  
        const pct = (b.allocated > 0) ? ((b.spent || 0) / b.allocated) * 100 : 0;
        progressFill.style.width = Math.min(pct, 100) + "%";
  
        if (pct >= 100) {
          progressFill.classList.add("danger");
        } else if (pct >= 80) {
          progressFill.classList.add("warning");
        }
  
        progressContainer.appendChild(progressFill);
  
        tile.appendChild(header);
        tile.appendChild(stats);
        tile.appendChild(progressContainer);
  
        categoryListEl.appendChild(tile);
      });
    }
  
    /*****************************************************
     * 3b) Render single bar chart => "Spent vs Allocated"
     *****************************************************/
    function renderBarChart() {
      if (!budgetBarEl) return;
  
      // If no budgets => destroy if existing, skip
      if (budgets.length === 0) {
        if (barChart) {
          barChart.destroy();
          barChart = null;
        }
        return;
      }
  
      // destroy old chart
      if (barChart) {
        barChart.destroy();
        barChart = null;
      }
  
      // data
      const labels = budgets.map(b => b.category);
      const dataAlloc = budgets.map(b => b.allocated || 0);
      const dataSpent = budgets.map(b => b.spent || 0);
  
      const ctx = budgetBarEl.getContext("2d");
      barChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Allocated",
              data: dataAlloc,
              backgroundColor: "rgba(102, 153, 255, 0.7)"
            },
            {
              label: "Spent",
              data: dataSpent,
              backgroundColor: "rgba(255, 99, 132, 0.7)"
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true }
          },
          plugins: {
            legend: { position: "bottom" }
          }
        }
      });
    }
  
    /*****************************************************
     * 4) Wizard => multi-step
     *****************************************************/
    btnLaunchWizard.addEventListener("click", openWizard);
  
    function openWizard() {
      wizardModal.style.display = "flex";
      wizardStep1.style.display = "block";
      wizardStep2.style.display = "none";
      wizardStep3.style.display = "none";
    }
    function closeWizard() {
      wizardModal.style.display = "none";
    }
  
    // We'll create a "Cancel Wizard" button in top-right
    function createRecommendedCats() {
      recommendedCats = [
        { name: "Rent/Mortgage", percent: 30 },
        { name: "Groceries", percent: 10 },
        { name: "Utilities", percent: 5 },
        { name: "Transportation", percent: 10 },
        { name: "Entertainment", percent: 5 },
        { name: "Savings", percent: 10 }
      ];
    }
  
    btnNextStep1.addEventListener("click", () => {
      monthlyIncome = parseFloat(wizardIncomeInput.value) || 0;
      wizardStep1.style.display = "none";
      wizardStep2.style.display = "block";
      wizardCatList.innerHTML = "";
      createRecommendedCats();
      recommendedCats.forEach((rc, i) => {
        const row = document.createElement("div");
        row.style.marginBottom = "6px";
        const defAlloc = (monthlyIncome * (rc.percent / 100)).toFixed(2);
        row.innerHTML = `
          <label>
            ${rc.name}
            <input type="number" value="${defAlloc}" data-index="${i}" style="margin-left:6px; width:80px;" />
          </label>
        `;
        wizardCatList.appendChild(row);
      });
    });
  
    btnPrevStep2.addEventListener("click", () => {
      wizardStep2.style.display = "none";
      wizardStep1.style.display = "block";
    });
    btnNextStep2.addEventListener("click", () => {
      const inputs = wizardCatList.querySelectorAll("input[type='number']");
      inputs.forEach(inp => {
        const idx = parseInt(inp.getAttribute("data-index"));
        recommendedCats[idx].amount = parseFloat(inp.value) || 0;
      });
      wizardStep2.style.display = "none";
      wizardStep3.style.display = "block";
      wizardReviewList.innerHTML = "";
      wizardReviewText.textContent = `Based on your monthly income of $${monthlyIncome}, here's your initial budget:`;
      recommendedCats.forEach(rc => {
        const row = document.createElement("p");
        row.textContent = `${rc.name}: $${rc.amount.toFixed(2)}`;
        wizardReviewList.appendChild(row);
      });
    });
  
    btnPrevStep3.addEventListener("click", () => {
      wizardStep3.style.display = "none";
      wizardStep2.style.display = "block";
    });
    btnFinishWizard.addEventListener("click", async () => {
      for (let rc of recommendedCats) {
        const newBudget = {
          category: rc.name,
          allocated: rc.amount,
          spent: 0,
          period: "monthly"
        };
        await saveBudgetToDB(newBudget);
      }
      closeWizard();
      renderPage();
    });
  
    // add a "Cancel Wizard" button at runtime
    function addWizardCancelButton() {
      const btnCancel = document.createElement("button");
      btnCancel.textContent = "Cancel Wizard";
      btnCancel.style.position = "absolute";
      btnCancel.style.top = "10px";
      btnCancel.style.right = "10px";
      btnCancel.style.background = "#f44336";
      btnCancel.style.color = "#fff";
      btnCancel.style.border = "none";
      btnCancel.style.padding = "6px 12px";
      btnCancel.style.borderRadius = "6px";
      btnCancel.style.cursor = "pointer";
      btnCancel.addEventListener("click", closeWizard);
      wizardContent.style.position = "relative";
      wizardContent.appendChild(btnCancel);
    }
  
    /*****************************************************
     * 5) Add/Edit Budget Modal
     *****************************************************/
    function openModalForNew() {
      editID = null;
      modalTitle.textContent = "Add Budget Category";
      modalCatName.value = "";
      modalCatAllocated.value = "";
      modalCatPeriod.value = "monthly";
      budgetModal.style.display = "flex";
    }
  
    function openModalForEdit(b) {
      editID = b.id;
      modalTitle.textContent = "Edit Budget Category";
      modalCatName.value = b.category || "";
      modalCatAllocated.value = b.allocated || 0;
      modalCatPeriod.value = b.period || "monthly";
      budgetModal.style.display = "flex";
    }
  
    btnSaveBudget.addEventListener("click", async () => {
      const catName = modalCatName.value.trim() || "Untitled";
      const allocatedVal = parseFloat(modalCatAllocated.value) || 0;
      const periodVal = modalCatPeriod.value;
  
      if (editID) {
        let existing = budgets.find(b => b.id === editID);
        if (existing) {
          existing.category = catName;
          existing.allocated = allocatedVal;
          existing.period = periodVal;
          // spent stays the same
          await updateBudgetInDB(existing);
        }
        editID = null;
      } else {
        const newB = {
          category: catName,
          allocated: allocatedVal,
          spent: 0,
          period: periodVal
        };
        await saveBudgetToDB(newB);
      }
      closeBudgetModal();
      renderPage();
    });
  
    btnCancelBudget.addEventListener("click", () => {
      closeBudgetModal();
    });
  
    budgetModal.addEventListener("click", (e) => {
      if (e.target === budgetModal) {
        closeBudgetModal();
      }
    });
  
    function closeBudgetModal() {
      budgetModal.style.display = "none";
    }
  
    /*****************************************************
     * 6) HELPER + Start
     *****************************************************/
    dateRangeSelect.addEventListener("change", () => {
      console.log("Date range changed:", dateRangeSelect.value);
      // e.g. re-fetch budgets for that range
    });
  
    function formatCurrency(num) {
      return `$${(num || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
  
    init();
  });
  