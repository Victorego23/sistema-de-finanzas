// Carga inicial segura de datos
let operaciones = JSON.parse(localStorage.getItem('tommy_operaciones')) || [];
let limites = JSON.parse(localStorage.getItem('tommy_limites')) || {};
let prestamos = JSON.parse(localStorage.getItem('tommy_prestamos')) || [];

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

function actualizarCategorias() {
    const tipo = document.getElementById('op-tipo').value;
    const selectCat = document.getElementById('op-categoria');
    if(!selectCat) return;
    selectCat.innerHTML = '';

    categoriasData[tipo].forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.value;
        opt.textContent = cat.label;
        selectCat.appendChild(opt);
    });
}

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
    if(event && event.currentTarget) event.currentTarget.classList.add('active');
}

// NUEVO: Cálculo matemático avanzado desglosado por Banco y Yape
function calcularGlobales() {
    let saldoYape = 0;
    let saldoBanco = 0;
    let saldoEfectivo = 0;

    operaciones.forEach(op => {
        const monto = op.monto;
        if (op.tipo === 'ingreso') {
            if (op.metodo === 'Yape/Plin') saldoYape += monto;
            if (op.metodo === 'Tarjeta de Débito') saldoBanco += monto;
            if (op.metodo === 'Efectivo') saldoEfectivo += monto;
        } else { // es gasto / salida
            if (op.metodo === 'Yape/Plin') saldoYape -= monto;
            if (op.metodo === 'Tarjeta de Débito') saldoBanco -= monto;
            if (op.metodo === 'Efectivo') saldoEfectivo -= monto;
        }
    });

    const balanceTotal = saldoYape + saldoBanco + saldoEfectivo;

    // Renderizar tarjetas superiores
    const txtNeto = document.getElementById('txt-balance-neto');
    txtNeto.textContent = `S/ ${balanceTotal.toFixed(2)}`;
    txtNeto.style.color = balanceTotal >= 0 ? '#2ed573' : '#ff4757';

    document.getElementById('saldo-yape').textContent = `S/ ${saldoYape.toFixed(2)}`;
    document.getElementById('saldo-banco').textContent = `S/ ${saldoBanco.toFixed(2)}`;
    document.getElementById('saldo-efectivo').textContent = `S/ ${saldoEfectivo.toFixed(2)}`;
}

// NUEVO: Intercepta el ingreso de trabajo y calcula deudas asociadas en tiempo real
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

    // LÓGICA DE DETECCIÓN INTELIGENTE DE CUOTAS
    if (tipo === 'ingreso' && categoria === 'Trabajo') {
        procesarDescuentoAutomaticoPrestamos(monto, metodo);
    }

    document.getElementById('form-operacion').reset();
    actualizarCategorias();
    calcularGlobales();
    verificarLimitesAlerta(categoria);
}

// NUEVO: Descuenta automáticamente la cuota fija del banco al entrar tu dinero
function procesarDescuentoAutomaticoPrestamos(ingresoMonto, metodoPago) {
    let cuotasCobradas = 0;
    let mensajeDetalle = "";

    prestamos.forEach(p => {
        const restante = p.montoTotal - p.montoPagado;
        if (restante > 0 && p.cuotaFija > 0) {
            let montoADescontar = p.cuotaFija;
            if (montoADescontar > restante) montoADescontar = restante;

            p.montoPagado += montoADescontar;
            cuotasCobradas += montoADescontar;

            // Inyectar la salida de forma automática
            const autoGasto = {
                id: 'op_auto_' + Date.now() + Math.random(),
                monto: montoADescontar,
                tipo: 'gasto',
                categoria: 'Trabajo',
                metodo: metodoPago, // Sale de la misma cuenta donde entró
                concepto: `🤖 Débito Auto: Cuota de ${p.nombre}`,
                fecha: new Date().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
            };
            operaciones.push(autoGasto);
            mensajeDetalle += `<br>• S/ ${montoADescontar.toFixed(2)} transferidos a: ${p.nombre}`;
        }
    });

    if (cuotasCobradas > 0) {
        localStorage.setItem('tommy_prestamos', JSON.stringify(prestamos));
        localStorage.setItem('tommy_operaciones', JSON.stringify(operaciones));

        // Mostrar alerta visual en la UI
        const cajaAlerta = document.getElementById('alerta-automatica-cuota');
        cajaAlerta.style.display = 'block';
        cajaAlerta.innerHTML = `<strong>🤖 Asistente Financiero:</strong> Se detectó tu ingreso de Trabajo. Sistema cobró automáticamente tus deudas pendientes bancarias: ${mensajeDetalle}`;
        
        // Desaparecer alerta en 10 segundos
        setTimeout(() => { cajaAlerta.style.display = 'none'; }, 10000);
    }
}

// Gestión del Módulo de Préstamos
function crearPrestamo(e) {
    e.preventDefault();
    const nombre = document.getElementById('deuda-nombre').value;
    const total = parseFloat(document.getElementById('deuda-total').value);
    const cuota = parseFloat(document.getElementById('deuda-cuota').value);

    const nuevoPrestamo = {
        id: 'prestamo_' + Date.now(),
        nombre,
        montoTotal: total,
        montoPagado: 0,
        cuotaFija: cuota
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

        const operacionAbono = {
            id: 'op_' + Date.now(),
            monto: montoAbono,
            tipo: 'gasto',
            categoria: 'Trabajo',
            metodo,
            concepto: `Abono manual a: ${prestamo.nombre}`,
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
    if(!select || !lista) return;

    select.innerHTML = '<option value="">-- Selecciona una deuda --</option>';
    lista.innerHTML = '';

    if (prestamos.length === 0) {
        lista.innerHTML = '<p style="color: var(--color-muted); text-align: center;">No tienes préstamos vinculados con bancos.</p>';
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
                    ${restante === 0 ? '✅ ¡PAGADO!' : `Resta: S/ ${restante.toFixed(2)}`}
                </span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${porcentaje}%"></div>
            </div>
            <div class="deuda-totales">
                <span>Progreso: ${porcentaje}% (Cuota: S/ ${p.cuotaFija.toFixed(2)}/mes)</span>
                <span>S/ ${p.montoPagado.toFixed(2)} de S/ ${p.montoTotal.toFixed(2)}</span>
            </div>
        `;
        lista.appendChild(item);
    });
}

// Configuración de límites y reportes heredados
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
    if(!container) return;
    container.innerHTML = '';
    for (let cat in limites) {
        const div = document.createElement('div');
        div.className = 'limite-alerta';
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
        alert(`⚠️ Has superado tu límite mensual en ${categoria}!`);
    }
}

function eliminarMovimiento(id) {
    operaciones = operaciones.filter(op => op.id !== id);
    localStorage.setItem('tommy_operaciones', JSON.stringify(operaciones));
    calcularGlobales();
    renderizarHistorial('todos');
    renderizarDistribucion();
}

function renderizarHistorial(filtro) {
    const lista = document.getElementById('historial-lista');
    if(!lista) return;
    lista.innerHTML = '';

    const filtrados = operaciones.filter(op => {
        if (filtro === 'todos') return true;
        return op.tipo === filtro;
    });

    if(filtrados.length === 0) {
        lista.innerHTML = '<p style="color: var(--color-muted); text-align:center; padding: 10px;">Sin movimientos.</p>';
        return;
    }

    [...filtrados].reverse().forEach(op => {
        const card = document.createElement('div');
        card.className = 'movimiento-card';
        card.innerHTML = `
            <div class="mov-meta">
                <h5>${op.concepto}</h5>
                <p>${op.categoria} • ${op.metodo} • 📅 ${op.fecha}</p>
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

function renderizarDistribucion() {
    const contenedor = document.getElementById('distribucion-barras');
    if(!contenedor) return;
    contenedor.innerHTML = '';
    let totalGastos = 0;
    let totalesPorCategoria = { Alimentación: 0, Servicios: 0, Entertainment: 0, Trabajo: 0 };

    operaciones.forEach(op => {
        if (op.tipo === 'gasto') {
            totalGastos += op.monto;
            if (totalesPorCategoria[op.categoria] !== undefined) totalesPorCategoria[op.categoria] += op.monto;
        }
    });

    for (let cat in totalesPorCategoria) {
        const gastado = totalesPorCategoria[cat];
        const porcentaje = totalGastos > 0 ? ((gastado / totalGastos) * 100).toFixed(1) : 0;
        const barraHTML = document.createElement('div');
        barraHTML.className = 'barra-progreso';
        barraHTML.innerHTML = `
            <div class="barra-labels"><span>${cat}</span><span>S/ ${gastado.toFixed(2)} (${porcentaje}%)</span></div>
            <div class="barra-fondo"><div class="barra-relleno" style="width: ${porcentaje}%;"></div></div>
        `;
        contenedor.appendChild(barraHTML);
    }
}

function exportarDatos() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({operaciones, limites, prestamos}));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "TommyFinance_Bancos_Respaldo.json");
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
                alert("¡Datos sincronizados!");
                cambiarPestaña('registrar');
            }
        } catch (err) { alert("Archivo inválido."); }
    };
    fileReader.readAsText(e.target.files[0]);
}

document.addEventListener('DOMContentLoaded', () => {
    actualizarCategorias();
    calcularGlobales();
    renderizarLimitesUI();
});