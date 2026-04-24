const fs = require('fs');
let content = fs.readFileSync('ui.js', 'utf8');

const replacement = `  function renderRules(vm) {
    const game = vm.game;
    if (!vm.rulesOpen || !game) {
      return "";
    }

    const sections = (game.rules || [])
      .map(
        (rule) => \\\`
          <div class="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 mb-4">
            <h4 class="font-bold text-primary mb-2">\${escapeHtml(rule.title)}</h4>
            <p class="text-on-surface-variant text-sm">\${escapeHtml(rule.text)}</p>
          </div>
        \\\`
      )
      .join("");

    return \`
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" data-overlay="rules">
        <div class="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-[scale-in_0.2s_ease-out]">
          <header class="flex items-center justify-between p-6 border-b border-outline-variant/30 bg-surface-container-lowest">
            <h3 class="text-xl font-bold text-on-surface font-['Plus_Jakarta_Sans']">Reglas del Juego</h3>
            <button class="material-symbols-outlined text-outline hover:bg-surface-container-high rounded-full p-2 transition-colors active:scale-95" data-action="close-rules">close</button>
          </header>
          <div class="p-6 max-h-[60vh] overflow-y-auto">
            \${sections}
          </div>
        </div>
      </div>
    \`;
  }

  function renderResult(vm) {
    const session = vm.session;
    const game = vm.game;

    if (!session || !game || !session.state.gameOver) {
      return "";
    }

    const isDraw = Boolean(session.state.isDraw);
    const winners = session.state.winners || [];
    const winnerNames = winners.map((idx) => session.players[idx].name).join(" y ");

    let title, subtitle;

    if (isDraw) {
      title = "Empate";
      subtitle = "No hay ganador claro esta vez.";
    } else {
      title = \`¡\${escapeHtml(winnerNames)} gana!\`;
      subtitle = "Excelente partida.";
    }

    return \`
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" data-overlay="result">
        <div class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-8 text-center animate-[scale-in_0.3s_ease-out]">
          <div class="w-20 h-20 mx-auto bg-primary-container text-primary rounded-full flex items-center justify-center mb-6 shadow-inner">
            <span class="material-symbols-outlined text-4xl" style="font-variation-settings: 'FILL' 1;">\${isDraw ? 'handshake' : 'emoji_events'}</span>
          </div>
          <h2 class="text-3xl font-bold text-on-surface mb-2 font-['Plus_Jakarta_Sans']">\${title}</h2>
          <p class="text-on-surface-variant font-body-md mb-8">\${subtitle}</p>
          
          <div class="flex flex-col gap-3">
            <button class="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all" data-action="play-again">
              Jugar de nuevo
            </button>
            <button class="w-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-bold py-4 rounded-xl active:scale-95 transition-all" data-action="new-game">
              Salir al catalogo
            </button>
          </div>
        </div>
      </div>
    \`;
  }`;

content = content.replace(/  function renderRules\(vm\) \{[\s\S]*?    `;\n  \}/, replacement);
fs.writeFileSync('ui.js', content, 'utf8');
