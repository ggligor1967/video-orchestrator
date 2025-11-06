#!/usr/bin/env python
"""Command-line interface example for Video Orchestrator.

This script demonstrates how to use Video Orchestrator without the GUI.
"""

import sys
import argparse
from pathlib import Path

# Add parent directory to path to import video_orchestrator
sys.path.insert(0, str(Path(__file__).parent.parent))

from video_orchestrator.core.video_processor import VideoProcessor
from video_orchestrator.core.batch_processor import BatchProcessor
from video_orchestrator.config import OUTPUT_DIR
from video_orchestrator.utils.logger import logger

def create_video_from_images(args):
    """Create a vertical video from images."""
    logger.info("Creating video from images...")
    
    processor = VideoProcessor()
    
    # Create video
    clip = processor.create_from_images(
        image_paths=args.images,
        duration_per_image=args.duration,
        audio_path=args.audio,
        transitions=args.transitions
    )
    
    # Export
    output_path = OUTPUT_DIR / args.output
    success = processor.export_video(
        clip,
        str(output_path),
        codec='libx264',
        bitrate='4000k'
    )
    
    clip.close()
    
    if success:
        print(f"\n✓ Video created successfully: {output_path}")
        return 0
    else:
        print("\n✗ Failed to create video")
        return 1

def create_video_from_videos(args):
    """Create a vertical video from existing videos."""
    logger.info("Creating video from videos...")
    
    processor = VideoProcessor()
    
    # Create video
    clip = processor.create_from_videos(
        video_paths=args.videos,
        audio_path=args.audio,
        fill_mode=args.fill_mode
    )
    
    # Export
    output_path = OUTPUT_DIR / args.output
    success = processor.export_video(
        clip,
        str(output_path),
        codec='libx264',
        bitrate='4000k'
    )
    
    clip.close()
    
    if success:
        print(f"\n✓ Video created successfully: {output_path}")
        return 0
    else:
        print("\n✗ Failed to create video")
        return 1

def process_batch(args):
    """Process multiple videos in batch."""
    import json
    
    logger.info("Processing batch...")
    
    # Load batch configuration
    with open(args.config, 'r') as f:
        tasks = json.load(f)
    
    # Process batch
    batch_processor = BatchProcessor(max_workers=args.workers)
    results = batch_processor.process_batch(tasks)
    
    # Print results
    print("\nBatch Processing Results:")
    print("-" * 60)
    
    success_count = 0
    for result in results:
        status_icon = "✓" if result['status'] == 'success' else "✗"
        print(f"{status_icon} Task {result['task_id'] + 1}: {result['status']}")
        if result['output_path']:
            print(f"   Output: {result['output_path']}")
        if result['error']:
            print(f"   Error: {result['error']}")
        
        if result['status'] == 'success':
            success_count += 1
    
    print("-" * 60)
    print(f"Completed: {success_count}/{len(results)} successful")
    
    return 0 if success_count == len(results) else 1

def main():
    """Main entry point for CLI."""
    parser = argparse.ArgumentParser(
        description="Video Orchestrator - CLI for creating vertical videos"
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    
    # Images command
    images_parser = subparsers.add_parser('images', help='Create video from images')
    images_parser.add_argument('--images', nargs='+', required=True,
                              help='Input image files')
    images_parser.add_argument('--output', required=True,
                              help='Output video filename')
    images_parser.add_argument('--duration', type=float, default=3.0,
                              help='Duration per image in seconds (default: 3.0)')
    images_parser.add_argument('--audio', default=None,
                              help='Optional audio file')
    images_parser.add_argument('--no-transitions', dest='transitions',
                              action='store_false', default=True,
                              help='Disable transitions between images')
    
    # Videos command
    videos_parser = subparsers.add_parser('videos', help='Create video from videos')
    videos_parser.add_argument('--videos', nargs='+', required=True,
                              help='Input video files')
    videos_parser.add_argument('--output', required=True,
                              help='Output video filename')
    videos_parser.add_argument('--audio', default=None,
                              help='Optional audio file to replace/add')
    videos_parser.add_argument('--fill-mode', choices=['fit', 'crop', 'blur'],
                              default='fit',
                              help='How to handle aspect ratio (default: fit)')
    
    # Batch command
    batch_parser = subparsers.add_parser('batch', help='Process multiple videos')
    batch_parser.add_argument('--config', required=True,
                             help='JSON configuration file with batch tasks')
    batch_parser.add_argument('--workers', type=int, default=2,
                             help='Number of concurrent workers (default: 2)')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    try:
        if args.command == 'images':
            return create_video_from_images(args)
        elif args.command == 'videos':
            return create_video_from_videos(args)
        elif args.command == 'batch':
            return process_batch(args)
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        print(f"\n✗ Error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
