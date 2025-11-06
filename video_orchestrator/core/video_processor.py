"""Core video processing functionality for Video Orchestrator."""

from pathlib import Path
from typing import List, Dict, Optional, Tuple
import numpy as np
from PIL import Image
from moviepy.editor import (
    VideoFileClip, ImageClip, AudioFileClip,
    concatenate_videoclips, CompositeVideoClip,
    ColorClip
)
from video_orchestrator.config import (
    DEFAULT_WIDTH, DEFAULT_HEIGHT, DEFAULT_FPS,
    DEFAULT_DURATION, TEMP_DIR
)
from video_orchestrator.utils.logger import logger
from video_orchestrator.utils.file_utils import is_image_file, is_video_file, is_audio_file

class VideoProcessor:
    """Handles video processing operations for vertical video creation."""
    
    def __init__(self, width: int = DEFAULT_WIDTH, height: int = DEFAULT_HEIGHT,
                 fps: int = DEFAULT_FPS):
        """Initialize video processor with target dimensions and fps.
        
        Args:
            width: Target video width (default: 1080)
            height: Target video height (default: 1920)
            fps: Frames per second (default: 30)
        """
        self.width = width
        self.height = height
        self.fps = fps
        self.aspect_ratio = width / height
        logger.info(f"VideoProcessor initialized: {width}x{height} @ {fps}fps")
    
    def resize_to_vertical(self, clip, fill_mode: str = 'fit') -> CompositeVideoClip:
        """Resize clip to vertical format (9:16 aspect ratio).
        
        Args:
            clip: MoviePy video clip
            fill_mode: How to handle aspect ratio ('fit', 'crop', 'blur')
            
        Returns:
            Resized video clip in vertical format
        """
        clip_aspect = clip.w / clip.h
        
        if fill_mode == 'crop':
            # Crop to vertical aspect ratio
            if clip_aspect > self.aspect_ratio:
                # Clip is wider - crop width
                new_width = int(clip.h * self.aspect_ratio)
                x_center = clip.w / 2
                clip = clip.crop(x1=int(x_center - new_width/2), 
                               x2=int(x_center + new_width/2))
            else:
                # Clip is taller - crop height
                new_height = int(clip.w / self.aspect_ratio)
                y_center = clip.h / 2
                clip = clip.crop(y1=int(y_center - new_height/2),
                               y2=int(y_center + new_height/2))
            
            return clip.resize((self.width, self.height))
        
        elif fill_mode == 'blur':
            # Use blurred background with original centered
            background = clip.resize((self.width, self.height))
            background = background.fl_image(lambda img: self._blur_image(img))
            
            # Scale original to fit
            if clip_aspect > self.aspect_ratio:
                clip = clip.resize(width=self.width)
            else:
                clip = clip.resize(height=self.height)
            
            # Center the clip
            clip = clip.set_position('center')
            return CompositeVideoClip([background, clip], size=(self.width, self.height))
        
        else:  # 'fit' mode - letterbox with black bars
            if clip_aspect > self.aspect_ratio:
                clip = clip.resize(width=self.width)
            else:
                clip = clip.resize(height=self.height)
            
            background = ColorClip(size=(self.width, self.height), color=(0, 0, 0))
            clip = clip.set_position('center')
            return CompositeVideoClip([background, clip], size=(self.width, self.height))
    
    def _blur_image(self, image: np.ndarray, blur_radius: int = 15) -> np.ndarray:
        """Apply blur effect to image array.
        
        Args:
            image: Image as numpy array
            blur_radius: Blur intensity
            
        Returns:
            Blurred image array
        """
        from PIL import ImageFilter
        pil_img = Image.fromarray(image)
        blurred = pil_img.filter(ImageFilter.GaussianBlur(blur_radius))
        return np.array(blurred)
    
    def create_from_images(self, image_paths: List[str], 
                          duration_per_image: float = 3.0,
                          audio_path: Optional[str] = None,
                          transitions: bool = True) -> VideoFileClip:
        """Create video from sequence of images.
        
        Args:
            image_paths: List of paths to image files
            duration_per_image: How long each image appears (seconds)
            audio_path: Optional audio file to add
            transitions: Whether to add crossfade transitions
            
        Returns:
            Compiled video clip
        """
        logger.info(f"Creating video from {len(image_paths)} images")
        
        clips = []
        for img_path in image_paths:
            img = Image.open(img_path)
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Create clip from image
            clip = ImageClip(np.array(img), duration=duration_per_image)
            clip = self.resize_to_vertical(clip, fill_mode='fit')
            clips.append(clip)
        
        # Concatenate with or without transitions
        if transitions and len(clips) > 1:
            final = concatenate_videoclips(clips, method='compose', padding=-0.5)
        else:
            final = concatenate_videoclips(clips, method='compose')
        
        final = final.set_fps(self.fps)
        
        # Add audio if provided
        if audio_path and is_audio_file(audio_path):
            audio = AudioFileClip(audio_path)
            # Loop or trim audio to match video duration
            if audio.duration < final.duration:
                audio = audio.audio_loop(duration=final.duration)
            elif audio.duration > final.duration:
                audio = audio.subclip(0, final.duration)
            final = final.set_audio(audio)
        
        return final
    
    def create_from_videos(self, video_paths: List[str],
                          audio_path: Optional[str] = None,
                          fill_mode: str = 'fit') -> VideoFileClip:
        """Create vertical video from existing video clips.
        
        Args:
            video_paths: List of paths to video files
            audio_path: Optional audio file to replace/add
            fill_mode: How to handle aspect ratio conversion
            
        Returns:
            Compiled vertical video clip
        """
        logger.info(f"Creating video from {len(video_paths)} video clips")
        
        clips = []
        for video_path in video_paths:
            clip = VideoFileClip(video_path)
            clip = self.resize_to_vertical(clip, fill_mode=fill_mode)
            clips.append(clip)
        
        final = concatenate_videoclips(clips, method='compose')
        
        # Replace audio if provided
        if audio_path and is_audio_file(audio_path):
            audio = AudioFileClip(audio_path)
            if audio.duration < final.duration:
                audio = audio.audio_loop(duration=final.duration)
            elif audio.duration > final.duration:
                audio = audio.subclip(0, final.duration)
            final = final.set_audio(audio)
        
        return final
    
    def export_video(self, clip: VideoFileClip, output_path: str,
                    codec: str = 'libx264', bitrate: str = '4000k') -> bool:
        """Export video clip to file.
        
        Args:
            clip: Video clip to export
            output_path: Path where video will be saved
            codec: Video codec to use
            bitrate: Video bitrate
            
        Returns:
            True if export succeeded, False otherwise
        """
        try:
            logger.info(f"Exporting video to {output_path}")
            output_path = Path(output_path)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            clip.write_videofile(
                str(output_path),
                codec=codec,
                bitrate=bitrate,
                fps=self.fps,
                audio_codec='aac',
                temp_audiofile=str(TEMP_DIR / 'temp_audio.m4a'),
                remove_temp=True,
                logger=None  # Disable moviepy's progress bar in logs
            )
            
            logger.info(f"Video exported successfully to {output_path}")
            return True
        except Exception as e:
            logger.error(f"Error exporting video: {e}")
            return False
