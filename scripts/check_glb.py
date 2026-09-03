import struct, json

with open('C:/Users/ADMIN/anuj/anuj-portfolio/public/id-card.glb', 'rb') as f:
    magic = f.read(4)
    version = struct.unpack('<I', f.read(4))[0]
    length = struct.unpack('<I', f.read(4))[0]
    print(f'Magic: {magic}, Version: {version}, Length: {length}')
    
    chunk_len = struct.unpack('<I', f.read(4))[0]
    chunk_type = f.read(4)
    json_data = f.read(chunk_len)
    gltf = json.loads(json_data)
    
    if 'meshes' in gltf:
        print(f'Meshes: {len(gltf["meshes"])}')
    if 'nodes' in gltf:
        print(f'Nodes: {len(gltf["nodes"])}')
        for i, node in enumerate(gltf['nodes']):
            name = node.get('name', 'unnamed')
            translation = node.get('translation', [0,0,0])
            scale = node.get('scale', [1,1,1])
            print(f'  Node {i}: {name} pos={translation} scale={scale}')
    
    if 'accessors' in gltf:
        for i, acc in enumerate(gltf['accessors']):
            if acc.get('type') == 'VEC3' and 'min' in acc and 'max' in acc:
                print(f'  Accessor {i}: min={acc["min"]} max={acc["max"]}')
