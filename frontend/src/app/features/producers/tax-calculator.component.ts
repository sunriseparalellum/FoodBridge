import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaxCalculatorService, TaxCalculationResult } from './tax-calculator.service';

@Component({
    selector: 'app-tax-calculator',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './tax-calculator.component.html',
})
export class TaxCalculatorComponent {
    donationValue = 0;
    taxableIncome = 0;
    isMonitored = false;
    result = signal<TaxCalculationResult | null>(null);

    constructor(private service: TaxCalculatorService) {}

    calculate(): void {
        this.service.calculate(this.donationValue, this.taxableIncome, this.isMonitored).subscribe(res => this.result.set(res));
    }
}