// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct PaymentDetails {
    payment_number: u32,
    payment_amount: f64,
    principal_payment: f64,
    interest_payment: f64,
    remaining_balance: f64,
}

#[derive(Debug, Serialize, Deserialize)]
struct AmortizationResult {
    monthly_payment: f64,
    total_interest: f64,
    total_paid: f64,
    schedule: Vec<PaymentDetails>,
}

/// Calculate amortization schedule
#[tauri::command]
fn calculate_amortization(principal: f64, annual_rate: f64, term_months: u32) -> Result<AmortizationResult, String> {
    if principal <= 0.0 {
        return Err("Principal must be greater than 0".to_string());
    }
    
    if annual_rate < 0.0 || annual_rate > 100.0 {
        return Err("Interest rate must be between 0 and 100".to_string());
    }
    
    if term_months == 0 {
        return Err("Term must be greater than 0".to_string());
    }

    // Convert annual rate to monthly rate
    let monthly_rate = annual_rate / 100.0 / 12.0;
    
    // Calculate monthly payment using amortization formula
    let monthly_payment = if monthly_rate == 0.0 {
        // Handle 0% interest rate edge case
        principal / term_months as f64
    } else {
        let rate_factor = (1.0 + monthly_rate).powi(term_months as i32);
        principal * (monthly_rate * rate_factor) / (rate_factor - 1.0)
    };

    let mut schedule = Vec::new();
    let mut remaining_balance = principal;
    let mut total_interest = 0.0;

    for payment_number in 1..=term_months {
        // Calculate interest for this payment
        let interest_payment = remaining_balance * monthly_rate;
        
        // Calculate principal payment
        let principal_payment = if remaining_balance < monthly_payment {
            // Last payment - pay remaining balance
            remaining_balance
        } else {
            monthly_payment - interest_payment
        };

        // Update remaining balance
        remaining_balance -= principal_payment;
        total_interest += interest_payment;

        // Add to schedule
        schedule.push(PaymentDetails {
            payment_number,
            payment_amount: principal_payment + interest_payment,
            principal_payment,
            interest_payment,
            remaining_balance: remaining_balance.max(0.0),
        });

        // Break if loan is paid off
        if remaining_balance <= 0.001 {
            break;
        }
    }

    let total_paid = principal + total_interest;

    Ok(AmortizationResult {
        monthly_payment,
        total_interest,
        total_paid,
        schedule,
    })
}

/// Export payment schedule to CSV format
#[tauri::command]
fn export_to_csv(schedule: Vec<PaymentDetails>) -> Result<String, String> {
    let mut csv_content = String::new();
    
    // Add header
    csv_content.push_str("Payment Number,Payment Amount,Principal,Interest,Remaining Balance\n");
    
    // Add data rows
    for payment in schedule {
        csv_content.push_str(&format!(
            "{},{:.2},{:.2},{:.2},{:.2}\n",
            payment.payment_number,
            payment.payment_amount,
            payment.principal_payment,
            payment.interest_payment,
            payment.remaining_balance
        ));
    }
    
    Ok(csv_content)
}

/// Calculate loan with extra payments
#[tauri::command]
fn calculate_with_extra_payments(
    principal: f64,
    annual_rate: f64,
    term_months: u32,
    extra_payments: std::collections::HashMap<u32, f64>
) -> Result<AmortizationResult, String> {
    if principal <= 0.0 {
        return Err("Principal must be greater than 0".to_string());
    }
    
    let monthly_rate = annual_rate / 100.0 / 12.0;
    
    // Calculate base monthly payment
    let base_monthly_payment = if monthly_rate == 0.0 {
        principal / term_months as f64
    } else {
        let rate_factor = (1.0 + monthly_rate).powi(term_months as i32);
        principal * (monthly_rate * rate_factor) / (rate_factor - 1.0)
    };

    let mut schedule = Vec::new();
    let mut remaining_balance = principal;
    let mut total_interest = 0.0;
    let mut payment_number = 1;

    while remaining_balance > 0.001 && payment_number <= term_months {
        // Calculate interest for this payment
        let interest_payment = remaining_balance * monthly_rate;
        
        // Get extra payment for this month
        let extra_payment = extra_payments.get(&payment_number).unwrap_or(&0.0);
        
        // Calculate total payment (base + extra)
        let total_payment = base_monthly_payment + extra_payment;
        
        // Calculate principal payment
        let principal_payment = if remaining_balance < total_payment {
            remaining_balance
        } else {
            total_payment - interest_payment
        };

        // Update remaining balance
        remaining_balance -= principal_payment;
        total_interest += interest_payment;

        // Add to schedule
        schedule.push(PaymentDetails {
            payment_number,
            payment_amount: principal_payment + interest_payment,
            principal_payment,
            interest_payment,
            remaining_balance: remaining_balance.max(0.0),
        });

        payment_number += 1;
    }

    let total_paid = principal + total_interest;

    Ok(AmortizationResult {
        monthly_payment: base_monthly_payment,
        total_interest,
        total_paid,
        schedule,
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            calculate_amortization,
            export_to_csv,
            calculate_with_extra_payments
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
