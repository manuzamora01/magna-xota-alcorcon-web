document.addEventListener('DOMContentLoaded', () => {
    // Cargar los datos del JSON
    fetch('datos.json')
        .then(respuesta => respuesta.json())
        .then(datos => {
            
            // ==========================================
            // 1. CARGAR NOTICIAS
            // ==========================================
            const contenedorNoticias = document.getElementById('contenedor-noticias');
            if (contenedorNoticias && datos.noticias) {
                datos.noticias.forEach(noticia => {
                    const html = `
                        <div class="col-md-6">
                            <div class="card card-magna h-100">
                                <img src="${noticia.imagen}" class="card-img-top" alt="${noticia.titulo}">
                                <div class="card-body">
                                    <small class="text-muted fw-bold">${noticia.fecha}</small>
                                    <h4 class="card-title fw-bold mt-2" style="color: var(--mx-granate);">${noticia.titulo}</h4>
                                    <p class="card-text">${noticia.texto}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    contenedorNoticias.innerHTML += html;
                });
            }

            // ==========================================
            // 2. CARGAR PLANTILLA POR CATEGORÍAS
            // ==========================================
            const contenedorPlantilla = document.getElementById('contenedor-plantilla');
            if (contenedorPlantilla && datos.plantilla) {
                contenedorPlantilla.innerHTML = ''; 

                const categorias = [
                    { clave: 'porteros', titulo: 'Porteros' },
                    { clave: 'cierres', titulo: 'Cierres' },
                    { clave: 'alas', titulo: 'Alas' },
                    { clave: 'pivots', titulo: 'Pívots' }
                ];

                categorias.forEach(cat => {
                    const listaJugadores = datos.plantilla[cat.clave];
                    
                    if (listaJugadores && listaJugadores.length > 0) {
                        let tituloHtml = `
                            <div class="col-12 mt-4 mb-3">
                                <h3 class="fw-bold pb-2" style="color: var(--mx-verde); border-bottom: 2px solid var(--mx-granate); text-transform: uppercase; font-size: 1.5rem; letter-spacing: 1px;">
                                    ${cat.titulo}
                                </h3>
                            </div>
                        `;
                        contenedorPlantilla.innerHTML += tituloHtml;

                        listaJugadores.forEach(jugador => {
                            const cardHtml = `
                                <div class="col-sm-6 col-md-4 col-lg-3 mb-4">
                                    <div class="card card-magna h-100 position-relative">
                                        <div class="dorsal">${jugador.dorsal}</div>
                                        <img src="${jugador.imagen}" class="card-img-top" alt="${jugador.nombre}">
                                        <div class="card-body text-center bg-white rounded-bottom">
                                            <h5 class="card-title fw-bold mb-0 text-dark">${jugador.nombre}</h5>
                                        </div>
                                    </div>
                                </div>
                            `;
                            contenedorPlantilla.innerHTML += cardHtml;
                        });
                    }
                });
            }

            // ==========================================
            // 3. CARGAR PALMARÉS
            // ==========================================
            const contenedorPalmares = document.getElementById('contenedor-palmares');
            if (contenedorPalmares && datos.palmares) {
                datos.palmares.forEach(trofeo => {
                    const html = `
                        <div class="col-md-4 mb-4">
                            <img src="${trofeo.imagen}" alt="Trofeo" class="img-fluid rounded-circle mb-3" style="width: 150px; height: 150px; object-fit: cover; border: 4px solid var(--mx-dorado);">
                            <h4 class="fw-bold" style="color: var(--mx-granate);">${trofeo.titulo}</h4>
                            <p class="text-muted">${trofeo.temporada}</p>
                        </div>
                    `;
                    contenedorPalmares.innerHTML += html;
                });
            }

            // ==========================================
            // 4. CLASIFICACIÓN Y RESULTADOS DINÁMICOS
            // ==========================================
            const contenedorResultados = document.getElementById('contenedor-resultados');
            const cuerpoClasificacion = document.getElementById('cuerpo-clasificacion');
            const selectorJornada = document.getElementById('selector-jornada');

            if (contenedorResultados && cuerpoClasificacion && selectorJornada && datos.partidos) {
                
                // 4.1 Obtener todas las jornadas únicas ordenadas de menor a mayor
                const jornadasUnicas = [...new Set(datos.partidos.map(p => p.jornada))].sort((a, b) => a - b);
                
                // 4.2 Rellenar el `<select>` con las jornadas disponibles
                jornadasUnicas.forEach(jornada => {
                    const option = document.createElement('option');
                    option.value = jornada;
                    option.textContent = `Jornada ${jornada}`;
                    selectorJornada.appendChild(option);
                });

                // 4.3 Calcular cuál es la última jornada que tiene algún partido jugado
                let ultimaJornadaJugada = 1;
                const partidosJugados = datos.partidos.filter(p => p.jugado);
                if (partidosJugados.length > 0) {
                    ultimaJornadaJugada = Math.max(...partidosJugados.map(p => p.jornada));
                }
                
                // Seleccionar esa jornada por defecto
                selectorJornada.value = ultimaJornadaJugada;

                // 4.4 Función principal que dibuja la pantalla según la jornada elegida
                const renderizarJornada = (jornadaSeleccionada) => {
                    jornadaSeleccionada = parseInt(jornadaSeleccionada);

                    // --- LIMPIAR CONTENEDORES ---
                    contenedorResultados.innerHTML = '';
                    cuerpoClasificacion.innerHTML = '';

                    // --- DIBUJAR LOS RESULTADOS DE ESTA JORNADA EXACTA ---
                    const partidosDeEstaJornada = datos.partidos.filter(p => p.jornada === jornadaSeleccionada);
                    
                    partidosDeEstaJornada.forEach(partido => {
                        let estado = partido.jugado ? `<span class="badge bg-success">Finalizado</span>` : `<span class="badge bg-secondary">Por jugar</span>`;
                        let golesL = partido.jugado ? partido.golesLocal : '-';
                        let golesV = partido.jugado ? partido.golesVisitante : '-';
                        
                        const resultadoHtml = `
                            <div class="card card-magna text-center p-3 shadow-sm">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <small class="text-muted fw-bold">Jornada ${partido.jornada}</small>
                                    ${estado}
                                </div>
                                <div class="d-flex justify-content-center align-items-center gap-3">
                                    <div class="fw-bold fs-5 text-end text-truncate" style="flex: 1; color: var(--mx-negro);">${partido.local}</div>
                                    <div class="fs-3 fw-bold p-2 rounded" style="background-color: var(--mx-crema); border: 2px solid var(--mx-granate); min-width: 80px;">
                                        ${golesL} - ${golesV}
                                    </div>
                                    <div class="fw-bold fs-5 text-start text-truncate" style="flex: 1; color: var(--mx-negro);">${partido.visitante}</div>
                                </div>
                            </div>
                        `;
                        contenedorResultados.innerHTML += resultadoHtml;
                    });

                    // --- CALCULAR LA CLASIFICACIÓN HASTA ESTA JORNADA ---
                    let equipos = {};

                    // Filtramos solo los partidos que se han jugado Y que pertenecen a esta jornada o a jornadas anteriores
                    const partidosValidos = datos.partidos.filter(p => p.jugado && p.jornada <= jornadaSeleccionada);

                    partidosValidos.forEach(partido => {
                        // Crear los equipos en el objeto si no existen aún
                        [partido.local, partido.visitante].forEach(nombreEq => {
                            if (!equipos[nombreEq]) {
                                equipos[nombreEq] = { nombre: nombreEq, pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0 };
                            }
                        });

                        let eqLocal = equipos[partido.local];
                        let eqVis = equipos[partido.visitante];
                        let gL = partido.golesLocal;
                        let gV = partido.golesVisitante;

                        // Sumar Partidos Jugados y Goles
                        eqLocal.pj++; eqVis.pj++;
                        eqLocal.gf += gL; eqLocal.gc += gV;
                        eqVis.gf += gV; eqVis.gc += gL;

                        // Calcular Victorias, Empates, Derrotas y Puntos
                        if (gL > gV) {
                            eqLocal.pts += 3; eqLocal.pg++;
                            eqVis.pp++;
                        } else if (gL < gV) {
                            eqVis.pts += 3; eqVis.pg++;
                            eqLocal.pp++;
                        } else {
                            eqLocal.pts += 1; eqVis.pts += 1;
                            eqLocal.pe++; eqVis.pe++;
                        }
                    });

                    // Convertir el objeto a Array y calcular diferencia de goles
                    let tablaClasificacion = Object.values(equipos);
                    tablaClasificacion.forEach(eq => eq.dif = eq.gf - eq.gc);

                    // Ordenar: 1º Puntos, 2º Diferencia Goles, 3º Goles a Favor
                    tablaClasificacion.sort((a, b) => {
                        if (b.pts !== a.pts) return b.pts - a.pts; 
                        if (b.dif !== a.dif) return b.dif - a.dif; 
                        return b.gf - a.gf; 
                    });

                    // Dibujar la tabla
                    tablaClasificacion.forEach((eq, index) => {
                        let destacarFila = eq.nombre === "Magna Xota Alcorcón" ? 'style="background-color: rgba(123, 17, 19, 0.1); font-weight: bold; color: var(--mx-granate);"' : '';

                        const filaHtml = `
                            <tr ${destacarFila}>
                                <td class="fw-bold">${index + 1}</td>
                                <td class="text-start">${eq.nombre}</td>
                                <td class="fw-bold fs-5">${eq.pts}</td>
                                <td>${eq.pj}</td>
                                <td>${eq.pg}</td>
                                <td>${eq.pe}</td>
                                <td>${eq.pp}</td>
                                <td>${eq.gf}</td>
                                <td>${eq.gc}</td>
                                <td>${eq.dif > 0 ? '+'+eq.dif : eq.dif}</td>
                            </tr>
                        `;
                        cuerpoClasificacion.innerHTML += filaHtml;
                    });
                };

                // 4.5 Ejecutar la función la primera vez al cargar la página
                renderizarJornada(selectorJornada.value);

                // 4.6 Escuchar los cambios en el desplegable para actualizar la página al vuelo
                selectorJornada.addEventListener('change', (evento) => {
                    renderizarJornada(evento.target.value);
                });
            }

        })
        .catch(error => console.error('Error cargando el JSON:', error));
});