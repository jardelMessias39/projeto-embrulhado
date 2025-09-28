

const telaInicial = document.getElementById('tela-inicial');
const botaoIniciarJogo = document.getElementById('botao-iniciar-jogo');
const btnReiniciar = document.getElementById('reiniciar-jogo');
const selectImagem = document.getElementById('imagem-selecao');
const imgPrincipal = document.getElementById('imagem-principal');
const selectDivisao = document.getElementById('divisao-imagem');
const quebraCabeca = document.getElementById('quebra-cabeca');
const cronometroDisplay = document.getElementById('cronometro');
const musicaFrequencia = document.getElementById('musica-frequencia');
const modoDificilCheckbox = document.getElementById('modo-dificil');
let estadoDoJogo = "inicio";



// As faixas de áudio são arquivos locais na sua pasta 'musicas'.
const faixasAudio = [
    './musicas/blue-sky-binaural-meditation-191542.mp3',
    './musicas/gamma-binaural-beats-enhance-brain-power-relaxing-music-for-study-161763.mp3',
    './musicas/kugelsicher-by-tremoxbeatz-302838.mp3',
    './musicas/lost-in-dreams-abstract-chill-downtempo-cinematic-future-beats-270241.mp3',
    './musicas/royalty-free-splint-hard-808-rap-beat-quotflutequot-223009.mp3',
    './musicas/summer-time-type-beat-hard-trap-x-rap-type-beat-372330.mp3',
    './musicas/binaural-beats-6hz-mind-flow-from-album-quottheta-patternsquot-196990.mp3'
];

let tempo = 0;
let intervaloCronometro = null;
let pecaArrastando = null;
let jogoEncerrado = false;

// ====================================================================
// 2. Funções de Lógica e Jogo
// ====================================================================

/**
 * Cria e embaralha as peças do quebra-cabeça.
 */
function criarPecas(colunas, linhas, imagemSrc, modoDificil) {
    const pecas = [];
    const largura = 400 / colunas;
    const altura = 300 / linhas;

    for (let l = 0; l < linhas; l++) {
        for (let c = 0; c < colunas; c++) {
            const peca = document.createElement('div');
            peca.style.width = `${largura}px`;
            peca.style.height = `${altura}px`;
            peca.style.backgroundImage = `url("${imagemSrc}")`;
            peca.style.backgroundSize = `${colunas * 100}% ${linhas * 100}%`;
            peca.style.backgroundPosition = `-${c * largura}px -${l * altura}px`;
            peca.style.border = '1px solid #eee';
            peca.style.boxSizing = 'border-box';
            peca.dataset.pos = `${l}-${c}`;
            peca.draggable = true;
            peca.classList.add('peca-jogo');

            if (modoDificil) {
                const angulo = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
                peca.style.transform = `rotate('${angulo}deg')`;
                peca.dataset.angulo = angulo;
            }

            peca.addEventListener('dragstart', dragStart);
            peca.addEventListener('dragover', dragOver);
            peca.addEventListener('drop', drop);
            peca.addEventListener('dragend', dragEnd);

            pecas.push(peca);
        }
    }

    embaralharArray(pecas);
    return pecas;
}

/**
 * Inicia o cronômetro do jogo.
 */
function iniciarCronometro() {
    clearInterval(intervaloCronometro);
    tempo = 0;
    cronometroDisplay.textContent = 'Tempo: 00:00';
    intervaloCronometro = setInterval(() => {
        if (!jogoEncerrado) {
            tempo++;
            const minutos = Math.floor(tempo / 60);
            const segundos = tempo % 60;
            cronometroDisplay.textContent = `Tempo: ${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

/**
 * Inicia a música de fundo.
 */
function iniciarMusica() {
    musicaFrequencia.pause();
    musicaFrequencia.currentTime = 0;
    const faixaAleatoria = faixasAudio[Math.floor(Math.random() * faixasAudio.length)];
    musicaFrequencia.src = faixaAleatoria;
    musicaFrequencia.volume = 0.3;
    musicaFrequencia.play().catch(err => console.warn('Erro ao tocar música:', err));
}

/**
 * Função principal para iniciar o jogo.
 */
function iniciarJogo() {
    const imagemSelecionada = selectImagem.value;
    const divisaoSelecionada = selectDivisao.value;

    // Verifica se a imagem foi escolhida
    if (!imagemSelecionada) {
        alert("Por favor, selecione uma imagem antes de iniciar o jogo.");
        return;
    }

    // Verifica se a divisão foi escolhida
    if (!divisaoSelecionada) {
        alert("Por favor, selecione a divisão da imagem.");
        return;
    }

    jogoEncerrado = false;
    quebraCabeca.innerHTML = '';

    const divisao = divisaoSelecionada.split('x');
    const colunas = parseInt(divisao[0]);
    const linhas = parseInt(divisao[1]);
    const imagemSrc = imgPrincipal.src;
    const modoDificil = modoDificilCheckbox.checked;

    const pecas = criarPecas(colunas, linhas, imagemSrc, modoDificil);
    pecas.forEach(peca => quebraCabeca.appendChild(peca));

    iniciarCronometro();
    iniciarMusica();
}


/**
 * Embaralhamento Fisher-Yates para as peças.
 */
function embaralharArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Verifica se o quebra-cabeça foi completado.
 */
function verificarVitoria() {
    const pecasAtuais = Array.from(quebraCabeca.children);
    const colunas = parseInt(selectDivisao.value.split('x')[0]);
    const modoDificil = modoDificilCheckbox.checked;

    for (let i = 0; i < pecasAtuais.length; i++) {
        const l = Math.floor(i / colunas);
        const c = i % colunas;
        const posCorreta = `${l}-${c}`;
        if (pecasAtuais[i].dataset.pos !== posCorreta) return false;
        if (modoDificil && pecasAtuais[i].dataset.angulo !== "0") return false;
    }
    return true;
}

/**
 * Encerra o jogo quando a vitória é alcançada.
 */
function encerrarJogo() {
    if (jogoEncerrado) return;
    jogoEncerrado = true;
    clearInterval(intervaloCronometro);
    musicaFrequencia.pause();
    musicaFrequencia.currentTime = 0;
    setTimeout(() => {
        alert(`✅ Concluído! Parabéns 🎉 Você terminou em ${cronometroDisplay.textContent.replace('Tempo: ', '')}`);
    }, 150);
}

/**
 * Verifica se duas peças são vizinhas para permitir a troca.
 */
function saoVizinhos(p1, p2) {
    const pecas = Array.from(quebraCabeca.children);
    const index1 = pecas.indexOf(p1);
    const index2 = pecas.indexOf(p2);
    const colunas = parseInt(selectDivisao.value.split('x')[0]);
    const diff = Math.abs(index1 - index2);
    return (
        diff === 1 && Math.floor(index1 / colunas) === Math.floor(index2 / colunas) || diff === colunas
    );
}

// ====================================================================
// 3. Funções de Drag and Drop
// ====================================================================

function dragStart(e) {
    if (jogoEncerrado) return;
    pecaArrastando = this;
    setTimeout(() => this.style.opacity = '0.5', 0);
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    if (jogoEncerrado) return;
    if (pecaArrastando && pecaArrastando !== this && saoVizinhos(pecaArrastando, this)) {
        const temp = document.createElement('div');
        quebraCabeca.replaceChild(temp, pecaArrastando);
        quebraCabeca.replaceChild(pecaArrastando, this);
        quebraCabeca.replaceChild(this, temp);

        if (verificarVitoria()) encerrarJogo();
    }
}
peca.addEventListener('touchstart', touchStart);
peca.addEventListener('touchend', touchEnd);

let pecaToqueInicial = null;

function touchStart(e) {
  if (jogoEncerrado) return;
  pecaToqueInicial = e.currentTarget;
  pecaToqueInicial.style.opacity = '0.5';
}

function touchEnd(e) {
  if (jogoEncerrado || !pecaToqueInicial) return;

  const toqueFinal = document.elementFromPoint(
    e.changedTouches[0].clientX,
    e.changedTouches[0].clientY
  );

  if (
    toqueFinal &&
    toqueFinal.classList.contains('peca-jogo') &&
    toqueFinal !== pecaToqueInicial &&
    saoVizinhos(pecaToqueInicial, toqueFinal)
  ) {
    const temp = document.createElement('div');
    quebraCabeca.replaceChild(temp, pecaToqueInicial);
    quebraCabeca.replaceChild(pecaToqueInicial, toqueFinal);
    quebraCabeca.replaceChild(toqueFinal, temp);

    if (verificarVitoria()) encerrarJogo();
  }

  pecaToqueInicial.style.opacity = '';
  pecaToqueInicial = null;
}

function dragEnd(e) {
    this.style.opacity = '';
    pecaArrastando = null;
}

// ====================================================================
// 4. Event Listeners
// ====================================================================

// O botão "Iniciar Jogo" na tela inicial
// Ele esconde a tela inicial e, em seguida, inicia o jogo.

// 1. LISTENER PARA A TELA INICIAL (Faz a transição)
telaInicial.addEventListener('click', () => { 
    if (estadoDoJogo === "inicio") {
        telaInicial.style.opacity = '0';
        setTimeout(() => {
            telaInicial.style.display = 'none';
            estadoDoJogo = "pronto"; // Prepara para receber o clique no botão 'Iniciar Jogo'
        }, 500);
    } 
    // FIM da função do clique na tela inicial. Ela não tem mais código aqui.
});


// 2. LISTENER PARA O BOTÃO DO PAINEL DE CONFIGURAÇÕES (Inicia o Jogo)
const btnIniciar = document.getElementById('iniciar-jogo');
if (btnIniciar) {
    // ESTE CÓDIGO PRECISA FICAR FORA DO EVENTO DA TELA INICIAL
    btnIniciar.addEventListener('click', () => {
        // A lógica do jogo DEVE estar aqui
        if (estadoDoJogo === "pronto" || estadoDoJogo === "jogando") {
            const imagemSelecionada = selectImagem.value;
            const divisaoSelecionada = selectDivisao.value;

            if (!imagemSelecionada || !divisaoSelecionada) {
                alert("Escolha uma imagem e uma divisão antes de começar.");
                return;
            }
            
            iniciarJogo();
            estadoDoJogo = "jogando";
        }
    });
}
// O botão "Reiniciar"
btnReiniciar.addEventListener('click', () => {
    if (!jogoEncerrado) {
        clearInterval(intervaloCronometro);
        musicaFrequencia.pause();
        musicaFrequencia.currentTime = 0;
    }
    iniciarJogo();
});

// A seleção de imagem
selectImagem.addEventListener('change', function () {
    imgPrincipal.src = './imagem/' + this.value;
});

// Adicionando um listener para o botão de iniciar no painel principal
// (caso ele exista no seu HTML)

if (btnIniciar) {
    btnIniciar.addEventListener('click', () => {
        // A lógica do jogo DEVE estar aqui
        if (estadoDoJogo === "pronto" || estadoDoJogo === "jogando") {
            const imagemSelecionada = selectImagem.value;
            const divisaoSelecionada = selectDivisao.value;

            if (!imagemSelecionada || !divisaoSelecionada) {
                alert("Escolha uma imagem e uma divisão antes de começar.");
                return;
            }

            iniciarJogo();
            estadoDoJogo = "jogando";
        }
    });
}