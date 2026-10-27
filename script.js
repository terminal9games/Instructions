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

// --- AUTORIZACIÓN DE JUGADOR (CON RAYOS X PARA CELULAR) ---
async function authorizePlayer() {
    const inputId = document.getElementById('player-id-input').value.trim();
    
    if (!inputId.startsWith("T9-") || inputId.length < 9) {
        alert("El ID debe empezar con T9- y ser válido.");
        return;
    }

    alert("Intentando buscar el ID: [" + inputId + "]");

    // Consultar Supabase
    const { data, error } = await supabaseClient
        .from('players')
        .select('*')
        .eq('player_id', inputId);

    if (error) {
        alert("Error de Supabase: " + error.message);
        return;
    }

    alert("Supabase respondió. Registros encontrados: " + (data ? data.length : 0));

    if (!data || data.length === 0) {
        alert("La tabla 'players' no tiene ningún registro con el campo 'player_id' igual a: " + inputId);
        return;
    }

    const player = data[0]; 
    alert("¡Encontrado! Estado actual: " + player.status);

    if (player.status === 'eliminated') {
        document.getElementById('login-container').classList
