<<<<<<< HEAD
# 100 Abogados Dijeron

Juego de encuestas estilo concurso televisivo para presentaciones en vivo.

## Estructura

```
100abogados_dijeron/
├── admin.html              # Panel de administración (crear/editar encuestas)
├── juego.html              # Presentación del juego (sin funciones de admin)
├── styles.css              # Estilos compartidos
├── admin.js                # Lógica de administración
├── juego.js                # Lógica del juego
├── shared.js               # Funciones compartidas
├── data/                   # Archivos de exportación
└── assets/
    └── sounds/             # Sonidos (agregar timer-end.mp3, reveal.mp3)
```

## Uso

### Configuración Inicial (una sola vez)

1. Abrir `admin.html` en el navegador
2. Crear 5-30 encuestas con preguntas y respuestas
3. (Opcional) Exportar encuestas como backup en `data/`

### Antes de la Presentación

1. Copiar la carpeta completa a la laptop de presentación
2. Abrir `juego.html` en el navegador
3. Listo para jugar

### Durante el Juego

**Flujo de pantallas:**
1. **Inicio** → Presionar ENTER o CLICK
2. **Instrucciones** → Click en "Continuar"
3. **Configuración** → Nombres de equipos + cronómetro → "Iniciar"
4. **Tablero** → Revelar respuestas, sumar puntos
5. **Resultados** → "Siguiente Ronda" o "Ver Resultados"

**Controles del juego:**
- Click en número → Revelar respuesta
- "+10/+20/+50" → Sumar puntos al equipo
- "Revelar Aleatoria" → Revela una respuesta al azar
- "Agregar Error" → Suma una X (3 errores = cambio de turno)
- "Terminar Ronda" → Finaliza y muestra resultados

**Formato:**
- 4 rondas por partida
- Cada ronda usa una encuesta aleatoria diferente
- El marcador se acumula entre rondas
- Al final se declara un ganador general

## Sonidos

El juego genera sonidos automáticamente con Web Audio API (sin archivos externos).

Si prefieres usar archivos MP3:
1. Agregar `timer-end.mp3` en `assets/sounds/`
2. Agregar `reveal.mp3` en `assets/sounds/`

## Administración

**Funciones disponibles en `admin.html`:**
- Crear/editar/eliminar encuestas (hasta 8 respuestas cada una)
- Buscar encuestas por pregunta
- Filtrar por categoría
- Duplicar encuestas
- Exportar encuestas a JSON
- Importar encuestas desde JSON
- Vista previa de cómo se ve en juego
- Historial de partidas jugadas
- Exportar historial

## Datos de Ejemplo

La primera vez que abras el admin, estará vacío. Crea tus propias encuestas o importa un JSON.

## Navegadores Soportados

- Chrome/Edge (recomendado)
- Firefox
- Safari

## Notas Técnicas

- Funciona 100% offline (sin necesidad de internet)
- Los datos se guardan en `localStorage` del navegador
- Ambos archivos (`admin.html` y `juego.html`) comparten los mismos datos
- Para llevar a otra laptop: exportar JSON → copiar carpeta → importar en destino

## Solución de Problemas

**"No hay encuestas disponibles"**
→ Abre `admin.html` y crea encuestas primero

**Los datos no se comparten entre admin y juego**
→ Asegúrate de abrir ambos archivos en el mismo navegador

**El sonido no funciona**
→ El navegador puede bloquear audio hasta que el usuario interactúe con la página

**Pantalla negra al abrir**
→ Presiona F5 para recargar la página
=======
# Juego_tipo_100_mexicanos_dijeron
Aplicación web interactiva inspirada en "100 Mexicanos Dijeron" que permite crear, administrar y jugar encuestas con respuestas ocultas, sistema de puntuación y revelado dinámico de respuestas.
>>>>>>> aadf3df152756cdbc4f7fe1fbe5e0e0b83d0f325
