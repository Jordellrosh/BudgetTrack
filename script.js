// Same budgeting logic as before.
// Just copy-paste if you already have a version you like.

let transactions = [];

function addTransaction() {
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;

  if (!desc || isNaN(amount)) {
    alert("Please enter a valid description and amount.");
    return;
  }

  let transaction = { desc, amount, type };
  transactions.push(transaction);
  updateUI();

  // Clear form fields
  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("type").value = "income";
}

function updateUI() {
  let balance = 0;
  let income = 0;
  let expenses = 0;

  const list = document.getElementById("transaction-list");
  list.innerHTML = "";

  // Calculate totals
  transactions.forEach((t) => {
    if (t.type === "income") {
      income += t.amount;
      balance += t.amount;
    } else {
      expenses += t.amount;
      balance -= t.amount;
    }
  });

  // Update summary bubbles
  document.getElementById("balance").textContent = `$${balance.toFixed(2)}`;
  document.getElementById("income").textContent = `$${income.toFixed(2)}`;
  document.getElementById("expenses").textContent = `$${expenses.toFixed(2)}`;

  // Populate recent transactions
  transactions.forEach((t) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${t.desc} - <strong>$${t.amount.toFixed(2)}</strong></span>
      <span>${t.type === "income" ? "Income" : "Expense"}</span>
    `;
    list.appendChild(li);
  });
}
