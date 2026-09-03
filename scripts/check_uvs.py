import struct, json

with open('C:/Users/ADMIN/anuj/anuj-portfolio/public/card_backup.glb', 'rb') as f:
    f.read(12)
    chunk_len = struct.unpack('<I', f.read(4))[0]
    f.read(4)
    json_bytes = f.read(chunk_len)

gltf = json.loads(json_bytes)

card_mesh = gltf['meshes'][0]
prim = card_mesh['primitives'][0]
uv_idx = prim['attributes'].get('TEXCOORD_0')
pos_idx = prim['attributes'].get('POSITION')

if uv_idx is not None:
    acc = gltf['accessors'][uv_idx]
    print(f'UV: type={acc["type"]}, count={acc["count"]}, min={acc.get("min")}, max={acc.get("max")}')

if pos_idx is not None:
    acc = gltf['accessors'][pos_idx]
    print(f'POS: type={acc["type"]}, count={acc["count"]}, min={acc.get("min")}, max={acc.get("max")}')
