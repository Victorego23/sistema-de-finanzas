// Arreglos Globales cargados de LocalStorage
let operaciones = JSON.parse(localStorage.getItem('tommy_operaciones')) || [];
let limites = JSON.parse(localStorage.getItem('tommy_limites')) || {};
let prestamos = JSON.parse(localStorage.getItem('tommy_prestamos')) || [];

// Categorías por tipo de operación
const categoriasData = {
    ingreso: [
        { value: 'Trabajo', label: '💼 Trabajo Mensual / Freelance' },
        { value: 'Otros', label: '💸 Otros Ingresos / Entradas' }
    ],
    gasto: [
        { value: 'Alimentación', label: '🍔 Alimentación / Restaurantes' },
        { value: 'Servicios', label: '💡 Servicios (Luz, Internet, Celular)' },
        { value: 'Entretenimiento', label: '🎬 Entretenimiento / Ocio' },
        { value: 'Trabajo', label: '💼 Gastos de Trabajo / Logística' }
    ]
};

// Cambiar dinámicamente las categorías en el formulario
function actualizarCategorias() {
    const tipo = document.getElementById('op-tipo').value;
    const selectCat = document.getElementById('op-categoria');
    selectCat.innerHTML = '';

    categoriasData[tipo].forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.value;
        opt.textContent = cat.label;
        selectCat.appendChild(opt);
    });
}

// Cambiar de pestaña
function cambiarPestaña(pestana) {
    document.getElementById('pestaña-registrar').style.display = 'none';
    document.getElementById('pestaña-cuentas').style.display = 'none';
    document.getElementById('pestaña-deudas').style.display = 'none';

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    if (pestana === 'registrar') {
        document.getElementById('pestaña-registrar').style.display = 'block';
    } else if (pestana === 'cuentas') {
        document.getElementById('pestaña-cuentas').style.display = 'block';
        renderizarHistorial('todos');
        renderizarDistribucion();
    } else if (pestana === 'deudas') {
        document.getElementById('pestaña-deudas').style.display = 'block';
        actualizarModuloDeudas();
    }
    
    if(event) {
        event.currentTarget.classList.add('active');
    }
}

// Calcular balances generales matemáticos
function calcularGlobales() {
    let ingresos = 0;
    let gastos = 0;

    operaciones.forEach(op => {
        if (op.tipo === 'ingreso') ingresos += op.monto;
        if (op.tipo === 'gasto') gastos += op.monto;
    });

    const balanceNeto = ingresos - gastos;

    // Inyectar en el HTML
    const txtBalance = document.getElementById('txt-balance-neto');
    txtBalance.textContent = `S/ ${balanceNeto.toFixed(2)}`;
    txtBalance.style.color = balanceNeto >= 0 ? '#2ed573' : '#ff4757';

    document.getElementById('txt-total-ingresos').textContent = `S/ ${ingresos.toFixed(2)}`;
    document.getElementById('txt-total-gastos').textContent = `S/ ${gastos.toFixed(2)}`;
}

// Registrar operación normal (Ingreso o Gasto común)
function registrarOperacion(e) {
    e.preventDefault();

    const monto = parseFloat(document.getElementById('op-monto').value);
    const tipo = document.getElementById('op-tipo').value;
    const categoria = document.getElementById('op-categoria').value;
    const metodo = document.getElementById('op-metodo').value;
    const concepto = document.getElementById('op-concepto').value;

    const nuevaOp = {
        id: 'op_' + Date.now(),
        monto,
        tipo,
        categoria,
        metodo,
        concepto,
        fecha: new Date().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
    };

    operaciones.push(nuevaOp);
    localStorage.setItem('tommy_operaciones', JSON.stringify(operaciones));

    document.getElementById('form-operacion').reset();
    actualizarCategorias();
    calcularGlobales();
    verificarLimitesAlerta(categoria);
}

// Establecer un límite de presupuesto
function establecerLimite(e) {
    e.preventDefault();
    const cat = document.getElementById('limite-categoria').value;
    const monto = parseFloat(document.getElementById('limite-monto').value);

    limites[cat] = monto;
    localStorage.setItem('tommy_limites', JSON.stringify(limites));

    document.getElementById('form-limite').reset();
    renderizarLimitesUI();
}

function renderizarLimitesUI() {
    const container = document.getElementById('lista-limites');
    container.innerHTML = '';
    
    for (let cat in limites) {
        const div = document.createElement('div');
        div.className = 'limite-alerta';
        div.style.borderColor = '#ffa502';
        div.style.color = '#ffa502';
        div.innerHTML = `🎯 Límite para <strong>${cat}</strong>: S/ ${limites[cat].toFixed(2)}`;
        container.appendChild(div);
    }
}

function verificarLimitesAlerta(categoria) {
    if (!limites[categoria]) return;

    let totalGastado = 0;
    operaciones.forEach(op => {
        if(op.tipo === 'gasto' && op.categoria === categoria) totalGastado += op.monto;
    });

    if (totalGastado > limites[categoria]) {
        alert(`⚠️ ¡ALERTA DE CONTROL! Has superado el límite establecido para la categoría ${categoria}. Gastado: S/ ${totalGastado.toFixed(2)} de S/ ${limites[categoria].toFixed(2)}.`);
    }
}

// Eliminar un movimiento individual del historial
function eliminarMovimiento(id) {
    operaciones = operaciones.filter(op => op.id !== id);
    localStorage.setItem('tommy_operaciones', JSON.stringify(operaciones));
    calcularGlobales();
    renderizarHistorial('todos');
    renderizarDistribucion();
}

// Renderizar el historial con filtros de control
function renderizarHistorial(filtro) {
    const lista = document.getElementById('historial-lista');
    lista.innerHTML = '';

    const filtrados = operaciones.filter(op => {
        if (filtro === 'todos') return true;
        return op.tipo === filtro;
    });

    if(filtrados.length === 0) {
        lista.innerHTML = '<p style="color: var(--color-muted); text-align:center; padding: 10px;">No hay movimientos registrados.</p>';
        return;
    }

    // Clonar y revertir para mostrar los más recientes primero
    [...filtrados].reverse().forEach(op => {
        const card = document.createElement('div');
        card.className = 'movimiento-card';
        card.innerHTML = `
            <div class="mov-meta">
                <h5>${op.concepto}</h5>
                <p>${op.categoria} • 🏦 ${op.metodo} • 📅 ${op.fecha}</p>
            </div>
            <div class="mov-monto-box">
                <span class="mov-monto" style="color: ${op.tipo === 'ingreso' ? '#2ed573' : '#ff4757'}">
                    ${op.tipo === 'ingreso' ? '+' : '-'} S/ ${op.monto.toFixed(2)}
                </span>
                <button class="btn-delete" onclick="eliminarMovimiento('${op.id}')">✕</button>
            </div>
        `;
        lista.appendChild(card);
    });
}

function filtrarMovimientos(tipo, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderizarHistorial(tipo);
}

// Distribución de barras de gastos matemáticas
function renderizarDistribucion() {
    const contenedor = document.getElementById('distribucion-barras');
    contenedor.innerHTML = '';

    let totalGastos = 0;
    let totalesPorCategoria = { Alimentación: 0, Servicios: 0, Entretenimiento: 0, Trabajo: 0 };

    operaciones.forEach(op => {
        if (op.tipo === 'gasto') {
            totalGastos += op.monto;
            if (totalesPorCategoria[op.categoria] !== undefined) {
                totalesPorCategoria[op.categoria] += op.monto;
            }
        }
    });

    for (let cat in totalesPorCategoria) {
        const gastado = totalesPorCategoria[cat];
        const porcentaje = totalGastos > 0 ? ((gastado / totalGastos) * 100).toFixed(1) : 0;

        const barraHTML = document.createElement('div');
        barraHTML.className = 'barra-progreso';
        barraHTML.innerHTML = `
            <div class="barra-labels">
                <span>${cat}</span>
                <span>S/ ${gastado.toFixed(2)} (${porcentaje}%)</span>
            </div>
            <div class="barra-fondo">
                <div class="barra-relleno" style="width: ${porcentaje}%; background-color: ${cat === 'Trabajo' ? '#9b5de5' : '#00d2d3'}"></div>
            </div>
        `;
        contenedor.appendChild(barraHTML);
    }
}

// ==========================================
// SECCIÓN NUEVA: LÓGICA DE CONTROL DE DEUDAS
// ==========================================

function crearPrestamo(e) {
    e.preventDefault();
    const nombre = document.getElementById('deuda-nombre').value;
    const total = parseFloat(document.getElementById('deuda-total').value);

    const nuevoPrestamo = {
        id: 'prestamo_' + Date.now(),
        nombre,
        montoTotal: total,
        montoPagado: 0
    };

    prestamos.push(nuevoPrestamo);
    localStorage.setItem('tommy_prestamos', JSON.stringify(prestamos));

    document.getElementById('form-nuevo-prestamo').reset();
    actualizarModuloDeudas();
}

function abonarPrestamo(e) {
    e.preventDefault();
    const idPrestamo = document.getElementById('select-deuda-activa').value;
    const montoAbono = parseFloat(document.getElementById('abono-monto').value);
    const metodo = document.getElementById('abono-metodo').value;

    if (!idPrestamo) return;

    const prestamo = prestamos.find(p => p.id === idPrestamo);
    if (prestamo) {
        prestamo.montoPagado += montoAbono;
        if (prestamo.montoPagado > prestamo.montoTotal) prestamo.montoPagado = prestamo.montoTotal;

        localStorage.setItem('tommy_prestamos', JSON.stringify(prestamos));

        // Insertar automáticamente la cuota mensual en el historial como una SALIDA DEL MES
        const operacionAbono = {
            id: 'op_' + Date.now(),
            monto: montoAbono,
            tipo: 'gasto',
            categoria: 'Trabajo',
            metodo,
            concepto: `Abono mensual a: ${prestamo.nombre}`,
            fecha: new Date().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
        };

        operaciones.push(operacionAbono);
        localStorage.setItem('tommy_operaciones', JSON.stringify(operaciones));
        calcularGlobales();
    }

    document.getElementById('form-abonar-prestamo').reset();
    actualizarModuloDeudas();
}

function actualizarModuloDeudas() {
    const select = document.getElementById('select-deuda-activa');
    const lista = document.getElementById('lista-prestamos-progreso');

    select.innerHTML = '<option value="">-- Selecciona una deuda --</option>';
    lista.innerHTML = '';

    if (prestamos.length === 0) {
        lista.innerHTML = '<p style="color: var(--color-muted); text-align: center;">No tienes préstamos registrados. ¡Estás al día!</p>';
        return;
    }

    prestamos.forEach(p => {
        const restante = p.montoTotal - p.montoPagado;
        const porcentaje = ((p.montoPagado / p.montoTotal) * 100).toFixed(1);

        if (restante > 0) {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.nombre} (Resta: S/ ${restante.toFixed(2)})`;
            select.appendChild(option);
        }

        const item = document.createElement('div');
        item.className = 'deuda-item';
        if (restante === 0) item.style.borderLeftColor = 'var(--neon-green)';

        item.innerHTML = `
            <div class="deuda-info">
                <strong>📌 ${p.nombre}</strong>
                <span style="color: ${restante === 0 ? 'var(--neon-green)' : 'var(--neon-red)'}">
                    ${restante === 0 ? '✅ ¡DEUDA SALDADA!' : `Resta: S/ ${restante.toFixed(2)}`}
                </span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${porcentaje}%"></div>
            </div>
            <div class="deuda-totales">
                <span>Progreso: ${porcentaje}%</span>
                <span>Pagado: S/ ${p.montoPagado.toFixed(2)} de S/ ${p.montoTotal.toFixed(2)}</span>
            </div>
        `;
        lista.appendChild(item);
    });
}

// Copias de Seguridad (Exportar / Importar)
function exportarDatos() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({operaciones, limites, prestamos}));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "TommyFinance_Respaldo.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importarDatos(e) {
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
        try {
            const parsed = JSON.parse(event.target.result);
            if (parsed.operaciones) {
                operaciones = parsed.operaciones;
                limites = parsed.limites || {};
                prestamos = parsed.prestamos || [];
                
                localStorage.setItem('tommy_operaciones', JSON.stringify(operaciones));
                localStorage.setItem('tommy_limites', JSON.stringify(limites));
                localStorage.setItem('tommy_prestamos', JSON.stringify(prestamos));
                
                calcularGlobales();
                renderizarLimitesUI();
                alert("¡Copia de seguridad restaurada de forma exitosa!");
                cambiarPestaña('registrar');
            }
        } catch (err) {
            alert("Error: El archivo de respaldo no es válido.");
        }
    };
    fileReader.readAsText(e.target.files[0]);
}

// Carga Inicial del Sistema
document.addEventListener('DOMContentLoaded', () => {
    actualizarCategorias();
    calcularGlobales();
    renderizarLimitesUI();
});