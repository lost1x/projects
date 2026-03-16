#!/bin/bash

# Cache-busting update script for all HTML pages
# This script adds anti-caching headers and dynamic resource loading to all pages

echo "Starting cache-busting updates for all HTML pages..."

# Array of all HTML files to update
pages=(
    "asset/pages/about.html"
    "asset/pages/agreement.html" 
    "asset/pages/share.html"
    "birth-charts/index.html"
    "crystal-healing/index.html"
    "dream-interpreter/index.html"
    "fortune-teller/index.html"
    "love-language-quiz/index.html"
    "numerology/index.html"
    "rune-casting/index.html"
    "zodiac-calculator/index.html"
)

# Enhanced cache control headers
cache_headers='    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate, max-age=0">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<meta name="referrer" content="no-referrer">
<meta name="cache-control" content="no-transform">'

# Dynamic loading script
dynamic_loader='    <script>
        // Cache-busting helper
        function loadScript(src) {
            const script = document.createElement("script");
            script.src = src + "?v=" + Date.now();
            document.head.appendChild(script);
        }
        
        function loadStylesheet(href) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = href + "?v=" + Date.now();
            document.head.appendChild(link);
        }
        
        // Load resources with cache-busting
        loadStylesheet("../asset/css/main.css");
        loadScript("../asset/js/navigation.js");
        loadScript("../asset/js/image-slideshow.js");
    </script>'

for page in "${pages[@]}"; do
    if [ -f "$page" ]; then
        echo "Updating $page..."
        
        # Update cache headers
        sed -i 's|<meta http-equiv="Cache-Control".*$|'"$cache_headers"'|g' "$page"
        
        # Remove static CSS links and add dynamic loading
        sed -i '/<link rel="stylesheet" href=".*asset\/css\/main.css">/d' "$page"
        
        # Find and replace script tags with dynamic loading
        if grep -q "script src.*asset/js" "$page"; then
            # Create temporary file with the dynamic loader
            echo "$dynamic_loader" > temp_loader.txt
            
            # Replace the script section
            sed -i '/<script src=".*asset\/js/,/<\/script>/c\
            <!-- Scripts -->\
            '"$(cat temp_loader.txt)" "$page"
            
            rm temp_loader.txt
        fi
        
        echo "✓ Updated $page"
    else
        echo "✗ File not found: $page"
    fi
done

echo "Cache-busting updates complete!"
