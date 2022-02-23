function novoElemento(tagName, className) {
    //criando elemento HTML
    const elem = document.createElement(tagName)
    //Atribuindo a classe passando por parametro para o elemento
    elem.className = className
    return elem
}

//'Classe' que modela uma barreira
function Barreira(reversa = falsa) {
    //Barreira em sí. this fará com que o elemento seja visto de forma global (public)
    this.elemento = novoElemento('div', 'barreira')

    //Borda da barreira (parte da boca do cano)
    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    //append dentro do element (div.barreira), caso seja reversa adiciona primeiro o corpo do cano, caso não, a boca
    this.elemento.appendChild(reversa ? corpo : borda)
    //completa a barreira (cano)
    this.elemento.appendChild(reversa ? borda : corpo)

    //Função que define a altura do corpo da barreira
    this.setAltura = altura => corpo.style.height = `${altura}px`
}

//const barreira = new Barreira(true)
//barreira.setAltura(200)
//document.querySelector('[wm-flappy]').appendChild(barreira.elemento)

//'Classe' que constroi um par de Barreira()
function ParDeBarreiras(altura, abertura, x) {
    //Cria uma div para o par de barreira cima/baixo
    this.elemento = novoElemento('div', 'par-de-barreiras')
    
    //Barreira cima - reversa ~> corpo e borda
    this.superior = new Barreira(true)
    //Barreira baixo - não reversa ~> borda e corpo
    this.inferior = new Barreira(false)

    //appendChild no this.elemento da 'Classe' Barreira, esse elemento que representa a barreira em sí
    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    //função que gera o local da abertura de forma randomica
    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        //A altura inferior é o que sobra da altura da barreira superior mais o espaço da abertura
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    //Função que pega a posição no eixo 'x' de onde a barreira se encontra
    //split no atributo left e pegando a primeira parte do array oriundo do split, que é o tamanho e faz-se um cast pra int
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])

    //Função que seta a posição no eixo 'x' da barreira
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    //Chamada de funções
    this.sortearAbertura()
    this.setX(x)
}

//const b = new ParDeBarreiras(700, 200, 400)
//'b' é o elemento dom oriundo da instancia de ParDeBarreiras
//document.querySelector('[wm-flappy]').appendChild(b.elemento)

//Função geradora de barreiras
function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        //Primeira barreira começa logo fora da 'tela' do jogo
        new ParDeBarreiras(altura, abertura, largura),
        //Segunda barreira começa da distancia entre ela e a primeira barreira
        new ParDeBarreiras(altura, abertura, largura + espaco),
        //A mesma distancia, mas dessa vez conta duas barreiras: a primeira e a segunda
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        //A mesma distancia, porém conta tres vezes: primeira, segunda e terceira barreiras
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]
    //Quantidade que irá deslocar em pixel
    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            //quando o elemento sair da 'tela' do jogo
            if(par.getX() < -par.getLargura()) {
                //Retorna barreira pro final da 'fila' de barreias
                par.setX(par.getX() + espaco * this.pares.length)
                //Sorteia uma nova abertura para essa barreira
                par.sortearAbertura()
            }

            const meio = largura / 2
            //Testa para saber se a barreira cruzou o meio da 'tela' do jogo
            const cruzouOMeio = par.getX() + deslocamento >= meio && par.getX() < meio
            if(cruzouOMeio){
                notificarPonto()
            }
        })
    }
}

function Passaro(alturaJogo) {
    
    //Controle do voo
    let voando = false
    
    //Criando um elemento HTML do tipo <img> para atribuir a ele o png do passaro
    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    //Capturando posição do passaro no eixo Y
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    //Tecla pressionada
    window.onkeydown = e => voando = true
    //Tecla solta
    window.onkeyup = e => voando = false

    this.animar = () => {
        //Se estiver voando, soma 8 px, se estiver caindo subtrai 5 px
        const novoY = this.getY() + (voando ? 8 : -5)
        //Altura maxima: teto do jogo - altura do passaro
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        //Não passa do teto
        if(novoY <= 0) {
            this.setY(0)
        //Não passa do chão
        }else if(novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        }else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}

//Seta Barreiras
const barreiras = new Barreiras(700, 1200, 200, 400)

//Seta passaro e altura da 'tela' do jogo
const passaro = new Passaro(700)

//Captura a div que representa a area do jogo
const areaDoJogo = document.querySelector('[wm-flappy]')
//adiciona o passaro a 'tela' do jogo
areaDoJogo.appendChild(passaro.elemento)

barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
setInterval(() => {
    barreiras.animar()
    passaro.animar()
}, 20)