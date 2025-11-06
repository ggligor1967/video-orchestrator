"""Main entry point for Video Orchestrator application."""

import sys
from PyQt6.QtWidgets import QApplication
from video_orchestrator.ui.main_window import MainWindow
from video_orchestrator.utils.logger import logger
from video_orchestrator.config import APP_NAME

def main():
    """Run the Video Orchestrator application."""
    logger.info(f"Starting {APP_NAME}")
    
    app = QApplication(sys.argv)
    app.setApplicationName(APP_NAME)
    
    window = MainWindow()
    window.show()
    
    logger.info("Application window shown")
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
