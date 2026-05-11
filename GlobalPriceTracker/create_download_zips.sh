#!/bin/bash

# Create downloads directory if it doesn't exist
mkdir -p /home/runner/workspace/downloads

# Create ZIP file for website source code
echo "Creating ZIP file for website source code..."
cd /home/runner/workspace
zip -r downloads/tesco_website_source_code.zip source_code_1_website

# Create ZIP file for app source code
echo "Creating ZIP file for app source code..."
cd /home/runner/workspace
zip -r downloads/tesco_app_source_code.zip source_code_2_app

echo "ZIP files created successfully in the downloads folder:"
echo "- /home/runner/workspace/downloads/tesco_website_source_code.zip"
echo "- /home/runner/workspace/downloads/tesco_app_source_code.zip"
echo ""
echo "You can download these files from the Replit file explorer."