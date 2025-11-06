"""Batch processing functionality for Video Orchestrator."""

from pathlib import Path
from typing import List, Dict, Callable, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
from video_orchestrator.core.video_processor import VideoProcessor
from video_orchestrator.config import MAX_BATCH_SIZE, OUTPUT_DIR
from video_orchestrator.utils.logger import logger
from video_orchestrator.utils.file_utils import sanitize_filename

class BatchProcessor:
    """Handles batch processing of multiple video generation tasks."""
    
    def __init__(self, max_workers: int = 2):
        """Initialize batch processor.
        
        Args:
            max_workers: Maximum number of concurrent processing tasks
        """
        self.max_workers = max_workers
        self.processor = VideoProcessor()
        logger.info(f"BatchProcessor initialized with {max_workers} workers")
    
    def process_batch(self, tasks: List[Dict], 
                     progress_callback: Optional[Callable] = None) -> List[Dict]:
        """Process multiple video generation tasks in batch.
        
        Args:
            tasks: List of task dictionaries containing job configuration
            progress_callback: Optional callback for progress updates
            
        Returns:
            List of results with status and output paths
        """
        if len(tasks) > MAX_BATCH_SIZE:
            logger.warning(f"Batch size {len(tasks)} exceeds maximum {MAX_BATCH_SIZE}")
            tasks = tasks[:MAX_BATCH_SIZE]
        
        logger.info(f"Processing batch of {len(tasks)} tasks")
        results = []
        
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Submit all tasks
            future_to_task = {
                executor.submit(self._process_single_task, task, i): (task, i)
                for i, task in enumerate(tasks)
            }
            
            # Collect results as they complete
            completed = 0
            for future in as_completed(future_to_task):
                task, task_id = future_to_task[future]
                try:
                    result = future.result()
                    results.append(result)
                    completed += 1
                    
                    if progress_callback:
                        progress_callback(completed, len(tasks), result)
                    
                    logger.info(f"Task {task_id + 1}/{len(tasks)} completed: {result['status']}")
                except Exception as e:
                    error_result = {
                        'task_id': task_id,
                        'status': 'failed',
                        'error': str(e),
                        'output_path': None
                    }
                    results.append(error_result)
                    logger.error(f"Task {task_id + 1} failed: {e}")
        
        return results
    
    def _process_single_task(self, task: Dict, task_id: int) -> Dict:
        """Process a single video generation task.
        
        Args:
            task: Task configuration dictionary
            task_id: Unique task identifier
            
        Returns:
            Result dictionary with status and output path
        """
        try:
            task_type = task.get('type', 'images')
            media_files = task.get('media_files', [])
            audio_file = task.get('audio_file')
            output_name = task.get('output_name', f'video_{task_id}')
            codec = task.get('codec', 'libx264')
            bitrate = task.get('bitrate', '4000k')
            fill_mode = task.get('fill_mode', 'fit')
            
            # Sanitize output name
            output_name = sanitize_filename(output_name)
            output_path = OUTPUT_DIR / f"{output_name}.mp4"
            
            # Create video based on task type
            if task_type == 'images':
                duration_per_image = task.get('duration_per_image', 3.0)
                transitions = task.get('transitions', True)
                clip = self.processor.create_from_images(
                    media_files,
                    duration_per_image=duration_per_image,
                    audio_path=audio_file,
                    transitions=transitions
                )
            elif task_type == 'videos':
                clip = self.processor.create_from_videos(
                    media_files,
                    audio_path=audio_file,
                    fill_mode=fill_mode
                )
            else:
                raise ValueError(f"Unknown task type: {task_type}")
            
            # Export video
            success = self.processor.export_video(
                clip,
                str(output_path),
                codec=codec,
                bitrate=bitrate
            )
            
            # Clean up
            clip.close()
            
            if success:
                return {
                    'task_id': task_id,
                    'status': 'success',
                    'output_path': str(output_path),
                    'error': None
                }
            else:
                return {
                    'task_id': task_id,
                    'status': 'failed',
                    'output_path': None,
                    'error': 'Export failed'
                }
        
        except Exception as e:
            logger.error(f"Error processing task {task_id}: {e}", exc_info=True)
            return {
                'task_id': task_id,
                'status': 'failed',
                'output_path': None,
                'error': str(e)
            }
