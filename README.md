# Rixit 🃏

Aplicación web inspirada en el juego de mesa Dixit.

## Instalación

```bash
pnpm install # o npm install / yarn install
```

## Desarrollo

```bash
pnpm dev # o npm run dev / yarn dev
```

## Construir para producción

```bash
pnpm build
```

## Tecnologías

- React + TypeScript
- Vite
- Tailwind CSS (modo oscuro por defecto)

## Diseño

Colores principales:

- Primario: `#646cff`
- Secundario: `#ff646c`

# Estructura del Proyecto

## Imágenes de Cartas
Las imágenes de las cartas se almacenan en la carpeta `public/cards/` con un formato de nombre secuencial de tres dígitos:
- `001.jpg`
- `002.jpg`
- `003.jpg`
- ...y así sucesivamente

La aplicación hace referencia a estas imágenes con rutas como `/cards/001.jpg`.

## Cómo añadir más cartas
Para añadir cartas adicionales, simplemente agrega archivos de imagen JPG en la carpeta `public/cards/` con nombres secuenciales (manteniendo el formato de tres dígitos).

Las dimensiones recomendadas para las cartas son 200x300 píxeles. 