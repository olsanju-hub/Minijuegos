const fs = require('fs');
let content = fs.readFileSync('ui.js', 'utf8');

const replacement = `  function renderGame(vm) {
    const session = vm.session;
    const game = vm.game;
    if (!session || !game) {
      return renderHome(vm);
    }

    const boardUiState = buildBoardUiState(vm);
    const topbarSubtitle = buildGameTopbarSubtitle(vm);

    return \`
      <!-- Top App Bar -->
      <header class="bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-6 h-16">
        <div class="flex items-center gap-2 md:gap-4">
          <button class="material-symbols-outlined text-slate-500 hover:bg-slate-50 transition-colors rounded-full p-2 active:scale-95 duration-200" data-action="game-back">arrow_back</button>
          <span class="text-lg md:text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans'] tracking-tight truncate max-w-[120px] md:max-w-none">\${escapeHtml(game.name)}</span>
        </div>
        
        <!-- Turn Indicator -->
        \${topbarSubtitle ? \\\`
        <div class="flex items-center bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant/50 max-w-[150px] md:max-w-none">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span class="font-bold text-[10px] md:text-xs uppercase tracking-wider text-on-surface-variant truncate">\${escapeHtml(topbarSubtitle)}</span>
          </div>
        </div>
        \\\` : ''}

        <div class="flex items-center gap-1 md:gap-2">
          <button class="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-all active:scale-95" data-action="restart-game" aria-label="Reiniciar">
            <span class="material-symbols-outlined text-xl md:text-2xl">refresh</span>
          </button>
          <button class="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-all active:scale-95" data-action="open-rules" aria-label="Reglas">
            <span class="material-symbols-outlined text-xl md:text-2xl">help_outline</span>
          </button>
        </div>
      </header>

      <!-- Main Game Area (Theater Mode) -->
      <main class="relative h-[calc(100vh-64px)] mt-16 w-full flex flex-col items-center justify-center p-2 md:p-6 bg-surface-container-low overflow-hidden">
        <div class="relative w-full max-w-[1200px] h-full max-h-[800px] bg-white rounded-2xl shadow-xl border border-outline-variant/30 flex items-center justify-center overflow-hidden">
          <div class="absolute inset-0 pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px; opacity: 0.03;"></div>
          <section class="board-wrap z-10 w-full h-full flex items-center justify-center">
            \${game.renderBoard({
              state: session.state,
              players: session.players,
              options: session.options,
              canAct: vm.canAct,
              uiState: boardUiState
            })}
          </section>
        </div>
      </main>
    \`;
  }`;

content = content.replace(/  function renderGame\(vm\) \{[\s\S]*?    `;\n  \}/, replacement);
fs.writeFileSync('ui.js', content, 'utf8');
