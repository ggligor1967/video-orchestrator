# 🎨 Video Orchestrator - UML Diagrams

## 1. Component Diagram (High-Level Architecture)

```plantuml
@startuml Video Orchestrator - Component Diagram

!define RECTANGLE class

skinparam componentStyle rectangle
skinparam backgroundColor #FEFEFE
skinparam component {
  BackgroundColor<<frontend>> #E3F2FD
  BackgroundColor<<backend>> #FFF3E0
  BackgroundColor<<storage>> #F3E5F5
  BackgroundColor<<external>> #E8F5E9
}

package "Desktop Application" {
  [Tauri Shell] <<frontend>>
  [Svelte UI] <<frontend>>
  [API Client] <<frontend>>
  
  [Svelte UI] --> [API Client]
  [Tauri Shell] --> [Svelte UI]
}

package "Backend API Server" {
  [Express Router] <<backend>>
  [Controllers] <<backend>>
  [Services] <<backend>>
  [Utils] <<backend>>
  
  [Express Router] --> [Controllers]
  [Controllers] --> [Services]
  [Services] --> [Utils]
}

package "Storage Layer" {
  [File System] <<storage>>
  [JSON Configs] <<storage>>
  [Media Files] <<storage>>
  [Cache] <<storage>>
}

package "External Tools" {
  [FFmpeg] <<external>>
  [Piper TTS] <<external>>
  [Whisper] <<external>>
}

package "External APIs" {
  [OpenAI API] <<external>>
  [Gemini API] <<external>>
  [Pexels API] <<external>>
}

[API Client] -down-> [Express Router] : HTTP/REST
[Services] -down-> [File System] : Read/Write
[Services] -down-> [FFmpeg] : Process
[Services] -down-> [Piper TTS] : Generate
[Services] -down-> [Whisper] : Transcribe
[Services] -right-> [OpenAI API] : Generate
[Services] -right-> [Gemini API] : Generate
[Services] -right-> [Pexels API] : Search

@enduml
```

---

## 2. Class Diagram (Service Layer)

```plantuml
@startuml Video Orchestrator - Service Layer

skinparam classAttributeIconSize 0
skinparam backgroundColor #FEFEFE

class ServiceContainer {
  -services: Map
  +registerSingleton(name, factory)
  +resolve(name): Service
  +override(name, instance)
}

abstract class BaseService {
  #logger: Logger
  #config: Config
}

class AIService extends BaseService {
  -openaiClient: OpenAI
  -geminiClient: Gemini
  +generateScript(options): Script
  +generateCompletion(prompt): String
}

class ContentAnalyzerService extends BaseService {
  -aiService: AIService
  +analyzeScript(script): Analysis
  +analyzeVideoContext(context): ContextAnalysis
  +getRealtimeSuggestions(state): Suggestions
}

class SmartAssetRecommenderService extends BaseService {
  -aiService: AIService
  -assetsService: AssetsService
  -stockMediaService: StockMediaService
  +getRecommendations(script): Recommendations
  -recommendBackgrounds(script): Backgrounds
  -recommendMusic(script): Music
  -recommendSFX(script): SFX
}

class AutoPilotService extends BaseService {
  -aiService: AIService
  -pipelineService: PipelineService
  -contentAnalyzerService: ContentAnalyzerService
  -smartAssetRecommenderService: SmartAssetRecommenderService
  -activeJobs: Map
  +createVideo(options): Video
  +getJobStatus(jobId): JobStatus
  -generateScriptWithFallback(): Script
  -selectAssetsWithFallback(): Assets
}

class VideoService extends BaseService {
  -ffmpegPath: String
  +processVideo(input, output, options): Video
  +cropToVertical(input, output): Video
  +addOverlay(video, overlay): Video
}

class TTSService extends BaseService {
  -piperPath: String
  -modelsDir: String
  +generate(text, voice): Audio
  +listVoices(): Voice[]
}

class SubsService extends BaseService {
  -whisperPath: String
  +generate(audio): Subtitles
  +format(subtitles, style): String
}

class PipelineService extends BaseService {
  -aiService: AIService
  -videoService: VideoService
  -audioService: AudioService
  -ttsService: TTSService
  -subsService: SubsService
  +build(config): Video
  +execute(steps): Result
}

ServiceContainer --> AIService
ServiceContainer --> ContentAnalyzerService
ServiceContainer --> SmartAssetRecommenderService
ServiceContainer --> AutoPilotService
ServiceContainer --> VideoService
ServiceContainer --> TTSService
ServiceContainer --> SubsService
ServiceContainer --> PipelineService

AutoPilotService --> AIService
AutoPilotService --> PipelineService
AutoPilotService --> ContentAnalyzerService
AutoPilotService --> SmartAssetRecommenderService

ContentAnalyzerService --> AIService
SmartAssetRecommenderService --> AIService

PipelineService --> AIService
PipelineService --> VideoService
PipelineService --> TTSService
PipelineService --> SubsService

@enduml
```

---

## 3. Sequence Diagram (Auto-Pilot Video Creation)

```plantuml
@startuml Auto-Pilot Video Creation Flow

actor User
participant "Frontend\n(Svelte)" as UI
participant "API Client" as API
participant "AutoPilot\nController" as Controller
participant "AutoPilot\nService" as AutoPilot
participant "AI Service" as AI
participant "Content\nAnalyzer" as Analyzer
participant "Smart Asset\nRecommender" as Recommender
participant "Pipeline\nService" as Pipeline
database "File System" as FS

User -> UI: Click "Create Video"
activate UI

UI -> API: POST /auto-pilot/create\n{topic, genre, duration}
activate API

API -> Controller: createVideo(request)
activate Controller

Controller -> AutoPilot: createVideo(options)
activate AutoPilot

AutoPilot -> AutoPilot: Create job\n(jobId, status: running)

== Step 1: Script Generation ==
AutoPilot -> AI: generateScript(topic, genre)
activate AI
alt AI Success
  AI --> AutoPilot: script
else AI Failure
  AutoPilot -> AutoPilot: Use template fallback
end
deactivate AI

== Step 2: Content Analysis ==
AutoPilot -> Analyzer: analyzeScript(script)
activate Analyzer
alt Analyzer Success
  Analyzer --> AutoPilot: analysis
else Analyzer Failure
  AutoPilot -> AutoPilot: Use default scores
end
deactivate Analyzer

== Step 3: Asset Selection ==
AutoPilot -> Recommender: getRecommendations(script)
activate Recommender
alt Recommender Success
  Recommender --> AutoPilot: assets
else Recommender Failure
  AutoPilot -> AutoPilot: Use default assets
end
deactivate Recommender

== Step 4-7: Video Processing ==
AutoPilot -> Pipeline: build(config)
activate Pipeline
Pipeline -> FS: Process & Export
activate FS
FS --> Pipeline: video path
deactivate FS
Pipeline --> AutoPilot: video
deactivate Pipeline

AutoPilot -> AutoPilot: Update job\n(status: complete)

AutoPilot --> Controller: {success, jobId, video}
deactivate AutoPilot

Controller --> API: 201 Created\n{jobId, video}
deactivate Controller

API --> UI: Response
deactivate API

UI -> User: Show success\n"Video ready!"
deactivate UI

@enduml
```

---

## 4. Activity Diagram (Video Export Workflow)

```plantuml
@startuml Video Export Workflow

start

:User configures export settings;

:Click "Export Video";

:Frontend sends POST /export/video;

partition "Backend Processing" {
  :Validate input parameters;
  
  if (Valid?) then (yes)
    :Create export job;
    
    fork
      :Process video with FFmpeg;
    fork again
      :Mix audio tracks;
    fork again
      :Generate subtitles;
    end fork
    
    :Combine all elements;
    
    :Apply brand kit (if selected);
    
    :Render final video;
    
    if (Export successful?) then (yes)
      :Save to data/exports/;
      :Return video path;
    else (no)
      :Log error;
      :Return error response;
      stop
    endif
    
  else (no)
    :Return validation error;
    stop
  endif
}

:Frontend receives response;

:Display success notification;

:Open export folder;

stop

@enduml
```

---

## 5. State Diagram (Job Status)

```plantuml
@startuml Job Status State Machine

[*] --> Pending : Job created

Pending --> Running : Start processing

Running --> Running : Progress update\n(0% → 100%)

Running --> Complete : All steps successful
Running --> Failed : Error occurred

Complete --> [*]
Failed --> [*]

note right of Running
  Steps:
  1. Script (10%)
  2. Analysis (20%)
  3. Assets (35%)
  4. Voice-over (50%)
  5. Audio (65%)
  6. Subtitles (80%)
  7. Export (100%)
end note

@enduml
```

---

## 6. Deployment Diagram

```plantuml
@startuml Deployment Diagram

node "User's Windows PC" {
  
  artifact "MSI Installer" {
  }
  
  node "Tauri Desktop App" {
    component "Svelte Frontend" as Frontend
    component "Rust Wrapper" as Tauri
  }
  
  node "Node.js Backend" {
    component "Express Server\n(Port 4545)" as Backend
  }
  
  folder "External Tools" {
    component "FFmpeg" as FFmpeg
    component "Piper TTS" as Piper
    component "Whisper" as Whisper
  }
  
  database "File System" {
    folder "data/assets" as Assets
    folder "data/exports" as Exports
    folder "data/cache" as Cache
  }
  
  Frontend -down-> Backend : HTTP\nlocalhost:4545
  Backend -down-> FFmpeg : Execute
  Backend -down-> Piper : Execute
  Backend -down-> Whisper : Execute
  Backend -down-> Assets : Read/Write
  Backend -down-> Exports : Write
  Backend -down-> Cache : Read/Write
}

cloud "External APIs" {
  component "OpenAI API" as OpenAI
  component "Gemini API" as Gemini
  component "Pexels API" as Pexels
}

Backend -right-> OpenAI : HTTPS
Backend -right-> Gemini : HTTPS
Backend -right-> Pexels : HTTPS

@enduml
```

---

## 7. Package Diagram (Monorepo Structure)

```plantuml
@startuml Package Diagram

package "video-orchestrator" {
  
  package "apps" {
    package "ui" {
      package "src" {
        package "components" {
          [StoryScriptTab]
          [BackgroundTab]
          [VoiceoverTab]
          [AudioTab]
          [SubtitlesTab]
          [ExportTab]
        }
        package "stores" {
          [appStore]
          [projectStore]
        }
        package "lib" {
          [API Client]
        }
      }
      package "src-tauri" {
        [Tauri Config]
        [Rust Main]
      }
    }
    
    package "orchestrator" {
      package "src" {
        package "routes" {
          [AI Routes]
          [Video Routes]
          [Export Routes]
          [Auto-Pilot Routes]
        }
        package "controllers" {
          [AI Controller]
          [Video Controller]
          [Auto-Pilot Controller]
        }
        package "services" {
          [AI Service]
          [Video Service]
          [Auto-Pilot Service]
        }
        package "utils" {
          [Logger]
          [Service Container]
        }
      }
    }
  }
  
  package "packages" {
    package "shared" {
      [Types]
      [Schemas]
      [Utils]
    }
  }
  
  package "tools" {
    [FFmpeg]
    [Piper]
    [Whisper]
  }
  
  package "data" {
    [Assets]
    [Exports]
    [Cache]
  }
}

[API Client] ..> [AI Routes] : HTTP
[AI Routes] --> [AI Controller]
[AI Controller] --> [AI Service]
[AI Service] ..> [Types] : uses
[AI Service] ..> [FFmpeg] : executes

@enduml
```

---

## 8. Entity Relationship Diagram (File-Based Storage)

```plantuml
@startuml Entity Relationship Diagram

entity "Template" {
  * id : String
  --
  name : String
  description : String
  category : String
  config : JSON
  createdAt : DateTime
}

entity "BrandKit" {
  * id : String
  --
  name : String
  colors : JSON
  fonts : JSON
  logoPath : String
  introPath : String
  outroPath : String
  createdAt : DateTime
}

entity "Project" {
  * id : String
  --
  name : String
  genre : String
  scriptContent : String
  backgroundPath : String
  audioTracks : JSON[]
  subtitlesPath : String
  status : String
}

entity "Background" {
  * path : String
  --
  name : String
  duration : Number
  resolution : String
  category : String
}

entity "Audio" {
  * path : String
  --
  name : String
  duration : Number
  mood : String
  genre : String
}

entity "Subtitle" {
  * path : String
  --
  format : String
  language : String
  style : String
}

entity "Export" {
  * path : String
  --
  projectId : String
  format : String
  resolution : String
  duration : Number
  createdAt : DateTime
}

Project }o--|| Template : uses
Project }o--|| BrandKit : uses
Project }o--|| Background : uses
Project }o--|{ Audio : uses
Project }o--|| Subtitle : uses
Project ||--o{ Export : generates

note right of Project
  Projects are in-memory only
  (not persisted to disk yet)
end note

note right of Template
  Stored as JSON files
  in data/templates/
end note

note right of BrandKit
  Stored as JSON configs
  in data/brands/configs/
  Assets in data/brands/assets/
end note

@enduml
```

---

## How to View UML Diagrams

### Option 1: PlantUML Online
1. Visit: https://www.plantuml.com/plantuml/uml/
2. Copy diagram code
3. Paste and view

### Option 2: VS Code Extension
1. Install "PlantUML" extension
2. Open this file
3. Press `Alt+D` to preview

### Option 3: IntelliJ IDEA
1. Install "PlantUML integration" plugin
2. Right-click diagram code
3. Select "Show PlantUML Diagram"

---

## Diagram Legend

**Colors**:
- 🔵 Blue: Frontend components
- 🟠 Orange: Backend components
- 🟣 Purple: Storage layer
- 🟢 Green: External tools/APIs

**Relationships**:
- `-->` : Direct dependency
- `..>` : Uses/References
- `--o` : Composition
- `}o--` : Aggregation

---

**Generated**: 2024-01-15
**Tool**: PlantUML
**Format**: UML 2.5
