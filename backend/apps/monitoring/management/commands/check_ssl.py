from django.core.management.base import BaseCommand
from apps.monitoring.services import check_all_ssl


class Command(BaseCommand):
    help = "Check SSL certificate expiry for all projects"

    def handle(self, *args, **options):
        self.stdout.write("Checking SSL certificates...")
        results = check_all_ssl()
        for r in results:
            days = r.get("days_remaining")
            if days is None:
                self.stdout.write(
                    self.style.ERROR(f"  {r['project_name']}: ERROR — {r.get('error', 'unknown')}")
                )
            elif days <= 7:
                self.stdout.write(
                    self.style.ERROR(f"  {r['project_name']}: {days} days — CRITICAL")
                )
            elif days <= 30:
                self.stdout.write(
                    self.style.WARNING(f"  {r['project_name']}: {days} days — WARNING")
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(f"  {r['project_name']}: {days} days — OK")
                )
        self.stdout.write(f"Done — checked {len(results)} certificates")
