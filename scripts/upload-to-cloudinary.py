"""
Upload existing local media files to Cloudinary.

Run once:
python scripts/upload-to-cloudinary.py
"""

import os
from pathlib import Path
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name=os.environ["CLOUDINARY_CLOUD_NAME"],
    api_key=os.environ["CLOUDINARY_API_KEY"],
    api_secret=os.environ["CLOUDINARY_API_SECRET"],
)

media_dir = Path("backend/media")

if not media_dir.exists():
    print("No local media directory found")
    raise SystemExit(0)

uploaded = 0

for filepath in media_dir.rglob("*"):
    if filepath.is_file():
        public_id = f"devos/{filepath.stem}"

        print(f"Uploading: {filepath}")

        cloudinary.uploader.upload(
            str(filepath),
            public_id=public_id,
            resource_type="auto",
            overwrite=False,
        )

        uploaded += 1

print(f"\nDone — uploaded {uploaded} files")
