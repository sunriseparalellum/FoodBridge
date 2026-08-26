from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("s2p", "0003_listing_charity_phone")]

    operations = [
        migrations.AddField(
            model_name="listing",
            name="charity_latitude",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="listing",
            name="charity_longitude",
            field=models.FloatField(blank=True, null=True),
        ),
    ]
