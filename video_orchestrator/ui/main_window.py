"""Main window UI for Video Orchestrator application."""

import sys
from pathlib import Path
from typing import List
from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QListWidget, QLabel, QComboBox,
    QSpinBox, QDoubleSpinBox, QProgressBar, QTabWidget,
    QFileDialog, QMessageBox, QGroupBox, QCheckBox,
    QTextEdit, QLineEdit
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal
from PyQt6.QtGui import QIcon
from video_orchestrator.config import (
    APP_NAME, APP_VERSION, OUTPUT_DIR,
    EXPORT_FORMATS, QUALITY_PRESETS,
    SUPPORTED_IMAGE_FORMATS, SUPPORTED_VIDEO_FORMATS,
    SUPPORTED_AUDIO_FORMATS
)
from video_orchestrator.core.batch_processor import BatchProcessor
from video_orchestrator.core.ai_engine import AIEngine
from video_orchestrator.utils.logger import logger

class ProcessingThread(QThread):
    """Thread for handling video processing without blocking UI."""
    
    progress = pyqtSignal(int, int, dict)  # current, total, result
    finished = pyqtSignal(list)  # results
    
    def __init__(self, tasks: List[dict]):
        super().__init__()
        self.tasks = tasks
        self.batch_processor = BatchProcessor(max_workers=2)
    
    def run(self):
        """Execute batch processing in thread."""
        results = self.batch_processor.process_batch(
            self.tasks,
            progress_callback=self.progress.emit
        )
        self.finished.emit(results)

class MainWindow(QMainWindow):
    """Main application window for Video Orchestrator."""
    
    def __init__(self):
        super().__init__()
        self.media_files = []
        self.audio_file = None
        self.ai_engine = AIEngine()
        self.processing_thread = None
        
        self.init_ui()
        logger.info("Main window initialized")
    
    def init_ui(self):
        """Initialize the user interface."""
        self.setWindowTitle(f"{APP_NAME} v{APP_VERSION}")
        self.setGeometry(100, 100, 1000, 700)
        
        # Create central widget and main layout
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        
        # Create tab widget
        tabs = QTabWidget()
        tabs.addTab(self.create_single_video_tab(), "Single Video")
        tabs.addTab(self.create_batch_tab(), "Batch Processing")
        tabs.addTab(self.create_settings_tab(), "Settings")
        
        main_layout.addWidget(tabs)
        
        # Status bar
        self.statusBar().showMessage("Ready")
    
    def create_single_video_tab(self) -> QWidget:
        """Create the single video generation tab."""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        # Media input section
        media_group = QGroupBox("Media Files")
        media_layout = QVBoxLayout()
        
        # File list
        self.media_list = QListWidget()
        self.media_list.setMinimumHeight(150)
        media_layout.addWidget(self.media_list)
        
        # Buttons for managing media
        btn_layout = QHBoxLayout()
        
        self.btn_add_images = QPushButton("Add Images")
        self.btn_add_images.clicked.connect(self.add_images)
        btn_layout.addWidget(self.btn_add_images)
        
        self.btn_add_videos = QPushButton("Add Videos")
        self.btn_add_videos.clicked.connect(self.add_videos)
        btn_layout.addWidget(self.btn_add_videos)
        
        self.btn_add_audio = QPushButton("Add Audio")
        self.btn_add_audio.clicked.connect(self.add_audio)
        btn_layout.addWidget(self.btn_add_audio)
        
        self.btn_clear = QPushButton("Clear All")
        self.btn_clear.clicked.connect(self.clear_media)
        btn_layout.addWidget(self.btn_clear)
        
        media_layout.addLayout(btn_layout)
        media_group.setLayout(media_layout)
        layout.addWidget(media_group)
        
        # Audio display
        audio_layout = QHBoxLayout()
        audio_layout.addWidget(QLabel("Audio Track:"))
        self.audio_label = QLabel("None")
        audio_layout.addWidget(self.audio_label)
        audio_layout.addStretch()
        layout.addLayout(audio_layout)
        
        # Video settings section
        settings_group = QGroupBox("Video Settings")
        settings_layout = QVBoxLayout()
        
        # Media type selector
        type_layout = QHBoxLayout()
        type_layout.addWidget(QLabel("Source Type:"))
        self.media_type_combo = QComboBox()
        self.media_type_combo.addItems(["Images", "Videos"])
        self.media_type_combo.currentTextChanged.connect(self.on_media_type_changed)
        type_layout.addWidget(self.media_type_combo)
        type_layout.addStretch()
        settings_layout.addLayout(type_layout)
        
        # Duration per image (for image mode)
        duration_layout = QHBoxLayout()
        duration_layout.addWidget(QLabel("Duration per Image (seconds):"))
        self.duration_spin = QDoubleSpinBox()
        self.duration_spin.setRange(0.5, 30.0)
        self.duration_spin.setValue(3.0)
        self.duration_spin.setSingleStep(0.5)
        duration_layout.addWidget(self.duration_spin)
        duration_layout.addStretch()
        settings_layout.addLayout(duration_layout)
        
        # Fill mode (for video mode)
        fill_layout = QHBoxLayout()
        fill_layout.addWidget(QLabel("Aspect Ratio Mode:"))
        self.fill_mode_combo = QComboBox()
        self.fill_mode_combo.addItems(["Fit (Letterbox)", "Crop", "Blur Background"])
        fill_layout.addWidget(self.fill_mode_combo)
        fill_layout.addStretch()
        settings_layout.addLayout(fill_layout)
        
        # Transitions
        self.transitions_check = QCheckBox("Enable Transitions")
        self.transitions_check.setChecked(True)
        settings_layout.addWidget(self.transitions_check)
        
        settings_group.setLayout(settings_layout)
        layout.addWidget(settings_group)
        
        # Export settings section
        export_group = QGroupBox("Export Settings")
        export_layout = QVBoxLayout()
        
        # Output name
        name_layout = QHBoxLayout()
        name_layout.addWidget(QLabel("Output Name:"))
        self.output_name_edit = QLineEdit("my_vertical_video")
        name_layout.addWidget(self.output_name_edit)
        export_layout.addLayout(name_layout)
        
        # Format
        format_layout = QHBoxLayout()
        format_layout.addWidget(QLabel("Format:"))
        self.format_combo = QComboBox()
        self.format_combo.addItems(list(EXPORT_FORMATS.keys()))
        format_layout.addWidget(self.format_combo)
        format_layout.addStretch()
        export_layout.addLayout(format_layout)
        
        # Quality
        quality_layout = QHBoxLayout()
        quality_layout.addWidget(QLabel("Quality:"))
        self.quality_combo = QComboBox()
        self.quality_combo.addItems(list(QUALITY_PRESETS.keys()))
        self.quality_combo.setCurrentText("Medium")
        quality_layout.addWidget(self.quality_combo)
        quality_layout.addStretch()
        export_layout.addLayout(quality_layout)
        
        export_group.setLayout(export_layout)
        layout.addWidget(export_group)
        
        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        layout.addWidget(self.progress_bar)
        
        # Generate button
        self.btn_generate = QPushButton("Generate Video")
        self.btn_generate.clicked.connect(self.generate_video)
        self.btn_generate.setMinimumHeight(40)
        layout.addWidget(self.btn_generate)
        
        layout.addStretch()
        return tab
    
    def create_batch_tab(self) -> QWidget:
        """Create the batch processing tab."""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        layout.addWidget(QLabel("Batch Processing"))
        
        # Instructions
        instructions = QTextEdit()
        instructions.setReadOnly(True)
        instructions.setMaximumHeight(100)
        instructions.setText(
            "Batch processing allows you to process multiple videos at once.\n\n"
            "1. Set up your first video in the 'Single Video' tab\n"
            "2. Click 'Add to Batch' to queue it\n"
            "3. Repeat for each video you want to create\n"
            "4. Click 'Process Batch' to generate all videos"
        )
        layout.addWidget(instructions)
        
        # Batch list
        self.batch_list = QListWidget()
        self.batch_list.setMinimumHeight(200)
        layout.addWidget(QLabel("Queued Videos:"))
        layout.addWidget(self.batch_list)
        
        # Buttons
        btn_layout = QHBoxLayout()
        
        self.btn_add_to_batch = QPushButton("Add Current to Batch")
        self.btn_add_to_batch.clicked.connect(self.add_to_batch)
        btn_layout.addWidget(self.btn_add_to_batch)
        
        self.btn_clear_batch = QPushButton("Clear Batch")
        self.btn_clear_batch.clicked.connect(self.clear_batch)
        btn_layout.addWidget(self.btn_clear_batch)
        
        layout.addLayout(btn_layout)
        
        # Batch progress
        self.batch_progress_bar = QProgressBar()
        self.batch_progress_bar.setVisible(False)
        layout.addWidget(self.batch_progress_bar)
        
        # Process button
        self.btn_process_batch = QPushButton("Process Batch")
        self.btn_process_batch.clicked.connect(self.process_batch)
        self.btn_process_batch.setMinimumHeight(40)
        layout.addWidget(self.btn_process_batch)
        
        # Results area
        layout.addWidget(QLabel("Results:"))
        self.batch_results = QTextEdit()
        self.batch_results.setReadOnly(True)
        self.batch_results.setMaximumHeight(150)
        layout.addWidget(self.batch_results)
        
        layout.addStretch()
        self.batch_tasks = []
        
        return tab
    
    def create_settings_tab(self) -> QWidget:
        """Create the settings tab."""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        layout.addWidget(QLabel("Settings"))
        
        # AI settings
        ai_group = QGroupBox("AI Features")
        ai_layout = QVBoxLayout()
        
        ai_info = QTextEdit()
        ai_info.setReadOnly(True)
        ai_info.setMaximumHeight(100)
        ai_info.setText(
            "AI features are currently in placeholder mode.\n"
            "To enable AI-powered suggestions:\n"
            "1. Set AI_ENABLED=true in your environment\n"
            "2. Provide AI_API_KEY with your API key\n"
            "3. Optionally set AI_MODEL (default: gpt-4)"
        )
        ai_layout.addWidget(ai_info)
        
        ai_status = QLabel(f"AI Status: {'Enabled' if self.ai_engine.enabled else 'Disabled'}")
        ai_layout.addWidget(ai_status)
        
        ai_group.setLayout(ai_layout)
        layout.addWidget(ai_group)
        
        # Output directory
        output_group = QGroupBox("Output Settings")
        output_layout = QVBoxLayout()
        
        output_dir_layout = QHBoxLayout()
        output_dir_layout.addWidget(QLabel("Output Directory:"))
        output_dir_label = QLabel(str(OUTPUT_DIR))
        output_dir_layout.addWidget(output_dir_label)
        output_layout.addLayout(output_dir_layout)
        
        btn_open_output = QPushButton("Open Output Folder")
        btn_open_output.clicked.connect(self.open_output_folder)
        output_layout.addWidget(btn_open_output)
        
        output_group.setLayout(output_layout)
        layout.addWidget(output_group)
        
        # About
        about_group = QGroupBox("About")
        about_layout = QVBoxLayout()
        
        about_text = QLabel(
            f"{APP_NAME} v{APP_VERSION}\n\n"
            "AI-powered desktop application for creating\n"
            "automated vertical videos (TikTok/Shorts/Reels)\n\n"
            "Features:\n"
            "• Create vertical videos from images or videos\n"
            "• Batch processing support\n"
            "• Multiple export formats and quality settings\n"
            "• AI-powered enhancements (when enabled)"
        )
        about_layout.addWidget(about_text)
        
        about_group.setLayout(about_layout)
        layout.addWidget(about_group)
        
        layout.addStretch()
        return tab
    
    def on_media_type_changed(self, text: str):
        """Handle media type change."""
        is_images = text == "Images"
        self.duration_spin.setEnabled(is_images)
        self.transitions_check.setEnabled(is_images)
        self.fill_mode_combo.setEnabled(not is_images)
    
    def add_images(self):
        """Add image files to media list."""
        formats = ' '.join(f'*{ext}' for ext in SUPPORTED_IMAGE_FORMATS)
        files, _ = QFileDialog.getOpenFileNames(
            self,
            "Select Images",
            "",
            f"Image Files ({formats})"
        )
        
        if files:
            self.media_files.extend(files)
            self.update_media_list()
            logger.info(f"Added {len(files)} images")
    
    def add_videos(self):
        """Add video files to media list."""
        formats = ' '.join(f'*{ext}' for ext in SUPPORTED_VIDEO_FORMATS)
        files, _ = QFileDialog.getOpenFileNames(
            self,
            "Select Videos",
            "",
            f"Video Files ({formats})"
        )
        
        if files:
            self.media_files.extend(files)
            self.update_media_list()
            logger.info(f"Added {len(files)} videos")
    
    def add_audio(self):
        """Add audio file."""
        formats = ' '.join(f'*{ext}' for ext in SUPPORTED_AUDIO_FORMATS)
        file, _ = QFileDialog.getOpenFileName(
            self,
            "Select Audio",
            "",
            f"Audio Files ({formats})"
        )
        
        if file:
            self.audio_file = file
            self.audio_label.setText(Path(file).name)
            logger.info(f"Added audio: {file}")
    
    def clear_media(self):
        """Clear all media files."""
        self.media_files = []
        self.audio_file = None
        self.media_list.clear()
        self.audio_label.setText("None")
        logger.info("Cleared all media")
    
    def update_media_list(self):
        """Update the media list display."""
        self.media_list.clear()
        for file in self.media_files:
            self.media_list.addItem(Path(file).name)
    
    def generate_video(self):
        """Generate a single video."""
        if not self.media_files:
            QMessageBox.warning(self, "No Media", "Please add images or videos first.")
            return
        
        self.btn_generate.setEnabled(False)
        self.progress_bar.setVisible(True)
        self.progress_bar.setRange(0, 0)  # Indeterminate
        self.statusBar().showMessage("Generating video...")
        
        # Prepare task
        task = self.create_task_from_ui()
        
        # Process in thread
        self.processing_thread = ProcessingThread([task])
        self.processing_thread.finished.connect(self.on_video_generated)
        self.processing_thread.start()
    
    def create_task_from_ui(self) -> dict:
        """Create a task dictionary from current UI settings."""
        media_type = self.media_type_combo.currentText().lower()
        fill_mode_map = {
            "Fit (Letterbox)": "fit",
            "Crop": "crop",
            "Blur Background": "blur"
        }
        
        format_info = EXPORT_FORMATS[self.format_combo.currentText()]
        quality_info = QUALITY_PRESETS[self.quality_combo.currentText()]
        
        task = {
            'type': media_type,
            'media_files': self.media_files.copy(),
            'audio_file': self.audio_file,
            'output_name': self.output_name_edit.text(),
            'codec': format_info['codec'],
            'bitrate': quality_info['bitrate'],
            'fill_mode': fill_mode_map[self.fill_mode_combo.currentText()],
            'duration_per_image': self.duration_spin.value(),
            'transitions': self.transitions_check.isChecked()
        }
        
        return task
    
    def on_video_generated(self, results: List[dict]):
        """Handle video generation completion."""
        self.btn_generate.setEnabled(True)
        self.progress_bar.setVisible(False)
        
        if results and results[0]['status'] == 'success':
            output_path = results[0]['output_path']
            self.statusBar().showMessage(f"Video saved to: {output_path}")
            
            msg = QMessageBox(self)
            msg.setIcon(QMessageBox.Icon.Information)
            msg.setText("Video generated successfully!")
            msg.setInformativeText(f"Saved to:\n{output_path}")
            msg.setWindowTitle("Success")
            msg.addButton("Open Folder", QMessageBox.ButtonRole.AcceptRole)
            msg.addButton("OK", QMessageBox.ButtonRole.RejectRole)
            
            if msg.exec() == 0:  # Open Folder clicked
                self.open_output_folder()
        else:
            error = results[0].get('error', 'Unknown error') if results else 'No results'
            self.statusBar().showMessage(f"Error: {error}")
            QMessageBox.critical(self, "Error", f"Failed to generate video:\n{error}")
        
        logger.info(f"Video generation completed: {results}")
    
    def add_to_batch(self):
        """Add current configuration to batch queue."""
        if not self.media_files:
            QMessageBox.warning(self, "No Media", "Please add images or videos first.")
            return
        
        task = self.create_task_from_ui()
        self.batch_tasks.append(task)
        
        output_name = task['output_name']
        media_count = len(task['media_files'])
        self.batch_list.addItem(f"{output_name} ({media_count} files)")
        
        self.statusBar().showMessage(f"Added to batch: {output_name}")
        logger.info(f"Added task to batch: {output_name}")
    
    def clear_batch(self):
        """Clear batch queue."""
        self.batch_tasks = []
        self.batch_list.clear()
        self.batch_results.clear()
        self.statusBar().showMessage("Batch cleared")
    
    def process_batch(self):
        """Process all videos in batch queue."""
        if not self.batch_tasks:
            QMessageBox.warning(self, "Empty Batch", "Please add videos to batch first.")
            return
        
        self.btn_process_batch.setEnabled(False)
        self.batch_progress_bar.setVisible(True)
        self.batch_progress_bar.setRange(0, len(self.batch_tasks))
        self.batch_progress_bar.setValue(0)
        self.statusBar().showMessage("Processing batch...")
        
        # Process in thread
        self.processing_thread = ProcessingThread(self.batch_tasks)
        self.processing_thread.progress.connect(self.on_batch_progress)
        self.processing_thread.finished.connect(self.on_batch_completed)
        self.processing_thread.start()
    
    def on_batch_progress(self, current: int, total: int, result: dict):
        """Handle batch processing progress update."""
        self.batch_progress_bar.setValue(current)
        self.statusBar().showMessage(f"Processing batch: {current}/{total}")
        
        # Update results
        status_icon = "✓" if result['status'] == 'success' else "✗"
        task = self.batch_tasks[result['task_id']]
        self.batch_results.append(
            f"{status_icon} {task['output_name']}: {result['status']}"
        )
    
    def on_batch_completed(self, results: List[dict]):
        """Handle batch processing completion."""
        self.btn_process_batch.setEnabled(True)
        self.batch_progress_bar.setVisible(False)
        
        success_count = sum(1 for r in results if r['status'] == 'success')
        total = len(results)
        
        self.statusBar().showMessage(
            f"Batch completed: {success_count}/{total} successful"
        )
        
        self.batch_results.append(f"\n--- Batch Complete: {success_count}/{total} successful ---")
        
        QMessageBox.information(
            self,
            "Batch Complete",
            f"Processed {total} videos\n"
            f"Successful: {success_count}\n"
            f"Failed: {total - success_count}"
        )
        
        logger.info(f"Batch processing completed: {success_count}/{total} successful")
    
    def open_output_folder(self):
        """Open the output folder in file explorer."""
        import subprocess
        import platform
        
        system = platform.system()
        try:
            if system == 'Windows':
                subprocess.Popen(['explorer', str(OUTPUT_DIR)])
            elif system == 'Darwin':  # macOS
                subprocess.Popen(['open', str(OUTPUT_DIR)])
            else:  # Linux
                subprocess.Popen(['xdg-open', str(OUTPUT_DIR)])
        except Exception as e:
            logger.error(f"Error opening output folder: {e}")
            QMessageBox.warning(
                self,
                "Error",
                f"Could not open output folder:\n{str(OUTPUT_DIR)}"
            )
