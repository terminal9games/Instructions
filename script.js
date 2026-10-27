// --- CONFIGURACIÓN DE SUPABASE ---
const SUPABASE_URL = 'https://ahlxqxoyeourtjzfdmxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHhxeG95ZW91cnRqemZkbXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNjI3NTUsImV4cCI6MjEwODYzODc1NX0.3GVmgce9GpThgcbMMDiKTTAsbL_nKa2tt3D8GEjyBxE';

// Inicializar cliente de Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Guardaremos el ID del jugador actual temporalmente
let currentSessionPlayerId = null;

// Public Countdown Script para index.html
function startPublicCountdown(durationSeconds) {
    let timer = durationSeconds;
    const display = document.getElementById('countdown');
    const overlay = document.getElementById('expired-overlay');

    if (!display) return;

    const interval = setInterval(() => {
        let hours = Math.floor(timer / 3600);
        let minutes = Math.floor((timer % 3600) / 60);
        let seconds = timer % 60;

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = `${hours}:${minutes}:${seconds}`;

        if (--timer < 0) {
            clearInterval(interval);
            display.textContent = "00:00:00";
            if (overlay) overlay.style.display = "flex";
        }
    }, 1000);
}

// --- AUTORIZACIÓN DE JUGADOR (CONECTADO A SUPABASE) ---
async function authorizePlayer() {
    const inputId = document.getElementById('player-id-input').value.trim();
    
    if (!inputId.startsWith("T9-") || inputId.length < 9) {
        alert("Invalid Player ID format. Access denied.");
        return;
    }

    // Consultar Supabase para verificar si el jugador existe y su estado
    const { data, error } = await supabaseClient
        .from('players')
        .select('*')
        .eq('player_id', inputId)
        .single();

    if (error || !data) {
        alert("Player ID not found in database. Did you complete registration?");
        return;
    }

    // Si ya está eliminado
    if (data.status === 'eliminated') {
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('fail-overlay').style.display = "flex";
        return;
    }

    // Guardar sesión actual
    currentSessionPlayerId = inputId;

    // Cambiar de pantalla de Login al Juego de Día 1
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');

    startDayOneGame();
}

// --- MECÁNICAS DEL JUEGO (DÍA 1) ---
let gameInterval;
let currentTimeLeft = 60.00;
let gameActive = false;

function startDayOneGame() {
    gameActive = true;
    currentTimeLeft = 60.00;
    const display = document.getElementById('game-timer');

    gameInterval = setInterval(() => {
        currentTimeLeft -= 0.05;
        if (currentTimeLeft <= 0) {
            currentTimeLeft = 0.00;
            clearInterval(gameInterval);
            if (gameActive) triggerFailState(); 
        }
        display.textContent = currentTimeLeft.toFixed(2) + "s";
    }, 50);
}

async function executeTrial() {
    if (!gameActive) return;
    gameActive = false;
    clearInterval(gameInterval);

    // Condición de victoria: Clic entre 07.00s y 07.99s restantes
    if (currentTimeLeft >= 7.00 && currentTimeLeft <= 7.99) {
        // Actualizar base de datos: pasa al Día 2
        await supabaseClient
            .from('players')
            .update({ current_day: 2 })
            .eq('player_id', currentSessionPlayerId);

        document.getElementById('pass-overlay').style.display = "flex";
    } else {
        triggerFailState();
    }
}

async function triggerFailState() {
    gameActive = false;
    clearInterval(gameInterval);

    // Actualizar base de datos: estatus eliminado
    if (currentSessionPlayerId) {
        await supabaseClient
            .from('players')
            .update({ status: 'eliminated' })
            .eq('player_id', currentSessionPlayerId);
    }

    document.getElementById('fail-overlay').style.display = "flex";
}
