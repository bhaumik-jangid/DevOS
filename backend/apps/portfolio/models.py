from django.db import models


class Profile(models.Model):
    """Single-row table — your personal profile."""
    name = models.CharField(max_length=100)
    tagline = models.CharField(max_length=200)
    bio = models.TextField()
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=100, blank=True)
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    resume = models.FileField(upload_to="resume/", null=True, blank=True)
    photo_primary = models.ImageField(upload_to="photos/", null=True, blank=True)
    photo_secondary = models.ImageField(upload_to="photos/", null=True, blank=True)
    available_for_work = models.BooleanField(default=True)
    years_of_experience = models.IntegerField(default=0)

    # DSA stats
    leetcode_username = models.CharField(max_length=100, blank=True)
    leetcode_solved = models.IntegerField(default=0)
    leetcode_easy = models.IntegerField(default=0)
    leetcode_medium = models.IntegerField(default=0)
    leetcode_hard = models.IntegerField(default=0)
    codeforces_username = models.CharField(max_length=100, blank=True)
    codeforces_rating = models.IntegerField(default=0)
    codechef_username = models.CharField(max_length=100, blank=True)
    total_dsa_solved = models.IntegerField(default=0)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Profile"

    def __str__(self):
        return self.name

    @classmethod
    def get_profile(cls):
        return cls.objects.first()


class Academic(models.Model):
    LEVEL_CHOICES = [
        ("10th", "10th Standard"),
        ("12th", "12th Standard"),
        ("diploma", "Diploma"),
        ("btech", "B.Tech"),
        ("mtech", "M.Tech"),
        ("other", "Other"),
    ]

    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    institution = models.CharField(max_length=200)
    board_or_university = models.CharField(max_length=200, blank=True)
    field_of_study = models.CharField(max_length=100, blank=True)
    percentage_or_cgpa = models.CharField(max_length=20)
    scale = models.CharField(max_length=20, default="percentage",
                             help_text="e.g. percentage, 10-point CGPA, 4-point CGPA")
    start_year = models.IntegerField()
    end_year = models.IntegerField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order", "start_year"]

    def __str__(self):
        return f"{self.level} — {self.institution}"


class Achievement(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateField(null=True, blank=True)
    url = models.URLField(blank=True)
    icon_name = models.CharField(max_length=50, blank=True)
    order = models.IntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "-date"]

    def __str__(self):
        return self.title


class Skill(models.Model):
    CATEGORY_CHOICES = [
        ("language", "Language"),
        ("framework", "Framework"),
        ("devops", "DevOps"),
        ("database", "Database"),
        ("tool", "Tool"),
    ]
    name = models.CharField(max_length=50)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    icon_name = models.CharField(max_length=50, blank=True)
    proficiency = models.IntegerField(default=80)
    order = models.IntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class Experience(models.Model):
    company = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    location = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.role} at {self.company}"


class Certification(models.Model):
    name = models.CharField(max_length=150)
    issuer = models.CharField(max_length=100)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    credential_url = models.URLField(blank=True)
    image = models.ImageField(upload_to="certifications/", null=True, blank=True)
    is_visible = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order", "-issue_date"]

    def __str__(self):
        return self.name


class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    excerpt = models.TextField(max_length=300)
    content = models.TextField()
    cover_image = models.ImageField(upload_to="blog/", null=True, blank=True)
    tags = models.JSONField(default=list)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at"]

    def __str__(self):
        return self.title


class SiteConfig(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()

    class Meta:
        db_table = "portfolio_site_config"

    def __str__(self):
        return self.key


class ContactSubmission(models.Model):
    # User-entered fields
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    message = models.TextField()

    # Auto-captured metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    referrer = models.CharField(max_length=500, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    # Status tracking
    telegram_sent = models.BooleanField(default=False)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.name} — {self.email} — {self.submitted_at:%Y-%m-%d}"
