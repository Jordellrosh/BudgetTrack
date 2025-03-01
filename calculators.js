document.addEventListener("DOMContentLoaded", () => {
    // =========== TAB SWITCHING ===========
    const tabButtons = document.querySelectorAll(".calc-tab");
    const tabContents = document.querySelectorAll(".calc-content");
  
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        // remove active from all
        tabButtons.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));
        // add active to clicked
        btn.classList.add("active");
        const tabId = btn.getAttribute("data-tab");
        document.getElementById(tabId).classList.add("active");
      });
    });
  
    // =========== BASIC CALCULATOR ===========
    // We'll create the numeric/operation buttons dynamically
    const basicCalcButtons = document.querySelector(".basic-calc-buttons");
    const basicCalcDisplay = document.getElementById("basicCalcDisplay");
    const calcSymbols = [
      "7","8","9","/",
      "4","5","6","*",
      "1","2","3","-",
      "0",".","C","+",
      "="
    ];
    let basicCalcExpression = "";
  
    calcSymbols.forEach(sym => {
      const btn = document.createElement("button");
      btn.textContent = sym;
      btn.addEventListener("click", () => handleBasicCalcInput(sym));
      basicCalcButtons.appendChild(btn);
    });
  
    function handleBasicCalcInput(symbol) {
      if(symbol === "C") {
        basicCalcExpression = "";
        basicCalcDisplay.value = "";
        return;
      }
      if(symbol === "=") {
        try {
          const result = eval(basicCalcExpression); // caution: eval for quick demo
          basicCalcDisplay.value = result;
          basicCalcExpression = String(result);
        } catch(e) {
          basicCalcDisplay.value = "Error";
        }
        return;
      }
      // append symbol
      basicCalcExpression += symbol;
      basicCalcDisplay.value = basicCalcExpression;
    }
  
    // =========== CAR LOAN CALCULATOR ===========
    // Using Jamaican data => interest ~8-12% typical, up to 7-10 yrs
    const carLoanCalcBtn = document.getElementById("carLoanCalcBtn");
    const carLoanMonthly = document.getElementById("carLoanMonthly");
    const carLoanTotalInterest = document.getElementById("carLoanTotalInterest");
  
    if(carLoanCalcBtn) {
      carLoanCalcBtn.addEventListener("click", () => {
        const amount = parseFloat(document.getElementById("carLoanAmount").value) || 0;
        const annualRate = parseFloat(document.getElementById("carLoanRate").value) || 0;
        const years = parseFloat(document.getElementById("carLoanTerm").value) || 0;
  
        // monthly interest rate
        const monthlyRate = (annualRate / 100) / 12;
        const n = years * 12;
        if(monthlyRate === 0 || n === 0) {
          carLoanMonthly.textContent = "Monthly Payment: -";
          carLoanTotalInterest.textContent = "Total Interest: -";
          return;
        }
        // formula for monthly payment (amortized):
        // M = P * (r(1+r)^n) / ((1+r)^n - 1)
        const monthlyPayment = amount * (monthlyRate * Math.pow((1+monthlyRate), n)) / (Math.pow((1+monthlyRate), n) - 1);
        const totalPaid = monthlyPayment * n;
        const totalInterest = totalPaid - amount;
  
        carLoanMonthly.textContent = `Monthly Payment: J$${monthlyPayment.toFixed(2)}`;
        carLoanTotalInterest.textContent = `Total Interest: J$${totalInterest.toFixed(2)}`;
      });
    }
  
    // =========== MORTGAGE CALCULATOR ===========
    const mortCalcBtn = document.getElementById("mortCalcBtn");
    const mortMonthly = document.getElementById("mortMonthly");
    const mortInsurance = document.getElementById("mortInsurance");
    const mortTotalInterest = document.getElementById("mortTotalInterest");
  
    if(mortCalcBtn) {
      mortCalcBtn.addEventListener("click", () => {
        const homePrice = parseFloat(document.getElementById("mortHomePrice").value) || 0;
        const downPct = parseFloat(document.getElementById("mortDownPaymentPct").value) || 0;
        const rate = parseFloat(document.getElementById("mortRate").value) || 0;
        const years = parseFloat(document.getElementById("mortTerm").value) || 0;
        const insRate = parseFloat(document.getElementById("mortInsuranceRate").value) || 0;
  
        // Loan principal = homePrice - (downPct% of homePrice)
        const downPayment = homePrice * (downPct / 100);
        const loanAmount = homePrice - downPayment;
  
        // monthly interest rate
        const monthlyRate = (rate / 100) / 12;
        const n = years * 12;
  
        // Mortgage monthly payment formula (amortized)
        let monthlyPayment = 0;
        if(monthlyRate > 0 && n > 0) {
          monthlyPayment = loanAmount * (monthlyRate * Math.pow(1+monthlyRate, n)) / (Math.pow(1+monthlyRate, n) - 1);
        }
        const totalPaid = monthlyPayment * n;
        const totalInterest = totalPaid - loanAmount;
  
        // Insurance: property insurance ~1–2% of home value. We'll use insRate as input
        const annualInsurance = homePrice * (insRate / 100);
  
        mortMonthly.textContent = `Monthly Payment: J$${monthlyPayment.toFixed(2)}`;
        mortInsurance.textContent = `Annual Insurance: J$${annualInsurance.toFixed(2)}`;
        mortTotalInterest.textContent = `Total Interest: J$${totalInterest.toFixed(2)}`;
      });
    }
  
    // =========== INSURANCE CALCULATOR ===========
    const insuranceTypeSelect = document.getElementById("insuranceTypeSelect");
    const autoFields = document.querySelector(".auto-fields");
    const homeFields = document.querySelector(".home-fields");
    const lifeFields = document.querySelector(".life-fields");
    const insuranceCalcBtn = document.getElementById("insuranceCalcBtn");
    const insuranceResult = document.getElementById("insuranceResult");
  
    if(insuranceTypeSelect) {
      insuranceTypeSelect.addEventListener("change", () => {
        const val = insuranceTypeSelect.value;
        autoFields.style.display = (val === "auto") ? "block" : "none";
        homeFields.style.display = (val === "home") ? "block" : "none";
        lifeFields.style.display = (val === "life") ? "block" : "none";
      });
    }
  
    if(insuranceCalcBtn) {
      insuranceCalcBtn.addEventListener("click", () => {
        const type = insuranceTypeSelect.value;
        let premium = 0;
  
        if(type === "auto") {
          // For example: ~5% of car value for comprehensive, or ~1% for third-party
          // We'll just do a simple ~5% for demonstration
          const carVal = parseFloat(document.getElementById("autoCarValue").value) || 0;
          premium = carVal * 0.05; // 5%
        } else if(type === "home") {
          // ~1–2% typical. We'll pick 1.5% as a sample
          const homeVal = parseFloat(document.getElementById("homeValue").value) || 0;
          premium = homeVal * 0.015;
        } else if(type === "life") {
          // Rough guess: e.g. J$2,000 per million coverage for a younger adult
          const coverage = parseFloat(document.getElementById("lifeCoverage").value) || 0;
          const age = parseFloat(document.getElementById("lifeAge").value) || 30;
          // If age is higher, maybe we add more. Just a simplistic approach
          let baseRate = 2000; // J$2,000 per million
          if(age > 50) baseRate = 3000; 
          premium = (coverage / 1000000) * baseRate;
        }
        insuranceResult.textContent = `Estimated Premium: J$${premium.toFixed(2)} / year`;
      });
    }
  
    // =========== SAVINGS & RETIREMENT CALCULATOR ===========
    const savingsCalcBtn = document.getElementById("savingsCalcBtn");
    const savingsFutureValue = document.getElementById("savingsFutureValue");
  
    if(savingsCalcBtn) {
      savingsCalcBtn.addEventListener("click", () => {
        const startBal = parseFloat(document.getElementById("savStartBal").value) || 0;
        const monthly = parseFloat(document.getElementById("savMonthly").value) || 0;
        const annualRate = parseFloat(document.getElementById("savRate").value) || 0;
        const years = parseFloat(document.getElementById("savYears").value) || 0;
  
        const monthlyRate = (annualRate / 100) / 12;
        const n = years * 12;
  
        // Future Value of a series + lump sum:
        // FV = startBal * (1 + monthlyRate)^n + monthly * [((1+monthlyRate)^n - 1) / monthlyRate]
        let futureVal = startBal * Math.pow(1 + monthlyRate, n);
        if(monthlyRate > 0 && n > 0) {
          futureVal += monthly * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate);
        } else {
          // if monthlyRate=0, just do linear
          futureVal += monthly * n;
        }
  
        savingsFutureValue.textContent = `Future Value: J$${futureVal.toFixed(2)}`;
      });
    }
  
    // Additional placeholders for notifications, help overlay, etc.
  });
  