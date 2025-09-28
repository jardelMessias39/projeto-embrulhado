

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
            peca.classList.add('peca-jogo'); // Adiciona uma classe para o touchEnd saber o que procurar

            if (modoDificil) {
                const angulo = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
                peca.style.transform = `rotate('${angulo}deg')`;
                peca.dataset.angulo = angulo;
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

function dragEnd(e) {
    this.style.opacity = '';
    pecaArrastando = null;
}

// ====================================================================
// 3. Funções de Drag and Drop (Com Suporte a Toque)
// ====================================================================

let pecaToqueInicial = null;

function touchStart(e) {
    if (jogoEncerrado) return;
    e.preventDefault(); 
    pecaToqueInicial = e.currentTarget;
    pecaToqueInicial.style.opacity = '0.5';
}

function touchEnd(e) {
    if (jogoEncerrado || !pecaToqueInicial) return;
    
    // Tenta encontrar o elemento na posição onde o toque terminou
    const toqueFinal = document.elementFromPoint(
        e.changedTouches[0].clientX,
        e.changedTouches[0].clientY
    );

    // O elemento precisa ter a classe 'peca-jogo'
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
// 4. Event Listeners (CORRIGIDO E SEPARADO)
// ====================================================================

// 1. O BOTÃO DA TELA INICIAL (SÓ FAZ A TRANSIÇÃO)
botaoIniciarJogo.addEventListener('click', () => {
    // Garante que só faz a transição se estiver no estado "inicio"
    if (estadoDoJogo === "inicio") {
        telaInicial.style.opacity = '0';
        setTimeout(() => {
            telaInicial.style.display = 'none';
            // Agora o estado é 'pronto' para o jogador escolher as opções
            estadoDoJogo = "pronto"; 
        }, 500);
    }
    // Removemos o bloco 'else if' que causava a confusão na lógica
});


// 2. O BOTÃO "REINICIAR"
btnReiniciar.addEventListener('click', () => {
    if (!jogoEncerrado) {
        clearInterval(intervaloCronometro);
        musicaFrequencia.pause();
        musicaFrequencia.currentTime = 0;
    }
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
        
        // Se a tela inicial já sumiu (o que define o estado como "pronto"), podemos prosseguir.
        
        const imagemSelecionada = selectImagem.value;
        const divisaoSelecionada = selectDivisao.value;

        // Validação: Verifique se as opções foram escolhidas
        if (!imagemSelecionada || !divisaoSelecionada) {
            alert("Escolha uma imagem e uma divisão antes de começar.");
            return;
        }
        
        // Se a validação passou, inicie o jogo e mude o estado
        iniciarJogo();
        estadoDoJogo = "jogando";
    });
}

// A seleção de imagem
selectImagem.addEventListener('change', function () {
    imgPrincipal.src = './imagem/' + this.value;
});

// Adicionando um listener para o botão de iniciar no painel principal
// (caso ele exista no seu HTML)

if (btnIniciar) {
    btnIniciar.addEventListener('click', iniciarJogo);
}