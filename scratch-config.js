const fs = require('fs');
let content = fs.readFileSync('ui.js', 'utf8');

const replacement = `  function renderConfig(vm) {
    const game = vm.game;
    if (!game) {
      return renderHome(vm);
    }

    const maxPlayers = game.maxPlayers || 4;
    const minPlayers = game.minPlayers || 1;
    const isFixedPlayers = minPlayers === maxPlayers;

    const playersRow = isFixedPlayers
      ? \`
        <div class="flex items-center justify-between">
          <label class="font-label-caps text-xs text-outline uppercase font-bold tracking-widest">Jugadores</label>
          <span class="font-body-md text-primary font-semibold">\${minPlayers} Jugadores (Fijo)</span>
        </div>
      \`
      : \`
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label class="font-label-caps text-xs text-outline uppercase font-bold tracking-widest">Jugadores</label>
            <span class="font-body-md text-primary font-semibold">Multijugador Local</span>
          </div>
          <div class="grid grid-cols-\${Math.min(3, maxPlayers - minPlayers + 1)} gap-4">
            \${Array.from({ length: maxPlayers - minPlayers + 1 }, (_, i) => minPlayers + i).map(count => {
              const isActive = vm.config.playerCount === count;
              return \\\`
                <button 
                  class="font-bold py-4 rounded-xl border flex flex-col items-center gap-1 transition-all active:scale-95 \${isActive ? 'bg-primary-container text-on-primary-container border-primary/20 shadow-sm' : 'bg-surface-container text-on-surface-variant border-outline-variant/50 hover:bg-surface-container-high'}"
                  data-action="select-player-count" 
                  data-player-count="\${count}"
                >
                  <span class="material-symbols-outlined">\${count === 1 ? 'person' : count === 2 ? 'group' : 'groups'}</span>
                  \${count} Jug.
                </button>
              \\\`;
            }).join("")}
          </div>
        </div>
      \`;

    const namesFields = Array.from({ length: vm.config.playerCount }, (_, index) => {
      const current = vm.config.names[index] || "";
      return \`
        <div class="flex flex-col gap-2">
          <label class="text-xs font-bold text-outline uppercase tracking-wider">Jugador \${index + 1}</label>
          <input
            class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-body-md text-on-surface shadow-sm"
            type="text"
            maxlength="14"
            value="\${escapeHtml(current)}"
            data-field="player-name"
            data-index="\${index}"
            placeholder="Nombre..."
          />
        </div>
      \`;
    }).join("");

    const namesBlock = game.hidePlayerNames
      ? ""
      : \`
        <div class="space-y-4 pt-6 mt-6 border-t border-outline-variant/20">
          <label class="font-label-caps text-xs text-outline uppercase font-bold tracking-widest">Nombres</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            \${namesFields}
          </div>
        </div>
      \`;

    return \`
      <!-- TopAppBar -->
      <header class="bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16">
        <div class="flex items-center gap-4">
          <button class="material-symbols-outlined text-slate-500 hover:bg-slate-50 transition-colors rounded-full p-2 active:scale-95 duration-200" data-action="go-home">arrow_back</button>
          <span class="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans'] tracking-tight">Configurar</span>
        </div>
      </header>

      <main class="pt-24 pb-12 px-6 flex flex-col items-center min-h-screen">
        <div class="max-w-md w-full">
          <!-- Hero Header Section -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center p-4 bg-primary-container rounded-2xl mb-4 shadow-inner">
              <div class="scale-150 text-on-primary-container">\${renderHomeGameGlyph(game.id)}</div>
            </div>
            <h1 class="text-3xl font-bold text-on-surface mb-2 font-['Plus_Jakarta_Sans']">\${escapeHtml(game.name)}</h1>
            <p class="text-on-surface-variant font-body-md">\${escapeHtml(game.tagline || "Partida local")}</p>
          </div>

          <!-- Configuration Container -->
          <div class="bg-white border border-outline-variant/30 rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.04)] p-6 md:p-8 space-y-6">
            \${playersRow}
            \${namesBlock}

            <!-- Action Button -->
            <div class="pt-6 mt-6 border-t border-outline-variant/20">
              <button class="w-full bg-primary hover:bg-primary/90 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3" data-action="start-game">
                Iniciar Partida
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">play_circle</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    \`;
  }`;

content = content.replace(/  function renderConfig\(vm\) \{[\s\S]*?    `;\n  \}/, replacement);
fs.writeFileSync('ui.js', content, 'utf8');
