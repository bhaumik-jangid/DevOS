from django.core.management.base import BaseCommand
from apps.monitoring.services import run_all_checks


class Command(BaseCommand):
    help = "Run health checks for all registered projects"

    def handle(self, *args, **options):
        self.stdout.write("Running health checks...")
        results = run_all_checks()
        self.stdout.write(
            self.style.SUCCESS(
                f"Done — checked: {results['checked']}, "
                f"healthy: {results['healthy']}, "
                f"unhealthy: {results['unhealthy']}, "
                f"skipped: {results['skipped']}"
            )
        )
