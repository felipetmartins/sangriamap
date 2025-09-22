from PIL import Image
import os
import math

# arquivo do mapa original
map_file = r"C:\Users\Felipe Martins\Documents\06 - Estudos\Arquivos - Python\MapVrising\MapaVrising.png"

# tamanho dos tiles
tile_size = 256

# abre a imagem
img = Image.open(map_file)
w, h = img.size

print(f"Mapa: {w}x{h}")

# calcula quantos níveis de zoom cabem
# zoom máximo: quando a largura ou altura for menor que o tile_size
max_zoom = int(math.ceil(math.log2(max(w, h) / tile_size)))
print(f"Níveis de zoom detectados: 0 até {max_zoom}")

# cria pasta de saída
out_dir = "tiles"
os.makedirs(out_dir, exist_ok=True)

# gera tiles para cada nível de zoom
for z in range(max_zoom + 1):
    scale = 2 ** (max_zoom - z)
    new_w = math.ceil(w / scale)
    new_h = math.ceil(h / scale)

    resized = img.resize((new_w, new_h), Image.LANCZOS)

    cols = math.ceil(new_w / tile_size)
    rows = math.ceil(new_h / tile_size)

    zoom_dir = os.path.join(out_dir, str(z))
    os.makedirs(zoom_dir, exist_ok=True)

    print(f"Gerando zoom {z}: {cols}x{rows} tiles")

    for x in range(cols):
        for y in range(rows):
            left = x * tile_size
            top = y * tile_size
            right = min((x+1) * tile_size, new_w)
            bottom = min((y+1) * tile_size, new_h)

            tile = resized.crop((left, top, right, bottom))

            tile_dir = os.path.join(zoom_dir, str(x))
            os.makedirs(tile_dir, exist_ok=True)

            tile_path = os.path.join(tile_dir, f"{y}.png")
            tile.save(tile_path)

print("✅ Tiles gerados no formato /zoom/x/y.png")
