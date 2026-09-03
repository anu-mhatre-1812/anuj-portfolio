import struct, json, os, shutil

glb_path = 'C:/Users/ADMIN/anuj/anuj-portfolio/public/card.glb'
backup_path = 'C:/Users/ADMIN/anuj/anuj-portfolio/public/card_backup.glb'
shutil.copy2(glb_path, backup_path)

with open(glb_path, 'rb') as f:
    header = f.read(12)
    chunk_len = struct.unpack('<I', f.read(4))[0]
    chunk_type = f.read(4)
    json_data = f.read(chunk_len)
    # Read remaining binary chunks
    rest = f.read()

gltf = json.loads(json_data)

# Remove texture from base material (material 0)
for mat in gltf.get('materials', []):
    if mat.get('name') == 'base':
        pbr = mat.get('pbrMetallicRoughness', {})
        if 'baseColorTexture' in pbr:
            del pbr['baseColorTexture']
        # Set a neutral white color
        pbr['baseColorFactor'] = [0.95, 0.95, 0.95, 1.0]
        print(f'Removed texture from material: {mat.get("name")}')

# Remove the texture image and sampler if no longer referenced
textures = gltf.get('textures', [])
images = gltf.get('images', [])
samplers = gltf.get('samplers', [])

# Check if any material still references textures
used_texture_indices = set()
for mat in gltf.get('materials', []):
    pbr = mat.get('pbrMetallicRoughness', {})
    if 'baseColorTexture' in pbr:
        used_texture_indices.add(pbr['baseColorTexture']['index'])

print(f'Used texture indices: {used_texture_indices}')
print(f'Total textures before: {len(textures)}')
print(f'Total images before: {len(images)}')

# Remove unused textures
if not used_texture_indices:
    gltf['textures'] = []
    gltf['images'] = []
    gltf['samplers'] = []
    print('Removed all textures, images, samplers')

new_json = json.dumps(gltf, separators=(',', ':'))
# Pad to 4-byte alignment
padding = (4 - len(new_json) % 4) % 4
new_json += ' ' * padding

new_json_bytes = new_json.encode('utf-8')
new_json_chunk = struct.pack('<I', len(new_json_bytes)) + b'json' + new_json_bytes

with open(glb_path, 'wb') as f:
    f.write(header[:8])  # magic + version
    f.write(struct.pack('<I', 12 + len(new_json_chunk) + len(rest)))
    f.write(new_json_chunk)
    f.write(rest)

print(f'Done. Original size: {os.path.getsize(backup_path)}, New size: {os.path.getsize(glb_path)}')
