from django.db import migrations, models


def add_phone_column(apps, schema_editor):
    user_model = apps.get_model("accounts", "User")
    table_name = user_model._meta.db_table
    columns = {
        column.name for column in schema_editor.connection.introspection.get_table_description(
            schema_editor.connection.cursor(), table_name
        )
    }
    if "phone" not in columns:
        schema_editor.execute(
            f'ALTER TABLE "{table_name}" ADD COLUMN "phone" varchar(30) NOT NULL DEFAULT \'\''
        )


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_alter_user_role"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[migrations.RunPython(add_phone_column, migrations.RunPython.noop)],
            state_operations=[
                migrations.AddField(
                    model_name="user",
                    name="phone",
                    field=models.CharField(blank=True, default="", max_length=30),
                ),
            ],
        ),
    ]