<template>
  <div class="w-full mt-4 flex flex-col gap-3 controles-container">
    <!-- Botones principales -->
    <div class="flex gap-3 items-center">
      <button class="btn azul" @click="$emit('iniciar')">Iniciar Partida</button>
      <button class="btn verde" @click="$emit('reiniciar')">Reiniciar</button>
    </div>

    <!-- Controles de canto -->
    <div class="flex items-center gap-2 flex-wrap">
      <!-- Envido -->
      <button
        class="btn borde envido-btn"
        :class="{ 'opacity-50 cursor-not-allowed': !canCantarEnvido }"
        :disabled="!canCantarEnvido"
        @click="$emit('cantar-envido', 'envido')"
      >Envido</button>

      <button
        class="btn borde envido-btn"
        :class="{ 'opacity-50 cursor-not-allowed': !canCantarRealEnvido }"
        :disabled="!canCantarRealEnvido"
        @click="$emit('cantar-envido', 'real_envido')"
      >Real Envido</button>

      <button
        class="btn borde envido-btn"
        :class="{ 'opacity-50 cursor-not-allowed': !canCantarFaltaEnvido }"
        :disabled="!canCantarFaltaEnvido"
        @click="$emit('cantar-envido', 'falta_envido')"
      >Falta Envido</button>

      <!-- Truco / Retruco / Vale 4 -->
      <button
        class="btn borde truco-btn"
        :class="{ 'opacity-50 cursor-not-allowed': !canCantarTruco }"
        :disabled="!canCantarTruco"
        @click="$emit('cantar-truco', 'truco')"
      >Truco</button>

      <button
        class="btn borde truco-btn"
        :class="{ 'opacity-50 cursor-not-allowed': !canCantarRetruco }"
        :disabled="!canCantarRetruco"
        @click="handleRetruco"
      >Retruco</button>

      <button
        class="btn borde truco-btn"
        :class="{ 'opacity-50 cursor-not-allowed': !canCantarVale4 }"
        :disabled="!canCantarVale4"
        @click="handleVale4"
      >Vale 4</button>
    </div>

    <!-- Respuesta a Truco pendiente -->
    <div v-if="hayTrucoPendiente" class="respuesta-panel truco-panel">
      <span class="texto-pendiente">🎲 La máquina cantó {{ textoTrucoPendiente }}. ¿Querés?</span>
      <div class="flex gap-2 flex-wrap">
        <button class="btn pequeño verde" @click="$emit('responder-truco', true, null)">Quiero</button>
        <button class="btn pequeño rojo" @click="$emit('responder-truco', false, null)">No Quiero</button>
        <button 
          v-if="canSubirTruco"
          class="btn pequeño naranja" 
          @click="$emit('responder-truco', true, siguienteNivelTruco)"
        >{{ textoSiguienteNivelTruco }}</button>
      </div>
    </div>

    <!-- Respuesta a Envido pendiente -->
    <div v-if="hayEnvidoPendiente" class="respuesta-panel envido-panel">
      <span class="texto-pendiente">🃏 La máquina cantó {{ textoEnvidoPendiente }}. ¿Querés?</span>
      <div class="flex gap-2 flex-wrap">
        <button class="btn pequeño verde" @click="$emit('responder-envido', true, null)">Quiero</button>
        <button class="btn pequeño rojo" @click="$emit('responder-envido', false, null)">No Quiero</button>
        
        <!-- Opciones para subir envido -->
        <button 
          v-if="canSubirConEnvido"
          class="btn pequeño azul-claro" 
          @click="$emit('responder-envido', true, 'envido')"
        >Envido</button>
        
        <button 
          v-if="canSubirConRealEnvido"
          class="btn pequeño azul-claro" 
          @click="$emit('responder-envido', true, 'real_envido')"
        >Real Envido</button>
        
        <button 
          v-if="canSubirConFaltaEnvido"
          class="btn pequeño azul-claro" 
          @click="$emit('responder-envido', true, 'falta_envido')"
        >Falta Envido</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  canCantarEnvido: { type: Boolean, default: false },
  canCantarRealEnvido: { type: Boolean, default: false },
  canCantarFaltaEnvido: { type: Boolean, default: false },
  canCantarTruco: { type: Boolean, default: false },
  canCantarRetruco: { type: Boolean, default: false },
  canCantarVale4: { type: Boolean, default: false },
  canSubirEnvido: { type: Boolean, default: false },
  canSubirConEnvido: { type: Boolean, default: false },
  canSubirConRealEnvido: { type: Boolean, default: false },
  canSubirConFaltaEnvido: { type: Boolean, default: false },
  hayTrucoPendiente: { type: Boolean, default: false },
  hayEnvidoPendiente: { type: Boolean, default: false },
  trucoActivo: { type: Object, default: () => ({}) },
  envidoActivo: { type: Object, default: () => ({}) }
})

const emit = defineEmits([
  'iniciar',
  'reiniciar',
  'cantar-envido',
  'cantar-truco',
  'responder-truco',
  'responder-envido'
])

const textoTrucoPendiente = computed(() => {
  const tipo = props.trucoActivo?.tipo || 'truco'
  if (tipo === 'retruco') return 'Retruco'
  if (tipo === 'vale4') return 'Vale 4'
  return 'Truco'
})

const textoEnvidoPendiente = computed(() => {
  const tipo = props.envidoActivo?.tipo || 'envido'
  if (tipo === 'real_envido') return 'Real Envido'
  if (tipo === 'falta_envido') return 'Falta Envido'
  return 'Envido'
})

const canSubirTruco = computed(() => {
  if (!props.hayTrucoPendiente) return false
  const tipo = props.trucoActivo?.tipo || 'truco'
  return tipo === 'truco' || tipo === 'retruco'
})

const siguienteNivelTruco = computed(() => {
  const tipo = props.trucoActivo?.tipo || 'truco'
  if (tipo === 'truco') return 'retruco'
  if (tipo === 'retruco') return 'vale4'
  return null
})

const textoSiguienteNivelTruco = computed(() => {
  const tipo = props.trucoActivo?.tipo || 'truco'
  if (tipo === 'truco') return 'Retruco'
  if (tipo === 'retruco') return 'Vale 4'
  return ''
})

function handleRetruco() {
  // Si hay un truco pendiente de la máquina, responder subiendo
  if (props.hayTrucoPendiente && props.trucoActivo?.tipo === 'truco') {
    emit('responder-truco', true, 'retruco')
  } else {
    // Si no, cantar retruco normalmente
    emit('cantar-truco', 'retruco')
  }
}

function handleVale4() {
  // Si hay un retruco pendiente de la máquina, responder subiendo
  if (props.hayTrucoPendiente && props.trucoActivo?.tipo === 'retruco') {
    emit('responder-truco', true, 'vale4')
  } else {
    // Si no, cantar vale4 normalmente
    emit('cantar-truco', 'vale4')
  }
}
</script>

<style scoped>
.controles-container {
  animation: fadeIn 0.5s ease;
}

.btn {
  transition: all 0.2s ease;
  padding: 0.5rem 0.9rem;
  border-radius: 0.4rem;
  font-weight: 600;
  user-select: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.btn:not(:disabled):active {
  transform: translateY(0);
}

.btn.azul {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.btn.verde {
  background-color: #10b981;
  color: white;
  border: none;
}

.btn.rojo {
  background-color: #ef4444;
  color: white;
  border: none;
}

.btn.naranja {
  background-color: #f97316;
  color: white;
  border: none;
}

.btn.azul-claro {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.btn.borde {
  border: 2px solid #d1d5db;
  background-color: white;
  color: #111827;
}

.btn.borde.truco-btn {
  border-color: #f59e0b;
  color: #f59e0b;
}

.btn.borde.envido-btn {
  border-color: #3b82f6;
  color: #3b82f6;
}

.btn.borde:not(:disabled):hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.btn.pequeño {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
}

.opacity-50 {
  opacity: 0.45;
}

.cursor-not-allowed {
  cursor: not-allowed;
}

.respuesta-panel {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  animation: slideIn 0.3s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  flex-wrap: wrap;
}

.truco-panel {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
}

.envido-panel {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 2px solid #3b82f6;
}

.texto-pendiente {
  font-weight: 700;
  font-size: 1.05rem;
  flex: 1;
  min-width: 250px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>