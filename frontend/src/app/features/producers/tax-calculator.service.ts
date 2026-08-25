import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TaxCalculationResult {
    donation_value: number;
    taxable_income: number;
    is_monitored: boolean;
    cap_rate: number;
    cpn_rate: number;
    max_deductible: number;
    accepted_amount: number;
    estimated_tax_savings: number;
}

@Injectable({ providedIn: 'root' })
export class TaxCalculatorService {
    constructor(private http: HttpClient) {}

    calculate(donationValue: number, taxableIncome: number, isMonitored: boolean, countryCode = 'KZ'): Observable<TaxCalculationResult> {
        return this.http.post<TaxCalculationResult>('http://127.0.0.1:8000/api/donations/tax-calculator/', {
            donation_value: donationValue,
            taxable_income: taxableIncome,
            is_monitored: isMonitored,
            country_code: countryCode,
        });
    }
}