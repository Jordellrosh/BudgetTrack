document.addEventListener("DOMContentLoaded", async () => {
    // ====== SUPABASE INIT (Use your real credentials) ======
    const supabaseUrl = 'YOUR_SUPABASE_URL';
    const supabaseKey = 'YOUR_SUPABASE_KEY';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  
    // DOM references
    const totalAllocatedEl = document.getElementById("totalAllocated");
    const totalSpentEl = document.getElementById("totalSpent");
    const categoryList = document.getElementById("categoryList");
    const detailContent = document.getElementById("detailContent");
    const btnAddCategory = document.getElementById("btnAddCategory");
  
    // Wizard
    const wizardModal = document.getElementById("wizardModal");
    const wizardErrorMsg = document.getElementById("wizardErrorMsg");
    const stepCircles = document.querySelectorAll(".step-circle");
    const step1 = document.querySelector(".step-1");
    const step2 = document.querySelector(".step-2");
    const wizardCancelBtn1 = document.getElementById("wizardCancelBtn1");
    const wizardNextBtn1 = document.getElementById("wizardNextBtn1");
    const wizardBackBtn2 = document.getElementById("wizardBackBtn2");
    const wizardFinishBtn = document.getElementById("wizardFinishBtn");
  
    const categoryNameInput = document.getElementById("categoryName");
    const allocatedAmountInput = document.getElementById("allocatedAmount");
    const iconGrid = document.getElementById("iconGrid");
    let selectedIcon = null;
    let currentStep = 1;
  
    // Edit
    const editModal = document.getElementById("editModal");
    const editErrorMsg = document.getElementById("editErrorMsg");
    const editCategoryNameInput = document.getElementById("editCategoryName");
    const editAllocatedAmountInput = document.getElementById("editAllocatedAmount");
    const editCancelBtn = document.getElementById("editCancelBtn");
    const editSaveBtn = document.getElementById("editSaveBtn");
    let editCategoryId = null;
  
    // Delete
    const deleteModal = document.getElementById("deleteModal");
    const deleteMessage = document.getElementById("deleteMessage");
    const deleteCancelBtn = document.getElementById("deleteCancelBtn");
    const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");
    let deleteCategoryId = null;
  
    // State
    let categories = [];
    let transactions = [];
  
    // ===========================
    // LOAD DATA
    // ===========================
    async function loadData() {
      // categories
      const { data: catData, error: catError } = await supabase
        .from("Category")
        .select("*");
      if (catError) {
        console.error("Error loading categories:", catError);
        categories = [];
      } else {
        categories = catData || [];
      }
  
      // transactions
      const { data: txData, error: txError } = await supabase
        .from("Transaction")
        .select("*");
      if (txError) {
        console.error("Error loading transactions:", txError);
        transactions = [];
      } else {
        transactions = txData || [];
      }
  
      renderSummary();
      renderCategories();
    }
  
    // ===========================
    // RENDER SUMMARY
    // ===========================
    function renderSummary() {
      let totalAllocated = 0;
      let totalSpent = 0;
  
      categories.forEach(cat => {
        totalAllocated += cat.allocated || 0;
        let catSpent = 0;
        transactions.forEach(tx => {
          if (tx.category_id === cat.id) {
            catSpent += Math.abs(tx.amount);
          }
        });
        totalSpent += catSpent;
      });
  
      totalAllocatedEl.textContent = `$${totalAllocated.toFixed(2)}`;
      totalSpentEl.textContent = `$${totalSpent.toFixed(2)}`;
    }
  
    // ===========================
    // RENDER CATEGORIES
    // ===========================
    function renderCategories() {
      categoryList.innerHTML = "";
      if (categories.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No categories yet.";
        li.style.opacity = "0.7";
        categoryList.appendChild(li);
        return;
      }
  
      categories.forEach(cat => {
        const li = document.createElement("li");
        li.classList.add("category-item");
  
        const infoDiv = document.createElement("div");
        infoDiv.classList.add("category-info");
  
        const nameEl = document.createElement("div");
        nameEl.classList.add("category-name");
        nameEl.textContent = cat.name;
        if (cat.icon) {
          nameEl.innerHTML = `<i class="${cat.icon}" style="margin-right:6px;"></i>` + nameEl.textContent;
        }
  
        const allocEl = document.createElement("div");
        allocEl.classList.add("category-allocated");
        allocEl.textContent = `Allocated: $${(cat.allocated||0).toFixed(2)}`;
  
        infoDiv.appendChild(nameEl);
        infoDiv.appendChild(allocEl);
  
        // actions
        const actionsDiv = document.createElement("div");
        actionsDiv.classList.add("category-actions");
  
        const editIcon = document.createElement("i");
        editIcon.classList.add("fa", "fa-pen");
        editIcon.title = "Edit Category";
        editIcon.addEventListener("click", (e)=>{
          e.stopPropagation();
          openEditModal(cat);
        });
  
        const trashIcon = document.createElement("i");
        trashIcon.classList.add("fa", "fa-trash");
        trashIcon.title = "Delete Category";
        trashIcon.addEventListener("click", (e)=>{
          e.stopPropagation();
          openDeleteModal(cat);
        });
  
        actionsDiv.appendChild(editIcon);
        actionsDiv.appendChild(trashIcon);
  
        li.appendChild(infoDiv);
        li.appendChild(actionsDiv);
  
        li.addEventListener("click", ()=>showCategoryDetail(cat));
        categoryList.appendChild(li);
      });
    }
  
    // ===========================
    // SHOW CATEGORY DETAIL
    // ===========================
    function showCategoryDetail(cat) {
      detailContent.innerHTML = `<h2>${cat.name} Details</h2>`;
  
      let spent = 0;
      const catTx = transactions.filter(tx => tx.category_id === cat.id);
      catTx.forEach(tx => {
        spent += Math.abs(tx.amount);
      });
  
      const allocated = cat.allocated || 0;
      const usedPercent = allocated > 0 ? (spent / allocated)*100 : 0;
      const clamped = Math.min(usedPercent, 100);
  
      // stats
      const statsDiv = document.createElement("div");
      statsDiv.classList.add("spent-stats");
      statsDiv.innerHTML = `
        <span>Allocated: $${allocated.toFixed(2)}</span>
        <span>Spent: $${spent.toFixed(2)}</span>
      `;
      detailContent.appendChild(statsDiv);
  
      // progress bar
      const progBar = document.createElement("div");
      progBar.classList.add("spent-progress");
      const fill = document.createElement("div");
      fill.classList.add("spent-fill");
      fill.style.width = `${clamped}%`;
  
      // color if over 100%
      if (usedPercent >= 100) {
        fill.style.background = "linear-gradient(90deg, #ff4444, #ff8888)";
      }
      progBar.appendChild(fill);
      detailContent.appendChild(progBar);
  
      // If category has notes or other fields, show them (optional)
      if (cat.notes) {
        const p = document.createElement("p");
        p.textContent = `Notes: ${cat.notes}`;
        p.style.opacity = "0.8";
        detailContent.appendChild(p);
      }
  
      // transactions table
      if (catTx.length > 0) {
        const txTable = document.createElement("table");
        txTable.classList.add("transaction-table");
        txTable.innerHTML = `
          <thead>
            <tr><th>Amount</th><th>Date</th></tr>
          </thead>
          <tbody></tbody>
        `;
        const tbody = txTable.querySelector("tbody");
        catTx.forEach(tx => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>$${Math.abs(tx.amount).toFixed(2)}</td>
            <td>${tx.date ? new Date(tx.date).toLocaleDateString() : "--"}</td>
          `;
          tbody.appendChild(row);
        });
        detailContent.appendChild(txTable);
      } else {
        const noTx = document.createElement("p");
        noTx.textContent = "No transactions for this category.";
        noTx.style.opacity = "0.7";
        detailContent.appendChild(noTx);
      }
    }
  
    // ===========================
    // ADD CATEGORY (2-step wizard)
    // ===========================
    btnAddCategory.addEventListener("click", openWizard);
    function openWizard() {
      wizardModal.classList.add("show");
      currentStep = 1;
      selectedIcon = null;
      categoryNameInput.value = "";
      allocatedAmountInput.value = "";
      wizardErrorMsg.style.display = "none";
      updateWizardStep();
    }
    function closeWizard() {
      wizardModal.classList.remove("show");
    }
    function updateWizardStep() {
      stepCircles.forEach(sc => {
        const s = parseInt(sc.getAttribute("data-step"));
        sc.classList.toggle("active", s===currentStep);
      });
      step1.style.display = (currentStep===1) ? "block" : "none";
      step2.style.display = (currentStep===2) ? "block" : "none";
    }
    function showWizardError(msg) {
      wizardErrorMsg.textContent = msg;
      wizardErrorMsg.style.display = "block";
    }
  
    wizardCancelBtn1.addEventListener("click", closeWizard);
    wizardNextBtn1.addEventListener("click", () => {
      const nameVal = categoryNameInput.value.trim();
      const allocVal = parseFloat(allocatedAmountInput.value) || 0;
      if (!nameVal || allocVal<=0) {
        showWizardError("Please enter a valid name and allocated amount.");
        return;
      }
      wizardErrorMsg.style.display = "none";
      currentStep = 2;
      updateWizardStep();
    });
    wizardBackBtn2.addEventListener("click", () => {
      currentStep = 1;
      updateWizardStep();
    });
    wizardFinishBtn.addEventListener("click", async () => {
      const nameVal = categoryNameInput.value.trim();
      const allocVal = parseFloat(allocatedAmountInput.value) || 0;
      if (!nameVal || allocVal<=0) {
        showWizardError("Please enter valid name and allocated amount.");
        return;
      }
      // Insert into DB
      const { error } = await supabase
        .from("Category")
        .insert([{ name: nameVal, allocated: allocVal, icon: selectedIcon }]);
      if (error) {
        console.error("Error adding category:", error);
        showWizardError("Error adding category. Check console for details.");
        return;
      }
      closeWizard();
      await loadData();
    });
  
    // ICON GRID
    const iconOptions = [
      { class:"fa fa-utensils", label:"Food" },
      { class:"fa fa-home", label:"Home" },
      { class:"fa fa-bolt", label:"Utilities" },
      { class:"fa fa-car", label:"Car" },
      { class:"fa fa-heart", label:"Health" },
      { class:"fa fa-film", label:"Entertainment" },
      { class:"fa fa-shopping-cart", label:"Shopping" },
      { class:"fa fa-ellipsis-h", label:"Misc" }
    ];
    function renderIconGrid() {
      iconGrid.innerHTML = "";
      iconOptions.forEach(opt => {
        const div = document.createElement("div");
        div.classList.add("icon-option");
        div.innerHTML = `<i class="${opt.class}" style="font-size:24px;"></i>`;
        div.title = opt.label;
        div.addEventListener("click", ()=>{
          document.querySelectorAll(".icon-option").forEach(el=>el.classList.remove("selected"));
          div.classList.add("selected");
          selectedIcon = opt.class;
        });
        iconGrid.appendChild(div);
      });
    }
    renderIconGrid();
  
    // ===========================
    // EDIT CATEGORY
    // ===========================
    function openEditModal(cat) {
      editModal.classList.add("show");
      editCategoryId = cat.id;
      editErrorMsg.style.display = "none";
      editCategoryNameInput.value = cat.name;
      editAllocatedAmountInput.value = cat.allocated;
    }
    function closeEditModal() {
      editModal.classList.remove("show");
    }
    editSaveBtn.addEventListener("click", async ()=>{
      const newName = editCategoryNameInput.value.trim();
      const newAlloc = parseFloat(editAllocatedAmountInput.value) || 0;
      if(!newName || newAlloc<=0) {
        editErrorMsg.textContent = "Please enter a valid name and allocated amount.";
        editErrorMsg.style.display = "block";
        return;
      }
      const { error } = await supabase
        .from("Category")
        .update({ name: newName, allocated: newAlloc })
        .eq("id", editCategoryId);
      if(error) {
        console.error("Error updating category:", error);
        editErrorMsg.textContent = "Error updating category. Check console.";
        editErrorMsg.style.display = "block";
        return;
      }
      closeEditModal();
      loadData();
    });
    editCancelBtn.addEventListener("click", closeEditModal);
  
    // ===========================
    // DELETE CATEGORY
    // ===========================
    function openDeleteModal(cat) {
      deleteModal.classList.add("show");
      deleteCategoryId = cat.id;
      deleteMessage.textContent = `Are you sure you want to delete "${cat.name}"?`;
    }
    function closeDeleteModal() {
      deleteModal.classList.remove("show");
    }
    deleteConfirmBtn.addEventListener("click", async ()=>{
      if(!deleteCategoryId) return;
      const { error } = await supabase
        .from("Category")
        .delete()
        .eq("id", deleteCategoryId);
      if(error) {
        console.error("Error deleting category:", error);
        return;
      }
      closeDeleteModal();
      loadData();
    });
    deleteCancelBtn.addEventListener("click", closeDeleteModal);
  
    // ===========================
    // BACKDROP CLOSE
    // ===========================
    window.addEventListener("click", (e) => {
      if (e.target===wizardModal) closeWizard();
      if (e.target===editModal) closeEditModal();
      if (e.target===deleteModal) closeDeleteModal();
    });
  
    // ===========================
    // INIT
    // ===========================
    await loadData();
  });
  