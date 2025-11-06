 Backend

  - High – apps/orchestrator/src/app.js:24-30: Global express.json/urlencoded 1 MB parsers run before the /assets/backgrounds/import 500 MB overrides, so large uploads hit 413
    Payload Too Large before the relaxed middleware ever executes. Reorder or gate the global parsers for those routes.
  - Critical – apps/orchestrator/src/server.js:22-29: Startup always calls batchService.cleanupOldJobs, but that method doesn’t exist; the first interval tick throws and kills
    the process.
  - Critical – apps/orchestrator/src/services/pipelineService.js:68-82: Pipeline passes {backgroundId} and later {videoId} to videoService.*, yet the service expects absolute
    inputPath strings. Every pipeline run fails before producing media.
  - High – apps/orchestrator/src/services/batchService.js:124-136: Batch jobs forward voiceId/includeSubtitles to pipelineService.buildCompleteVideo, but that service expects
    voice and options.generateSubtitles; it returns only {jobId}. Subsequent status reporting tries to read videoPath/duration/size from result and always gets null.
  - High – apps/orchestrator/src/services/audioService.js:70-86: getAudioInfo calls ffmpegService.getVideoInfo, which rejects audio-only inputs (“No video stream found”), so the
    endpoint can never inspect standalone audio files.
  - High – apps/orchestrator/src/middleware/validatePath.js:49-120: The validator ignores query parameters; /audio/info?path=… and /video/info accept arbitrary paths without
    sandboxing.
  - High – apps/orchestrator/src/services/ffmpegService.js:7-12, services/ttsService.js:14-22, services/subsService.js:12-15: All hard-code Windows-only .exe locations
    under ../../tools/.... Linux/macOS builds can’t locate binaries and every media operation fails.
  - Medium – apps/orchestrator/src/services/videoService.js:67-88: applySpeedRamp ignores endTime/speedMultiplier; if callers omit startTime, the FFmpeg filter emits
    time,undefined and the command crashes.
  - Medium – apps/orchestrator/src/services/exportService.js:70-106: When both audio and subtitles are applied, the intermediate “with audio” file is never removed, leaving
    orphaned cache files each export.
  - Medium – apps/orchestrator/src/services/assetsService.js:7 (and similar process.cwd() + ../../ paths across services): When the app starts from the repo root (default with
    pnpm), these resolve outside the project (e.g., /mnt/d/data/...) and all file operations throw ENOENT.

  Frontend

  - Critical – apps/ui/src/components/tabs/StoryScriptTab.svelte:38-57: UI sends genre: 'true-crime', but the backend Zod schema only allows 'true crime'. Every generation call
    fails with 400.
  - High – apps/ui/src/components/tabs/BackgroundTab.svelte:170-207: autoReframeVideo posts {videoId: …} while the API requires inputPath. Additionally, scriptGenre reuses the
    'true-crime' value, so background suggestion requests are also rejected.
  - Critical – apps/ui/src/components/tabs/VoiceoverTab.svelte:44, 115-129: The store lookup uses nonexistent context.script.generated, keeping script empty, and generateTTS
    is invoked as generateTTS(script, {...}), so the request body is just a raw string. Even if it succeeded, the code expects result.audioPath, but the backend responds with
    outputPath, leaving the tab without a playable file.
  - Critical – apps/ui/src/lib/api.js:79-146: The audio helper functions (processAudio, uploadAudio, listAudioAssets, deleteAudioAsset) target endpoints that the backend never
    implemented; the Audio & SFX tab cannot function.
  - Critical – apps/ui/src/components/tabs/SubtitlesTab.svelte:14-65: Imports updateSubtitles from $lib/api.js, but no such export exists, causing a runtime import error. The tab
    then calls generateSubtitles(processedAudio.path, subtitleSettings), passing a positional string instead of the { audioId } object the backend expects.
  - Critical – apps/ui/src/components/tabs/ExportTab.svelte:84-144: Assumes a long-running export job returning exportId and polls /export/status/:id, yet the backend finishes
    synchronously and exposes no status route. The polling immediately hits 404 and marks every export as failed.
  - High – apps/ui/src/lib/api.js:167-188: listTTSVoices returns { voices: [...] }, but VoiceoverTab treats the value as an array, so availableVoices.length is undefined and the
    dropdown never populates.
  - Medium – apps/ui/src/App.svelte:6-22: The tab loader omits BatchProcessingTab and SchedulerTab; those screens can’t be reached from the navigation even though components
    exist.
  - Medium – apps/ui/src/routes/+page.svelte:5-13: The SvelteKit entry imports components like $lib/components/tabs/StoryScript.svelte that aren’t present. Building the kit-based
    UI fails.

  Shared Package

  - High – packages/shared/src/types.ts:6-18: ProjectContext.script.generated and 'true crime' enumerations don’t match the frontend (text, 'true-crime') or backend, leading to
    type safety issues for consumers.
  - High – packages/shared/src/schemas.ts:44-125: The exported schemas (e.g., TTSGenerationResponse, ExportVideoSchema, PipelineBuildSchema) model response/request shapes that
    diverge from the API implementations (expecting audioPath, exportId, topic fields that never exist). Any code validating against these schemas will raise false positives or
    reject valid payloads.

  Next Steps

  1. Reconcile backend service contracts (pipeline/video/audio/export/tts) and adjust the UI + shared schemas to the actual request/response shapes.
  2. Fix the routing/data validation gaps (query path validation, genre naming consistency, missing endpoints) and add integration tests to lock behavior down.
  3. Audit platform-specific paths/binaries so the orchestrator works on macOS/Linux; consider moving path resolution into config with OS detection.

