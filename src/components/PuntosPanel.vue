<template>
  <div class="w-full flex justify-between items-center py-2">
    <div>
      <div class="text-sm font-medium">Jugador</div>
      <div class="text-lg">{{ puntosJugador }}</div>
    </div>
    <div class="text-center">
      <div class="text-xs text-gray-500">Mano</div>
      <div class="text-sm">{{ mano }}</div>
    </div>
    <div>
      <div class="text-sm font-medium">Máquina</div>
      <div class="text-lg">{{ puntosMaquina }}</div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
const props = defineProps({
  puntosJugador: { type: Number, default: 0 },
  puntosMaquina: { type: Number, default: 0 },
  mano: { type: Number, default: 0 }
})
</script>

<style scoped>
</style>
