// Import Tauri API
import { invoke } from '@tauri-apps/api/tauri'
import { Chart, registerables } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

// Global state
let currentChart = null
let paymentSchedule = []
let extraPayments = {} // Store extra payments by payment number

// DOM Elements - will be initialized after DOM is ready
let form = {}
let sections = {}
let results = {}
let loadingSpinner = null
let paymentTable = null
let chartCanvas = null

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Add a small delay to ensure DOM is fully ready
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Initialize DOM elements first
        initializeDOMElements()
        
        // Setup event listeners
        setupEventListeners()
        
        // Load sample data and calculate
        await loadSampleDataAndCalculate()
        
    } catch (error) {
        console.error('Initialization failed:', error)
        alert('Failed to initialize the application. Please refresh the page.')
    }
})

function initializeDOMElements() {    // Form elements
    form = {
        principal: document.getElementById('principal'),
        rate: document.getElementById('rate'),
        term: document.getElementById('term'),
        termType: document.getElementById('termType'),
        startMonth: document.getElementById('startMonth'),
        startYear: document.getElementById('startYear'),
        calculateBtn: document.getElementById('calculateBtn'),
        clearBtn: document.getElementById('clearBtn'),
        exportBtn: document.getElementById('exportBtn')
    }

    // Section elements
    sections = {
        results: document.getElementById('resultsSection'),
        chart: document.getElementById('chartSection'),
        table: document.getElementById('tableSection')
    }

    // Result display elements
    results = {
        monthlyPayment: document.getElementById('monthlyPayment'),
        totalInterest: document.getElementById('totalInterest'),
        totalPaid: document.getElementById('totalPaid'),
        payoffTime: document.getElementById('payoffTime')
    }

    // Other elements
    loadingSpinner = document.getElementById('loadingSpinner')
    const paymentTableElement = document.getElementById('paymentTable')
    paymentTable = paymentTableElement ? paymentTableElement.getElementsByTagName('tbody')[0] : null
    chartCanvas = document.getElementById('amortizationChart')    // Verify all critical elements exist
    const criticalElements = [
        'principal', 'rate', 'term', 'termType', 'startMonth', 'startYear', 'calculateBtn',
        'resultsSection', 'chartSection', 'amortizationChart'
    ]
    
    const missingElements = criticalElements.filter(id => !document.getElementById(id))
    
    if (missingElements.length > 0) {
        throw new Error(`Missing critical DOM elements: ${missingElements.join(', ')}`)
    }
}

function setupEventListeners() {
    form.calculateBtn.addEventListener('click', handleCalculate)
    form.clearBtn.addEventListener('click', handleClear)
    form.exportBtn.addEventListener('click', handleExport)
      // Add Enter key support for input fields
    [form.principal, form.rate, form.term, form.startYear].forEach(input => {
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleCalculate()
                }
            })
        }
    })
}

async function loadSampleDataAndCalculate() {    // Set default values
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1 // getMonth() returns 0-11, so add 1
    const currentYear = currentDate.getFullYear()
    
    const defaults = {
        principal: '250000',
        rate: '6.5',
        term: '30',
        termType: 'years',
        startMonth: currentMonth.toString(),
        startYear: currentYear.toString()
    }
    
    console.log('Setting defaults:', defaults)    // Set values with special handling for select elements
    Object.entries(defaults).forEach(([key, defaultValue]) => {
        if (form[key]) {
            console.log(`Setting ${key} to ${defaultValue}`)
            
            if (form[key].tagName === 'SELECT') {
                // For select elements, find and set the correct option
                const option = form[key].querySelector(`option[value="${defaultValue}"]`)
                if (option) {
                    // Clear any existing selections
                    Array.from(form[key].options).forEach(opt => opt.selected = false)
                    // Set the correct option
                    option.selected = true
                    form[key].value = defaultValue
                    console.log(`${key} set to option:`, option.text)
                } else {
                    console.log(`Option with value ${defaultValue} not found for ${key}`)
                }
            } else {
                form[key].value = defaultValue
            }
        } else {
            console.log(`Form element ${key} not found`)
        }
    })
    
    // Give DOM time to update
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Verify the month was set correctly
    console.log('Final startMonth value:', form.startMonth?.value)
    console.log('Final startMonth selected text:', form.startMonth?.selectedOptions[0]?.text)
    
    // Clear any existing extra payments
    extraPayments = {}
    
    // Calculate immediately with sample data
    try {
        await handleCalculate()
    } catch (error) {
        console.error('Initial calculation failed:', error)
    }
}

// Debounce function to limit how often calculation runs during typing
function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// Get current form data
function getFormData() {
    return {
        principal: form.principal?.value || '',
        rate: form.rate?.value || '',
        term: form.term?.value || '',
        termType: form.termType?.value || 'years',
        startMonth: form.startMonth?.value || '1',
        startYear: form.startYear?.value || '2025'
    }
}

async function handleCalculate() {
    // Check if form elements are available
    if (!form.principal || !form.rate || !form.term || !form.termType) {
        alert('Form elements not properly initialized. Please refresh the page.')
        return
    }
    
    // Get form data
    const data = getFormData()
    
    // Parse the values
    const principal = parseFloat(data.principal)
    const rate = parseFloat(data.rate)
    const term = parseInt(data.term)
    const termType = data.termType

    // Validate inputs
    if (!validateInputs(principal, rate, term)) {
        return
    }

    showLoading(true)

    try {
        // Convert term to months if needed
        const termInMonths = termType === 'years' ? term * 12 : term

        // Check if we have extra payments to apply
        const hasExtraPayments = Object.keys(extraPayments).length > 0

        let result
        if (hasExtraPayments) {
            // Call Rust backend with extra payments
            result = await invoke('calculate_with_extra_payments', {
                principal: principal,
                annualRate: rate,
                termMonths: termInMonths,
                extraPayments: extraPayments
            })
        } else {
            // Call standard calculation
            result = await invoke('calculate_amortization', {
                principal: principal,
                annualRate: rate,
                termMonths: termInMonths
            })
        }

        paymentSchedule = result.schedule
        displayResults(result)
        showSections(true)
        
    } catch (error) {
        console.error('Calculation error:', error)
        alert(`Calculation failed: ${error.message || error}`)
    } finally {
        showLoading(false)
    }
}

function validateInputs(principal, rate, term) {
    if (isNaN(principal) || principal <= 0) {
        alert('Please enter a valid principal amount (greater than 0)')
        if (form.principal) form.principal.focus()
        return false
    }
    
    if (isNaN(rate) || rate < 0 || rate > 100) {
        alert('Please enter a valid interest rate (0-100%)')
        if (form.rate) form.rate.focus()
        return false
    }
    
    if (isNaN(term) || term <= 0) {
        alert('Please enter a valid term (greater than 0)')
        if (form.term) form.term.focus()
        return false
    }
    
    return true
}

function displayResults(result) {
    // Update summary cards with null checks
    if (results.monthlyPayment) results.monthlyPayment.textContent = formatCurrency(result.monthly_payment)
    if (results.totalInterest) results.totalInterest.textContent = formatCurrency(result.total_interest)
    if (results.totalPaid) results.totalPaid.textContent = formatCurrency(result.total_paid)
    if (results.payoffTime) results.payoffTime.textContent = `${result.schedule.length} payments`

    // Update chart
    updateChart(result.schedule)
    
    // Update table
    updateTable(result.schedule)
    
    // Update extra payment status
    updateExtraPaymentStatus()
}

function updateChart(schedule) {
    // Check if canvas exists
    if (!chartCanvas) {
        return
    }
    
    const ctx = chartCanvas.getContext('2d')
      // Destroy existing chart
    if (currentChart) {
        currentChart.destroy()
    }    // Use full data - show every month for accurate representation    const termType = form.termType?.value || 'years'
    const startMonth = parseInt(form.startMonth?.value || '1')
    const startYear = parseInt(form.startYear?.value || '2025')
      // Create labels based on term type selection
    const labels = schedule.map((payment, index) => {
        if (termType === 'years') {
            // Show year labels at 12, 24, 36... months from start (payments 12, 24, 36...)
            // Payment 12 = Year 1, Payment 24 = Year 2, etc.
            if ((index + 1) % 12 === 0) {
                const year = Math.floor((index + 1) / 12)
                return `Year ${year}`
            }
            return ''
        } else {
            return `Month ${payment.payment_number}`
        }
    })
    
    const balanceData = schedule.map(payment => payment.remaining_balance)
    
    // Calculate cumulative principal payments (running total)
    let cumulativePrincipal = 0
    const cumulativePrincipalData = schedule.map(payment => {
        cumulativePrincipal += payment.principal_payment
        return cumulativePrincipal
    })
    
    // Calculate cumulative interest payments (running total)
    let cumulativeInterest = 0
    const cumulativeInterestData = schedule.map(payment => {
        cumulativeInterest += payment.interest_payment
        return cumulativeInterest
    })

    const datasets = [
        {
            label: 'Total Principal Paid',
            data: cumulativePrincipalData,
            borderColor: '#2e7d32',
            backgroundColor: 'rgba(46, 125, 50, 0.1)',
            fill: false,
            tension: 0.4,
            borderWidth: 1.5
        },
        {
            label: 'Total Interest Paid',
            data: cumulativeInterestData,
            borderColor: '#d32f2f',
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            fill: false,
            tension: 0.4,
            borderWidth: 1.5
        },        {
            label: 'Remaining Balance',
            data: balanceData,
            borderColor: '#2196f3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            fill: false,
            tension: 0.4,
            borderWidth: 1.5
        }
    ]

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {                title: {
                    display: true,
                    text: 'Amortization Schedule Over Time'
                },
                legend: {
                    position: 'top'
                },                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const dataIndex = context[0].dataIndex
                            const payment = schedule[dataIndex]
                            
                            // Calculate actual calendar date
                            const paymentDate = new Date(startYear, startMonth - 1 + dataIndex)
                            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                            
                            if (termType === 'years') {
                                return `${monthNames[paymentDate.getMonth()]} ${paymentDate.getFullYear()} (Payment ${payment.payment_number})`
                            } else {
                                return `${monthNames[paymentDate.getMonth()]} ${paymentDate.getFullYear()} (Payment ${payment.payment_number})`
                            }
                        }
                    }
                }
            },            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString()
                        }
                    }
                }
            }
        }
    })
}

function updateTable(schedule) {
    // Clear existing table
    paymentTable.innerHTML = ''
    
    // Add rows (limit to first 120 payments for performance)
    const displaySchedule = schedule.slice(0, 120)
    
    displaySchedule.forEach((payment, index) => {
        const row = paymentTable.insertRow()
        
        // Payment number
        row.insertCell(0).textContent = payment.payment_number
        
        // Calculate base payment amount (without extra payments)
        const extraAmount = extraPayments[payment.payment_number] || 0
        const basePaymentAmount = payment.payment_amount - extraAmount
        
        // Payment amount - show base payment if no extra, or "Base + Extra" if there is extra
        const paymentCell = row.insertCell(1)
        if (extraAmount > 0) {
            paymentCell.innerHTML = `
                ${formatCurrency(basePaymentAmount)} + ${formatCurrency(extraAmount)} 
                = <strong>${formatCurrency(payment.payment_amount)}</strong>
            `
            paymentCell.style.fontSize = '0.9em'
        } else {
            paymentCell.textContent = formatCurrency(payment.payment_amount)
        }
        
        // Principal
        row.insertCell(2).textContent = formatCurrency(payment.principal_payment)
        
        // Interest
        row.insertCell(3).textContent = formatCurrency(payment.interest_payment)
        
        // Remaining balance
        row.insertCell(4).textContent = formatCurrency(payment.remaining_balance)
        
        // Extra payment input
        const extraCell = row.insertCell(5)
        const extraInput = document.createElement('input')
        extraInput.type = 'number'
        extraInput.placeholder = '0.00'
        extraInput.min = '0'
        extraInput.step = '0.01'
        extraInput.value = extraPayments[payment.payment_number] || ''
        extraInput.addEventListener('change', (e) => handleExtraPayment(payment.payment_number, e.target.value))
        
        // Highlight the row if it has an extra payment
        if (extraAmount > 0) {
            row.style.backgroundColor = '#fff3cd'
            extraInput.style.backgroundColor = '#ffc107'
            extraInput.style.fontWeight = 'bold'
        }
        
        extraCell.appendChild(extraInput)
    })
    
    // Update table info
    const tableInfo = document.getElementById('tableInfo')
    if (schedule.length > 120) {
        tableInfo.textContent = `Showing first 120 of ${schedule.length} payments`
    } else {
        tableInfo.textContent = `Showing all ${schedule.length} payments`
    }
}

// Add a function to show extra payment status
function updateExtraPaymentStatus() {
    const extraPaymentCount = Object.keys(extraPayments).length
    const totalExtraAmount = Object.values(extraPayments).reduce((sum, amount) => sum + amount, 0)
    
    // Find or create status element
    let statusElement = document.getElementById('extraPaymentStatus')
    if (!statusElement) {
        statusElement = document.createElement('div')
        statusElement.id = 'extraPaymentStatus'
        statusElement.style.cssText = `
            background: #e8f5e8;
            border: 1px solid #4caf50;
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            display: none;
        `
        
        // Insert after the table info
        const tableInfo = document.getElementById('tableInfo')
        if (tableInfo && tableInfo.parentNode) {
            tableInfo.parentNode.insertBefore(statusElement, tableInfo.nextSibling)
        }
    }
    
    if (extraPaymentCount > 0) {
        statusElement.innerHTML = `
            <strong>💰 Extra Payments Active:</strong> 
            ${extraPaymentCount} payment${extraPaymentCount > 1 ? 's' : ''} 
            totaling ${formatCurrency(totalExtraAmount)}
            <button onclick="clearAllExtraPayments()" style="margin-left: 10px; padding: 5px 10px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">
                Clear All Extra Payments
            </button>
        `
        statusElement.style.display = 'block'
    } else {
        statusElement.style.display = 'none'
    }
}

// Add function to clear all extra payments
window.clearAllExtraPayments = async function() {
    if (confirm('Are you sure you want to clear all extra payments?')) {
        extraPayments = {}
        await handleCalculate()
    }
}

async function handleExtraPayment(paymentNumber, extraAmount) {
    const amount = parseFloat(extraAmount) || 0
    
    if (amount < 0) {
        alert('Extra payment cannot be negative')
        return
    }
      // Store the extra payment
    if (amount > 0) {
        extraPayments[paymentNumber] = amount
    } else {
        // Remove if set to 0 or empty
        delete extraPayments[paymentNumber]
    }
    
    // Recalculate the schedule with extra payments
    await handleCalculate()
}

function handleClear() {
    // Clear form
    Object.values(form).forEach(element => {
        if (element.type === 'number' || element.type === 'text') {
            element.value = ''
        }
    })
    
    // Clear extra payments
    extraPayments = {}
    
    // Hide sections
    showSections(false)
    
    // Clear chart
    if (currentChart) {
        currentChart.destroy()
        currentChart = null
    }
    
    // Clear table
    paymentTable.innerHTML = ''
    paymentSchedule = []
    updateExtraPaymentStatus()
}

async function handleExport() {
    if (paymentSchedule.length === 0) {
        alert('No data to export. Please calculate first.')
        return
    }
    
    try {
        // Call Rust backend to generate CSV
        const csvData = await invoke('export_to_csv', {
            schedule: paymentSchedule
        })
        
        // Create download link
        const blob = new Blob([csvData], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'amortization_schedule.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
    } catch (error) {
        console.error('Export error:', error)
        alert('Error exporting data')
    }
}

function showLoading(show) {
    if (loadingSpinner) {
        loadingSpinner.style.display = show ? 'flex' : 'none'
    }
}

function showSections(show) {
    Object.values(sections).forEach(section => {
        if (section) {
            section.style.display = show ? 'block' : 'none'
            if (show) {
                section.classList.add('fade-in')
            }
        }
    })
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount)
}
