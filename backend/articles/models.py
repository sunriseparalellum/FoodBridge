from django.db import models

class Article(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, allow_unicode=True, blank=True)
    summary = models.CharField(max_length=500, blank=True)
    body = models.TextField(blank=True)
    cover_image_url = models.URLField(blank=True)
    external_url = models.URLField(blank=True)
    og_title = models.CharField(max_length=255, blank=True)
    og_description = models.CharField(max_length=500, blank=True)
    og_image = models.URLField(blank=True)
    published_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title