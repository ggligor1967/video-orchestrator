"""File handling utilities for Video Orchestrator."""

from pathlib import Path
from typing import List
from video_orchestrator.config import (
    SUPPORTED_IMAGE_FORMATS,
    SUPPORTED_VIDEO_FORMATS,
    SUPPORTED_AUDIO_FORMATS
)

def is_image_file(file_path: str) -> bool:
    """Check if file is a supported image format.
    
    Args:
        file_path: Path to the file
        
    Returns:
        True if file is a supported image format
    """
    return Path(file_path).suffix.lower() in SUPPORTED_IMAGE_FORMATS

def is_video_file(file_path: str) -> bool:
    """Check if file is a supported video format.
    
    Args:
        file_path: Path to the file
        
    Returns:
        True if file is a supported video format
    """
    return Path(file_path).suffix.lower() in SUPPORTED_VIDEO_FORMATS

def is_audio_file(file_path: str) -> bool:
    """Check if file is a supported audio format.
    
    Args:
        file_path: Path to the file
        
    Returns:
        True if file is a supported audio format
    """
    return Path(file_path).suffix.lower() in SUPPORTED_AUDIO_FORMATS

def get_supported_files(directory: str, file_types: List[str] = None) -> List[Path]:
    """Get all supported files from a directory.
    
    Args:
        directory: Path to directory to scan
        file_types: List of file extensions to include (default: all supported)
        
    Returns:
        List of Path objects for supported files
    """
    dir_path = Path(directory)
    if not dir_path.is_dir():
        return []
    
    if file_types is None:
        file_types = SUPPORTED_IMAGE_FORMATS + SUPPORTED_VIDEO_FORMATS + SUPPORTED_AUDIO_FORMATS
    
    supported_files = []
    for file_path in dir_path.iterdir():
        if file_path.is_file() and file_path.suffix.lower() in file_types:
            supported_files.append(file_path)
    
    return sorted(supported_files)

def sanitize_filename(filename: str) -> str:
    """Sanitize filename by removing/replacing invalid characters.
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename safe for filesystem
    """
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    return filename.strip()
