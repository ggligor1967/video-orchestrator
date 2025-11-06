"""Tests for file utility functions."""

import pytest
from pathlib import Path
from video_orchestrator.utils.file_utils import (
    is_image_file, is_video_file, is_audio_file, sanitize_filename
)

class TestFileUtils:
    """Test file utility functions."""
    
    def test_is_image_file(self):
        """Test image file detection."""
        assert is_image_file("test.jpg") is True
        assert is_image_file("test.jpeg") is True
        assert is_image_file("test.png") is True
        assert is_image_file("test.gif") is True
        assert is_image_file("test.mp4") is False
        assert is_image_file("test.txt") is False
    
    def test_is_video_file(self):
        """Test video file detection."""
        assert is_video_file("test.mp4") is True
        assert is_video_file("test.avi") is True
        assert is_video_file("test.mov") is True
        assert is_video_file("test.jpg") is False
        assert is_video_file("test.txt") is False
    
    def test_is_audio_file(self):
        """Test audio file detection."""
        assert is_audio_file("test.mp3") is True
        assert is_audio_file("test.wav") is True
        assert is_audio_file("test.aac") is True
        assert is_audio_file("test.mp4") is False
        assert is_audio_file("test.txt") is False
    
    def test_sanitize_filename(self):
        """Test filename sanitization."""
        assert sanitize_filename("test.txt") == "test.txt"
        assert sanitize_filename("test:file.txt") == "test_file.txt"
        assert sanitize_filename("test/file.txt") == "test_file.txt"
        assert sanitize_filename("test<>file.txt") == "test__file.txt"
        assert sanitize_filename("  test.txt  ") == "test.txt"
