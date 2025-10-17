// composables/useTruco.js
import { reactive, ref, computed } from 'vue'
import { Robot } from './Robot.js'

export function useTruco() {
  const TARGET_POINTS = 30

  // --- JUGADORES ---
  const jugador1 = reactive({ nombre: 'Jugador', cartas: [], puntos: 0 })
  const jugador2 = reactive({ nombre: 'Máquina', cartas: [], puntos: 0 })
  
  // --- TURNO ---
  const turno = ref('Jugador')
  const inicioMano = ref('Jugador')
  const manoActual = ref(0)
  
  const manosGanadas = reactive({ 
    jugador1: 0,
    jugador2: 0,
    primera: null,
    segunda: null,
    tercera: null 
  })
  const cartasMesa = reactive([])
  
  const estadoRonda = ref('idle')
  const nivelTruco = ref(1)
  const trucoActivo = reactive({ 
    cantado: false, 
    cantador: null, 
    aceptado: null, 
    esperandoRespuesta: false,
    ultimoCantador: null,
    tipo: null
  })
  const envidoActivo = reactive({ 
    cantado: false, 
    cantador: null, 
    aceptado: null, 
    puntosEnJuego: 0, 
    esperandoRespuesta: false, 
    tipo: null,
    ultimoCantador: null,
    secuencia: []
  })
  const mensaje = ref('')

  // --- MAZO ---
  const MAZO_INICIAL = [
    { numero:1, palo:"espada", valor:14 }, { numero:2, palo:"espada", valor:9 },
    { numero:3, palo:"espada", valor:10 }, { numero:4, palo:"espada", valor:1 },
    { numero:5, palo:"espada", valor:2 }, { numero:6, palo:"espada", valor:3 },
    { numero:7, palo:"espada", valor:12 }, { numero:10, palo:"espada", valor:5 },
    { numero:11, palo:"espada", valor:6 }, { numero:12, palo:"espada", valor:7 },

    { numero:1, palo:"basto", valor:13 }, { numero:2, palo:"basto", valor:9 },
    { numero:3, palo:"basto", valor:10 }, { numero:4, palo:"basto", valor:1 },
    { numero:5, palo:"basto", valor:2 }, { numero:6, palo:"basto", valor:3 },
    { numero:7, palo:"basto", valor:4 }, { numero:10, palo:"basto", valor:5 },
    { numero:11, palo:"basto", valor:6 }, { numero:12, palo:"basto", valor:7 },

    { numero:1, palo:"copa", valor:8 }, { numero:2, palo:"copa", valor:9 },
    { numero:3, palo:"copa", valor:10 }, { numero:4, palo:"copa", valor:1 },
    { numero:5, palo:"copa", valor:2 }, { numero:6, palo:"copa", valor:3 },
    { numero:7, palo:"copa", valor:4 }, { numero:10, palo:"copa", valor:5 },
    { numero:11, palo:"copa", valor:6 }, { numero:12, palo:"copa", valor:7 },

    { numero:1, palo:"oro", valor:8 }, { numero:2, palo:"oro", valor:9 },
    { numero:3, palo:"oro", valor:10 }, { numero:4, palo:"oro", valor:1 },
    { numero:5, palo:"oro", valor:2 }, { numero:6, palo:"oro", valor:3 },
    { numero:7, palo:"oro", valor:11 }, { numero:10, palo:"oro", valor:5 },
    { numero:11, palo:"oro", valor:6 }, { numero:12, palo:"oro", valor:7 },
  ]

  const mazo = ref([])

  function cloneMazo() {
    return MAZO_INICIAL.map(c => ({ ...c }))
  }

  function mezclar(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const r = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[r]] = [array[r], array[i]]
    }
  }

  function repartir() {
    jugador1.cartas = mazo.value.slice(0,3)
    jugador2.cartas = mazo.value.slice(3,6)
  }

  function limpiarMesa() {
    cartasMesa.splice(0, cartasMesa.length)
    manosGanadas.primera = null
    manosGanadas.segunda = null
    manosGanadas.tercera = null
    manoActual.value = 0
    nivelTruco.value = 1
    trucoActivo.cantado = false
    trucoActivo.cantador = null
    trucoActivo.aceptado = null
    trucoActivo.esperandoRespuesta = false
    trucoActivo.ultimoCantador = null
    trucoActivo.tipo = null
    envidoActivo.cantado = false
    envidoActivo.cantador = null
    envidoActivo.aceptado = null
    envidoActivo.puntosEnJuego = 0
    envidoActivo.tipo = null
    envidoActivo.esperandoRespuesta = false
    envidoActivo.ultimoCantador = null
    envidoActivo.secuencia = []
    mensaje.value = ''
    estadoRonda.value = 'idle'
  }

  // --- COMPARAR CARTAS ---
  function compararCartas(c1, c2) {
    if (!c1 || !c2) return null
    if (c1.valor > c2.valor) return 'Jugador'
    if (c1.valor < c2.valor) return 'Máquina'
    return 'parda'
  }

  function valorEnvidoDeCarta(c) {
    if (!c) return 0
    return (c.numero >= 10 && c.numero <= 12) ? 0 : c.numero
  }

  function calcularEnvido(cartas) {
    const porPalo = {}
    for (const c of cartas) {
      if (!c) continue
      porPalo[c.palo] = porPalo[c.palo] || []
      porPalo[c.palo].push(c)
    }
    let mejor = 0
    for (const palo in porPalo) {
      const arr = porPalo[palo]
      if (arr.length >= 2) {
        const vals = arr.map(valorEnvidoDeCarta).sort((a,b)=>b-a)
        const punt = 20 + vals[0] + vals[1]
        if (punt > mejor) mejor = punt
      }
    }
    if (mejor === 0) {
      const mayores = cartas.filter(Boolean).map(valorEnvidoDeCarta)
      mejor = mayores.length > 0 ? Math.max(...mayores) : 0
    }
    return mejor
  }

  // --- INICIO PARTIDA / RONDA ---
  function initPartida(primerTurno = 'Jugador') {
    limpiarMesa()
    jugador1.puntos = 0
    jugador2.puntos = 0
    turno.value = primerTurno
    inicioMano.value = primerTurno
    mazo.value = cloneMazo()
    mezclar(mazo.value)
    repartir()
    estadoRonda.value = 'playing'
    mensaje.value = 'Partida iniciada'
    
    if (turno.value === 'Máquina' && hayCartasDisponibles(jugador2)) {
      setTimeout(() => procesarTurnoMaquina(), 1000)
    }
  }

  function iniciarRonda() {
    limpiarMesa()
    mazo.value = cloneMazo()
    mezclar(mazo.value)
    repartir()
    estadoRonda.value = 'playing'
    turno.value = inicioMano.value
    mensaje.value = 'Ronda nueva'
    
    if (turno.value === 'Máquina' && hayCartasDisponibles(jugador2)) {
      setTimeout(() => procesarTurnoMaquina(), 1000)
    }
  }

  // --- JUGAR CARTA ---
  function jugarCartaJugador(indice) {
    if (turno.value !== 'Jugador') {
      mensaje.value = 'No es tu turno'
      return false
    }
    if (trucoActivo.esperandoRespuesta || envidoActivo.esperandoRespuesta) {
      mensaje.value = 'Debes responder primero al canto'
      return false
    }
    return jugarCartaInterno(jugador1, indice)
  }

  function procesarTurnoMaquina() {
    if (estadoRonda.value !== 'playing' || turno.value !== 'Máquina') return

    const delay = 900 + Math.floor(Math.random() * 500)
    setTimeout(() => {
      if (estadoRonda.value !== 'playing' || turno.value !== 'Máquina') return

      // 1) Envido solo en primera mano sin cartas jugadas
      if (!envidoActivo.cantado && manoActual.value === 0 && cartasMesa.length === 0 && !trucoActivo.esperandoRespuesta) {
        const canto = Robot.decidirEnvido(jugador2.cartas, jugador1.puntos, calcularEnvido)
        if (canto) {
          cantarEnvido('Máquina', canto)
          return
        }
      }

      // 2) Truco solo si no hay uno pendiente y no fue aceptado recientemente
      if (!trucoActivo.esperandoRespuesta && 
          !envidoActivo.esperandoRespuesta && 
          nivelTruco.value < 4 &&
          !(trucoActivo.cantado && trucoActivo.aceptado && trucoActivo.ultimoCantador === 'Máquina')) {
        
        const trucoCanto = Robot.decidirTruco(
          jugador2.cartas,
          nivelTruco.value,
          manosGanadas,
          manoActual.value,
          trucoActivo.cantado
        )
        if (trucoCanto) {
          cantarTruco('Máquina', trucoCanto)
          return
        }
      }

      // 3) Jugar carta
      if (!hayCartasDisponibles(jugador2)) {
        turno.value = 'Jugador'
        return
      }

      const idx = Robot.elegirCarta(cartasMesa, jugador2.cartas, manosGanadas, manoActual.value)
      const indexToPlay = (typeof idx === 'number' && idx >= 0 && idx < jugador2.cartas.length) ? idx : jugador2.cartas.findIndex(c => !!c)

      if (indexToPlay === -1) {
        turno.value = 'Jugador'
        return
      }

      jugarCartaInterno(jugador2, indexToPlay)

    }, delay)
  }

  function hayCartasDisponibles(jugadorObj) {
    return jugadorObj.cartas.some(c => !!c)
  }

  // --- LOGICA DE MANOS Y TURNOS ---
  function determinarGanadorRonda() {
    const primera = manosGanadas.primera
    const segunda = manosGanadas.segunda
    const tercera = manosGanadas.tercera

    // Si primera fue parda
    if (primera === 'parda') {
      if (segunda === 'Jugador' || segunda === 'Máquina') return segunda
      if (segunda === 'parda') {
        return tercera || inicioMano.value
      }
    }

    // Si segunda fue parda, gana quien ganó la primera
    if (segunda === 'parda') {
      return primera || inicioMano.value
    }

    // Si alguien ganó las dos primeras
    if (primera === segunda && primera && primera !== 'parda') {
      return primera
    }

    // Si están 1-1, va a la tercera
    if (primera && segunda && primera !== segunda && primera !== 'parda' && segunda !== 'parda') {
      return tercera || inicioMano.value
    }

    return inicioMano.value
  }

  function debeFinalizarRonda() {
    const p = manosGanadas.primera
    const s = manosGanadas.segunda
    const t = manosGanadas.tercera

    // Si ya se jugó la tercera mano
    if (t) return true

    // Si alguien ganó 2 de 2
    if (p && s && p === s && p !== 'parda') return true

    // Si no hay más cartas para jugar
    const cartasJ1 = jugador1.cartas.filter(Boolean).length
    const cartasJ2 = jugador2.cartas.filter(Boolean).length
    if (cartasJ1 === 0 && cartasJ2 === 0) return true

    return false
  }

  function jugarCartaInterno(jugadorObj, indice) {
    const carta = jugadorObj.cartas[indice]
    if (!carta) return false

    if (trucoActivo.esperandoRespuesta || envidoActivo.esperandoRespuesta) {
      mensaje.value = 'Debes responder primero al canto'
      return false
    }

    // Jugar carta
    jugadorObj.cartas.splice(indice, 1, null)
    cartasMesa.push({ carta, jugador: jugadorObj.nombre })
    mensaje.value = `${jugadorObj.nombre} jugó ${carta.numero} de ${carta.palo}`

    // Calcular mano actual
    const manoNum = Math.ceil(cartasMesa.length / 2)
    manoActual.value = manoNum

    // Si se completó una mano (2 cartas)
    if (cartasMesa.length % 2 === 0) {
      const c1 = cartasMesa[cartasMesa.length - 2].carta
      const j1 = cartasMesa[cartasMesa.length - 2].jugador
      const c2 = cartasMesa[cartasMesa.length - 1].carta
      const j2 = cartasMesa[cartasMesa.length - 1].jugador

      let ganador
      if (c1.valor > c2.valor) {
        ganador = j1
      } else if (c2.valor > c1.valor) {
        ganador = j2
      } else {
        ganador = 'parda'
      }

      // Registrar ganador de la mano
      if (manoNum === 1) manosGanadas.primera = ganador
      else if (manoNum === 2) manosGanadas.segunda = ganador
      else if (manoNum === 3) manosGanadas.tercera = ganador

      // Verificar si debe finalizar la ronda
      if (debeFinalizarRonda()) {
        resolverRonda()
        return true
      }

      // Siguiente turno: gana la mano, juega primero
      if (ganador !== 'parda') {
        turno.value = ganador
      } else {
        // En parda, juega quien era mano
        turno.value = inicioMano.value
      }
    } else {
      // Primera carta de la mano: el otro jugador responde
      turno.value = (jugadorObj.nombre === 'Jugador') ? 'Máquina' : 'Jugador'
    }

    // Procesar turno máquina
    if (turno.value === 'Máquina' && hayCartasDisponibles(jugador2) && estadoRonda.value === 'playing') {
      setTimeout(() => procesarTurnoMaquina(), 800)
    }

    return true
  }

  function resolverRonda() {
    estadoRonda.value = 'resolving'
    const winner = determinarGanadorRonda()
    
    let puntosASumar = 1
    if (trucoActivo.cantado && trucoActivo.aceptado) {
      puntosASumar = nivelTruco.value
    }

    if (winner === 'Jugador') {
      jugador1.puntos += puntosASumar
      mensaje.value = `Jugador ganó la ronda y obtiene ${puntosASumar} punto${puntosASumar > 1 ? 's' : ''}`
    } else {
      jugador2.puntos += puntosASumar
      mensaje.value = `Máquina ganó la ronda y obtiene ${puntosASumar} punto${puntosASumar > 1 ? 's' : ''}`
    }

    estadoRonda.value = 'ended'

    if (jugador1.puntos >= TARGET_POINTS || jugador2.puntos >= TARGET_POINTS) {
      estadoRonda.value = 'game_over'
      mensaje.value += ` — Partida finalizada. Ganador: ${jugador1.puntos >= TARGET_POINTS ? 'Jugador' : 'Máquina'}`
    } else {
      inicioMano.value = (inicioMano.value === 'Jugador') ? 'Máquina' : 'Jugador'
      setTimeout(() => iniciarRonda(), 2000)
    }
  }

  // ---------- TRUCO ----------
  function cantarTruco(jugador, tipo = 'truco') {
    if (trucoActivo.esperandoRespuesta) {
      mensaje.value = "Ya hay un truco pendiente de respuesta."
      return false
    }

    const niveles = { truco: 2, retruco: 3, vale4: 4 }
    const nivel = niveles[tipo] || 2

    trucoActivo.cantado = true
    trucoActivo.tipo = tipo
    trucoActivo.cantador = jugador
    trucoActivo.aceptado = null
    trucoActivo.esperandoRespuesta = true
    trucoActivo.ultimoCantador = jugador

    mensaje.value = `${jugador} cantó ${tipo.toUpperCase()}!`

    if (jugador === 'Jugador') {
      setTimeout(() => {
        const decision = Robot.decidirResponderTruco(
          jugador2.cartas,
          nivel,
          manosGanadas,
          manoActual.value
        )

        if (decision) {
          trucoActivo.aceptado = true
          trucoActivo.esperandoRespuesta = false
          nivelTruco.value = nivel
          mensaje.value = `La máquina aceptó el ${tipo}!`

          // NO subir automáticamente, solo jugar
          if (turno.value === 'Máquina' && hayCartasDisponibles(jugador2)) {
            setTimeout(() => procesarTurnoMaquina(), 1000)
          }
        } else {
          trucoActivo.aceptado = false
          trucoActivo.esperandoRespuesta = false
          const puntosGanados = Math.max(1, nivel - 1)
          jugador1.puntos += puntosGanados
          mensaje.value = `La máquina no quiso el ${tipo}. Ganás ${puntosGanados} puntos.`
          
          estadoRonda.value = 'ended'
          if (jugador1.puntos >= TARGET_POINTS) {
            estadoRonda.value = 'game_over'
            mensaje.value += ` — Partida finalizada. ¡Ganaste!`
          } else {
            inicioMano.value = (inicioMano.value === 'Jugador') ? 'Máquina' : 'Jugador'
            setTimeout(() => iniciarRonda(), 2000)
          }
        }
      }, 1000)
    } else if (jugador === 'Máquina') {
      mensaje.value = `La máquina te cantó ${tipo}. ¿Querés, no querés o querés subir?`
    }

    return true
  }

  function responderTruco(aceptar, respondedor, subirA = null) {
    if (!trucoActivo.esperandoRespuesta) {
      mensaje.value = 'No hay truco pendiente de respuesta'
      return
    }

    const nivel = { truco: 2, retruco: 3, vale4: 4 }[trucoActivo.tipo] || 2

    // Si el jugador quiere subir la apuesta
    if (subirA) {
      trucoActivo.esperandoRespuesta = false
      trucoActivo.aceptado = true
      nivelTruco.value = nivel
      
      // Ahora el jugador canta el siguiente nivel
      setTimeout(() => {
        cantarTruco('Jugador', subirA)
      }, 100)
      return
    }

    trucoActivo.aceptado = aceptar
    trucoActivo.esperandoRespuesta = false

    if (!aceptar) {
      const puntosGanados = Math.max(1, nivel - 1)
      const ganador = trucoActivo.cantador
      if (ganador === 'Jugador') jugador1.puntos += puntosGanados
      else jugador2.puntos += puntosGanados

      mensaje.value = `${respondedor} rechazó el ${trucoActivo.tipo}. ${ganador} recibe ${puntosGanados} puntos.`
      estadoRonda.value = 'ended'
      
      if (jugador1.puntos >= TARGET_POINTS || jugador2.puntos >= TARGET_POINTS) {
        estadoRonda.value = 'game_over'
        mensaje.value += ` — Partida finalizada. Ganador: ${jugador1.puntos >= TARGET_POINTS ? 'Jugador' : 'Máquina'}`
      } else {
        inicioMano.value = (inicioMano.value === 'Jugador') ? 'Máquina' : 'Jugador'
        setTimeout(() => iniciarRonda(), 2000)
      }
      return
    }

    nivelTruco.value = nivel
    mensaje.value = `${respondedor} aceptó el ${trucoActivo.tipo}!`

    // Quien cantó debe jugar
    if (trucoActivo.cantador === 'Máquina') {
      turno.value = 'Máquina'
      if (hayCartasDisponibles(jugador2)) {
        setTimeout(() => procesarTurnoMaquina(), 1000)
      }
    } else {
      turno.value = 'Jugador'
    }
  }

  // ---------- ENVIDO ----------
  function cantarEnvido(jugador, tipo = 'envido') {
    // Permitir cantar si no hay respuesta pendiente O si estamos subiendo la apuesta
    const esSubida = envidoActivo.cantado && envidoActivo.esperandoRespuesta && 
                     envidoActivo.ultimoCantador !== jugador

    if (envidoActivo.esperandoRespuesta && !esSubida) {
      mensaje.value = "Ya hay un envido pendiente de respuesta."
      return false
    }

    if (!envidoActivo.secuencia) envidoActivo.secuencia = []
    
    // Si es una subida, no reiniciar el cantador original
    if (!envidoActivo.cantado) {
      envidoActivo.cantador = jugador
    }
    
    envidoActivo.cantado = true
    envidoActivo.aceptado = null
    envidoActivo.tipo = tipo
    envidoActivo.esperandoRespuesta = true
    envidoActivo.ultimoCantador = jugador
    envidoActivo.secuencia.push(tipo)

    const puntosRival = jugador === 'Jugador' ? jugador2.puntos : jugador1.puntos
    envidoActivo.puntosEnJuego = calcularPuntosEnvido(envidoActivo.secuencia, puntosRival)

    mensaje.value = `${jugador} cantó ${formatearTipoEnvido(tipo)}!`

    if (jugador === 'Jugador') {
      setTimeout(() => {
        const decision = Robot.decidirResponderOSubirEnvido(
          jugador2.cartas,
          envidoActivo.puntosEnJuego,
          jugador2.puntos,
          calcularEnvido,
          envidoActivo.secuencia
        )

        if (decision.tipo === 'aceptar') {
          resolverEnvidoAceptado()
        } else if (decision.tipo === 'rechazar') {
          resolverEnvidoRechazado('Máquina')
        } else if (decision.tipo === 'subir') {
          envidoActivo.esperandoRespuesta = false
          setTimeout(() => cantarEnvido('Máquina', decision.canto), 800)
        }

      }, 1000)
    } else if (jugador === 'Máquina') {
      mensaje.value = `La máquina te cantó ${formatearTipoEnvido(tipo)}. ¿Querés, no querés o querés subir?`
    }

    return true
  }

  function formatearTipoEnvido(tipo) {
    if (tipo === 'real_envido') return 'Real Envido'
    if (tipo === 'falta_envido') return 'Falta Envido'
    return 'Envido'
  }

  function resolverEnvidoAceptado() {
    envidoActivo.aceptado = true
    envidoActivo.esperandoRespuesta = false

    const e1 = calcularEnvido(jugador1.cartas.filter(Boolean))
    const e2 = calcularEnvido(jugador2.cartas.filter(Boolean))

    if (e1 > e2) {
      jugador1.puntos += envidoActivo.puntosEnJuego
      mensaje.value = `Ganaste el Envido con ${e1} contra ${e2}. Obtenés ${envidoActivo.puntosEnJuego} puntos.`
    } else if (e2 > e1) {
      jugador2.puntos += envidoActivo.puntosEnJuego
      mensaje.value = `La máquina ganó el Envido con ${e2} contra ${e1}. Obtiene ${envidoActivo.puntosEnJuego} puntos.`
    } else {
      const ganador = envidoActivo.cantador
      if (ganador === 'Jugador') {
        jugador1.puntos += envidoActivo.puntosEnJuego
        mensaje.value = `Empate en Envido (${e1}). Gana el cantador (Jugador). Obtenés ${envidoActivo.puntosEnJuego} puntos.`
      } else {
        jugador2.puntos += envidoActivo.puntosEnJuego
        mensaje.value = `Empate en Envido (${e2}). Gana el cantador (Máquina). Obtiene ${envidoActivo.puntosEnJuego} puntos.`
      }
    }

    // Continuar juego
    if (turno.value === 'Máquina' && hayCartasDisponibles(jugador2) && estadoRonda.value === 'playing') {
      setTimeout(() => procesarTurnoMaquina(), 1500)
    }
  }

  function resolverEnvidoRechazado(rechazador) {
    envidoActivo.aceptado = false
    envidoActivo.esperandoRespuesta = false
    
    const puntosNoQuerer = calcularPuntosNoQuerer(envidoActivo.secuencia)
    const ganador = envidoActivo.cantador
    
    if (ganador === 'Jugador') jugador1.puntos += puntosNoQuerer
    else jugador2.puntos += puntosNoQuerer

    mensaje.value = `${rechazador} rechazó el Envido. ${ganador} recibe ${puntosNoQuerer} puntos.`

    // Continuar juego
    if (turno.value === 'Máquina' && hayCartasDisponibles(jugador2) && estadoRonda.value === 'playing') {
      setTimeout(() => procesarTurnoMaquina(), 1500)
    }
  }

  function calcularPuntosEnvido(secuencia, puntosRival) {
    let total = 0
    for (const canto of secuencia) {
      if (canto === 'envido') total += 2
      else if (canto === 'real_envido') total += 3
      else if (canto === 'falta_envido') {
        // Devolver la diferencia hasta TARGET_POINTS
        return TARGET_POINTS - puntosRival
      }
    }
    return total
  }

  function calcularPuntosNoQuerer(secuencia) {
    if (secuencia.length === 0) return 1
    
    let total = 0
    for (let i = 0; i < secuencia.length - 1; i++) {
      const canto = secuencia[i]
      if (canto === 'envido') total += 2
      else if (canto === 'real_envido') total += 3
    }
    
    return total > 0 ? total : 1
  }

  function responderEnvido(aceptar, respondedor, subirCon = null) {
    if (!envidoActivo.esperandoRespuesta) {
      mensaje.value = 'No hay envido pendiente de respuesta'
      return
    }

    // Si el jugador quiere subir la apuesta
    if (subirCon) {
      envidoActivo.esperandoRespuesta = false
      // Ahora el jugador canta el siguiente nivel
      setTimeout(() => {
        cantarEnvido('Jugador', subirCon)
      }, 100)
      return
    }

    if (!aceptar) {
      resolverEnvidoRechazado(respondedor)
    } else {
      resolverEnvidoAceptado()
    }
  }

  function reiniciarPartida() {
    jugador1.puntos = 0
    jugador2.puntos = 0
    iniciarRonda()
  }

  // ---------- CONTROLES CENTRALIZADOS ----------
  const canCantarTruco = computed(() => {
    return estadoRonda.value === 'playing' &&
           turno.value === 'Jugador' &&
           !trucoActivo.cantado &&
           !trucoActivo.esperandoRespuesta &&
           !envidoActivo.esperandoRespuesta &&
           nivelTruco.value === 1
  })

  const canCantarRetruco = computed(() => {
    // Puede cantar retruco como respuesta o después de aceptar truco
    if (trucoActivo.esperandoRespuesta && trucoActivo.cantador === 'Máquina' && trucoActivo.tipo === 'truco') {
      return true
    }
    return estadoRonda.value === 'playing' &&
           turno.value === 'Jugador' &&
           trucoActivo.cantado &&
           trucoActivo.aceptado &&
           nivelTruco.value === 2 &&
           trucoActivo.ultimoCantador !== 'Jugador' &&
           !trucoActivo.esperandoRespuesta &&
           !envidoActivo.esperandoRespuesta
  })

  const canCantarVale4 = computed(() => {
    // Puede cantar vale4 como respuesta o después de aceptar retruco
    if (trucoActivo.esperandoRespuesta && trucoActivo.cantador === 'Máquina' && trucoActivo.tipo === 'retruco') {
      return true
    }
    return estadoRonda.value === 'playing' &&
           turno.value === 'Jugador' &&
           trucoActivo.cantado &&
           trucoActivo.aceptado &&
           nivelTruco.value === 3 &&
           trucoActivo.ultimoCantador !== 'Jugador' &&
           !trucoActivo.esperandoRespuesta &&
           !envidoActivo.esperandoRespuesta
  })

  const canCantarEnvido = computed(() => {
    return manoActual.value === 0 && 
           !envidoActivo.cantado && 
           estadoRonda.value === 'playing' &&
           !trucoActivo.esperandoRespuesta &&
           !envidoActivo.esperandoRespuesta &&
           turno.value === 'Jugador'
  })

  const canCantarRealEnvido = computed(() => {
    return canCantarEnvido.value && !envidoActivo.secuencia.includes('real_envido')
  })

  const canCantarFaltaEnvido = computed(() => {
    return canCantarEnvido.value && !envidoActivo.secuencia.includes('falta_envido')
  })

  const canSubirEnvido = computed(() => {
    return envidoActivo.esperandoRespuesta && 
           envidoActivo.ultimoCantador === 'Máquina' &&
           estadoRonda.value === 'playing'
  })

  const canSubirConEnvido = computed(() => {
    return canSubirEnvido.value && 
           !envidoActivo.secuencia.includes('envido') && 
           envidoActivo.secuencia.length === 1 &&
           envidoActivo.tipo !== 'envido'
  })

  const canSubirConRealEnvido = computed(() => {
    return canSubirEnvido.value && 
           !envidoActivo.secuencia.includes('real_envido') &&
           envidoActivo.tipo !== 'falta_envido'
  })

  const canSubirConFaltaEnvido = computed(() => {
    return canSubirEnvido.value && 
           !envidoActivo.secuencia.includes('falta_envido')
  })

  const hayTrucoPendiente = computed(() => {
    return trucoActivo.esperandoRespuesta && 
           trucoActivo.cantador === 'Máquina'
  })

  const hayEnvidoPendiente = computed(() => {
    return envidoActivo.esperandoRespuesta && 
           envidoActivo.ultimoCantador === 'Máquina'
  })

  const siguienteCanto = computed(() => {
    if (!trucoActivo.cantado) return 'truco'
    if (nivelTruco.value === 2) return 'retruco'
    if (nivelTruco.value === 3) return 'vale4'
    return null
  })

  return {
    jugador1,
    jugador2,
    turno,
    inicioMano,
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
    procesarTurnoMaquina,
    cantarTruco,
    responderTruco,
    cantarEnvido,
    responderEnvido,
    reiniciarPartida,
    hayCartasDisponibles,
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
    hayEnvidoPendiente,
    siguienteCanto,
    calcularEnvido
  }
}