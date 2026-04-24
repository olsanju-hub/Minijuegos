const fs = require('fs');
let content = fs.readFileSync('ui.js', 'utf8');

const replacement = `  function renderHome(vm) {
    const baseGames = Array.isArray(vm.games) ? vm.games : [];
    if (baseGames.length === 0) {
      return \`
        <div class="min-h-screen flex items-center justify-center bg-background">
          <p class="text-on-surface-variant font-body-md">No hay juegos disponibles por ahora.</p>
        </div>
      \`;
    }
    const games = getHomeCatalog(vm);

    function profileForGame(game) {
      const map = {
        tictactoe: { tag: "Logica", color: "from-blue-500 to-blue-600" },
        connect4: { tag: "Estrategia", color: "from-orange-400 to-orange-500" },
        damas: { tag: "Tablero", color: "from-rose-400 to-rose-500" },
        parchis: { tag: "Familiar", color: "from-green-400 to-green-500" },
        "escaleras-serpientes": { tag: "Suerte", color: "from-emerald-400 to-emerald-500" },
        trafico: { tag: "Puzzle", color: "from-sky-400 to-sky-500" },
        buscaminas: { tag: "Logica", color: "from-indigo-400 to-indigo-500" },
        memory: { tag: "Memoria", color: "from-purple-400 to-purple-500" },
        billar: { tag: "Habilidad", color: "from-teal-500 to-teal-600" },
        sokoban: { tag: "Desafio", color: "from-amber-500 to-amber-600" },
        "futbol-turnos": { tag: "Deportes", color: "from-emerald-500 to-emerald-600" },
        tanques: { tag: "Accion", color: "from-red-500 to-red-600" }
      };

      const base = map[game?.id] || { tag: "Juego", color: "from-slate-400 to-slate-500" };
      return base;
    }

    return \`
      <!-- TopAppBar -->
      <header class="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-primary" data-icon="sports_esports" style="font-variation-settings: 'FILL' 1;">sports_esports</span>
          </div>
          <h1 class="text-xl font-extrabold tracking-tighter text-slate-900 font-['Plus_Jakarta_Sans']">Minijuegos</h1>
        </div>
        <button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors active:scale-95 duration-200">
          <span class="material-symbols-outlined text-slate-900" data-icon="help">help</span>
        </button>
      </header>

      <main class="pt-24 pb-32 max-w-[1440px] mx-auto px-6 md:px-12 w-full">
        <!-- Hero Section -->
        <section class="relative overflow-hidden rounded-3xl mb-12 bg-primary-container border border-slate-100 shadow-sm text-on-primary-container">
          <div class="relative z-10 px-8 py-16 md:px-16 md:py-24 max-w-2xl">
            <span class="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-4 uppercase tracking-wider backdrop-blur-md">Coleccion Local</span>
            <h2 class="font-display-lg text-4xl md:text-5xl font-bold mb-6 leading-tight">Redescubre los clasicos</h2>
            <p class="font-body-lg text-lg opacity-90 mb-8 leading-relaxed">
              Una coleccion curada de los juegos que definieron generaciones, ahora reimaginados con una interfaz moderna y enfocada en la jugabilidad.
            </p>
          </div>
        </section>

        <!-- Grid Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="font-headline-md text-2xl font-bold text-on-surface">Catalogo Premium</h3>
            <p class="font-body-md text-on-surface-variant">\${games.length} experiencias listas para jugar</p>
          </div>
        </div>

        <!-- Bento-inspired Game Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          \${games.map((game) => {
            const profile = profileForGame(game);
            return \\\`
              <div class="group bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] hover:shadow-xl transition-all duration-300 border border-slate-100 relative flex flex-col active:scale-95">
                <button
                  class="absolute inset-0 w-full h-full z-10"
                  data-action="open-game"
                  data-game-id="\${game.id}"
                  aria-label="Abrir \${escapeHtml(game.name)}"
                ></button>
                <div class="h-48 relative flex items-center justify-center bg-gradient-to-br \${profile.color}">
                  <div class="scale-150 opacity-90 text-white drop-shadow-xl group-hover:scale-[1.7] transition-transform duration-500">
                    \${renderHomeGameGlyph(game.id)}
                  </div>
                </div>
                <div class="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 class="font-title-lg text-lg font-bold text-on-surface mb-1">\${escapeHtml(game.name)}</h4>
                    <p class="font-caption text-sm text-on-surface-variant line-clamp-2">\${escapeHtml(game.tagline || "Partida local")}</p>
                  </div>
                  <div class="mt-4 flex justify-between items-center">
                    <span class="px-2 py-1 bg-surface-container rounded text-[10px] font-bold text-primary tracking-wider uppercase">\${escapeHtml(profile.tag)}</span>
                    <span class="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" data-icon="play_circle">play_circle</span>
                  </div>
                </div>
              </div>
            \\\`;
          }).join("")}
        </div>
      </main>

      <!-- BottomNavBar -->
      <nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] md:hidden">
        <a class="flex flex-col items-center justify-center text-primary bg-primary/10 rounded-xl px-4 py-1 active:scale-90 transition-all duration-150" href="#">
          <span class="material-symbols-outlined" data-icon="home" style="font-variation-settings: 'FILL' 1;">home</span>
          <span class="font-['Plus_Jakarta_Sans'] text-xs font-medium">Home</span>
        </a>
        <a class="flex flex-col items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all duration-150" href="#">
          <span class="material-symbols-outlined" data-icon="history">history</span>
          <span class="font-['Plus_Jakarta_Sans'] text-xs font-medium">Historial</span>
        </a>
      </nav>
    \`;
  }`;

content = content.replace(/  function renderHome\(vm\) \{[\s\S]*?    `;\n  \}/, replacement);
fs.writeFileSync('ui.js', content, 'utf8');
