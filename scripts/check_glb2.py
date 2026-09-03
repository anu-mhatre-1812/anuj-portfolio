import struct, json

with open('C:/Users/ADMIN/anuj/anuj-portfolio/public/id-card.glb', 'rb') as f:
    f.read(12)
    chunk_len = struct.unpack('<I', f.read(4))[0]
    f.read(4)
    gltf = json.loads(f.read(chunk_len))
    
    for i, mat in enumerate(gltf.get('materials', [])):
        print(f'Material {i}: {mat.get("name", "unnamed")}')
        pbr = mat.get('pbrMetallicRoughness', {})
        print(f'  baseColorFactor: {pbr.get("baseColorFactor")}')
        print(f'  metallicFactor: {pbr.get("metallicFactor")}')
        print(f'  roughnessFactor: {pbr.get("roughnessFactor")}')
        print(f'  baseColorTexture: {pbr.get("baseColorTexture")}')
    
    for i, mesh in enumerate(gltf.get('meshes', [])):
        print(f'Mesh {i}: {mesh.get("name", "unnamed")}')
        for j, prim in enumerate(mesh.get('primitives', [])):
            print(f'  Primitive {j}: attributes={prim.get("attributes")}, material={prim.get("material")}, mode={prim.get("mode", 4)}')
    
    node = gltf['nodes'][0]
    print(f'Node 0: name={node.get("name")}, mesh={node.get("mesh")}, translation={node.get("translation")}, rotation={node.get("rotation")}, scale={node.get("scale")}')
    
    if 'scenes' in gltf:
        print(f'Scenes: {gltf["scenes"]}')
