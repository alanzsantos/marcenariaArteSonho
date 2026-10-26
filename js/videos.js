document.addEventListener("DOMContentLoaded", () => {

    /*
       ELEMENTOS
    */

    const grid =
        document.getElementById("videosGrid");

    const filters =
        document.getElementById("videosFilters");

    const empty =
        document.getElementById("videosEmpty");

    const loading =
        document.getElementById("videosLoading");


    /*
       VALIDAÇÃO DOS ELEMENTOS
    */

    if (
        !grid ||
        !filters ||
        !empty ||
        !loading
    ) {
        return;
    }


    /*
       VARIÁVEIS DA GALERIA
    */

    let videos = [];

    let videosFiltrados = [];


    /*
       CARREGAR JSON
    */

    fetch("data/videos.json")

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Não foi possível carregar data/videos.json"
                );

            }

            return response.json();

        })

        .then(data => {

            videos = Array.isArray(data)
                ? data
                : [];

            loading.style.display = "none";

            criarFiltros();

            configurarBotaoTodos();

            renderizarVideos("todos");

        })

        .catch(error => {

            console.error(
                "Erro ao carregar vídeos:",
                error
            );

            loading.style.display = "none";

            empty.style.display = "block";

            empty.textContent =
                "Não foi possível carregar os vídeos.";

        });


    /*
       CONFIGURAR BOTÃO "TODOS"
    */

    function configurarBotaoTodos() {

        const botaoTodos =
            filters.querySelector(
                '[data-category="todos"]'
            );


        if (!botaoTodos) {
            return;
        }


        botaoTodos.addEventListener(
            "click",
            () => {

                ativarFiltro(botaoTodos);

                renderizarVideos("todos");

            }
        );

    }


    /*
       CRIAR FILTROS DAS CATEGORIAS
    */

    function criarFiltros() {

        filters
            .querySelectorAll(
                ".video-filter:not([data-category='todos'])"
            )
            .forEach(button => {

                button.remove();

            });


        const categorias = [
            ...new Set(
                videos
                    .map(video => video.categoria)
                    .filter(Boolean)
            )
        ];


        categorias
            .sort((a, b) =>
                a.localeCompare(
                    b,
                    "pt-BR"
                )
            )
            .forEach(categoria => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "video-filter";


                button.dataset.category =
                    categoria;


                button.textContent =
                    formatarCategoria(
                        categoria
                    );


                button.addEventListener(
                    "click",
                    () => {

                        ativarFiltro(button);

                        renderizarVideos(
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
       ATIVAR FILTRO
    */

    function ativarFiltro(botaoSelecionado) {

        filters
            .querySelectorAll(
                ".video-filter"
            )
            .forEach(button => {

                button.classList.remove(
                    "active"
                );

            });


        botaoSelecionado.classList.add(
            "active"
        );

    }


    /*
       RENDERIZAR VÍDEOS
    */

    function renderizarVideos(categoria) {

        /*
           Limpa a galeria
        */

        grid.innerHTML = "";

        empty.style.display = "none";


        /*
           FILTRAGEM
        */

        if (categoria === "todos") {

            videosFiltrados =
                [...videos];

        } else {

            videosFiltrados =
                videos.filter(
                    video =>
                        video.categoria === categoria
                );

        }


        /*
           NENHUM RESULTADO
        */

        if (!videosFiltrados.length) {

            empty.style.display = "block";

            return;

        }


        /*
           CONTROLE DAS CATEGORIAS JÁ EXIBIDAS
           
           Quando estiver em "Todos",
           cada categoria recebe o nome
           somente no primeiro vídeo.
        */

        const categoriasExibidas =
            new Set();


        /*
           CRIAR CARDS
        */

        videosFiltrados.forEach(
            (video, index) => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "video-card";


                card.style.animationDelay =
                    `${Math.min(
                        index * 20,
                        300
                    )}ms`;


                const categoriaFormatada =
                    formatarCategoria(
                        video.categoria
                    );


                /*
                   Verifica se este é o primeiro
                   vídeo da categoria.
                */

                const primeiroDaCategoria =
                    !categoriasExibidas.has(
                        video.categoria
                    );


                if (
                    primeiroDaCategoria
                ) {

                    categoriasExibidas.add(
                        video.categoria
                    );

                }


                /*
                   CARD DO VÍDEO
                */

                card.innerHTML = `

                    <div class="video-card-player">

                        <video
                            controls
                            muted
                            playsinline
                            preload="metadata"
                            controlsList="nodownload noplaybackrate"
                            disablePictureInPicture>

                            <source
                                src="${video.arquivo}"
                                type="video/${video.extensao}">

                            Seu navegador não suporta
                            reprodução de vídeo.

                        </video>

                    </div>

                `;


                /*
                   Adiciona o nome da categoria
                   somente no primeiro vídeo.
                */

                if (
                    primeiroDaCategoria
                ) {

                    const info =
                        document.createElement(
                            "div"
                        );


                    info.className =
                        "video-card-info";


                    info.innerHTML = `

                        <span class="video-card-category">
                            ${categoriaFormatada}
                        </span>

                    `;


                    card.appendChild(
                        info
                    );

                }


                /*
                   GARANTIR VÍDEO SEM ÁUDIO
                */

                const elementoVideo =
                    card.querySelector(
                        "video"
                    );


                if (elementoVideo) {

                    elementoVideo.muted =
                        true;

                    elementoVideo.volume =
                        0;

                }


                grid.appendChild(
                    card
                );

            }
        );

    }


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

            .replace(
                /[-_]/g,
                " "
            )

            .replace(
                /\b\w/g,
                letra =>
                    letra.toUpperCase()
            );

    }

});
