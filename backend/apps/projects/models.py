from django.db import models


class Project(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("maintenance", "Maintenance"),
        ("archived", "Archived"),
        ("in_progress", "In Progress"),
    ]

    HOSTING_CHOICES = [
        ("vercel", "Vercel"),
        ("render", "Render"),
        ("railway", "Railway"),
        ("aws", "AWS"),
        ("digitalocean", "DigitalOcean"),
        ("vps", "VPS"),
        ("other", "Other"),
    ]

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    long_description = models.TextField(blank=True)
    stack_tags = models.JSONField(default=list)
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    alias = models.SlugField(
        max_length=100, blank=True,
        help_text="Subdomain alias e.g. 'agripool' → agripool.bhaumikjangid.me"
    )
    cover_image = models.ImageField(upload_to="projects/", null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    hosting_provider = models.CharField(max_length=20, choices=HOSTING_CHOICES, blank=True)

    # Registry fields
    frontend_url = models.URLField(blank=True)
    backend_url = models.URLField(blank=True)
    health_endpoint = models.URLField(blank=True)
    deployment_type = models.CharField(max_length=50, blank=True)
    docker_enabled = models.BooleanField(default=False)
    ci_cd_enabled = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    is_featured = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self):
        return self.name
