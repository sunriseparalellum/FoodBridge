from django.db import models

class TaxRule(models.Model):
    """Основано на ст. 337 НК РК ('Уменьшение налогооблагаемого дохода'):
    благотворительная помощь и безвозмездно переданное имущество (получатель -
    некоммерческая организация или организация социальной сферы) уменьшают налогооблагаемый доход,
    но не более cap_rate_monitored (3% - для крупных бизнесов) или cap_rate_standard (4% - малые и средние бизнесы)."""
    
    country_code = models.CharField(max_length=5, default="KZ", unique=True)
    cap_rate_standard = models.DecimalField(max_digits=4, decimal_places=2, default=0.04)
    cap_rate_monitored = models.DecimalField(max_digits=4, decimal_places=2, default=0.03)
    cpn_rate = models.DecimalField(max_digits=4, decimal_places=2, default=0.20)

    def __str__(self):
        return f"{self.country_code}: станд. {self.cap_rate_standard} / мониторинг {self.cap_rate_monitored}, КПН {self.cpn_rate}"