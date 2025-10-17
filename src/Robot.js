// Robot.js
export const Robot = {
  nombre: 'Máquina',

  // --- ENVIDO ---
  decidirEnvido(cartas, puntosRival = 0, calcularEnvido) {
    const envido = calcularEnvido(cartas)
    const probabilidadCantar = Math.random()

    // Con 30-33 puntos: siempre canta falta envido
    if (envido >= 30) return 'falta_envido'
    
    // Con 27-29 puntos: 80% falta, 20% real envido
    if (envido >= 27) {
      return probabilidadCantar < 0.8 ? 'falta_envido' : 'real_envido'
    }
    
    // Con 24-26 puntos: real envido o envido
    if (envido >= 24) {
      return probabilidadCantar < 0.7 ? 'real_envido' : 'envido'
    }
    
    // Con 20-23 puntos: envido básico
    if (envido >= 20) {
      return probabilidadCantar < 0.5 ? 'envido' : null
    }

    // Menos de 20: no cantar
    return null
  },

  decidirResponderOSubirEnvido(cartas, puntosEnJuego, misPuntos, calcularEnvido, secuencia) {
    const miEnvido = calcularEnvido(cartas)
    const ultimoCanto = secuencia[secuencia.length - 1]
    
    // Determinar qué cantos aún puede hacer
    const puedeEnvido = !secuencia.includes('envido') && secuencia.length === 1
    const puedeRealEnvido = !secuencia.includes('real_envido')
    const puedeFaltaEnvido = !secuencia.includes('falta_envido')
    
    // Con envido muy alto: subir la apuesta
    if (miEnvido >= 30 && puedeFaltaEnvido) {
      return { tipo: 'subir', canto: 'falta_envido' }
    }
    
    if (miEnvido >= 27) {
      if (puedeFaltaEnvido && Math.random() < 0.7) {
        return { tipo: 'subir', canto: 'falta_envido' }
      }
      if (puedeRealEnvido && Math.random() < 0.6) {
        return { tipo: 'subir', canto: 'real_envido' }
      }
      return { tipo: 'aceptar' }
    }
    
    if (miEnvido >= 24) {
      if (puedeRealEnvido && puntosEnJuego <= 3 && Math.random() < 0.5) {
        return { tipo: 'subir', canto: 'real_envido' }
      }
      if (puedeEnvido && Math.random() < 0.4) {
        return { tipo: 'subir', canto: 'envido' }
      }
      // Acepta según riesgo
      if (puntosEnJuego <= 3) return Math.random() < 0.75 ? { tipo: 'aceptar' } : { tipo: 'rechazar' }
      return Math.random() < 0.55 ? { tipo: 'aceptar' } : { tipo: 'rechazar' }
    }
    
    if (miEnvido >= 20) {
      if (puntosEnJuego <= 2) return Math.random() < 0.6 ? { tipo: 'aceptar' } : { tipo: 'rechazar' }
      return Math.random() < 0.35 ? { tipo: 'aceptar' } : { tipo: 'rechazar' }
    }
    
    // Envido bajo: generalmente rechaza
    if (puntosEnJuego <= 2) return Math.random() < 0.4 ? { tipo: 'aceptar' } : { tipo: 'rechazar' }
    return Math.random() < 0.2 ? { tipo: 'aceptar' } : { tipo: 'rechazar' }
  },

  // --- TRUCO ---
  decidirTruco(cartas, nivelActual, manosGanadas = {}, manoActual = 0, trucoCantado = false) {
    const valores = cartas.filter(Boolean).map(c => c.valor).sort((a,b) => b - a)
    if (valores.length === 0) return null

    const { primera = null, segunda = null } = manosGanadas

    const mejorCarta = valores[0]
    const segundaMejor = valores[1] || 0
    const terceraMejor = valores[2] || 0
    const fuerzaTotal = valores.reduce((a,b) => a + b, 0)
    const fuerzaPromedio = fuerzaTotal / valores.length

    // Evaluar situación de las manos
    let ventaja = 0
    if (primera === 'Máquina') ventaja++
    if (primera === 'Jugador') ventaja--
    if (segunda === 'Máquina') ventaja++
    if (segunda === 'Jugador') ventaja--

    // TRUCO inicial (nivel 1 -> 2)
    if (nivelActual === 1 && !trucoCantado) {
      // Con ancho de espadas o basto: casi siempre canta
      if (mejorCarta >= 13) return Math.random() < 0.85 ? 'truco' : null
      
      // Con 7 de espadas u oro: muy probable
      if (mejorCarta >= 11) return Math.random() < 0.7 ? 'truco' : null
      
      // Con mano fuerte general
      if (fuerzaTotal >= 28 || fuerzaPromedio >= 9) {
        return Math.random() < 0.6 ? 'truco' : null
      }
      
      // Con ventaja en manos, puede arriesgar con cartas menores
      if (ventaja > 0 && mejorCarta >= 9) {
        return Math.random() < 0.5 ? 'truco' : null
      }
      
      // En la tercera mano con carta decente
      if (manoActual >= 2 && mejorCarta >= 10 && ventaja >= 0) {
        return Math.random() < 0.5 ? 'truco' : null
      }
    }

    // RETRUCO (nivel 2 -> 3) - solo si el truco ya fue cantado y aceptado
    if (nivelActual === 2 && trucoCantado) {
      // Con anchos: casi siempre
      if (mejorCarta >= 13) return Math.random() < 0.8 ? 'retruco' : null
      
      // Con 7 de espadas u oro + otra buena
      if (mejorCarta >= 11 && segundaMejor >= 10) {
        return Math.random() < 0.7 ? 'retruco' : null
      }
      
      // Con dos cartas muy fuertes
      if (mejorCarta >= 10 && segundaMejor >= 10) {
        return Math.random() < 0.55 ? 'retruco' : null
      }
      
      // Con ventaja de manos + carta fuerte
      if (ventaja > 0 && mejorCarta >= 10) {
        return Math.random() < 0.5 ? 'retruco' : null
      }
    }

    // VALE 4 (nivel 3 -> 4) - solo si el retruco ya fue cantado y aceptado
    if (nivelActual === 3 && trucoCantado) {
      // Solo con anchos o mano extremadamente fuerte
      if (mejorCarta >= 14) return Math.random() < 0.7 ? 'vale4' : null
      
      // Con ancho de basto + otra excelente
      if (mejorCarta >= 13 && segundaMejor >= 11) {
        return Math.random() < 0.6 ? 'vale4' : null
      }
      
      // Con ventaja clara de manos + cartas muy fuertes
      if (ventaja > 0 && mejorCarta >= 12 && fuerzaTotal >= 30) {
        return Math.random() < 0.4 ? 'vale4' : null
      }
    }

    return null
  },

  decidirResponderTruco(cartas, nivelActual, manosGanadas = {}, manoActual = 0) {
    const primera = manosGanadas.primera ?? null
    const segunda = manosGanadas.segunda ?? null

    const valores = (Array.isArray(cartas) ? cartas : [])
      .filter(Boolean)
      .map(c => c.valor)
      .sort((a, b) => b - a)

    if (valores.length === 0) return false

    const mejorCarta = valores[0]
    const segundaMejor = valores[1] || 0
    const fuerzaTotal = valores.reduce((a, b) => a + b, 0)

    // Evaluar ventaja en manos
    let ventaja = 0
    if (primera === 'Máquina') ventaja++
    if (primera === 'Jugador') ventaja--
    if (segunda === 'Máquina') ventaja++
    if (segunda === 'Jugador') ventaja--

    // RESPONDER SEGÚN NIVEL
    // Nivel 2 -> Truco
    if (nivelActual === 2) {
      if (mejorCarta >= 11) return true
      if (mejorCarta >= 10 && fuerzaTotal >= 25) return Math.random() < 0.85
      if (fuerzaTotal >= 24) return Math.random() < 0.7
      if (ventaja > 0 && mejorCarta >= 9) return Math.random() < 0.7
      if (manoActual >= 2 && mejorCarta >= 8) return Math.random() < 0.6
      if (fuerzaTotal < 20) return Math.random() < 0.3
      return Math.random() < 0.45
    }

    // Nivel 3 -> Retruco
    if (nivelActual === 3) {
      if (mejorCarta >= 13) return Math.random() < 0.9
      if (mejorCarta >= 11 && segundaMejor >= 9) return Math.random() < 0.75
      if (mejorCarta >= 10 && fuerzaTotal >= 28) return Math.random() < 0.65
      if (ventaja > 0 && mejorCarta >= 10) return Math.random() < 0.6
      if (mejorCarta >= 9 && fuerzaTotal >= 25) return Math.random() < 0.45
      return Math.random() < 0.25
    }

    // Nivel 4 -> Vale 4
    if (nivelActual === 4) {
      if (mejorCarta >= 14) return Math.random() < 0.85
      if (mejorCarta >= 13 && segundaMejor >= 10) return Math.random() < 0.7
      if (ventaja > 0 && mejorCarta >= 12 && fuerzaTotal >= 32) return Math.random() < 0.6
      if (mejorCarta >= 11 && fuerzaTotal >= 30) return Math.random() < 0.4
      return Math.random() < 0.15
    }

    return fuerzaTotal >= 25 && Math.random() < 0.5
  },

  elegirCarta(cartasMesa, misCartas, manosGanadas, manoActual) {
    const cartasDisponibles = misCartas
      .map((c, i) => ({ c, i }))
      .filter(x => x.c)
      .sort((a, b) => b.c.valor - a.c.valor)

    if (cartasDisponibles.length === 0) return 0

    // PRIMERA CARTA DE LA MANO (la máquina juega primero)
    if (cartasMesa.length === 0) {
      // En primera mano: jugar carta media-alta (mantener reserva)
      if (manoActual === 0) {
        if (cartasDisponibles.length === 3) {
          // Si tengo ancho, guardar para después
          if (cartasDisponibles[0].c.valor >= 13) {
            return cartasDisponibles[1]?.i || cartasDisponibles[0].i
          }
          // Jugar la segunda mejor carta
          return cartasDisponibles[1]?.i || cartasDisponibles[0].i
        }
      }

      // En segunda mano: estrategia según resultado primera
      if (manoActual === 1) {
        if (manosGanadas.primera === 'Máquina') {
          // Gané la primera: jugar carta más baja para asegurar
          return cartasDisponibles[cartasDisponibles.length - 1].i
        }
        if (manosGanadas.primera === 'Jugador') {
          // Perdí la primera: debo ganar esta sí o sí
          return cartasDisponibles[0].i
        }
        // Parda: jugar carta alta
        return cartasDisponibles[0].i
      }

      // En tercera mano: jugar lo mejor que tenga
      if (manoActual === 2) {
        return cartasDisponibles[0].i
      }

      // Default: carta media
      return cartasDisponibles[Math.floor(cartasDisponibles.length / 2)]?.i || cartasDisponibles[0].i
    }

    // RESPONDER A CARTA DEL JUGADOR
    const ultimaCarta = cartasMesa[cartasMesa.length - 1].carta

    // Buscar cartas que ganan
    const ganadoras = cartasDisponibles.filter(x => x.c.valor > ultimaCarta.valor)

    if (ganadoras.length > 0) {
      // Si puedo ganar con varias cartas, usar la más baja que gane
      return ganadoras[ganadoras.length - 1].i
    }

    // No puedo ganar: estrategia según situación
    // En primera mano: tirar carta baja
    if (manoActual === 0) {
      return cartasDisponibles[cartasDisponibles.length - 1].i
    }

    // En segunda mano perdiendo la primera: tirar lo más bajo
    if (manoActual === 1 && manosGanadas.primera === 'Jugador') {
      return cartasDisponibles[cartasDisponibles.length - 1].i
    }

    // En tercera mano o ganando: tirar carta más baja
    return cartasDisponibles[cartasDisponibles.length - 1].i
  }
} 