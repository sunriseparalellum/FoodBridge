from .models import TaxRule

def estimate_deduction(donation_value: float, taxable_income: float, is_monitored: bool, country_code: str = "KZ") -> dict:
    rule = TaxRule.objects.filter(country_code=country_code).first()
    if not rule:
        raise ValueError("Нет налогового правила для этой страны") #позже планируем добавить

    cap_rate = float(rule.cap_rate_monitored) if is_monitored else float(rule.cap_rate_standard)
    cpn_rate = float(rule.cpn_rate)

    max_deductible = taxable_income * cap_rate
    accepted_amount = min(donation_value, max_deductible)
    tax_savings = accepted_amount * cpn_rate

    return {
        "donation_value": donation_value,
        "taxable_income": taxable_income,
        "is_monitored": is_monitored,
        "cap_rate": cap_rate,
        "cpn_rate": cpn_rate,
        "max_deductible": round(max_deductible, 2),
        "accepted_amount": round(accepted_amount, 2),
        "estimated_tax_savings": round(tax_savings, 2),
    }