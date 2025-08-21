#!/usr/bin/env python3
"""
Build script for Excel WhatsApp Sender
Creates an executable using PyInstaller
"""
import os
import sys
import subprocess
import shutil
from pathlib import Path

def install_pyinstaller():
    """Install PyInstaller if not already installed"""
    try:
        import PyInstaller
        print("✓ PyInstaller already installed")
    except ImportError:
        print("Installing PyInstaller...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
        print("✓ PyInstaller installed successfully")

def create_spec_file():
    """Create a PyInstaller spec file for the project"""
    spec_content = '''# -- mode: python ; coding: utf-8 --
block_cipher = None
a = Analysis(
    ['app.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('templates', 'templates'),
        ('files/master_excel.xlsx', 'files'),
    ],
    hiddenimports=[
        'pandas',
        'openpyxl',
        'requests',
        'flask',
        'PIL',
        'PIL.Image',
        'PIL.ImageDraw',
        'PIL.ImageFont',
        'werkzeug',
        'jinja2',
        'markupsafe',
        'itsdangerous',
        'click',
        'blinker',
        'eventlet',
        'eventlet.hubs.epolls',  # Manually specify epolls as hidden import
    ],
    hookspath=['./hooks'],  # Specify the hooks folder
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)
exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='Excel_WhatsApp_Sender',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,
)
'''
    with open('Excel_WhatsApp_Sender.spec', 'w') as f:
        f.write(spec_content)
    print("✓ Created PyInstaller spec file")
def build_executable():
    """Build the executable using PyInstaller"""
    print("Building executable...")
    
    # Clean previous builds
    if os.path.exists('build'):
        shutil.rmtree('build')
    if os.path.exists('dist'):
        shutil.rmtree('dist')
    
    # Run PyInstaller
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--onefile",
        "--console",
        "--name=Excel_WhatsApp_Sender",
        "--add-data=templates;templates",
        # "--add-data=files/master_excel.xlsx;files",  # Corrected the path for master_excel.xlsx
        "--collect-all=flask",
        "--collect-all=PIL",
        "--collect-all=pandas",
        "--collect-all=openpyxl",
        "--hidden-import=requests",
        "--hidden-import=werkzeug",
        "--hidden-import=jinja2",
        "--hidden-import=markupsafe",
        "--hidden-import=itsdangerous",
        "--hidden-import=click",
        "--hidden-import=blinker",
        "--hidden-import=flask.templating",
        "--hidden-import=flask.static",
        "app.py"
    ]
    
    try:
        subprocess.check_call(cmd)
        print("✓ Executable built successfully!")
        
        # Check if executable was created
        exe_path = Path("dist/Excel_WhatsApp_Sender.exe")
        if exe_path.exists():
            print(f"✓ Executable created at: {exe_path.absolute()}")
            return str(exe_path.absolute())
        else:
            print("✗ Executable not found in dist folder")
            return None
            
    except subprocess.CalledProcessError as e:
        print(f"✗ Build failed with error: {e}")
        return None

def create_distribution_folder():
    """Create a distribution folder with all necessary files"""
    dist_folder = Path("Excel_WhatsApp_Sender_Distribution")
    
    # Clean previous distribution
    if dist_folder.exists():
        shutil.rmtree(dist_folder)
    
    dist_folder.mkdir()
    
    # Copy executable
    exe_source = Path("dist/Excel_WhatsApp_Sender.exe")
    if exe_source.exists():
        shutil.copy2(exe_source, dist_folder)
        print("✓ Copied executable to distribution folder")
    
    # # Copy master Excel file from the "files" folder
    # master_excel = Path("files/master_excel.xlsx")
    # if master_excel.exists():
    #     shutil.copy2(master_excel, dist_folder)
    #     print("✓ Copied master Excel file")
    
    # Create README
    readme_content = """# Excel WhatsApp Sender
## How to Use
1. Double-click Excel_WhatsApp_Sender.exe to start the application
2. The application will open in your default web browser
3. Upload your Excel file with client details
4. Enter your WhatsApp API key
5. Set the time interval between messages (5-100 seconds)
6. Click "Start Processing" to begin sending WhatsApp messages

## Requirements
- Windows 10 or later
- Internet connection for WhatsApp API
- Excel file with client details in the required format

## File Format
Your Excel file should contain:
- Client name in column A
- Phone number with "PH :" prefix in column B
- Bill details in subsequent rows
- "TOTAL" row to mark the end of each client's data

## Support
If you encounter any issues, please check:
1. Your internet connection
2. The format of your Excel file
3. The validity of your WhatsApp API key

## Generated Files
The application will create:
- generated_reports/ folder with Excel reports and images
- uploads/ folder with uploaded files

## Troubleshooting
If images are not being generated properly:
- Make sure Arial font is installed on your system
- Check that the generated_reports folder has write permissions
- Verify that your Excel data doesn't contain special characters
"""
    
    with open(dist_folder / "README.txt", 'w') as f:
        f.write(readme_content)
    print("✓ Created README file")
    
    # Create a batch file to run the application
    batch_content = """@echo off
echo Starting Excel WhatsApp Sender...
echo Please wait while the application loads...
Excel_WhatsApp_Sender.exe
pause
"""
    
    with open(dist_folder / "Start Application.bat", 'w') as f:
        f.write(batch_content)
    print("✓ Created batch file for easy execution")
    
    return dist_folder

def main():
    """Main build process"""
    print("=== Excel WhatsApp Sender - Build Process ===")
    
    # Check if we're in the right directory
    if not os.path.exists('app.py'):
        print("✗ Error: app.py not found. Please run this script from the project root directory.")
        return False
    
    # Check if required files exist
    # required_files = ['templates/index.html', 'files/master_excel.xlsx']
    # for file in required_files:
    #     if not os.path.exists(file):
    #         print(f"✗ Error: Required file '{file}' not found.")
    #         return False
    
    # Install PyInstaller
    install_pyinstaller()
    
    # Build executable
    exe_path = build_executable()
    if not exe_path:
        print("✗ Build failed!")
        return False
    
    # Create distribution folder
    dist_folder = create_distribution_folder()
    
    print(f"\n=== Build Complete ===")
    print(f"✓ Executable: {exe_path}")
    print(f"✓ Distribution folder: {dist_folder.absolute()}")
    print(f"\nYou can now distribute the contents of '{dist_folder.name}' folder")
    print(f"Users can run the application by double-clicking 'Start Application.bat'")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)
