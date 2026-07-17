#!/bin/bash
# Netlify Deployment Script for Caribbean Supply LCL

echo "🚀 Preparing deployment to Netlify..."

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Fix errors before deploying."
    exit 1
fi

echo "✅ Build successful!"
echo ""
echo "📋 Deployment options:"
echo ""
echo "Option 1: Deploy via Netlify CLI (recommended)"
echo "  a) If you have Netlify CLI installed: npx netlify-cli deploy --prod"
echo "  b) First time? Run: npx netlify-cli init"
echo ""
echo "Option 2: Deploy via Netlify UI"
echo "  1. Visit https://app.netlify.com"
echo "  2. Select your 'caribbean-supply-lcl' site"
echo "  3. Go to 'Deploys' tab"
echo "  4. Drag and drop the '.next' and 'public' folders"
echo ""
echo "📝 Current build status:"
echo "  Project: Caribbean Supply LCL"
echo "  Site: lucent-narwhal-220c1f.netlify.app"
echo "  Build folder: .next + public"
echo ""
echo "✨ All fixes included:"
echo "  ✓ Auth refactor for serverless (no file system operations)"
echo "  ✓ Pricing updated to 380€ HT/CBM"
echo "  ✓ Delivery time updated to 60 days"
echo "  ✓ Warehouse address and SKU mandatory alert"
echo "  ✓ Stripe checkout configured"
echo "  ✓ Google Sheets integration ready"
