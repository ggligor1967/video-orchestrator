#!/usr/bin/env python
"""Script to create test media files for Video Orchestrator examples."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np

def create_test_images(output_dir: Path, count: int = 5):
    """Create test images with different colors and text.
    
    Args:
        output_dir: Directory to save images
        count: Number of images to create
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    
    colors = [
        (255, 100, 100),  # Red
        (100, 255, 100),  # Green
        (100, 100, 255),  # Blue
        (255, 255, 100),  # Yellow
        (255, 100, 255),  # Magenta
        (100, 255, 255),  # Cyan
    ]
    
    for i in range(count):
        # Create image
        img = Image.new('RGB', (1920, 1080), colors[i % len(colors)])
        draw = ImageDraw.Draw(img)
        
        # Add text
        try:
            # Try to use a larger font
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 120)
        except:
            # Fallback to default font
            font = ImageFont.load_default()
        
        text = f"Test Image {i + 1}"
        
        # Get text size for centering
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Center text
        x = (1920 - text_width) // 2
        y = (1080 - text_height) // 2
        
        # Draw text with shadow
        draw.text((x + 5, y + 5), text, fill=(0, 0, 0), font=font)
        draw.text((x, y), text, fill=(255, 255, 255), font=font)
        
        # Add decorative elements
        draw.rectangle([50, 50, 250, 250], outline=(255, 255, 255), width=5)
        draw.ellipse([1670, 50, 1870, 250], outline=(255, 255, 255), width=5)
        
        # Save image
        output_path = output_dir / f"test_image_{i + 1}.jpg"
        img.save(output_path, quality=95)
        print(f"Created: {output_path}")
    
    print(f"\nSuccessfully created {count} test images in {output_dir}")

def main():
    """Create test media files."""
    script_dir = Path(__file__).parent
    output_dir = script_dir / "test_media"
    
    print("Creating test media files...")
    create_test_images(output_dir, count=5)
    print("\nTest media creation complete!")
    print(f"Files saved to: {output_dir}")
    print("\nYou can now use these images with Video Orchestrator:")
    print(f"  python examples/cli_example.py images --images {output_dir}/*.jpg")

if __name__ == "__main__":
    main()
