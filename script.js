// ====================================================================
// 1. Variáveis e Configuração Inicial (ADICIONANDO NOVOS ELEMENTOS)
// ====================================================================
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

const TEMPO_DUPLO_TOQUE = 300; // 300 milissegundos
// NOVOS ELEMENTOS DE CONTROLE DE MÚSICA
const btnPauseMusica = document.getElementById('btn-pause-musica');
const btnMudarMusica = document.getElementById('btn-mudar-musica');

let estadoDoJogo = "inicio";

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
let musicaPausada = false; // Estado do pause da música
let pecaToqueInicial = null;
let ultimoToque = 0; // Variável para rastrear o tempo do último toque



// ====================================================================
// 2. Funções de Lógica e Jogo (CORRIGIDAS E NOVAS)
// ====================================================================

/**
 * Gira uma peça em 90 graus (apenas no modo difícil).
 */
function girarPeca() {
    // Só gira se não estiver encerrado E o modo difícil estiver ativo
    if (jogoEncerrado || !modoDificilCheckbox.checked) return;

    let anguloAtual = parseInt(this.dataset.angulo || 0);
    anguloAtual = (anguloAtual + 90) % 360;
    
    // CORREÇÃO AQUI: Aplica a rotação
    this.style.transform = `rotate(${anguloAtual}deg)`;
    this.dataset.angulo = anguloAtual.toString(); 

    if (verificarVitoria()) encerrarJogo();
}


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
                // CORREÇÃO NO CSS: Aplicação correta do 'rotate'
                peca.style.transform = `rotate(${angulo}deg)`;
                peca.dataset.angulo = angulo; 
                
                // ADICIONA o listener de clique/toque para GIRA a peça (Modo Difícil)
                peca.addEventListener('click', girarPeca); 
            } else {
                // Garante que o dataset.angulo exista e seja "0" no modo normal
                peca.dataset.angulo = "0"; 
            }

            peca.addEventListener('dragstart', dragStart);
            peca.addEventListener('dragover', dragOver);
            peca.addEventListener('drop', drop);
            peca.addEventListener('dragend', dragEnd);
            peca.addEventListener('touchstart', touchStart);
            peca.addEventListener('touchend', touchEnd);

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

// =======================
// NOVAS FUNÇÕES DE MÚSICA
// =======================

/**
 * Pausa ou retoma a música.
 */
function toggleMusica() {
    if (musicaFrequencia.paused) {
        musicaFrequencia.play();
        musicaPausada = false;
        // Atualiza o ícone para pausa
        btnPauseMusica.textContent = '⏸️'; 
    } else {
        musicaFrequencia.pause();
        musicaPausada = true;
        // Atualiza o ícone para play
        btnPauseMusica.textContent = '▶️'; 
    }
}

/**
 * Inicia a próxima música aleatória.
 */
function mudarMusica() {
    musicaFrequencia.pause();
    musicaFrequencia.currentTime = 0;
    const faixaAleatoria = faixasAudio[Math.floor(Math.random() * faixasAudio.length)];
    musicaFrequencia.src = faixaAleatoria;
    musicaFrequencia.volume = 0.3;
    
    musicaFrequencia.play().catch(err => console.warn('Erro ao tocar música:', err));
    musicaPausada = false;
    // Garante que o ícone está no estado de 'pausa' após tocar
    if (btnPauseMusica) btnPauseMusica.textContent = '⏸️'; 
}

/**
 * Inicia a música de fundo.
 */
function iniciarMusica() {
    mudarMusica(); // Usa a função de mudar para iniciar uma faixa aleatória
}

// =======================

/**
 * Função principal para iniciar o jogo.
 */
function iniciarJogo() {
    const imagemSelecionada = selectImagem.value;
    const divisaoSelecionada = selectDivisao.value;

    if (!imagemSelecionada) {
        alert("Por favor, selecione uma imagem antes de iniciar o jogo.");
        return;
    }
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
 * Verifica se o quebra-cabeça foi completado. (CORRIGIDA)
 */
function verificarVitoria() {
    const pecasAtuais = Array.from(quebraCabeca.children);
    const colunas = parseInt(selectDivisao.value.split('x')[0]);
    const modoDificil = modoDificilCheckbox.checked;

    for (let i = 0; i < pecasAtuais.length; i++) {
        const l = Math.floor(i / colunas);
        const c = i % colunas;
        const posCorreta = `${l}-${c}`;
        
        // 1. Verifica a Posição no DOM (Ordem das Peças)
        if (pecasAtuais[i].dataset.pos !== posCorreta) return false;
        
        // 2. Verifica a Rotação no Modo Difícil
        // A vitória só ocorre se a peça estiver na posição E a rotação for 0 graus
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
// 3. Funções de Drag and Drop (SEM MUDANÇAS)
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

function dragEnd(e) {
    this.style.opacity = '';
    pecaArrastando = null;
}


function touchStart(e) {
    if (jogoEncerrado) return;
    e.preventDefault(); 
    pecaToqueInicial = e.currentTarget;
    pecaToqueInicial.style.opacity = '0.5';

    const agora = new Date().getTime();
    
    // Lógica de Duplo Toque: Se o tempo entre os toques for menor que 300ms
    if (agora - ultimoToque < TEMPO_DUPLO_TOQUE) {
        // É um toque duplo! Gira a peça
        girarPeca.call(pecaToqueInicial); // Chama a função girarPeca no contexto da peça
        
        // Zera o tempo para que 3 toques não girem 2x
        ultimoToque = 0; 
        
        // Evita a lógica de troca para este toque duplo
        pecaToqueInicial.style.opacity = '';
        pecaToqueInicial = null;
        return; 
    }
    
    // Armazena o tempo do toque atual
    ultimoToque = agora;
}

function touchEnd(e) {
    if (jogoEncerrado || !pecaToqueInicial) return;
    
    // Se o toque inicial foi nulo (porque foi um duplo toque e a peça girou), saímos.
    if (!pecaToqueInicial) return; 

    // Tenta encontrar o elemento na posição onde o toque terminou
    const toqueFinal = document.elementFromPoint(
        e.changedTouches[0].clientX,
        e.changedTouches[0].clientY
    );

    // Lógica de troca de peça (a mesma de antes)
    if (
        toqueFinal &&
        toqueFinal.classList.contains('peca-jogo') && 
        toqueFinal !== pecaToqueInicial &&
        saoVizinhos(pecaToqueInicial, toqueFinal)
    ) {
        // Lógica de troca das peças
        const temp = document.createElement('div');
        quebraCabeca.replaceChild(temp, pecaToqueInicial);
        quebraCabeca.replaceChild(pecaToqueInicial, toqueFinal);
        quebraCabeca.replaceChild(toqueFinal, temp);

        if (verificarVitoria()) encerrarJogo();
    }

    // Limpa o estado
    pecaToqueInicial.style.opacity = '';
    pecaToqueInicial = null;

   
}
// ====================================================================
// 4. Event Listeners (COM NOVOS LISTENERS DE MÚSICA)
// ====================================================================

// 1. O BOTÃO DA TELA INICIAL (SÓ FAZ A TRANSIÇÃO)
botaoIniciarJogo.addEventListener('click', () => {
    if (estadoDoJogo === "inicio") {
        telaInicial.style.opacity = '0';
        setTimeout(() => {
            telaInicial.style.display = 'none';
            estadoDoJogo = "pronto"; 
        }, 500);
    }
});


// 2. O BOTÃO "REINICIAR"
btnReiniciar.addEventListener('click', () => {
    if (!jogoEncerrado) {
        clearInterval(intervaloCronometro);
        musicaFrequencia.pause();
        musicaFrequencia.currentTime = 0;
    }
    // Reinicia o jogo (e a música)
    iniciarJogo();
});

// 3. A SELEÇÃO DE IMAGEM
selectImagem.addEventListener('change', function () {
    imgPrincipal.src = './imagem/' + this.value;
});

// 4. O BOTÃO INICIAR JOGO NO PAINEL PRINCIPAL (Realmente inicia o jogo)
const btnIniciar = document.getElementById('iniciar-jogo');

if (btnIniciar) {
    btnIniciar.addEventListener('click', () => {
        const imagemSelecionada = selectImagem.value;
        const divisaoSelecionada = selectDivisao.value;

        if (!imagemSelecionada || !divisaoSelecionada) {
            alert("Escolha uma imagem e uma divisão antes de começar.");
            return;
        }
        
        iniciarJogo();
        estadoDoJogo = "jogando";
    });
}

// ===================================
// NOVOS LISTENERS PARA CONTROLES MÚSICA
// ===================================

if (btnPauseMusica) {
    btnPauseMusica.addEventListener('click', toggleMusica);
}

if (btnMudarMusica) {
    btnMudarMusica.addEventListener('click', mudarMusica);
}