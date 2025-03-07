document.addEventListener("DOMContentLoaded", () => {
    /*****************************************************
     * 0) ACCOUNTS => now each account gets an ID
     *****************************************************/
    let allAccounts = [];
    let nextID = 1; // increment for each new account
  
    let currentCategory = "All";
    const categoryList = ["Bank", "Cash", "Credit", "Investment", "Custom"];
  
    // DOM refs
    const allViewContainer = document.getElementById("allViewContainer");
    const accountsGrid = document.getElementById("accountsGrid");
    const tabs = document.querySelectorAll(".tabs .tab");
  
    // Add/Edit Modal
    const addAccountModal = document.getElementById("addAccountModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalAccName = document.getElementById("modalAccName");
    const modalAccBalance = document.getElementById("modalAccBalance");
    const modalAccCurrency = document.getElementById("modalAccCurrency");
    const modalAccCategory = document.getElementById("modalAccCategory");
    const modalAccLastTx = document.getElementById("modalAccLastTx");
    const modalAccCardType = document.getElementById("modalAccCardType");
    const modalAccBrand = document.getElementById("modalAccBrand");
    const modalAccNumber = document.getElementById("modalAccNumber");
    const modalAccExp = document.getElementById("modalAccExp");
    const modalAccHolder = document.getElementById("modalAccHolder");
  
    const btnSaveAccount = document.getElementById("btnSaveAccount");
    const btnCancelAccount = document.getElementById("btnCancelAccount");
  
    // Detail Modal
    const accountDetailModal = document.getElementById("accountDetailModal");
    const detailAccountInfo = document.getElementById("detailAccountInfo");
    const btnEditAccount = document.getElementById("btnEditAccount");
    const btnDeleteAccount = document.getElementById("btnDeleteAccount");
    const closeDetailModalBtn = document.getElementById("closeDetailModal");
  
    // We'll store which account is currently being edited
    let editID = null; // if set, we are in "edit" mode
  
    /*****************************************************
     * 1) RENDER => "All" or single category
     *****************************************************/
    function renderAccounts() {
      if (currentCategory === "All") {
        accountsGrid.style.display = "none";
        allViewContainer.style.display = "block";
        renderAllGrouped();
      } else {
        accountsGrid.style.display = "grid";
        allViewContainer.style.display = "none";
        renderSingleCategory(currentCategory);
      }
    }
  
    /*****************************************************
     * 2) RENDER => "All" => group by category
     *****************************************************/
    function renderAllGrouped() {
      allViewContainer.innerHTML = "";
      categoryList.forEach(cat => {
        const catAccounts = allAccounts.filter(a => a.category === cat);
        if (catAccounts.length === 0) return;
  
        const heading = document.createElement("h2");
        heading.textContent = cat + " Accounts";
  
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("accounts-grid");
  
        catAccounts.forEach(acc => {
          rowDiv.appendChild(createAccountItem(acc));
        });
  
        allViewContainer.appendChild(heading);
        allViewContainer.appendChild(rowDiv);
      });
    }
  
    /*****************************************************
     * 3) RENDER => single category
     *****************************************************/
    function renderSingleCategory(cat) {
      const catAccounts = allAccounts.filter(a => a.category === cat);
      accountsGrid.innerHTML = "";
      catAccounts.forEach(acc => {
        accountsGrid.appendChild(createAccountItem(acc));
      });
    }
  
    /*****************************************************
     * 4) CREATE ACCOUNT ITEM => either card or tile
     *****************************************************/
    function createAccountItem(acc) {
      const isCard = (acc.cardType === "credit" || acc.cardType === "debit");
      const wrapper = isCard ? createCreditDebitCard(acc) : createTile(acc);
  
      // HOVER TOOLTIP => summary
      const tooltip = document.createElement("div");
      tooltip.classList.add("account-tooltip");
      tooltip.innerHTML = getAccountTooltip(acc);
      wrapper.appendChild(tooltip);
  
      // CLICK => open detail modal
      wrapper.addEventListener("click", () => {
        openAccountDetail(acc);
      });
  
      return wrapper;
    }
  
    /*****************************************************
     * 4a) Create a credit/debit card
     *****************************************************/
    function createCreditDebitCard(acc) {
      const wrapper = document.createElement("div");
      wrapper.classList.add("account-item", "card-style");
  
      // brand detection
      let brandClass = "other";
      if (/visa/i.test(acc.brand)) {
        brandClass = "visa";
      } else if (/mastercard/i.test(acc.brand)) {
        brandClass = "mastercard";
      } else if (/discover/i.test(acc.brand)) {
        brandClass = "discover";
      }
  
      wrapper.classList.add(`brand-${brandClass}`);
      if (acc.cardType === "credit") {
        wrapper.classList.add("credit");
      } else {
        wrapper.classList.add("debit");
      }
  
      // Build the card content
      wrapper.innerHTML = `
        <div class="card-bg"></div>
        <div class="card-content">
          <div class="card-logo">
            <img src="assets/${brandClass === 'mastercard' ? 'ma_symbol.svg' : brandClass + '.png'}" alt="${brandClass} logo" />
          </div>
          <!-- If you want no chip for debit, conditionally remove it. For now, we show it. -->
          <div class="card-chip"><img src="assets/chip.png" alt="Chip" /></div>
  
          <div class="card-number">${acc.cardNumber || "**** **** **** 1234"}</div>
  
          <div class="card-label-holder">Cardholder</div>
          <div class="card-holder">${acc.holderName || "John Doe"}</div>
  
          <div class="card-label-exp">Expires</div>
          <div class="card-expiration">${acc.expiration || "MM/YY"}</div>
        </div>
      `;
      return wrapper;
    }
  
    /*****************************************************
     * 4b) Create a simpler tile
     *****************************************************/
    function createTile(acc) {
      const wrapper = document.createElement("div");
      wrapper.classList.add("account-item", "tile-style");
  
      // color-coded background by category
      let tileClass = "other";
      if (/bank/i.test(acc.category)) tileClass = "bank";
      else if (/cash/i.test(acc.category)) tileClass = "cash";
      else if (/investment/i.test(acc.category)) tileClass = "investment";
      else if (/custom/i.test(acc.category)) tileClass = "custom";
  
      wrapper.classList.add(`tile-${tileClass}`);
  
      // Format balance
      const formattedBalance = formatNumber(acc.balance);
      // Format last transaction
      const formattedTx = formatLastTransaction(acc.lastTx || "N/A");
  
      const labelDiv = document.createElement("div");
      labelDiv.classList.add("tile-label");
      labelDiv.textContent = acc.name || "Untitled";
  
      const balanceDiv = document.createElement("div");
      balanceDiv.classList.add("tile-balance");
      balanceDiv.textContent = `${acc.currency} ${formattedBalance}`;
  
      const lastTxDiv = document.createElement("div");
      lastTxDiv.classList.add("tile-lastTx");
      lastTxDiv.textContent = formattedTx;
  
      wrapper.appendChild(labelDiv);
      wrapper.appendChild(balanceDiv);
      wrapper.appendChild(lastTxDiv);
  
      return wrapper;
    }
  
    /*****************************************************
     * 4c) Tooltip content
     *****************************************************/
    function getAccountTooltip(acc) {
      const formattedBalance = formatNumber(acc.balance);
      const formattedTx = formatLastTransaction(acc.lastTx || "N/A");
      return `
        <strong>${acc.category} Account</strong><br/>
        Balance: ${acc.currency} ${formattedBalance}<br/>
        Last Tx: ${formattedTx}
      `;
    }
  
    /*****************************************************
     * 5) TABS => switch category
     *****************************************************/
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        if (tab.id === "btnAddNew") {
          openModalForNew();
          return;
        }
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentCategory = tab.dataset.category;
        renderAccounts();
      });
    });
  
    /*****************************************************
     * 6) ADD/EDIT MODAL
     *****************************************************/
    function openModalForNew() {
      editID = null; // not editing, we're adding
      modalTitle.textContent = "Add New Account";
  
      modalAccName.value = "";
      modalAccBalance.value = "";
      modalAccCurrency.value = "USD";
      modalAccCategory.value = "Bank";
      modalAccLastTx.value = "";
  
      modalAccCardType.value = "";
      modalAccBrand.value = "";
      modalAccNumber.value = "";
      modalAccExp.value = "";
      modalAccHolder.value = "";
  
      addAccountModal.style.display = "flex";
    }
  
    function openModalForEdit(acc) {
      editID = acc.id;
      modalTitle.textContent = "Edit Account";
  
      modalAccName.value = acc.name;
      modalAccBalance.value = acc.balance;
      modalAccCurrency.value = acc.currency;
      modalAccCategory.value = acc.category;
      modalAccLastTx.value = acc.lastTx;
  
      modalAccCardType.value = acc.cardType || "";
      modalAccBrand.value = acc.brand || "";
      modalAccNumber.value = acc.cardNumber || "";
      modalAccExp.value = acc.expiration || "";
      modalAccHolder.value = acc.holderName || "";
  
      addAccountModal.style.display = "flex";
    }
  
    function closeModal() {
      addAccountModal.style.display = "none";
    }
  
    btnSaveAccount.addEventListener("click", () => {
      // Gather input
      const nameVal = modalAccName.value.trim() || "Untitled";
      const balVal = parseFloat(modalAccBalance.value) || 0;
      const curVal = modalAccCurrency.value;
      const catVal = modalAccCategory.value;
      const lastTxVal = modalAccLastTx.value.trim() || "N/A";
  
      const cardTypeVal = modalAccCardType.value; // "credit", "debit", or ""
      const brandVal = modalAccBrand.value;
      const cardNumVal = modalAccNumber.value.trim();
      const expVal = modalAccExp.value.trim();
      const holderVal = modalAccHolder.value.trim();
  
      if (editID) {
        // EDIT MODE => update existing
        const idx = allAccounts.findIndex(a => a.id === editID);
        if (idx > -1) {
          allAccounts[idx].name = nameVal;
          allAccounts[idx].balance = balVal;
          allAccounts[idx].currency = curVal;
          allAccounts[idx].category = catVal;
          allAccounts[idx].lastTx = lastTxVal;
  
          allAccounts[idx].cardType = cardTypeVal;
          allAccounts[idx].brand = brandVal;
          allAccounts[idx].cardNumber = cardNumVal;
          allAccounts[idx].expiration = expVal;
          allAccounts[idx].holderName = holderVal;
        }
        editID = null;
      } else {
        // ADD MODE => create new
        const newAcc = {
          id: nextID++,
          name: nameVal,
          balance: balVal,
          currency: curVal,
          category: catVal,
          lastTx: lastTxVal,
  
          cardType: cardTypeVal,
          brand: brandVal,
          cardNumber: cardNumVal,
          expiration: expVal,
          holderName: holderVal
        };
        allAccounts.push(newAcc);
      }
  
      closeModal();
      currentCategory = catVal;
      // re-select the tab
      tabs.forEach(t => {
        if (t.dataset.category === catVal) {
          tabs.forEach(x => x.classList.remove("active"));
          t.classList.add("active");
        }
      });
      renderAccounts();
    });
  
    btnCancelAccount.addEventListener("click", () => {
      closeModal();
    });
    addAccountModal.addEventListener("click", e => {
      if (e.target === addAccountModal) {
        closeModal();
      }
    });
  
    /*****************************************************
     * 7) DETAIL MODAL => open on click, with Edit & Delete
     *****************************************************/
    let currentDetailID = null; // track which account is shown in detail modal
  
    function openAccountDetail(acc) {
      currentDetailID = acc.id; // store so we can edit/delete
      detailAccountInfo.innerHTML = getAccountDetailHTML(acc);
      accountDetailModal.style.display = "flex";
    }
  
    function getAccountDetailHTML(acc) {
      const formattedBalance = formatNumber(acc.balance);
      const formattedTx = formatLastTransaction(acc.lastTx || "N/A");
  
      let html = `
        <strong>ID:</strong> ${acc.id}<br/>
        <strong>Name:</strong> ${acc.name}<br/>
        <strong>Category:</strong> ${acc.category}<br/>
        <strong>Balance:</strong> ${acc.currency} ${formattedBalance}<br/>
        <strong>Last Transaction:</strong> ${formattedTx}<br/>
      `;
      if (acc.cardType) {
        html += `
          <strong>Card Type:</strong> ${acc.cardType}<br/>
          <strong>Brand:</strong> ${acc.brand}<br/>
          <strong>Card Number:</strong> ${acc.cardNumber}<br/>
          <strong>Cardholder:</strong> ${acc.holderName}<br/>
          <strong>Expires:</strong> ${acc.expiration}<br/>
        `;
      }
      return html;
    }
  
    if (closeDetailModalBtn) {
      closeDetailModalBtn.addEventListener("click", () => {
        accountDetailModal.style.display = "none";
      });
    }
    accountDetailModal.addEventListener("click", e => {
      if (e.target === accountDetailModal) {
        accountDetailModal.style.display = "none";
      }
    });
  
    /*****************************************************
     * 8) EDIT & DELETE from Detail Modal
     *****************************************************/
    btnEditAccount.addEventListener("click", () => {
      if (currentDetailID == null) return;
      const acc = allAccounts.find(a => a.id === currentDetailID);
      if (!acc) return;
      accountDetailModal.style.display = "none";
      openModalForEdit(acc);
    });
  
    btnDeleteAccount.addEventListener("click", () => {
      if (currentDetailID == null) return;
      const idx = allAccounts.findIndex(a => a.id === currentDetailID);
      if (idx > -1) {
        allAccounts.splice(idx, 1);
      }
      accountDetailModal.style.display = "none";
      renderAccounts();
    });
  
    /*****************************************************
     * 9) UTILITY: Format numbers & lastTx
     *****************************************************/
    function formatNumber(num) {
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    function formatLastTransaction(tx) {
      if (!/\d/.test(tx)) return tx;
      const match = tx.match(/([+-]?\d+(\.\d+)?)/);
      if (!match) return tx;
      const numericStr = match[1];
      const prefix = numericStr.startsWith("+") ? "+" : (numericStr.startsWith("-") ? "-" : "");
      const rawNum = parseFloat(numericStr.replace(/[+-]/, "")) || 0;
      const withCommas = rawNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return tx.replace(numericStr, prefix + withCommas);
    }
  
    /*****************************************************
     * 10) INITIAL RENDER
     *****************************************************/
    renderAccounts();
  });
  