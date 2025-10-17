<template>
  <div class="w-full py-4 flex flex-col items-center">

    <div class="w-full max-w-2xl flex justify-center items-center">
      <div class="w-full flex items-center justify-around">

        <!-- Cartas del jugador -->        
        <div class="flex flex-col items-center">
          <div class="h-32 w-60 flex justify-center items-center mt-20">
            <div class="grid grid-cols-3 gap-x-15 mr-85">
              <Carta
                v-for="(carta, index) in cartasJugador"
                :key="'jugador-' + index"
                :carta="carta.carta"
                :oculta="false"
                :jugable="false"
              />
              <!-- espacios vacíos para mantener el layout -->
              <div
                v-for="i in (6 - cartasJugador.length)"
                :key="'espacio-jugador-' + i"
                class="w-[50px] h-[70px]"
              ></div>
            </div>
          </div>
        </div>

        <!-- <div class="text-sm text-gray-500 mx-4">Mesa</div> -->

        <!-- Cartas de la máquina -->
        <div class="flex flex-col items-center">
          <div class="h-32 w-60 flex justify-center items-center mt-20">
            <div class="grid grid-cols-3 gap-x-15 ml-12">
              <Carta
                v-for="(carta, index) in cartasOponente"
                :key="'oponente-' + index"
                :carta="carta.carta"
                :oculta="false"
                :jugable="false"
              />
              <!-- espacios vacíos para mantener el layout -->
              <div
                v-for="i in (6 - cartasOponente.length)"
                :key="'espacio-oponente-' + i"
                class="w-[50px] h-[70px]"
              ></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import Carta from './Carta.vue'
import { defineProps, computed } from 'vue'

const props = defineProps({
  cartasMesa: { type: Array, default: () => [] },
  mano: { type: Number, default: 0 }
})

// Filtramos las cartas jugadas por jugador y máquina
const cartasJugador = computed(() =>
  props.cartasMesa.filter(c => c.jugador === 'Jugador')
)

const cartasOponente = computed(() =>
  props.cartasMesa.filter(c => c.jugador === 'Máquina')
)
</script>

<style scoped>
/* Ajuste de tamaño base para las cartas */
Carta {
  width: 50px;
  height: 70px;
}

/* Mantiene el grid estable y evita el salto de línea */
.grid {
  grid-template-columns: repeat(3, minmax(50px, 1fr));
}
</style>
