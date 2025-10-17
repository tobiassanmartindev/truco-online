<template>
  <div class="w-full">
    <div class="text-sm mb-2">Mano oponente</div>
    <div class="flex space-x-2">
      <div v-for="(c, idx) in cartasVisibles" :key="idx">
        <Carta :oculta="true" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Carta from './Carta.vue'
import { defineProps, computed } from 'vue'

const props = defineProps({
  cartas: { type: Array, default: () => [] },
})

const cartasVisibles = computed(() => {
  // mostramos un dorso por cada carta no nula que tenga la máquina
  return props.cartas.filter(Boolean)
})
</script>

<style scoped>
</style>
