# 🐛 BUG FIXES - Plan Complet de Implementare
**Data: 14 Octombrie 2025**
**Versiune: 1.0**
**Status: IN PROGRESS**

---

## 📊 REZUMAT EXECUTIV

**Total probleme identificate**: 23
- 🔴 **CRITICE (Blocante)**: 5 
- 🟠 **HIGH Priority**: 8
- 🟡 **MEDIUM Priority**: 6
- 🟢 **LOW Priority**: 4

**Timp estimat total**: 15-20 ore
**Timp pentru blocante (Etapa 1)**: 2-3 ore

---

## 🚨 ETAPA 1 - PROBLEME BLOCANTE (IMEDIAT)

### 1.1 ❌ CRASH: batchService.cleanupOldJobs inexistent
**Locație**: `apps/orchestrator/src/server.js` linia ~50
**Problemă**: Funcția nu există, crash la fiecare 60 minute
**Status**: 🟢 IMPLEMENTING

### 1.2 ❌ Cross-platform Binaries (Windows-only hardcoded)
**Locație**: `apps/orchestrator/src/config/paths.js`
**Problemă**: `.exe` hardcodat, nu funcționează pe Linux/Mac
**Status**: 🟢 IMPLEMENTING

### 1.3 ❌ Missing Environment Variables
**Locație**: `apps/orchestrator/src/config/config.js`
**Problemă**: API keys pentru stock media nu sunt expuse
**Status**: 🟢 IMPLEMENTING

### 1.4 ❌ Middleware Request Size Limits
**Locație**: `apps/orchestrator/src/server.js`
**Problemă**: Limită globală 500MB pentru toate rutele
**Status**: 🟢 IMPLEMENTING

### 1.5 ❌ Path Resolution Issues
**Locație**: Multiple services
**Problemă**: Inconsistent path handling (absolute vs relative)
**Status**: 🟢 IMPLEMENTING

---

## 🟠 ETAPA 2 - MEDIA PIPELINE & BATCH (HIGH Priority)

### 2.1 Pipeline ID vs Path
### 2.2 Video/Audio Signatures
### 2.3 Export Cleanup
### 2.4 Batch voiceId vs voice
### 2.5 TemplateService Container
### 2.6 CaptionStyling Cross-platform

---

## 🟡 ETAPA 3 - CONTRACTE & UI ALIGNMENT

### 3.1 Genre Mismatch
### 3.2 Voice Response Format (✅ DONE)
### 3.3 Export Path Response
### 3.4 Batch/Scheduler Testing
### 3.5 packages/shared Sync

---

## 🟢 ETAPA 4 - QA & TESTING

### 4.1 Missing Service Tests
### 4.2 Documentation Updates

---

**Document creat**: 14 Octombrie 2025
**Autor**: GitHub Copilot
**Status**: Implementation in progress
