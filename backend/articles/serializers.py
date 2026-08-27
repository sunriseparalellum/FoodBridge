from django.utils.text import slugify
from rest_framework import serializers
from .models import Article
from .og_utils import fetch_og_metadata

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = "__all__"
        read_only_fields = ["og_title", "og_description", "og_image", "published_at"]

    def _make_unique_slug(self, title):
        max_length = Article._meta.get_field("slug").max_length
        base = slugify(title, allow_unicode=True)[: max_length - 5]
        slug = base
        i = 1
        while Article.objects.filter(slug=slug).exists():
            i += 1
            slug = f"{base}-{i}"[:max_length]
        return slug

    def create(self, validated_data):
        if not validated_data.get("slug"):
            validated_data["slug"] = self._make_unique_slug(validated_data["title"])

        instance = Article(**validated_data)
        if instance.external_url:
            og = fetch_og_metadata(instance.external_url)
            instance.og_title = og["og_title"]
            instance.og_description = og["og_description"]
            instance.og_image = og["og_image"]
        instance.save()
        return instance

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if instance.external_url:
            og = fetch_og_metadata(instance.external_url)
            instance.og_title = og["og_title"]
            instance.og_description = og["og_description"]
            instance.og_image = og["og_image"]
        instance.save()
        return instance
