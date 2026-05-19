import requests
from django.conf import settings
from django.utils import timezone
from .models import Alert


def send_telegram(message: str, parse_mode: str = "HTML") -> bool:
    """Send a message to Telegram. Returns True on success."""

    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID

    if not token or not chat_id:
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"

    try:
        response = requests.post(url, json={
            "chat_id": chat_id,
            "text": message,
            "parse_mode": parse_mode,
        }, timeout=10)
        return response.status_code == 200
    except Exception:
        return False


def send_alert(
    subject: str,
    message: str,
    alert_type: str = "custom",
    project=None,
) -> Alert:
    """Create an alert record and send via Telegram."""

    alert = Alert.objects.create(
        channel="telegram",
        alert_type=alert_type,
        subject=subject,
        message=message,
        project=project,
        status="pending",
    )

    success = send_telegram(message)

    alert.status = "sent" if success else "failed"
    alert.sent_at = timezone.now() if success else None
    alert.save()

    return alert


def alert_downtime(project) -> Alert:
    message = (
        f"🔴 <b>Downtime detected</b>\n\n"
        f"Project: <b>{project.name}</b>\n"
        f"Health endpoint: {project.health_endpoint}\n"
        f"Time: {timezone.now().strftime('%Y-%m-%d %H:%M UTC')}\n\n"
        f"DevOS has opened an incident for this project."
    )
    return send_alert(
        subject=f"Downtime: {project.name}",
        message=message,
        alert_type="downtime",
        project=project,
    )


def alert_recovery(project, downtime_minutes: int = None) -> Alert:
    duration = f"\nDowntime duration: {downtime_minutes} minutes" if downtime_minutes else ""
    message = (
        f"✅ <b>Service recovered</b>\n\n"
        f"Project: <b>{project.name}</b>\n"
        f"Time: {timezone.now().strftime('%Y-%m-%d %H:%M UTC')}"
        f"{duration}"
    )
    return send_alert(
        subject=f"Recovery: {project.name}",
        message=message,
        alert_type="recovery",
        project=project,
    )


def alert_contact_form(name: str, email: str, message_body: str, phone: str = "") -> Alert:
    phone_line = f"\nPhone: {phone}" if phone else ""
    message = (
        f"📩 <b>New contact form submission</b>\n\n"
        f"Name: <b>{name}</b>\n"
        f"Email: {email}"
        f"{phone_line}\n\n"
        f"Message:\n{message_body}"
    )
    return send_alert(
        subject=f"Contact from {name}",
        message=message,
        alert_type="contact_form",
    )
