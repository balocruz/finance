let mainChart = null
let secondChart = null
let thirdChart = null
const submitBtn = document.getElementById("submitBtn");
const textInput = document.getElementById("text");
const dateInput = document.getElementById("date");
const listOutput = document.getElementById("list");
const formInput = document.getElementById("form");
const maxValue = document.querySelectorAll(".max");
const avgValue = document.querySelectorAll(".gro");

const monthAverage = document.getElementById("month")


const totalYearIncome = document.getElementById("total")
const totalRevenue = document.getElementById("totalRevenue")
const yearAverage = document.getElementById("yearAverage")
const yearGrowth = document.getElementById("yearGrowth")
let locals = JSON.parse(localStorage.getItem("logs")) || [{
  text: "",
  date: ""
}]

let logs = JSON.parse(localStorage.getItem("logs")) || [{
  text: "",
  date: ""
}];
document.querySelector(".cler").addEventListener('click', reset)
function reset() {
  logs = []
  listOutput.innerHTML = ""
  localStorage.clear()
  console.log(logs)
  updateUi()
}
function updateUi() {
  localStorage.setItem("logs", JSON.stringify(logs))

  if (logs.length === 0) {
    maxValue.forEach((el) => {
      el.textContent = "KSH 0.00";
    });
    avgValue.forEach((el) => {
      el.textContent = `0.00%`;
    });
    return;
  }
  const values = logs.map(log => Number(log.text))
  const highestIncome = Math.max(...values);

  const totalSum = values.reduce((total, curr) => total + curr, 0)
  totalRevenue.textContent = `KSH ${totalSum}`

  maxValue.forEach((el) => {
    el.textContent = `KSH ${highestIncome}`;
  });
  calculateAverageMontlyGrowth()
  calculateAverageYearlyGrowth()
  calculateAverageYearlyIncome()
  calculateAverageMonthlyIncome()
  calculateYearlyIncome()
  renderChart()
  renderChartTwo()
  renderChartThree()
}

function calculateAverageMontlyGrowth() {
  const values = logs.map(log => Number(log.text))
  const monthChange = []
  for (let i = 1; i < logs.length; i++) {
    const initialValue = values[i - 1]
    const finalValue = values[i]
    if (initialValue !== 0) {
      const change = (finalValue - initialValue) / initialValue
      monthChange.push(change)
    }
  }
  const avgGrowthRaw = monthChange.length > 0 ? (monthChange.reduce((total, curr) => total + curr, 0) / monthChange.length) * 100 : 0;
  const avgGrowth = avgGrowthRaw.toFixed(2)

  avgValue.forEach((el) => {
    if (avgGrowth < 0) {
      el.textContent = `${avgGrowth}%`
      el.style.color = `red`;
    } else {
      el.textContent = `${avgGrowth}%`;
      el.style.color = `#4be27e`;
    }
  });
}
function calculateAverageYearlyIncome() {
  const yearlyData = getYearly(logs)
  yearAverage.textContent = yearlyData.datasets.length > 0 ? `KSH ${(yearlyData.datasets.reduce((a, b) => a + b, 0) / yearlyData.datasets.length).toFixed(2)}` : "0%"
}
function calculateAverageMonthlyIncome() {
  const monthlyData = getMonthly(logs)

  monthAverage.textContent = monthlyData.datasets.length > 0 ? `KSH ${(monthlyData.datasets.reduce((a, b) => a + b, 0) / monthlyData.datasets.length).toFixed(2)}` : "0%"
}
function calculateYearlyIncome() {
  let currentYear = new Date().getFullYear()
  const currentYearValues = logs.filter(log => {
    if (!log.text || !log.date) return false
    const logYear = new Date(log.date).getFullYear()
    return logYear === currentYear
  })

  const currentYearvalue = currentYearValues.map(log => Number(log.text))
  const totalYearSum = currentYearvalue.reduce((total, curr) => total + curr, 0)
  const presentYearValues = getYearly(logs)
  const presentYear = [presentYearValues.labels.at(-1)]
  let year = new Date()

  function returnCurrentYear() {
    if (!presentYear) {
      return false
    }
    year = new Date(presentYear.at(-1)).getFullYear()
    return currentYear = year

  }
  returnCurrentYear()
  const presentYearValue = presentYearValues.total.at(-1)
  totalYearIncome.textContent = `KSH ${presentYearValue}`
  console.log(currentYear)
  console.log(totalYearSum)


  //totalYearIncome.textContent = `KSH ${totalYearSum}`
}

function calculateAverageYearlyGrowth() {
  const yearlyData = getYearly(logs)
  const growthRates = []
  for (let i = 1; i < yearlyData.datasets.length; i++) {
    const initialValue = yearlyData.datasets[i - 1]
    const finalValue = yearlyData.datasets[i]
    if (initialValue !== 0) {
      const growthRate = (finalValue - initialValue) / initialValue
      growthRates.push(growthRate)
    }
  }
  const avgGrowthRaw = growthRates.length > 0 ? (growthRates.reduce((total, curr) => total + curr, 0) / growthRates.length) * 100 : 0
  const avgGrowth = avgGrowthRaw.toFixed(2)
  yearGrowth.textContent = `${avgGrowth}%`
}

function getMonthly(financeLogs) {
  const monthlyTotal = {}
  const activeLogs = financeLogs.filter(log => log.text !== "" && log.date !== "")
  activeLogs.forEach(log => {
    const dateObj = new Date(log.date)
    const monthlyName = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' })
    if (!monthlyTotal[monthlyName]) {
      monthlyTotal[monthlyName] = []
    }
    monthlyTotal[monthlyName].push(Number(log.text))
  })
  const labels = []
  const averages = []

  for (const [month, valueArray] of Object.entries(monthlyTotal)) {
    labels.push(month)
    const sum = valueArray.reduce((a, b) => a + b, 0)
    averages.push(Number((sum / valueArray.length).toFixed(2)))
  }
  return { labels, datasets: averages }
}

function getYearly(financeLogs) {
  const monthlyTotal = {}
  financeLogs.forEach(log => {
    const yearObj = new Date(log.date)
    const yearlyKey = `${yearObj.getFullYear()}`
    if (!monthlyTotal[yearlyKey]) {
      monthlyTotal[yearlyKey] = []
    }
    monthlyTotal[yearlyKey].push(Number(log.text))
  })
  const labels = []
  const total = []
  const averages = []

  for (const [year, valueArray] of Object.entries(monthlyTotal)) {
    labels.push(year)
    const sum = valueArray.reduce((a, b) => a + b, 0)
    total.push(sum)
    averages.push(Number((sum / valueArray.length).toFixed(2)))
  }
  return { labels, datasets: averages, total }
}

function updateList() {
  locals.map(local => {
    listOutput.innerHTML += `<li>Date:${local.date} <span class="ksh">KSH${local.text}</span></li>`
  }).join('')
}


function renderChart() {
  const ctx = document.getElementById("chart").getContext("2d")
  const monthlyData = getMonthly(logs)
  if (monthlyData.labels.length === 0) return

  if (mainChart) {
    mainChart.destroy()
  }

  mainChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: monthlyData.labels,
      datasets: [{
        label: "Monthly Trend",
        data: monthlyData.datasets,
        borderColor: "#09fff3",
        backgroundColor: "rgba(34, 197, 197, 0.1)",
        borderWidth: 3,
        tension: 0.2,
        fill: true,
        spanGaps: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Monthly Average Income",
          color: "#fff",
          font: {
            size: 18,
            family: "Verdana",
            weight: "bold",
            lineHeight: 1.3,
            padding: {
              top: 10,
              bottom: 20
            }
          }
        },
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  })
}

function renderChartTwo() {
  const ctx = document.getElementById("chartWeek").getContext("2d")
  const inputDataLabels = logs.map(log => log.date)
  if (secondChart) {
    secondChart.destroy()
  }

  secondChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: inputDataLabels,
      datasets: [{
        label: "Weekly Income",
        data: logs.map(log => Number(log.text)),
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Weekly Income",
          color: "#fff",
          font: {
            size: 18,
            family: "Verdana",
            weight: "bold",
            lineHeight: 1.3,
            padding: {
              top: 10,
              bottom: 20
            }
          }
        },
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  })
}

function renderChartThree() {
  const ctx = document.getElementById("chartYear").getContext("2d")
  const yearlyData = getYearly(logs)
  if (yearlyData.labels.length === 0) return
  if (thirdChart) {
    thirdChart.destroy()
  }
  thirdChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: yearlyData.labels,
      datasets: [{
        label: "Yearly Income",
        data: yearlyData.datasets,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Yearly Income",
          color: "#fff",
          font: {
            size: 18,
            family: "Verdana",
            weight: "bold",
            lineHeight: 1.3,
            padding: {
              top: 10,
              bottom: 20
            }
          }
        },
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  })
}


formInput.addEventListener("submit", (e) => {
  e.preventDefault();
  const p = document.querySelectorAll(".error")
  if (dateInput.value === "" && textInput.value === "") {
    p.forEach(p => {
      p.style.display = "block"
      p.textContent = "enter value"
      setTimeout(() => {
        p.style.display = "none"
      }, 3000)
    })
    return
  }
  if (dateInput.value === "") {

    p.forEach(p => {
      if (p.classList.contains("brr")) {
        p.style.display = "block"
        p.textContent = "enter value"
        setTimeout(() => {
          p.style.display = "none"
        }, 3000)
      }
    })
    return
  }
  if (textInput.value === "") {
    const p = document.querySelectorAll(".error")
    p.forEach(p => {
      if (p.classList.contains("err")) {
        p.style.display = "block"
        p.textContent = "enter value"
        setTimeout(() => {
          p.style.display = "none"
        }, 3000)
      }
    })
    return
  }

  const li = document.createElement("li");

  li.innerHTML += `Date: ${dateInput.value}  <span class="ksh">KSH${textInput.value}</span>`;
  listOutput.appendChild(li);
  listOutput.scrollTop = listOutput.scrollHeight;
  const newLog = {
    text: textInput.value,
    date: dateInput.value
  }
  logs.push(newLog)
  updateUi();
  formInput.reset();
});
updateList()
updateUi()

