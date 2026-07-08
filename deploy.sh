#!/bin/bash
# TCPL PPI Prep Portal Deployment Helper Script

echo "=================================================="
echo "🚀 TCPL PPI Prep Portal Deployment Helper"
echo "=================================================="
echo "Choose your deployment method:"
echo "1) Deploy via GitHub (auto-triggers Vercel build)"
echo "2) Deploy directly via Vercel CLI"
echo "=================================================="
read -p "Enter choice (1 or 2): " choice

if [ "$choice" == "1" ]; then
    echo ""
    read -p "👉 Enter your GitHub Repository URL (e.g. https://github.com/username/fmcg-prep.git): " repo_url
    if [ -z "$repo_url" ]; then
        echo "❌ Error: Repository URL cannot be empty."
        exit 1
    fi
    # Remove existing remote if any
    git remote remove origin 2>/dev/null
    # Add new remote and push
    git remote add origin "$repo_url"
    git branch -M main
    echo "⏳ Pushing code to GitHub..."
    git push -u origin main -f
    echo "✅ Pushed successfully! Vercel is now rebuilding your site live at https://fmcg-prep.vercel.app/"
    
elif [ "$choice" == "2" ]; then
    echo ""
    echo "⏳ Logging in to Vercel (completing browser/email prompt)..."
    npx vercel login
    if [ $? -ne 0 ]; then
        echo "❌ Error: Vercel login failed."
        exit 1
    fi
    echo "⏳ Deploying production build to Vercel..."
    npx vercel --prod --yes
    echo "✅ Deployment finished! Your site is live."
    
else
    echo "❌ Invalid selection. Please run the script again and select 1 or 2."
fi
