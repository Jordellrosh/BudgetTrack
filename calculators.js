document.addEventListener("DOMContentLoaded", () => {
    // =========== TAB SWITCHING ===========
    const tabButtons = document.querySelectorAll(".calc-tab");
    const tabContents = document.querySelectorAll(".calc-content");
  
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        const tabId = btn.getAttribute("data-tab");
        document.getElementById(tabId).classList.add("active");
      });
    });
  
    // =========== AUTO-COMMA ON KEYUP FOR TEXT INPUTS ===========
    const textInputs = document.querySelectorAll('input[type="text"]');
    textInputs.forEach(inp => {
      inp.addEventListener("keyup", () => {
        const caretPos = inp.selectionStart; // optional if you want to preserve caret
        const rawVal = inp.value.replace(/,/g, ""); // strip commas
        if(!rawVal) {
          inp.value = "";
          return;
        }
        const floatVal = parseFloat(rawVal);
        if(isNaN(floatVal)) {
          inp.value = "";
          return;
        }
        // reformat with commas
        inp.value = new Intl.NumberFormat("en-US", {maximumFractionDigits:2}).format(floatVal);
        // if you want to restore caret pos, you'd do more advanced logic here
      });
    });
  
    // =========== HELPER: PARSE COMMA-SEPARATED INPUT ===========
    function parseInputValue(valueStr) {
      if(!valueStr) return 0;
      const cleanStr = valueStr.replace(/,/g, "");
      return parseFloat(cleanStr) || 0;
    }
  
    // =========== HELPER: FORMAT NUMBER WITH COMMAS ===========
    function formatNumber(num) {
      if(isNaN(num)) return "0";
      return Intl.NumberFormat("en-US", {maximumFractionDigits:2}).format(num);
    }
  
    // =========== BASIC CALCULATOR ===========
    const basicCalcButtons = document.querySelector(".basic-calc-buttons");
    const basicCalcDisplay = document.getElementById("basicCalcDisplay");
    let basicCalcExpression = "";
  
    const calcSymbols = [
      "7","8","9","/",
      "4","5","6","*",
      "1","2","3","-",
      "0",".","C","+",
      "="
    ];
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
          const result = eval(basicCalcExpression);
          basicCalcDisplay.value = formatNumber(result);
          basicCalcExpression = String(result);
        } catch(e) {
          basicCalcDisplay.value = "Error";
        }
        return;
      }
      basicCalcExpression += symbol;
      basicCalcDisplay.value = basicCalcExpression;
    }
  
    // =========== CAR LOAN CALCULATOR ===========
    const carLoanCalcBtn = document.getElementById("carLoanCalcBtn");
    const carLoanMonthly = document.getElementById("carLoanMonthly");
    const carLoanTotalInterest = document.getElementById("carLoanTotalInterest");
  
    if(carLoanCalcBtn) {
      carLoanCalcBtn.addEventListener("click", () => {
        const amount = parseInputValue(document.getElementById("carLoanAmount").value);
        const annualRate = parseFloat(document.getElementById("carLoanRate").value) || 0;
        const totalMonths = parseFloat(document.getElementById("carLoanTerm").value) || 0;
  
        if(totalMonths <= 0 || amount <= 0) {
          carLoanMonthly.textContent = "Monthly Payment: -";
          carLoanTotalInterest.textContent = "Total Interest: -";
          return;
        }
  
        const monthlyRate = (annualRate / 100) / 12;
        let monthlyPayment = 0;
        if(monthlyRate > 0) {
          monthlyPayment = amount * (monthlyRate * Math.pow(1+monthlyRate, totalMonths)) / (Math.pow(1+monthlyRate, totalMonths) - 1);
        } else {
          // rate=0 => linear
          monthlyPayment = amount / totalMonths;
        }
        const totalPaid = monthlyPayment * totalMonths;
        const totalInterest = totalPaid - amount;
  
        carLoanMonthly.textContent = `Monthly Payment: J$${formatNumber(monthlyPayment)}`;
        carLoanTotalInterest.textContent = `Total Interest: J$${formatNumber(totalInterest)}`;
      });
    }
  
    // =========== MORTGAGE CALCULATOR ===========
    const mortCalcBtn = document.getElementById("mortCalcBtn");
    const mortMonthly = document.getElementById("mortMonthly");
    const mortInsurance = document.getElementById("mortInsurance");
    const mortTotalInterest = document.getElementById("mortTotalInterest");
    const mortInsUnsure = document.getElementById("mortInsUnsure");
  
    if(mortCalcBtn) {
      mortCalcBtn.addEventListener("click", () => {
        const homePrice = parseInputValue(document.getElementById("mortHomePrice").value);
        const downPct = parseFloat(document.getElementById("mortDownPaymentPct").value) || 0;
        const rate = parseFloat(document.getElementById("mortRate").value) || 0;
        const years = parseFloat(document.getElementById("mortTerm").value) || 0;
        let insRate = parseFloat(document.getElementById("mortInsuranceRate").value) || 0;
  
        if(mortInsUnsure && mortInsUnsure.checked) {
          insRate = 1.5;
          document.getElementById("mortInsuranceRate").value = "1.5";
        }
  
        const downPayment = homePrice * (downPct / 100);
        const loanAmount = homePrice - downPayment;
  
        const monthlyRate = (rate / 100) / 12;
        const n = years * 12;
        let monthlyPayment = 0;
        if(monthlyRate > 0 && n > 0) {
          monthlyPayment = loanAmount * (monthlyRate * Math.pow(1+monthlyRate, n)) / (Math.pow(1+monthlyRate, n) - 1);
        } else if(n > 0) {
          monthlyPayment = loanAmount / n;
        }
        const totalPaid = monthlyPayment * n;
        const totalInterest = totalPaid - loanAmount;
  
        const annualInsurance = homePrice * (insRate / 100);
  
        mortMonthly.textContent = `Monthly Payment: J$${formatNumber(monthlyPayment)}`;
        mortInsurance.textContent = `Annual Insurance: J$${formatNumber(annualInsurance)}`;
        mortTotalInterest.textContent = `Total Interest: J$${formatNumber(totalInterest)}`;
      });
    }
  
    // =========== INSURANCE CALCULATOR (AUTO, HOME, LIFE) ===========
    const insuranceTypeSelect = document.getElementById("insuranceTypeSelect");
    const autoFields = document.querySelector(".auto-fields");
    const homeFields = document.querySelector(".home-fields");
    const lifeFields = document.querySelector(".life-fields");
    const insuranceCalcBtn = document.getElementById("insuranceCalcBtn");
    const insuranceResult = document.getElementById("insuranceResult");
  
    const autoVehicleType = document.getElementById("autoVehicleType");
    const autoLicenseMonths = document.getElementById("autoLicenseMonths");
  
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
          // Progressive approach
          // 1) base rate => 4.5% if newish car, 5.5% if older
          const carVal = parseInputValue(document.getElementById("autoCarValue").value);
          let baseRate = 0.045; // 4.5%
          const vType = autoVehicleType.value;
          if(vType === "sedanOld") {
            baseRate = 0.055; // older sedan
          }
          // 2) base premium
          let basePremium = carVal * baseRate;
  
          // Vehicle type multiplier
          let vehicleMult = 1.0;
          if(vType === "suv") vehicleMult = 1.2;
          else if(vType === "sports") vehicleMult = 1.5;
          else if(vType === "commercial") vehicleMult = 1.3;
          // else if sedanOld => already adjusted baseRate
  
          // License months => progressive surcharges
          const monthsExp = parseFloat(autoLicenseMonths.value) || 0;
          let licenseMult = 1.0;
          if(monthsExp < 1) {
            // brand new => +180%
            licenseMult = 2.8; // base + 1.8
          } else if(monthsExp < 12) {
            licenseMult = 2.0; // +100%
          } else if(monthsExp < 24) {
            licenseMult = 1.6; // +60%
          } else if(monthsExp < 36) {
            licenseMult = 1.3; // +30%
          } else if(monthsExp < 60) {
            licenseMult = 1.2; // +20%
          }
          // 5+ yrs => no extra => licenseMult=1
  
          premium = basePremium * vehicleMult * licenseMult;
  
        } else if(type === "home") {
          const homeVal = parseInputValue(document.getElementById("homeValue").value);
          // ~1.5% default
          premium = homeVal * 0.015;
  
        } else if(type === "life") {
          const coverage = parseInputValue(document.getElementById("lifeCoverage").value);
          const age = parseFloat(document.getElementById("lifeAge").value) || 30;
          let baseRate = 2000; // J$2,000 per million
          if(age > 50) baseRate = 3000; 
          premium = (coverage / 1000000) * baseRate;
        }
  
        insuranceResult.textContent = `Estimated Premium: J$${formatNumber(premium)} / year`;
      });
    }
  
    // =========== SAVINGS & RETIREMENT CALCULATOR ===========
    const savingsCalcBtn = document.getElementById("savingsCalcBtn");
    const savingsFutureValue = document.getElementById("savingsFutureValue");
  
    if(savingsCalcBtn) {
      savingsCalcBtn.addEventListener("click", () => {
        const startBal = parseInputValue(document.getElementById("savStartBal").value);
        const monthly = parseInputValue(document.getElementById("savMonthly").value);
  
        const annualRate = parseFloat(document.getElementById("savRate").value) || 0;
        const years = parseFloat(document.getElementById("savYears").value) || 0;
  
        const monthlyRate = (annualRate / 100) / 12;
        const n = years * 12;
  
        let futureVal = startBal * Math.pow(1 + monthlyRate, n);
        if(monthlyRate > 0 && n > 0) {
          futureVal += monthly * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate);
        } else {
          futureVal += monthly * n;
        }
  
        savingsFutureValue.textContent = `Future Value: J$${formatNumber(futureVal)}`;
      });
    }
  });
  