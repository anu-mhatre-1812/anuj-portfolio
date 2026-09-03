import struct, json

with open('C:/Users/ADMIN/anuj/anuj-portfolio/public/card.glb', 'rb') as f:
    f.read(12)
    chunk_len = struct.unpack('<I', f.read(4))[0]
    f.read(4)
    gltf = json.loads(f.read(chunk_len))
    
    for i, mesh in enumerate(gltf.get('meshes', [])):
        print(f'Mesh {i}: {mesh.get("name", "unnamed")}')
    
    for i, node in enumerate(gltf.get('nodes', [])):
        print(f'Node {i}: name={node.get("name")}, mesh={node.get("mesh")}')
    
    for i, mat in enumerate(gltf.get('materials', [])):
        print(f'Material {i}: {mat.get("name", "unnamed")}')
