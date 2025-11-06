"""Tests for configuration module."""

import pytest
from pathlib import Path
from video_orchestrator.config import (
    VERTICAL_ASPECT_RATIO, DEFAULT_WIDTH, DEFAULT_HEIGHT,
    SUPPORTED_IMAGE_FORMATS, EXPORT_FORMATS
)

class TestConfig:
    """Test configuration values."""
    
    def test_vertical_aspect_ratio(self):
        """Test vertical aspect ratio is 9:16."""
        assert VERTICAL_ASPECT_RATIO == (9, 16)
        assert DEFAULT_WIDTH / DEFAULT_HEIGHT == 9 / 16
    
    def test_default_dimensions(self):
        """Test default video dimensions."""
        assert DEFAULT_WIDTH == 1080
        assert DEFAULT_HEIGHT == 1920
    
    def test_supported_formats(self):
        """Test supported file formats are defined."""
        assert len(SUPPORTED_IMAGE_FORMATS) > 0
        assert '.jpg' in SUPPORTED_IMAGE_FORMATS
        assert '.png' in SUPPORTED_IMAGE_FORMATS
    
    def test_export_formats(self):
        """Test export formats are configured."""
        assert 'MP4 (H.264)' in EXPORT_FORMATS
        assert EXPORT_FORMATS['MP4 (H.264)']['codec'] == 'libx264'
