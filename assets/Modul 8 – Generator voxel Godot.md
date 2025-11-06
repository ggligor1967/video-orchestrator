*Modul 8 – Generator voxel Godot
Un fundal original „blocky-parkour-like”, cu mișcare constantă, culori low-saturation și fără HUD. Proiect Godot 4.x, rulat local și capturat cu OBS la 1080p/30fps, apoi importat automat în orchestrator.*Planning content for Godot voxel generator**

For this, I'll create a concise guide for Module 8 focusing on a voxel generator in Godot. I need to structure it well, including a basic Godot project setup, GDScript code for the endless runner voxel scene, and export instructions. I think I should mention the asset import process, controls for colour and speed, and how to integrate with an app via the Asset Manager. Not sure how to tackle testing — I'll suggest manual QA steps. Need to cover OBS recording too! I'll keep everything under 6 sections and ensure it remains clear and practical.
# Modul 8 – Generator voxel Godot

Un fundal original „blocky-parkour-like”, cu mișcare constantă, culori low-saturation și fără HUD. Proiect Godot 4.x, rulat local și capturat cu OBS la 1080p/30fps, apoi importat automat în orchestrator.

---

## Arhitectură proiect Godot

```
apps/godot-voxel-runner/
├─ project.godot
├─ scenes/
│  ├─ Main.tscn
│  ├─ Chunk.tscn
│  └─ Sky.tscn
├─ scripts/
│  ├─ Main.gd
│  ├─ Chunk.gd
│  └─ Utils.gd
├─ assets/
│  └─ palettes/low_sat_palette.tres
└─ shaders/
   └─ low_saturation.gdshader
```

- **Engine:** Godot 4.2+ (Forward+) pentru performanță stabilă.
- **Render:** low-saturation, lumină uniformă, fără umbre grele (fără distrageri).
- **Design:** endless runner cu „chunk”-uri voxel generate procedural, camera pe rail, mișcare constantă.

---

## Scenă și scripturi principale

### scenes/Main.tscn
```ini
[gd_scene load_steps=4 format=3 uid="uid://main"]
[node name="Main" type="Node3D"]
script = ExtResource("res://scripts/Main.gd")

[node name="WorldEnv" type="WorldEnvironment" parent="."]
environment = SubResource("Environment_1")

[sub_resource type="Environment" id=1]
background_mode = 2 # Sky
ambient_light_color = Color(0.85, 0.87, 0.9, 1.0)
ambient_light_energy = 0.8

[node name="Camera" type="Camera3D" parent="."]
transform = Transform3D(Basis(), Vector3(0, 3.2, -7))

[node name="DirectionalLight" type="DirectionalLight3D" parent="."]
light_energy = 1.0
shadow_enabled = false

[node name="Sky" instance=ExtResource("res://scenes/Sky.tscn") parent="."]

[node name="ChunkPool" type="Node3D" parent="."]
```

### scenes/Chunk.tscn
```ini
[gd_scene load_steps=2 format=3]
[node name="Chunk" type="Node3D"]
script = ExtResource("res://scripts/Chunk.gd")

[node name="Grid" type="MultiMeshInstance3D" parent="."]
# MultiMesh configurat din script pentru cuburi (CubeMesh)
```

### scenes/Sky.tscn
```ini
[gd_scene load_steps=2 format=3]
[node name="Sky" type="CSGSphere3D"]
material = null
radius = 200.0
```

### scripts/Utils.gd
```gdscript
extends Node

static func make_cube_mesh(size: float = 1.0) -> ArrayMesh:
	var cube := BoxMesh.new()
	cube.size = Vector3(size, size, size)
	return cube

static func palette_low_sat() -> Array:
	return [
		Color8(112, 122, 138), # slate
		Color8(100, 124, 118), # teal gray
		Color8(134, 118, 96),  # sand
		Color8(92, 92, 104),   # dusk
		Color8(140, 136, 128)  # taupe
	]
```

### scripts/Chunk.gd
```gdscript
extends Node3D

@export var length:int = 40
@export var width:int = 8
@export var height:int = 4
@export var density:float = 0.18
@export var block_size:float = 1.0
@export var seed:int = 0

var mm: MultiMesh
var multimesh_instance: MultiMeshInstance3D

func _ready():
	multimesh_instance = $Grid
	mm = MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.use_colors = true
	var mesh = Utils.make_cube_mesh(block_size)
	mm.mesh = mesh
	_generate()
	multimesh_instance.multimesh = mm

func _generate():
	var rng = RandomNumberGenerator.new()
	rng.seed = seed if seed != 0 else randi()
	var colors = Utils.palette_low_sat()
	# Estimare număr elemente
	var max_blocks = int(length * width * height * density)
	mm.instance_count = max_blocks
	var count = 0
	for x in length:
		for z in width:
			# platform „parkour”: înălțime mică + goluri discrete
			if rng.randf() < density and (x % 3 != 0):
				var h = int(rng.randi_range(0, height))
				var t = Transform3D(Basis(), Vector3(z - width/2.0, h, x))
				mm.set_instance_transform(count, t)
				mm.set_instance_color(count, colors[rng.randi_range(0, colors.size()-1)])
				count += 1
	mm.instance_count = count  # ajustează la numărul real
```

### scripts/Main.gd
```gdscript
extends Node3D

@export var chunk_scene:PackedScene
@export var chunk_length:int = 40
@export var speed:float = 5.0
@export var max_chunks:int = 8

var chunks:Array[Node3D] = []
var traveled:float = 0.0

func _ready():
	if chunk_scene == null:
		chunk_scene = load("res://scenes/Chunk.tscn")
	for i in range(max_chunks):
		_spawn_chunk(i * chunk_length)

func _process(delta):
	var move = speed * delta
	traveled += move
	# Muta camera înainte
	$Camera.translate(Vector3(0, 0, move))
	# Când primul chunk este depășit, reciclează-l în față
	var cam_z = $Camera.global_transform.origin.z
	if chunks.size() > 0:
		var first = chunks[0]
		var last = chunks[chunks.size()-1]
		if first.global_transform.origin.z + chunk_length < cam_z - chunk_length:
			# mute chunk în fața ultimului
			first.global_transform.origin.z = last.global_transform.origin.z + chunk_length
			# reseed pentru variație
			if first.has_method("_generate"):
				first.seed = randi()
				first._generate()
			# reordonare
			chunks.push_back(first)
			chunks.pop_front()

func _spawn_chunk(z_offset:float):
	var c:Node3D = chunk_scene.instantiate()
	c.global_transform.origin = Vector3(0, 0, z_offset)
	$ChunkPool.add_child(c)
	chunks.append(c)
```

### shaders/low_saturation.gdshader (opțional)
```glsl
shader_type spatial;
render_mode unshaded;

uniform float saturation : hint_range(0.0, 1.0) = 0.4;

void fragment() {
	vec3 col = COLOR.rgb;
	float gray = dot(col, vec3(0.299, 0.587, 0.114));
	COLOR.rgb = mix(vec3(gray), col, saturation);
}
```

- Aplică shaderul pe materialul global (via Environment → PostProcess Shader) sau pe materiale bloc.

---

## Parametri de stil și performanță

- **Mișcare:** viteză constantă 4.5–6.0 u/s; fără sprinturi bruște.
- **Paletă:** low-saturation; fără culori neon; 5–6 tonuri max.
- **HUD:** zero. Fără text, fără elemente UI.
- **Performanță:** MultiMesh pentru cuburi; max 50–100k instanțe pe hardware mediu; umbre dezactivate.
- **Camera:** poziție fixă, ușor deasupra „platformei”, FOV implicit 75–80.

---

## Captură și integrare cu orchestrator

- **OBS setup:**
  - Profil: 1080p, 30 fps, NVENC/AMF/CPU conform hardware.
  - Audio: dezactivat (fundalul video nu necesită sunet).
  - Scenă: „Game Capture” sau „Window Capture” pe Godot.
  - Output: MP4/MKV → MP4, bitrate 20 Mbps (suficient pentru re-encoding ulterior).

- **Output folder recomandat:**
  - Setează OBS să salveze în `project-root/data/assets/backgrounds/obs/`
  - Orchestratorul va lista auto fișierele din `data/assets/backgrounds/**`

- **Import în UI:**
  - În tab-ul Background, folosește butonul „Import background” sau watcher-ul pentru `data/assets/backgrounds/` ca să apară automat în galerie.

---

## Opțional: param panel în editor

- **Tweak rapid:** expune în Main.gd parametri editabili în inspector:
  - **speed:** 4.5–6.0
  - **chunk_length:** 30–50
  - **max_chunks:** 6–10
- **Variabilitate:** în Chunk.gd ajustează `density` între 0.12–0.22 pentru diferite niveluri de „goluri”.

---

## Verificări și QA

- **Fluiditate:** fără micro-stuttering; 30/60 fps constante.
- **Distragere:** fără particule agresive, fără lumină intermitentă.
- **Culoare:** saturație scăzută, contrast suficient pentru lizibilitatea subtitrărilor viitoare.
- **Lungime:** înregistrează minimum 75–90 sec pentru siguranță la montaj.

---

## Definition of done

- **Rulează:** proiectul Godot se lansează, camera avansează, chunk-urile se reciclează fără pop-in vizibil.
- **Captură:** OBS produce fișier 1080p/30fps stabil, fără HUD.
- **Integrare:** fișierele apar în UI → Background, pot fi selectate și pre-vizualizate.
- **Stil:** low-saturation, mișcare constantă, fără distrageri.

Dacă vrei, pot adăuga un mic „color preset” switcher (noon/dusk/fog) și un generator de seed reproducibil pentru serii coerente.
