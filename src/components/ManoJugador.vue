<template>
  <div class="w-full">
    <div class="text-sm mb-2">Tus cartas</div>
    <div class="flex space-x-3">
      <div v-for="(c, idx) in cartas" :key="idx">
        <Carta
          v-if="c"
          :carta="c"
          :oculta="false"
          :jugable="turno === 'Jugador' && estadoRonda === 'playing'"
          @seleccionar="() => seleccionarCarta(idx)"
        />
        <div v-else class="w-24 h-36 rounded-md border bg-gray-100 flex items-center justify-center">--</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Carta from './Carta.vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  cartas: { type: Array, default: () => [] },
  turno: { type: String, default: 'Jugador' },
  estadoRonda: { type: String, default: 'idle' }
})

const emit = defineEmits(['jugar'])

function seleccionarCarta(idx) {
  emit('jugar', idx)
}
</script>

<style scoped>
</style>
