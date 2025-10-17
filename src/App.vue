<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6 text-center">Truco Argentino</h1>

    <PuntosPanel 
      :puntosJugador="jugador1.puntos" 
      :puntosMaquina="jugador2.puntos" 
      :mano="manoActual"
      :targetPoints="TARGET_POINTS"
    />

    <Mesa 
      :cartasMesa="cartasMesa" 
      :mano="manoActual"
      :manosGanadas="manosGanadas"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div>
        <h3 class="text-lg font-semibold mb-2">Tu Mano</h3>
        <ManoJugador 
          :cartas="jugador1.cartas" 
          :turno="turno" 
          :estadoRonda="estadoRonda"
          :bloqueado="trucoActivo.esperandoRespuesta || envidoActivo.esperandoRespuesta"
          @jugar="onJugarCarta" 
        />
      </div>
      <div>
        <h3 class="text-lg font-semibold mb-2">Mano de la Máquina</h3>
        <ManoOponente :cartas="jugador2.cartas" />
      </div>
    </div>

    <div class="mt-6">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-sm text-gray-700 font-semibold">Estado de la partida:</span>
        <span v-if="turno === 'Jugador'" class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Tu turno</span>
        <span v-else class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Turno de la máquina</span>
      </div>
      <div class="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg mensaje-box border border-gray-200">
        {{ mensaje }}
      </div>
    </div>

    <ControlesJuego
      @iniciar="onIniciar"
      @reiniciar="onReiniciar"
      @cantar-envido="onCantarEnvido"
      @cantar-truco="onCantarTruco"
      @responder-truco="onResponderTruco"
      @responder-envido="onResponderEnvido"
      :canCantarEnvido="canCantarEnvido"
      :canCantarRealEnvido="canCantarRealEnvido"
      :canCantarFaltaEnvido="canCantarFaltaEnvido"
      :canCantarTruco="canCantarTruco"
      :canCantarRetruco="canCantarRetruco"
      :canCantarVale4="canCantarVale4"
      :canSubirEnvido="canSubirEnvido"
      :canSubirConEnvido="canSubirConEnvido"
      :canSubirConRealEnvido="canSubirConRealEnvido"
      :canSubirConFaltaEnvido="canSubirConFaltaEnvido"
      :hayTrucoPendiente="hayTrucoPendiente"
      :hayEnvidoPendiente="hayEnvidoPendiente"
      :trucoActivo="trucoActivo"
      :envidoActivo="envidoActivo"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTruco } from './useTruco'
import Mesa from './components/Mesa.vue'
import ManoJugador from './components/ManoJugador.vue'
import ManoOponente from './components/ManoOponente.vue'
import PuntosPanel from './components/PuntosPanel.vue'
import ControlesJuego from './components/ControlesJuego.vue'

const {
  jugador1,
  jugador2,
  turno,
  manoActual,
  manosGanadas,
  cartasMesa,
  estadoRonda,
  mensaje,
  nivelTruco,
  trucoActivo,
  envidoActivo,
  TARGET_POINTS,
  initPartida,
  iniciarRonda,
  jugarCartaJugador,
  cantarTruco,
  responderTruco,
  cantarEnvido,
  responderEnvido,
  reiniciarPartida,
  canCantarTruco,
  canCantarRetruco,
  canCantarVale4,
  canCantarEnvido,
  canCantarRealEnvido,
  canCantarFaltaEnvido,
  canSubirEnvido,
  canSubirConEnvido,
  canSubirConRealEnvido,
  canSubirConFaltaEnvido,
  hayTrucoPendiente,
  hayEnvidoPendiente
} = useTruco()

onMounted(() => initPartida('Jugador'))

function onIniciar() {
  initPartida('Jugador')
}

function onReiniciar() {
  reiniciarPartida()
}

function onJugarCarta(index) {
  jugarCartaJugador(index)
}

function onCantarTruco(tipo) {
  cantarTruco('Jugador', tipo)
}

function onCantarEnvido(tipo) {
  cantarEnvido('Jugador', tipo)
}

function onResponderTruco(aceptar, subirA) {
  responderTruco(aceptar, 'Jugador', subirA)
}

function onResponderEnvido(aceptar, subirCon) {
  responderEnvido(aceptar, 'Jugador', subirCon)
}
</script>

<style scoped>
.mensaje-box {
  min-height: 60px;
  font-size: 0.95rem;
  line-height: 1.5;
}
</style>