# 🧪 VIDEO ORCHESTRATOR - TESTING GUIDE
**Core Workflow Testing Instructions**

---

## 🚀 QUICK START

### Prerequisites
- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Windows 10/11 (primary target platform)

### Start the Application

#### 1️⃣ Start Backend (Terminal 1)
```bash
cd d:\playground\Aplicatia\apps\orchestrator
pnpm start
```

**Expected Output**:
```
🚀 Video Orchestrator Backend starting...
✓ Server running on http://127.0.0.1:4545
✓ Static files served at /static
✓ Health check: GET /health
```

#### 2️⃣ Start Frontend (Terminal 2)
```bash
cd d:\playground\Aplicatia\apps\ui
pnpm dev
```

**Expected Output**:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### 3️⃣ Open Browser
Navigate to: **http://localhost:5173/**

---

## ✅ CORE WORKFLOW TEST SCENARIOS

### Test 1: Complete Video Creation Pipeline (Happy Path)

#### Step 1: Story & Script Tab
1. **Enter Topic**: `"A mysterious abandoned hospital"`
2. **Select Genre**: `Horror`
3. **Click**: "Generate Script with AI"
4. **Expected Result**:
   - Loading spinner appears
   - Script generated within 3-5 seconds
   - Hooks and hashtags displayed
   - Virality score calculated automatically
   - "Continue to Background" button enabled
   - Tab status icon changes to ✓ (completed)

**Sample Generated Output**:
```
Script: "You walk through the dark corridors..."
Hooks: ["What I found inside will haunt you forever", ...]
Hashtags: ["#horror", "#mystery", "#abandoned", ...]
Virality Score: 75/100 (High Potential)
```

#### Step 2: Background Tab
1. **Method A - Upload Video** (if you have a test video):
   - Click "Upload Video" button
   - Select a video file (MP4, MOV, etc.)
   - Wait for upload completion
   - Video appears in library
   - Click video to select it

2. **Method B - Smart Suggestions** (recommended):
   - Click "Suggest" button (AI generates background ideas)
   - Review suggestions based on your script
   - Copy keywords for stock footage search
   - Upload a matching video

3. **Optional - Auto-Reframe**:
   - Select detection mode (Face/Motion/Center)
   - Click "Apply Auto-Reframe"
   - Wait for processing
   - New reframed version added to library

**Expected Result**:
- Video preview displays
- Video information shown (duration, resolution, size)
- "Continue to Voice-over" button enabled
- Tab status icon changes to ✓

#### Step 3: Voiceover Tab
1. **Review Script**: Script from Step 1 auto-populated
2. **Select Voice**: Choose from dropdown (e.g., "Amy (English US)")
3. **Adjust Settings**:
   - Speed: `1.0x` (default)
   - Pitch: `1.0x` (default)
4. **Click**: "Generate Voice-over"
5. **Expected Result**:
   - Loading spinner appears
   - Audio generated within 5-10 seconds
   - Audio player appears with preview
   - Can play/pause/download audio
   - "Continue to Audio & SFX" button enabled
   - Tab status icon changes to ✓

#### Step 4: Audio & SFX Tab
1. **Review Voice-over**: Auto-populated from Step 3
2. **Optional - Add Background Music**:
   - Upload audio file (MP3, WAV)
   - Click "Music" button on uploaded file
   - Selected as background music
3. **Optional - Add Sound Effects**:
   - Upload sound effect
   - Click "SFX" button
   - Set start time (e.g., `5.0` seconds)
   - Adjust volume (e.g., `0.7`)
4. **Adjust Mix Settings**:
   - Voiceover Volume: `1.0`
   - Music Volume: `0.3`
   - Enable normalization & compression
5. **Click**: "Process Audio Mix"
6. **Expected Result**:
   - Loading spinner appears
   - Mixed audio generated within 5-10 seconds
   - Audio player appears with final mix
   - "Continue to Subtitles" button enabled
   - Tab status icon changes to ✓

#### Step 5: Subtitles Tab
1. **Review Audio Source**: Processed audio from Step 4
2. **Customize Subtitle Settings** (optional):
   - Font Size: `24`
   - Font Color: White (`#FFFFFF`)
   - Background Color: Black (`#000000`)
   - Background Opacity: `80%`
   - Position: `Bottom`
3. **Click**: "Generate Subtitles"
4. **Expected Result**:
   - Loading spinner appears
   - Subtitles generated within 10-15 seconds
   - Subtitle list displayed with timestamps
   - Can edit individual subtitle entries
   - Preview shows styled subtitles
   - "Continue to Export" button enabled
   - Tab status icon changes to ✓

**Optional - Edit Subtitles**:
- Click edit icon (pencil) on any subtitle
- Modify text
- Click "Save"
- Changes reflected in preview

#### Step 6: Export Tab
1. **Review Project Summary**: All components checked ✓
2. **Select Preset**: `TikTok` (or YouTube/Instagram)
3. **Configure Settings** (optional):
   - Resolution: `1080x1920` (9:16)
   - Frame Rate: `30 fps`
   - Video Bitrate: `8000 kbps`
4. **Enable Overlays**:
   - ✓ Include Subtitles
   - ✓ Burn-in Subtitles
   - ✓ Progress Bar
   - ✓ "Part N" Badge
5. **Enter Output Name**: `my-horror-video`
6. **Click**: "Export Video"
7. **Expected Result**:
   - Export progress bar appears
   - Processing stages shown (0% → 100%)
   - Time estimate: 30-60 seconds
   - Final video ready for download
   - "Download Video" button enabled
   - Tab status icon changes to ✓

**Final Output**:
- MP4 video file (1080×1920, 9:16 aspect ratio)
- Optimized for selected platform
- Includes all overlays (subtitles, progress bar, badges)

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: Backend Not Connected
**Symptom**: "Backend Connection Failed" error in UI  
**Solution**:
```bash
# Terminal 1: Verify backend is running
cd d:\playground\Aplicatia\apps\orchestrator
pnpm start

# Check browser console for errors
# Ensure port 4545 is not in use: netstat -ano | findstr :4545
```

### Issue 2: Script Generation Fails
**Symptom**: "Failed to generate script" error  
**Solution**:
- Check if AI service mock is working
- Review backend console for errors
- Verify `src/services/aiService.js` has mock data

### Issue 3: File Upload Fails
**Symptom**: "Failed to upload" error  
**Solution**:
- Check file size (<500MB for video, <50MB for audio)
- Verify file type (MP4/MOV/AVI for video, MP3/WAV for audio)
- Ensure `data/assets/backgrounds/` directory exists
- Check disk space

### Issue 4: TTS Generation Slow
**Symptom**: Voice-over takes >30 seconds  
**Solution**:
- This is normal for first-time TTS (model loading)
- Subsequent generations should be faster (<10s)
- Check backend console for progress logs

### Issue 5: Export Fails
**Symptom**: "Export failed" error  
**Solution**:
- Verify all assets are present (script, background, voiceover, audio)
- Check backend console for FFmpeg errors
- Ensure FFmpeg is accessible (will be bundled in MSI)

---

## 🧪 ADVANCED TESTING

### Test 2: Error Handling

#### Missing Assets Test
1. Skip directly to Export tab (without completing previous steps)
2. Click "Export Video"
3. **Expected**: Error message "Missing required assets: Script, Background video, Voice-over audio, Processed audio"

#### Invalid File Upload
1. Go to Background tab
2. Try uploading a non-video file (e.g., .txt, .pdf)
3. **Expected**: Error message "Please select a video file"

#### Path Traversal Protection
```bash
# Terminal: Try malicious path
curl -X POST http://localhost:4545/tts/generate \
  -H "Content-Type: application/json" \
  -d '{"text":"test","voice":"en-us","outputPath":"../../../evil.wav"}'

# Expected Response: 403 Forbidden
# {"error":"Invalid output path: path traversal detected"}
```

### Test 3: Concurrent Operations

#### Multiple Tab Navigation
1. Generate script (wait for completion)
2. Immediately switch to Background tab
3. Upload video (don't wait for completion)
4. Switch to Voiceover tab
5. Switch back to Background tab
6. **Expected**: Upload still in progress, state preserved

#### Parallel Requests (Backend Test)
```bash
# Run E2E tests to validate concurrent request handling
cd apps/orchestrator
pnpm test e2e-pipeline --run

# Expected: All 23 tests pass, including concurrent request test
```

---

## 📊 VALIDATION CHECKLIST

### Backend Health
```bash
# Check backend status
curl http://localhost:4545/health

# Expected Response:
# {"status":"ok","message":"Video Orchestrator is running"}
```

### UI Components
- [ ] All 6 tabs load without errors
- [ ] Tab navigation works (click + keyboard arrows)
- [ ] Backend status indicator shows "Connected" (green dot)
- [ ] Progress bar updates as tabs complete

### Core Features
- [ ] Script generation produces valid output
- [ ] Background upload and selection works
- [ ] Voice-over generation creates audio file
- [ ] Audio mixing combines tracks correctly
- [ ] Subtitles generate from audio
- [ ] Export creates final video file

### UX/UI
- [ ] Loading spinners appear during async operations
- [ ] Success notifications show after completion
- [ ] Error messages are user-friendly
- [ ] "Continue to..." buttons enable when tab complete
- [ ] Tab status icons update (✓ for completed)

### Performance
- [ ] Script generation: <5s
- [ ] Voice-over generation: <10s
- [ ] Audio mixing: <10s
- [ ] Subtitle generation: <15s
- [ ] Export: <60s (depends on video length)

---

## 🎬 DEMO VIDEO SCRIPT

**For showcasing the application:**

1. **Opening**: "Today I'll show you how to create viral TikTok videos in under 2 minutes"
2. **Step 1**: "First, I enter a horror story topic and let AI generate the script"
3. **Step 2**: "Next, I upload a spooky background video"
4. **Step 3**: "The AI converts my script into a voice-over"
5. **Step 4**: "I add background music to set the mood"
6. **Step 5**: "Auto-generate subtitles for maximum engagement"
7. **Step 6**: "Export optimized for TikTok with progress bar and subtitles"
8. **Closing**: "And that's it! Ready to upload and go viral"

---

## 📝 TEST REPORTING

### Bug Report Template
```markdown
**Bug Title**: [Brief description]
**Tab**: [Which tab: Story/Background/Voiceover/Audio/Subtitles/Export]
**Steps to Reproduce**:
1. Step 1
2. Step 2
3. ...

**Expected Behavior**: [What should happen]
**Actual Behavior**: [What actually happened]
**Console Errors**: [Any errors in browser console or backend logs]
**Screenshots**: [If applicable]
```

### Feature Request Template
```markdown
**Feature Title**: [Brief description]
**Use Case**: [Why is this needed?]
**Proposed Solution**: [How should it work?]
**Priority**: [Low/Medium/High]
```

---

## 🚀 NEXT STEPS AFTER TESTING

1. **Report Issues**: Document any bugs or UX improvements
2. **Performance Benchmarks**: Record actual processing times
3. **User Feedback**: Gather impressions from test users
4. **MSI Deployment**: Proceed to Phase 3 (packaging for distribution)

---

**Testing Guide Version**: 1.0  
**Last Updated**: October 14, 2025  
**Applies to**: Module 9 Phase 2 (Core Workflow)  
**Status**: Ready for QA Testing ✅
