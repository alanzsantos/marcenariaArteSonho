document.addEventListener("DOMContentLoaded", () => {

    /*
       ELEMENTOS
    */

    const grid =
        document.getElementById("portfolioGrid");

    const filters =
        document.getElementById("portfolioFilters");

    const empty =
        document.getElementById("portfolioEmpty");

    const loading =
        document.getElementById("portfolioLoading");

    /*
       VIEWER
    */

    const viewer =
        document.getElementById("portfolioViewer");

    const viewerImage =
        document.getElementById("portfolioViewerImage");

    const viewerCategory =
        document.getElementById("portfolioViewerCategory");

    const viewerCounter =
        document.getElementById("portfolioViewerCounter");

    const viewerClose =
        document.getElementById("portfolioViewerClose");

    const viewerPrev =
        document.getElementById("portfolioViewerPrev");

    const viewerNext =
        document.getElementById("portfolioViewerNext");


    /*
       MENU MOBILE
    */

    const navToggle =
        document.getElementById("navToggle");

    const navLinks =
        document.getElementById("navLinks");


    if (navToggle && navLinks) {

        navToggle.addEventListener(
            "click",
            () => {

                const aberto =
                    navLinks.classList.toggle("open");

                navToggle.setAttribute(
                    "aria-expanded",
                    aberto
                );

            }
        );


        navLinks
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        navLinks.classList.remove("open");

                        navToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            });

    }


    /*
       VARIÁVEIS DA GALERIA
    */

    let imagens = [];

    let imagensFiltradas = [];

    let imagemAtual = 0;

    let limiteExibido = 10;

    const itensPorPagina = 10;

    const portfolioActions = document.getElementById("portfolioActions");

    const btnCarregarMais = document.getElementById("btnCarregarMais");

    /*
       CARREGAR JSON
    */

    fetch("data/imagens.json")

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Não foi possível carregar data/imagens.json"
                );

            }

            return response.json();

        })

        .then(data => {

            imagens = data;

            loading.style.display = "none";

            criarFiltros();

            renderizarGaleria("todos");

        })

        .catch(error => {

            console.error(error);

            loading.style.display = "none";

            empty.style.display = "block";

            empty.textContent =
                "Não foi possível carregar os projetos.";

        });


    /*
       CRIAR FILTROS
    */

    function criarFiltros() {

        /*
         * BOTÃO "TODOS"
         */

        const botaoTodos =
            filters.querySelector(
                '[data-category="todos"]'
            );


        if (botaoTodos) {

            botaoTodos.addEventListener(
                "click",
                () => {

                    /*
                     Remove o active de todos
                     */

                    filters
                        .querySelectorAll(
                            ".portfolio-filter"
                        )
                        .forEach(btn => {

                            btn.classList.remove(
                                "active"
                            );

                        });


                    /*
                     Ativa novamente o botão Todos
                     */

                    botaoTodos.classList.add(
                        "active"
                    );


                    /*
                     Renderiza todas as imagens
                     */

                    renderizarGaleria("todos");

                }
            );

        }


        /*
         CATEGORIAS
         */

        const categorias = [
            ...new Set(
                imagens
                    .map(imagem => imagem.categoria)
                    .filter(Boolean)
            )
        ];

        categorias
            .sort()
            .forEach(categoria => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "portfolio-filter";


                button.dataset.category =
                    categoria;


                button.textContent =
                    formatarCategoria(
                        categoria
                    );


                button.addEventListener(
                    "click",
                    () => {

                        /*
                         Remove active de todos
                         */

                        filters
                            .querySelectorAll(
                                ".portfolio-filter"
                            )
                            .forEach(btn => {

                                btn.classList.remove(
                                    "active"
                                );

                            });


                        /*
                            Ativa o botão selecionado
                         */

                        button.classList.add(
                            "active"
                        );


                        /*
                            Filtra a galeria
                         */

                        renderizarGaleria(
                            categoria
                        );

                    }
                );


                filters.appendChild(
                    button
                );

            });

    }


    /*
       RENDERIZAR GALERIA
    */

    function renderizarGaleria(categoria) {
        grid.innerHTML = "";
        empty.style.display = "none";
        limiteExibido = itensPorPagina;

        if (categoria === "todos") {
            imagensFiltradas = [...imagens];
        } else {
            imagensFiltradas = imagens.filter(
                imagem => imagem.categoria === categoria
            );
        }

        if (!imagensFiltradas.length) {
            empty.style.display = "block";
            portfolioActions.style.display = "none";
            return;
        }

        desenharBlocoImagens(0, limiteExibido);
        verificarVisibilidadeBotao();
    }

    /*
       FUNÇÃO AUXILIAR PARA MONTAR OS CARD NO DOM (Fatiado)
    */
   
    function desenharBlocoImagens(inicio, fim) {
        const bloco = imagensFiltradas.slice(inicio, fim);

        bloco.forEach((imagem, index) => {
            const indexReal = inicio + index;

            const card = document.createElement("article");
            card.className = "portfolio-card";
            card.style.animationDelay = `${Math.min(index * 20, 300)}ms`;

            const categoriaFormatada = formatarCategoria(imagem.categoria);
            
            const primeiraDaCategoria =
                indexReal === 0 ||
                imagensFiltradas[indexReal - 1].categoria !== imagem.categoria;

            card.innerHTML = `
                <div class="portfolio-card-image">
                    <img class="portfolio-image" src="${imagem.arquivo}" alt="${categoriaFormatada}" loading="lazy" decoding="async">
                    <img class="portfolio-card-logo" src="profissionais/mas.png" alt="" aria-hidden="true">
                </div>
                <div class="portfolio-card-open"> → </div>
                ${primeiraDaCategoria ? `
                    <div class="portfolio-card-info">
                        <span class="portfolio-card-category">${categoriaFormatada}</span>
                    </div>
                ` : ""}
            `;

            card.addEventListener("click", () => {
                abrirViewer(indexReal);
            });

            grid.appendChild(card);
        });
    }

    /*
       VERIFICAR SE O BOTÃO DEVE APARECER
    */

    function verificarVisibilidadeBotao() {
        if (limiteExibido >= imagensFiltradas.length) {
            portfolioActions.style.display = "none";
        } else {
            portfolioActions.style.display = "block";
        }
    }

    /*
       OUVINTE DE EVENTO DO BOTÃO CARREGAR MAIS
    */

    if (btnCarregarMais) {
        btnCarregarMais.addEventListener("click", () => {
            const antigoLimite = limiteExibido;
            limiteExibido += itensPorPagina;

            desenharBlocoImagens(antigoLimite, limiteExibido);
            verificarVisibilidadeBotao();
        });
    } 


    /*
       ABRIR VIEWER
    */

    function abrirViewer(index) {

        if (!imagensFiltradas.length) {
            return;
        }


        imagemAtual = index;


        atualizarViewer("next");


        viewer.classList.add("active");

        viewer.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "viewer-open"
        );

    }


    /*
       ATUALIZAR VIEWER
    */

    function atualizarViewer(direcao = "next") {

        const imagem =
            imagensFiltradas[imagemAtual];


        if (!imagem) {
            return;
        }


        /*
             Remove a animação anterior.
         */

        viewerImage.classList.remove(
            "slide-next",
            "slide-prev"
        );


        /*
          Força o navegador a recalcular a animação.
        */

        void viewerImage.offsetWidth;


        viewerImage.src =
            imagem.arquivo;


        viewerImage.alt =
            formatarCategoria(
                imagem.categoria
            );


        viewerCategory.textContent =
            formatarCategoria(
                imagem.categoria
            );


        viewerCounter.textContent =
            `${imagemAtual + 1} / ${imagensFiltradas.length}`;


        /*
            Aplica a animação correspondente.
         */

        viewerImage.classList.add(
            direcao === "prev"
                ? "slide-prev"
                : "slide-next"
        );

    }

    /*
       PRÓXIMA IMAGEM
    */

    function proximaImagem() {

        if (!imagensFiltradas.length) {
            return;
        }


        imagemAtual++;


        if (
            imagemAtual >=
            imagensFiltradas.length
        ) {

            imagemAtual = 0;

        }


        atualizarViewer("next");

    }


    /*
       IMAGEM ANTERIOR
    */

    function imagemAnterior() {

        if (!imagensFiltradas.length) {
            return;
        }


        imagemAtual--;


        if (imagemAtual < 0) {

            imagemAtual =
                imagensFiltradas.length - 1;

        }


        atualizarViewer("prev");

    }


    /*
       FECHAR VIEWER
    */

    function fecharViewer() {

        viewer.classList.remove("active");

        viewer.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "viewer-open"
        );

    }


    /*
       BOTÕES DO VIEWER
    */

    viewerNext.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            proximaImagem();

        }
    );


    viewerPrev.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            imagemAnterior();

        }
    );


    viewerClose.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            fecharViewer();

        }
    );


    /*
       CLICAR FORA DA IMAGEM
    */

    viewer.addEventListener(
        "click",
        event => {

            if (
                event.target === viewer
            ) {

                fecharViewer();

            }

        }
    );


    /*
       TECLADO
    */

    document.addEventListener(
        "keydown",
        event => {

            if (
                !viewer.classList.contains(
                    "active"
                )
            ) {
                return;
            }


            if (
                event.key === "ArrowRight"
            ) {

                proximaImagem();

            }


            if (
                event.key === "ArrowLeft"
            ) {

                imagemAnterior();

            }


            if (
                event.key === "Escape"
            ) {

                fecharViewer();

            }

        }
    );


    /*
       SWIPE / ARRASTAR
    */

    let touchStartX = 0;

    let touchStartY = 0;

    let isDragging = false;


    viewerImage.addEventListener(
        "pointerdown",
        event => {

            touchStartX =
                event.clientX;

            touchStartY =
                event.clientY;

            isDragging = true;


            viewerImage.setPointerCapture(
                event.pointerId
            );

        }
    );


    viewerImage.addEventListener(
        "pointerup",
        event => {

            if (!isDragging) {
                return;
            }

            isDragging = false;

            const differenceX =
                event.clientX -
                touchStartX;


            const differenceY =
                event.clientY -
                touchStartY;

            /*
                Ignora se o movimento foi predominantemente vertical.
            */

            if (
                Math.abs(differenceY) >
                Math.abs(differenceX)
            ) {

                return;

            }


            /*
                Movimento mínimo.
             */

            if (
                Math.abs(differenceX) < 60
            ) {

                return;

            }


            if (differenceX < 0) {

                proximaImagem();

            } else {

                imagemAnterior();

            }

        }
    );

    viewerImage.addEventListener(
        "pointercancel",
        () => {

            isDragging = false;

        }
    );

    /* 
       FORMATAÇÃO DAS CATEGORIAS
    */

    function formatarCategoria(
        categoria
    ) {

        if (!categoria) {
            return "Projeto";
        }

        return categoria

            .replace(/[-_]/g, " ")

            .replace(
                /\b\w/g,
                letra =>
                    letra.toUpperCase()
            );
    }

});

/*  EXPERIENCIA  */

function inicializarContadoresHistoria() {
    const expElement = document.getElementById("exp-counter");
    const yearElement = document.getElementById("year-counter");
    const descElement = document.getElementById("counter-desc");

    if (!expElement || !yearElement || !descElement) return;

    const animarExperiencia = () => {
        let currentExp = 0;
        const targetExp = 30;
        const duration = 1500;
        const stepTime = duration / targetExp;

        const expTimer = setInterval(() => {
            currentExp++;
            expElement.innerText = currentExp;
            if (currentExp === targetExp) {
                clearInterval(expTimer);
            }
        }, stepTime);
    };

    const animarLinhaDoTempo = () => {
        let currentYear = 2020;
        const targetYear = 2026;

        const yearTimer = setInterval(() => {
            currentYear++;
            yearElement.innerText = currentYear;

            if (currentYear === targetYear) {
                clearInterval(yearTimer);

                setTimeout(() => {
                    yearElement.style.transition = "opacity 0.3s ease";
                    yearElement.style.opacity = 0;

                    setTimeout(() => {
                        yearElement.innerText = "6 Anos";
                        descElement.innerHTML = "De história, evolução e solidez no mercado de marcenaria.";
                        descElement.style.color = "#ffffff";
                        yearElement.style.opacity = 1;
                    }, 300);

                }, 800);
            }
        }, 180);
    };

    const secaoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animarExperiencia();
                animarLinhaDoTempo();
                secaoObserver.disconnect();
            }
        });
    }, { threshold: 0.1 });

    secaoObserver.observe(expElement);
}

inicializarContadoresHistoria();

function inicializarContadoresTimeline() {
    const elements = document.querySelectorAll(".timeline-num");
    if (elements.length === 0) return;

    const animarCard = (el) => {
        const target = +el.getAttribute("data-target");
        let current = 0;
        const duration = 1200;
        const stepTime = duration / target;

        const timer = setInterval(() => {
            current++;
            el.innerText = current;
            if (current === target) {
                clearInterval(timer);
            }
        }, stepTime);
    };

    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                elements.forEach(el => animarCard(el));
                timelineObserver.disconnect();
            }
        });
    }, { threshold: 0.2 });

    timelineObserver.observe(elements[0]);
}

inicializarContadoresTimeline();

/* Formulario */

function focarNoFormulario() {
    const secaoForm = document.getElementById('secaoFormulario');
    secaoForm.scrollIntoView({ behavior: 'smooth' });

    document.getElementById('nome').focus();
}

function enviarMensagemWhatsapp(event) {
    event.preventDefault();

    const ddd = "5511";
    const prefixo = "97800";
    const sufixo = "9451";
    const numeroCompleto = ddd + prefixo + sufixo;

    const nome = document.getElementById('nome').value.trim();
    const mensagemUsuario = document.getElementById('mensagem').value.trim();

    const textoFormatado = `Olá André, meu nome é ${nome}.\n\n${mensagemUsuario}`;

    const urlBase = new URL(`https://wa.me/${numeroCompleto}`);
    urlBase.searchParams.append("text", textoFormatado);

    window.open(urlBase.href, '_blank');

    event.target.reset();
}

document.addEventListener('DOMContentLoaded', () => {
    const btnChamarForm = document.getElementById('btnChamarForm');
    btnChamarForm.addEventListener('click', focarNoFormulario);

    const formulario = document.getElementById('formContato');
    formulario.addEventListener('submit', enviarMensagemWhatsapp);
});

function gerenciarTemaEscuro() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    const savedTheme = localStorage.getItem('theme');
    const prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefereEscuro)) {
        document.body.classList.add('dark-theme');
    }
    
    function alternarTema() {
        document.body.classList.toggle('dark-theme');
        
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    }

    themeToggleBtn.addEventListener('click', alternarTema);
}

gerenciarTemaEscuro();
