import struct, json, os, shutil

glb_path = 'C:/Users/ADMIN/anuj/anuj-portfolio/public/card.glb'
backup_path = 'C:/Users/ADMIN/anuj/anuj-portfolio/public/card_backup.glb'

if not os.path.exists(backup_path):
    shutil.copy2(glb_path, backup_path)

with open(backup_path, 'rb') as f:
    data = f.read()

magic = data[:4]
version = struct.unpack('<I', data[4:8])[0]
total_length = struct.unpack('<I', data[8:12])[0]
print(f'Magic: {magic}, Version: {version}, Length: {total_length}')

offset = 12
json_bytes = None
bin_bytes = None

while offset < len(data) - 8:
    chunk_len = struct.unpack('<I', data[offset:offset+4])[0]
    chunk_type = data[offset+4:offset+8]
    chunk_data = data[offset+8:offset+8+chunk_len]
    
    type_str = chunk_type.decode('ascii', errors='replace')
    print(f'Chunk at {offset}: type={type_str!r}, len={chunk_len}')
    
    if chunk_type in (b'json', b'JSON'):
        json_bytes = chunk_data
    elif chunk_type in (b'bin\x00', b'BIN\x00'):
        bin_bytes = chunk_data
    
    advance = 8 + chunk_len
    if chunk_len % 4 != 0:
        advance += 4 - (chunk_len % 4)
    offset += advance

if json_bytes is None:
    print('ERROR: No JSON chunk found!')
    exit(1)

gltf = json.loads(json_bytes)
print(f'Images: {len(gltf.get("images", []))}, Textures: {len(gltf.get("textures", []))}')

for mat in gltf.get('materials', []):
    pbr = mat.get('pbrMetallicRoughness', {})
    if 'baseColorTexture' in pbr:
        del pbr['baseColorTexture']
        print(f'Removed texture from: {mat.get("name")}')

gltf.pop('textures', None)
gltf.pop('images', None)
gltf.pop('samplers', None)

new_json_str = json.dumps(gltf, separators=(',', ':'))
pad = (4 - len(new_json_str) % 4) % 4
new_json_bytes = (new_json_str + ' ' * pad).encode('utf-8')

new_json_chunk = struct.pack('<I', len(new_json_bytes)) + b'JSON' + new_json_bytes

new_bin_chunk = b''
if bin_bytes:
    bin_pad = (4 - len(bin_bytes) % 4) % 4
    padded = bin_bytes + b'\x00' * bin_pad
    new_bin_chunk = struct.pack('<I', len(bin_bytes)) + b'BIN\x00' + padded

new_total = 12 + len(new_json_chunk) + len(new_bin_chunk)
out = magic + struct.pack('<I', version) + struct.pack('<I', new_total) + new_json_chunk + new_bin_chunk

with open(glb_path, 'wb') as f:
    f.write(out)

print(f'Original: {os.path.getsize(backup_path)}, New: {os.path.getsize(glb_path)}')
