from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services import estimate_deduction

@api_view(["POST"])
def tax_calculator(request):
    donation_value = float(request.data.get("donation_value", 0))
    taxable_income = float(request.data.get("taxable_income", 0))
    is_monitored = bool(request.data.get("is_monitored", False))
    country = request.data.get("country_code", "KZ")
    try:
        result = estimate_deduction(donation_value, taxable_income, is_monitored, country)
    except ValueError as e:
        return Response({"detail": str(e)}, status=400)
    return Response(result)