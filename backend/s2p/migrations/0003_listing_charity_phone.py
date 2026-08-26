from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("s2p", "0002_message")]

    operations = [
        migrations.AddField(
            model_name="listing",
            name="charity_phone",
            field=models.CharField(blank=True, default="", max_length=30),
        ),
        migrations.DeleteModel(name="Message"),
    ]
