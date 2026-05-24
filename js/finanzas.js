/**
 * TommyFinance - Sistema de Gestión de Finanzas Personales
 * Arquitectura modular y persistencia en LocalStorage
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. ESTADO GLOBAL DE LA APLICACIÓN
    // ==========================================
    const CONFIG = {
        keys: {
            transacciones: 'cryptoFinanzasData',
            metas: 'cryptoMetasData',
            limites: 'cryptoLimitesData'
        },
        categorias: ['Alimentación', 'Transporte', 'Servicios', 'Entretenimiento', 'Trabajo'],
        iconos: { 
            Alimentación: '🍔', 
            Transporte: '🚗', 
            Servicios: '💡', 
            Entretenimiento: '🎬', 
            Trabajo: '💼' 
        }
    };

    let filtroActual = 'all';

    // ==========================================
    // 2. ELEMENTOS DEL DOM (SELECTORES)
    // ==========================================
    const DOM = {
        // Formularios
        financeForm: document.getElementById('finance-form'),
        budgetForm: document.getElementById('budget-form'), 
        savingsForm: document.getElementById('savings-form'), 
        
        // Contenedores de Listas
        historyList: document.getElementById('history-list'),
        budgetsStatusList: document.getElementById('budgets-status-list'), 
        savingsStatusList: document.getElementById('savings-status-list'),
        categoryStatsContainer: document.getElementById('category-stats-container'),
        toastContainer: document.getElementById('toast-container'),
        
        // Tarjetas de Balance
        totalBalance: document.getElementById('total-balance'),
        totalIngresos: document.getElementById('total-ingresos'),
        totalGastos: document.getElementById('total-gastos'),
        
        // Componentes de Navegación
        tabs: document.querySelectorAll('.btn-tab'),
        filters: document.querySelectorAll('.btn-filter'),

        // Herramientas de Seguridad de Copias de Respaldo
        btnExportar: document.getElementById('btn-exportar'),
        inputImportar: document.getElementById('input-importar')
    };

    // ==========================================
    // 3. SERVICIOS DE ALMACENAMIENTO (LOCALSTORAGE)
    // ==========================================
    const StorageService = {
        get: (key) => JSON.parse(localStorage.getItem(key)) || [],
        getObj: (key) => JSON.parse(localStorage.getItem(key)) || {},
        set: (key, data) => localStorage.setItem(key, JSON.stringify(data))
    };

    // ==========================================
    // 4. SISTEMA UI: NOTIFICACIONES (TOASTS)
    // ==========================================
    function mostrarToast(mensaje, tipo = 'success') {
        if (!DOM.toastContainer) return;
        
        // Validar entrada
        if (typeof mensaje !== 'string' || mensaje.trim().length === 0) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        
        const iconosToast = {
            success: '🟢',
            danger: '🔴',
            warning: '⚠️',
            info: '💡',
            purple: '🔮'
        };

        const icono = iconosToast[tipo] || '🟢';
        
        // SEGURIDAD: Usar textContent en lugar de innerHTML
        const span1 = document.createElement('span');
        span1.textContent = icono;
        const span2 = document.createElement('span');
        span2.textContent = mensaje;
        
        toast.appendChild(span1);
        toast.appendChild(span2);
        DOM.toastContainer.appendChild(toast);
        
        setTimeout(() => toast.remove(), 4000); 
    }
    
    // ==========================================
    // FUNCIÓN SEGURA DE CONFIRMACIÓN
    // ==========================================
    function confirmarAccion(mensaje) {
        return confirm(mensaje);
    }

    // ==========================================
    // 5. CONTROLADOR DE PESTAÑAS (TABS)
    // ==========================================
    function inicializarTabs() {
        DOM.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                DOM.tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });

                const targetTab = tab.getAttribute('data-tab');
                const targetElement = document.getElementById(`tab-${targetTab}`);
                if (targetElement) {
                    targetElement.classList.add('active');
                }
            });
        });
    }

    // ==========================================
    // 6. RENDERIZADORES DE INTERFAZ (UI)
    // ==========================================
    
    function actualizarTarjetasBalance(transacciones) {
        let ingresos = 0;
        let gastos = 0;

        transacciones.forEach(t => {
            if (t.tipo === 'ingreso') ingresos += t.monto;
            else if (t.tipo === 'gasto') gastos += t.monto;
        });

        const metas = StorageService.get(CONFIG.keys.metas);
        const totalAhorrado = metas.reduce((suma, m) => suma + m.ahorrado, 0);

        // Balance Neto Disponible matemático
        const balanceTotal = ingresos - gastos - totalAhorrado;

        if (DOM.totalIngresos) DOM.totalIngresos.textContent = `S/ ${ingresos.toFixed(2)}`;
        if (DOM.totalGastos) DOM.totalGastos.textContent = `S/ ${gastos.toFixed(2)}`;
        
        if (DOM.totalBalance) {
            DOM.totalBalance.textContent = `S/ ${balanceTotal.toFixed(2)}`;
            const tarjetaBalance = DOM.totalBalance.parentElement;
            
            if (balanceTotal < 0) {
                tarjetaBalance.style.borderTop = "4px solid var(--crypto-red)";
                DOM.totalBalance.style.color = "var(--crypto-red)";
            } else {
                tarjetaBalance.style.borderTop = "4px solid var(--crypto-blue)";
                DOM.totalBalance.style.color = "var(--text-main)";
            }
        }
    }

    function renderizarEstadisticasCategorias(transacciones) {
        if (!DOM.categoryStatsContainer) return;
        DOM.categoryStatsContainer.innerHTML = '';

        const totalGastos = transacciones
            .filter(t => t.tipo === 'gasto')
            .reduce((suma, t) => suma + t.monto, 0);

        if (totalGastos === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-state';
            emptyDiv.style.padding = '0.5rem 0';
            emptyDiv.textContent = 'No hay deudas o gastos registrados.';
            DOM.categoryStatsContainer.appendChild(emptyDiv);
            return;
        }

        CONFIG.categorias.forEach(cat => {
            const gastadoCat = transacciones
                .filter(t => t.tipo === 'gasto' && t.categoria === cat)
                .reduce((suma, t) => suma + t.monto, 0);

            if (gastadoCat > 0) {
                const porcentaje = (gastadoCat / totalGastos) * 100;
                const fila = document.createElement('div');
                
                // SEGURIDAD: Construir elementos de forma segura
                const divTop = document.createElement('div');
                divTop.style.cssText = 'display:flex; justify-content:space-between; font-size:0.85rem; color:var(--text-muted);';
                
                const spanCat = document.createElement('span');
                spanCat.textContent = (CONFIG.iconos[cat] || '•') + ' ' + cat;
                
                const spanMonto = document.createElement('span');
                spanMonto.textContent = `S/ ${gastadoCat.toFixed(2)} (${porcentaje.toFixed(1)}%)`;
                
                divTop.appendChild(spanCat);
                divTop.appendChild(spanMonto);
                
                const divBar = document.createElement('div');
                divBar.style.cssText = 'background:#0b0f19; height:5px; border-radius:3px; margin-top:2px; overflow:hidden;';
                
                const divFill = document.createElement('div');
                divFill.style.cssText = `width:${porcentaje}%; height:100%; background-color:var(--crypto-purple);`;
                
                divBar.appendChild(divFill);
                fila.appendChild(divTop);
                fila.appendChild(divBar);
                
                DOM.categoryStatsContainer.appendChild(fila);
            }
        });
    }

    function renderizarLimitesPresupuesto(transacciones) {
        if (!DOM.budgetsStatusList) return;
        DOM.budgetsStatusList.innerHTML = '';
        
        const limites = StorageService.getObj(CONFIG.keys.limites);
        const categoriasConLimite = Object.keys(limites);

        categoriasConLimite.forEach(cat => {
            const limiteMax = limites[cat];
            const gastado = transacciones
                .filter(t => t.tipo === 'gasto' && t.categoria === cat)
                .reduce((suma, t) => suma + t.monto, 0);
            
            const porcentaje = Math.min((gastado / limiteMax) * 100, 100);
            const sobrepasado = gastado > limiteMax;

            const itemBudget = document.createElement('div');
            itemBudget.innerHTML = `
                <div style="display:flex; justify-content:space-between; color: var(--text-muted); font-size:0.85rem;">
                    <span>${CONFIG.iconos[cat] || '•'} ${cat}</span>
                    <span style="font-weight:600; color: ${sobrepasado ? 'var(--crypto-red)' : 'var(--text-main)'}">
                        S/ ${gastado.toFixed(2)} / S/ ${limiteMax.toFixed(2)}
                    </span>
                </div>
                <div style="background:#0b0f19; height:6px; border-radius:4px; margin-top:4px; overflow:hidden; width:100%;">
                    <div style="width: ${porcentaje}%; height:100%; background-color: ${sobrepasado ? 'var(--crypto-red)' : 'var(--crypto-blue)'}; transition: width 0.3s;"></div>
                </div>
            `;
            DOM.budgetsStatusList.appendChild(itemBudget);
        });
    }

    function renderizarCochinitoMetas() {
        if (!DOM.savingsStatusList) return;
        DOM.savingsStatusList.innerHTML = '';

        const metas = StorageService.get(CONFIG.keys.metas);

        if (metas.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-state';
            emptyDiv.style.padding = '0.5rem 0';
            emptyDiv.textContent = 'No tienes metas de ahorro activas.';
            DOM.savingsStatusList.appendChild(emptyDiv);
            return;
        }

        metas.forEach(m => {
            const porcentaje = Math.min((m.ahorrado / m.objetivo) * 100, 100);
            const itemMeta = document.createElement('div');
            itemMeta.className = "item-saving-card"; 
            itemMeta.style.cssText = "background: var(--bg-dark-deep); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 0.5rem;";

            // SEGURIDAD: Construir elementos de forma segura
            const divTitle = document.createElement('div');
            divTitle.style.cssText = 'display:flex; justify-content:space-between; font-size:0.9rem; font-weight:600; margin-bottom:0.3rem;';
            
            const spanName = document.createElement('span');
            spanName.textContent = '🔮 ' + m.nombre;
            
            const spanAmount = document.createElement('span');
            spanAmount.textContent = `S/ ${m.ahorrado.toFixed(2)} / S/ ${m.objetivo.toFixed(2)}`;
            
            divTitle.appendChild(spanName);
            divTitle.appendChild(spanAmount);
            
            const divBar = document.createElement('div');
            divBar.style.cssText = 'background:#171e2e; height:8px; border-radius:4px; overflow:hidden; width:100%; margin-bottom:0.6rem;';
            
            const divFill = document.createElement('div');
            divFill.style.cssText = `width: ${porcentaje}%; height:100%; background-color: var(--crypto-purple); transition: width 0.3s;`;
            divBar.appendChild(divFill);
            
            const divControls = document.createElement('div');
            divControls.style.cssText = 'display:flex; gap:0.5rem;';
            
            const input = document.createElement('input');
            input.type = 'number';
            input.step = '0.01';
            input.placeholder = 'Monto S/';
            input.id = `input-ahorrar-${m.id}`;
            input.style.cssText = 'padding:0.3rem; background:#171e2e; border:1px solid var(--border-color); color:white; border-radius:4px; font-size:0.8rem; flex:1;';
            
            const btnAdd = document.createElement('button');
            btnAdd.className = 'btn-add-saving';
            btnAdd.setAttribute('data-id', m.id);
            btnAdd.textContent = 'Ahorrar';
            btnAdd.style.cssText = 'background:var(--crypto-purple); color:white; border:none; padding:0.3rem 0.6rem; border-radius:4px; font-size:0.8rem; font-weight:600; cursor:pointer;';
            
            const btnDelete = document.createElement('button');
            btnDelete.className = 'btn-delete-meta';
            btnDelete.setAttribute('data-id', m.id);
            btnDelete.textContent = '✕';
            btnDelete.style.cssText = 'background:none; border:none; color:var(--crypto-red); cursor:pointer; font-weight:bold;';
            
            divControls.appendChild(input);
            divControls.appendChild(btnAdd);
            divControls.appendChild(btnDelete);
            
            itemMeta.appendChild(divTitle);
            itemMeta.appendChild(divBar);
            itemMeta.appendChild(divControls);
            
            DOM.savingsStatusList.appendChild(itemMeta);
        });

        asignarEventosDinamicosMetas();
    }

    function renderizarHistorial() {
        if (!DOM.historyList) return;
        
        const transacciones = StorageService.get(CONFIG.keys.transacciones);
        
        // Sincronizar todos los paneles numéricos primero
        actualizarTarjetasBalance(transacciones);
        renderizarEstadisticasCategorias(transacciones);
        renderizarLimitesPresupuesto(transacciones);

        const transaccionesFiltradas = transacciones.filter(t => {
            if (filtroActual === 'all') return true;
            return t.tipo === filtroActual;
        });

        DOM.historyList.innerHTML = '';
        
        if (transaccionesFiltradas.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-state';
            emptyDiv.textContent = 'No hay movimientos guardados en esta sección.';
            DOM.historyList.appendChild(emptyDiv);
            return;
        }

        transaccionesFiltradas.forEach(t => {
            const item = document.createElement('div');
            item.className = 'item-transaction';
            const esIngreso = t.tipo === 'ingreso';
            const claseTipo = esIngreso ? 'type-ingreso' : 'type-gasto';
            const signo = esIngreso ? '+' : '-';

            // SEGURIDAD: Construir elementos de forma segura
            const itemInfo = document.createElement('div');
            itemInfo.className = 'item-info';
            
            const h4 = document.createElement('h4');
            h4.textContent = t.descripcion;
            
            const spanInfo = document.createElement('span');
            spanInfo.style.cssText = 'font-size: 0.8rem; color: var(--text-muted);';
            spanInfo.innerHTML = `${CONFIG.iconos[t.categoria] || '•'} ${t.categoria} • 🏦 ${t.metodo} <br>
                        📅 ${t.fecha} a las 🕒 ${t.hora}`;
            
            itemInfo.appendChild(h4);
            itemInfo.appendChild(spanInfo);
            
            const itemAction = document.createElement('div');
            itemAction.className = 'item-amount-action';
            
            const spanAmount = document.createElement('span');
            spanAmount.className = `item-amount ${claseTipo}`;
            spanAmount.textContent = `${signo} S/ ${t.monto.toFixed(2)}`;
            
            const btnDelete = document.createElement('button');
            btnDelete.className = 'btn-delete-trans';
            btnDelete.setAttribute('data-id', t.id);
            btnDelete.textContent = '✕';
            
            itemAction.appendChild(spanAmount);
            itemAction.appendChild(btnDelete);
            
            item.appendChild(itemInfo);
            item.appendChild(itemAction);
            
            DOM.historyList.appendChild(item);
        });

        asignarEventosDinamicosHistorial();
    }

    // ==========================================
    // 7. EVENTOS DINÁMICOS (ELEMENTOS GENERADOS)
    // ==========================================
    function asignarEventosDinamicosMetas() {
        document.querySelectorAll('.btn-add-saving').forEach(b => {
            b.onclick = () => {
                const idMeta = Number(b.getAttribute('data-id'));
                const input = document.getElementById(`input-ahorrar-${idMeta}`);
                const montoAhorro = parseFloat(input?.value);
                
                // SEGURIDAD: Validación robusta
                if (isNaN(montoAhorro) || montoAhorro <= 0) {
                    mostrarToast('Por favor ingresa un monto válido.', 'warning');
                    return;
                }
                
                // Límite de validación
                if (montoAhorro > 1000000) {
                    mostrarToast('El monto es demasiado grande.', 'warning');
                    return;
                }
                
                let metas = StorageService.get(CONFIG.keys.metas);
                const index = metas.findIndex(m => m.id === idMeta);
                
                if (index !== -1) {
                    metas[index].ahorrado += montoAhorro;
                    StorageService.set(CONFIG.keys.metas, metas);
                    input.value = '';
                    renderizarHistorial();
                    renderizarCochinitoMetas();
                    mostrarToast(`¡S/ ${montoAhorro.toFixed(2)} añadidos al cochinito!`, 'purple');
                }
            };
        });

        document.querySelectorAll('.btn-delete-meta').forEach(b => {
            b.onclick = () => {
                const idMeta = Number(b.getAttribute('data-id'));
                if (confirmarAccion('¿Deseas eliminar esta meta de ahorro?')) {
                    let metas = StorageService.get(CONFIG.keys.metas);
                    metas = metas.filter(m => m.id !== idMeta);
                    StorageService.set(CONFIG.keys.metas, metas);
                    renderizarHistorial();
                    renderizarCochinitoMetas();
                    mostrarToast('Meta de ahorro eliminada con éxito.', 'danger');
                }
            };
        });
    }

    function asignarEventosDinamicosHistorial() {
        document.querySelectorAll('.btn-delete-trans').forEach(boton => {
            boton.onclick = (e) => {
                const idAEliminar = Number(e.currentTarget.getAttribute('data-id'));
                if (confirmarAccion('¿Estás seguro de eliminar esta transacción de tus cuentas?')) {
                    let transacciones = StorageService.get(CONFIG.keys.transacciones);
                    transacciones = transacciones.filter(t => t.id !== idAEliminar);
                    StorageService.set(CONFIG.keys.transacciones, transacciones);
                    renderizarHistorial();
                    mostrarToast('Operación eliminada de los registros.', 'danger');
                }
            };
        });
    }

    // ==========================================
    // 8. ESCUCHADORES DE FORMULARIOS DE ENTRADA
    // ==========================================
    function inicializarFormularios() {
        if (DOM.financeForm) {
            DOM.financeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const amount = parseFloat(document.getElementById('amount').value);
                const type = document.getElementById('type').value;
                const category = document.getElementById('category').value;
                const method = document.getElementById('payment-method').value;
                const description = document.getElementById('description').value.trim();

                // SEGURIDAD: Validación robusta de entrada
                if (isNaN(amount) || amount <= 0) {
                    mostrarToast('El monto debe ser un número positivo.', 'danger');
                    return;
                }
                
                if (amount > 1000000) {
                    mostrarToast('El monto excede los límites permitidos.', 'danger');
                    return;
                }
                
                if (description.length === 0 || description.length > 200) {
                    mostrarToast('La descripción debe tener entre 1 y 200 caracteres.', 'danger');
                    return;
                }
                
                if (!category || category === '') {
                    mostrarToast('Selecciona una categoría válida.', 'danger');
                    return;
                }

                const ahora = new Date();
                const nuevaTransaccion = {
                    id: Date.now(),
                    monto: amount,
                    tipo: type,
                    categoria: category,
                    metodo: method,
                    descripcion: description,
                    fecha: ahora.toLocaleDateString(),
                    hora: ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };

                let transacciones = StorageService.get(CONFIG.keys.transacciones);
                
                if (type === 'gasto') {
                    const limites = StorageService.getObj(CONFIG.keys.limites);
                    if (limites[category]) {
                        const limiteMax = limites[category];
                        const gastadoActual = transacciones
                            .filter(t => t.tipo === 'gasto' && t.categoria === category)
                            .reduce((suma, t) => suma + t.monto, 0);
                            
                        if (gastadoActual + amount > limiteMax) {
                            mostrarToast(`⚠️ Alerta: Esta operación superará tu presupuesto mensual para ${category}.`, 'warning');
                        }
                    }
                }

                transacciones.unshift(nuevaTransaccion);
                StorageService.set(CONFIG.keys.transacciones, transacciones);
                
                DOM.financeForm.reset();
                renderizarHistorial();
                mostrarToast('Operación registrada correctamente.', 'success');
            });
        }

        if (DOM.savingsForm) {
            DOM.savingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('goal-name').value.trim();
                const target = parseFloat(document.getElementById('goal-target').value);

                // SEGURIDAD: Validación de metas
                if (name.length === 0 || name.length > 100) {
                    mostrarToast('El nombre de la meta debe tener entre 1 y 100 caracteres.', 'danger');
                    return;
                }
                
                if (isNaN(target) || target <= 0) {
                    mostrarToast('El monto objetivo debe ser un número positivo.', 'danger');
                    return;
                }
                
                if (target > 1000000) {
                    mostrarToast('El monto objetivo es demasiado grande.', 'danger');
                    return;
                }

                const nuevaMeta = { id: Date.now(), nombre: name, objetivo: target, ahorrado: 0 };
                let metas = StorageService.get(CONFIG.keys.metas);
                metas.push(nuevaMeta);
                StorageService.set(CONFIG.keys.metas, metas);

                DOM.savingsForm.reset();
                renderizarCochinitoMetas();
                renderizarHistorial(); 
                mostrarToast(`Meta "${name}" creada con éxito.`, 'success');
            });
        }

        if (DOM.budgetForm) {
            DOM.budgetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const cat = document.getElementById('budget-category').value;
                const limit = parseFloat(document.getElementById('budget-limit').value);
                
                // SEGURIDAD: Validación de presupuesto
                if (isNaN(limit) || limit <= 0) {
                    mostrarToast('El límite debe ser un número positivo.', 'danger');
                    return;
                }
                
                if (limit > 1000000) {
                    mostrarToast('El límite es demasiado grande.', 'danger');
                    return;
                }
                
                let limites = StorageService.getObj(CONFIG.keys.limites);
                limites[cat] = limit;
                StorageService.set(CONFIG.keys.limites, limites);
                
                DOM.budgetForm.reset();
                renderizarHistorial();
                mostrarToast(`Límite de presupuesto asignado a ${cat}.`, 'success');
            });
        }
    }

    // ==========================================
    // 9. ESCUCHADORES DE FILTROS CRONOLÓGICOS
    // ==========================================
    function inicializarFiltros() {
        DOM.filters.forEach(boton => {
            boton.addEventListener('click', (e) => {
                DOM.filters.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                filtroActual = e.currentTarget.getAttribute('data-filter');
                renderizarHistorial();
            });
        });
    }

    // ==========================================
    // 10. NUEVO: SISTEMA DE RESPALDO DE SEGURIDAD (LOCAL)
    // ==========================================
    function inicializarSistemaSeguridad() {
        if (DOM.btnExportar) {
            DOM.btnExportar.addEventListener('click', () => {
                const copiaData = {
                    transacciones: StorageService.get(CONFIG.keys.transacciones),
                    metas: StorageService.get(CONFIG.keys.metas),
                    limites: StorageService.getObj(CONFIG.keys.limites)
                };

                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(copiaData));
                const downloadAnchor = document.createElement('a');
                
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `TommyFinance_Backup_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`);
                document.body.appendChild(downloadAnchor);
                
                downloadAnchor.click();
                downloadAnchor.remove();
                mostrarToast('Copia de seguridad descargada.', 'success');
            });
        }

        if (DOM.inputImportar) {
            DOM.inputImportar.addEventListener('change', (e) => {
                const archivo = e.target.files[0];
                if (!archivo) return;

                // SEGURIDAD: Validar tipo y tamaño de archivo
                const maxTamaño = 5 * 1024 * 1024; // 5MB
                if (archivo.size > maxTamaño) {
                    mostrarToast('El archivo es demasiado grande (máx 5MB).', 'danger');
                    return;
                }
                
                if (!archivo.name.endsWith('.json')) {
                    mostrarToast('Por favor selecciona un archivo .json válido.', 'danger');
                    return;
                }

                const lector = new FileReader();
                lector.onload = function(event) {
                    try {
                        const dataRestaurada = JSON.parse(event.target.result);
                        
                        if (dataRestaurada.transacciones && Array.isArray(dataRestaurada.transacciones) &&
                            dataRestaurada.metas && Array.isArray(dataRestaurada.metas) &&
                            dataRestaurada.limites && typeof dataRestaurada.limites === 'object') {
                            
                            if (confirmarAccion('¿Estás seguro de restaurar este respaldo? Reemplazará todos los datos actuales de la aplicación.')) {
                                StorageService.set(CONFIG.keys.transacciones, dataRestaurada.transacciones);
                                StorageService.set(CONFIG.keys.metas, dataRestaurada.metas);
                                localStorage.setItem(CONFIG.keys.limites, JSON.stringify(dataRestaurada.limites));
                                mostrarToast('Respaldo restaurado exitosamente.', 'success');
                                
                                setTimeout(() => window.location.reload(), 1000);
                            }
                        } else {
                            mostrarToast('El archivo seleccionado no es un respaldo válido de TommyFinance.', 'danger');
                        }
                    } catch (err) {
                        mostrarToast('Error al procesar el archivo de respaldo.', 'danger');
                    }
                };
                lector.readAsText(archivo);
            });
        }
    }

    // ==========================================
    // 11. ARRANQUE DEL SISTEMA
    // ==========================================
    function init() {
        inicializarTabs();
        inicializarFormularios();
        inicializarFiltros();
        inicializarSistemaSeguridad(); // Activado de forma nativa
        
        // Primer renderizado completo
        renderizarHistorial();
        renderizarCochinitoMetas();
    }

    init();
});