document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a los elementos del DOM ---
    const amountInput = document.getElementById('amount-input');
    const inputLabel = document.getElementById('input-label');
    const modeSwitcher = document.querySelector('.mode-switcher');
    
    const netResultEl = document.getElementById('net-result');
    const ivaResultEl = document.getElementById('iva-result');
    const totalResultEl = document.getElementById('total-result');

    // Tasa de IVA (19% en Chile)
    const IVA_RATE = 0.19;
    
    // --- LÓGICA DE CÁLCULO PRINCIPAL ---
    function calculateAndDisplay() {
        // 1. Obtener el modo actual y el valor del input
        const currentMode = document.querySelector('input[name="mode"]:checked').value;
        const rawValue = amountInput.value.replace(/\./g, '').replace(/,/g, '.'); // Limpiar separadores
        const amount = parseFloat(rawValue) || 0;

        // 2. Declarar variables para los resultados
        let net = 0;
        let iva = 0;
        let total = 0;

        // 3. Calcular según el modo seleccionado
        if (currentMode === 'from-total') {
            total = amount;
            net = total / (1 + IVA_RATE);
            iva = total - net;
        } else { // from-net
            net = amount;
            iva = net * IVA_RATE;
            total = net + iva;
        }

        // 4. Mostrar los resultados formateados
        const clpFormatter = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0
        });

        netResultEl.textContent = clpFormatter.format(net);
        ivaResultEl.textContent = clpFormatter.format(iva);
        totalResultEl.textContent = clpFormatter.format(total);

        // 5. Guardar los valores numéricos para poder copiarlos
        netResultEl.parentElement.dataset.value = net;
        ivaResultEl.parentElement.dataset.value = iva;
        totalResultEl.parentElement.dataset.value = total;
    }

    // --- FUNCIÓN PARA FORMATEAR EL INPUT MIENTRAS SE ESCRIBE ---
    function formatInput(e) {
        let rawValue = e.target.value.replace(/\./g, ''); // Quitamos los puntos existentes
        if (!isNaN(rawValue) && rawValue !== '') {
            let formattedValue = new Intl.NumberFormat('es-CL').format(rawValue);
            e.target.value = formattedValue;
        } else {
            e.target.value = '';
        }
        calculateAndDisplay();
    }

    // --- FUNCIÓN PARA CAMBIAR EL TEXTO DEL LABEL SEGÚN EL MODO ---
    function updateLabel() {
        const currentMode = document.querySelector('input[name="mode"]:checked').value;
        if (currentMode === 'from-total') {
            inputLabel.textContent = 'Monto Total (con IVA)';
        } else {
            inputLabel.textContent = 'Monto Neto (sin IVA)';
        }
        calculateAndDisplay();
    }
    
    // --- LÓGICA PARA COPIAR AL PORTAPAPELES ---
    document.querySelectorAll('.result-item').forEach(item => {
        item.addEventListener('click', () => {
            const valueToCopy = parseFloat(item.dataset.value || '0');
            const numberToCopy = Math.round(valueToCopy).toString(); // Copiamos el número entero
            
            navigator.clipboard.writeText(numberToCopy).then(() => {
                const pElement = item.querySelector('p');
                const originalText = pElement.textContent;
                pElement.textContent = 'Copiado!';
                pElement.style.color = '#34d399'; // Verde para confirmación

                setTimeout(() => {
                    pElement.textContent = originalText;
                    pElement.style.color = ''; // Volver al color original
                }, 1200);
            }).catch(err => {
                console.error('Error al copiar:', err);
            });
        });
    });

    // --- EVENT LISTENERS ---
    amountInput.addEventListener('input', formatInput);
    modeSwitcher.addEventListener('change', updateLabel);

    // --- INICIALIZACIÓN ---
    updateLabel(); // Llamar una vez para establecer el estado inicial
});

