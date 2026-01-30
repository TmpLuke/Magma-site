# Product Image System Guide

## Overview
Your product image system now uses two separate image types with easy upload functionality:

### 1. **Cover Image** (`image` field)
- This is the main "front cover" image for your product
- Shows on product cards in store listings
- Shows in the carousel on the homepage
- Think of this as your product's "box art" or promotional image

### 2. **Gallery Images** (`gallery` array)
- These are 3+ in-game or menu screenshots
- Only show when someone clicks into the product detail page
- The cover image is NOT shown in the gallery
- These give customers a real look at what they're buying

## How to Upload Images in Admin Panel

### Method 1: Upload Files (Recommended)

1. **Go to Admin Panel** → Products (`/mgmt-x9k2m7/products`)

2. **When Adding/Editing a Product:**
   
   **Cover Image:**
   - Find the "Cover Image (Front Cover)" section
   - Click "Upload Image" button
   - Select your image file (max 5MB)
   - Image will be automatically uploaded and saved
   - Preview appears immediately
   
   **Gallery Images:**
   - Scroll to "Gallery Images (In-Game & Menu)" section
   - Click "Upload Images" button
   - Select multiple images at once (max 5MB each)
   - Images appear in a grid with preview
   - Drag to reorder using arrow buttons
   - Click X to remove any image

### Method 2: Paste URLs

If you already have images hosted elsewhere:
- Use the text input field next to the upload button
- Paste the full URL to your image
- Press Enter or click Add

## Image Recommendations

### Cover Image:
- High quality promotional image
- Can include text/branding
- Should be eye-catching
- Recommended size: 800x600px or 16:9 aspect ratio
- Formats: JPG, PNG, WebP

### Gallery Images:
- Actual in-game screenshots
- Menu/settings screenshots
- Feature demonstrations
- Recommended size: 1920x1080px (16:9 aspect ratio)
- Formats: JPG, PNG, WebP
- Should show the product in action

## Features

✅ **Drag & Drop** - Upload multiple images at once
✅ **Live Preview** - See images immediately after upload
✅ **Reorder** - Use arrow buttons to change gallery order
✅ **Remove** - Click X to delete any image
✅ **URL Support** - Can still paste URLs if needed
✅ **Auto Storage** - Images saved to `/public/uploads/`

## What Changed

✅ **Product cards** (store listing) → Show cover image only
✅ **Product detail page** → Show gallery images only (3+ screenshots)
✅ **Homepage carousel** → Show cover image only
✅ **Removed** → Large banner at top of product detail page
✅ **Added** → Easy file upload with preview

## File Storage

- Uploaded images are stored in `/public/uploads/`
- Files are automatically named with timestamp + random string
- Images are accessible at `/uploads/filename.jpg`
- The uploads folder is gitignored (not committed to repo)

## Example Setup

For a product called "Apex Legends Cheat":

**Cover Image:**
- Upload: `apex-cover.jpg` → Becomes `/uploads/1234567890-abc123.jpg`

**Gallery Images:**
- Upload: `apex-menu.jpg` → Becomes `/uploads/1234567891-def456.jpg`
- Upload: `apex-aimbot.jpg` → Becomes `/uploads/1234567892-ghi789.jpg`
- Upload: `apex-esp.jpg` → Becomes `/uploads/1234567893-jkl012.jpg`

This way, customers see the attractive cover on the store page, then see real screenshots when they click in!
