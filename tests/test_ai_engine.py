"""Tests for AI engine module."""

import pytest
from video_orchestrator.core.ai_engine import AIEngine

class TestAIEngine:
    """Test AI engine functionality."""
    
    def test_ai_engine_init(self):
        """Test AI engine initialization."""
        engine = AIEngine()
        assert engine is not None
        assert hasattr(engine, 'enabled')
    
    def test_suggest_scene_order(self):
        """Test scene order suggestion."""
        engine = AIEngine()
        files = ['img1.jpg', 'img2.jpg', 'img3.jpg']
        result = engine.suggest_scene_order(files)
        
        # Should return a list
        assert isinstance(result, list)
        assert len(result) == len(files)
    
    def test_auto_enhance_settings(self):
        """Test auto-enhance settings."""
        engine = AIEngine()
        characteristics = {
            'avg_width': 1920,
            'avg_height': 1080
        }
        
        result = engine.auto_enhance_settings('images', characteristics)
        
        # Should return settings dict
        assert isinstance(result, dict)
        assert 'codec' in result
        assert 'bitrate' in result
        assert 'fps' in result
