<template>
  <div
    class="rounded-md shadow-md flex items-center justify-center cursor-pointer select-none relative overflow-hidden carta-container"
    @click="onClick"
    :class="[tamanoClase, { 'opacity-60 cursor-not-allowed': !jugable && !oculta }]"
  >
    <!-- Carta visible -->
    <div
      v-if="!oculta && carta"
      class="absolute top-0 left-0 bg-no-repeat carta-contenido"
      :style="{
        width: anchoContenedor + 'px',
        height: altoContenedor + 'px',
        backgroundImage: `url('/baraja.png')`,
        backgroundPosition: `${pos.x * escalaX}px ${pos.y * escalaY}px`,
        backgroundSize: `${TOTAL_WIDTH * escalaX}px ${TOTAL_HEIGHT * escalaY}px`
      }"
    ></div>
      
    <!-- Dorso -->
    <div v-else class="dorso-carta"></div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  carta: { type: Object, default: null },
  oculta: { type: Boolean, default: false },
  jugable: { type: Boolean, default: false },
  tamano: { type: String, default: 'w-24 h-36' }
})
const emit = defineEmits(['seleccionar'])

const ANCHO_CARTA = 208
const ALTO_CARTA = 319
const TOTAL_WIDTH = 2082
const TOTAL_HEIGHT = 1276
const anchoContenedor = 96
const altoContenedor = 144
const escalaX = anchoContenedor / ANCHO_CARTA
const escalaY = altoContenedor / ALTO_CARTA

const PALOS = ['oro', 'copa', 'espada', 'basto']
const NUMERO_MAP = { 1:0, 2:1, 3:2, 4:3, 5:4, 6:5, 7:6, 10:7, 11:8, 12:9 }

const cartasPosiciones = {}
PALOS.forEach((palo, i) => {
  for (const numero of Object.keys(NUMERO_MAP).map(n => parseInt(n))) {
    const cartaIndex = i * 10 + NUMERO_MAP[numero]
    const columna = cartaIndex % 10
    const fila = Math.floor(cartaIndex / 10)
    cartasPosiciones[`${palo}-${numero}`] = { x: -columna * ANCHO_CARTA, y: -fila * ALTO_CARTA }
  }
})

const pos = computed(() => {
  if (!props.carta) return { x: 0, y: 0 }
  return cartasPosiciones[`${props.carta.palo}-${props.carta.numero}`] || { x: 0, y: 0 }
})
const tamanoClase = computed(() => props.tamano)

function onClick() {
  if (props.oculta || !props.jugable) return
  emit('seleccionar', props.carta)
}
</script>

<style scoped>
.carta-container {
  transition: transform 0.25s ease, box-shadow 0.3s ease;
  transform-origin: center;
  animation: fadeInUp 0.4s ease forwards;
}
.carta-container:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 16px rgba(0,0,0,0.25);
}
.carta-contenido {
  transition: transform 0.4s ease;
}
.dorso-carta {
  background-image: url('/dorso.png');
  background-repeat: no-repeat;
  background-size: contain;
  width: 100%;
  height: 100%;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
