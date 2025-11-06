from setuptools import setup, find_packages

setup(
    name="video-orchestrator",
    version="1.0.0",
    description="AI-powered desktop application for creating automated vertical videos",
    author="Video Orchestrator Team",
    packages=find_packages(),
    install_requires=[
        "PyQt6>=6.6.0",
        "moviepy>=1.0.3",
        "Pillow>=10.0.0",
        "numpy>=1.24.0",
        "requests>=2.31.0",
        "python-dotenv>=1.0.0",
    ],
    entry_points={
        "console_scripts": [
            "video-orchestrator=video_orchestrator.main:main",
        ],
    },
    python_requires=">=3.8",
)
