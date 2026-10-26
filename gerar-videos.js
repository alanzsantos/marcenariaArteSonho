const fs = require("fs");
const path = require("path");

const pastaVideos =
    path.join(__dirname, "videos");

const pastaData =
    path.join(__dirname, "data");

const arquivoJson =
    path.join(pastaData, "videos.json");


const extensoesPermitidas = [
    ".mp4",
    ".webm",
    ".mov",
    ".m4v"
];


function formatarCategoria(categoria) {

    return categoria
        .replace(/[-_]/g, " ")
        .replace(
            /\b\w/g,
            letra => letra.toUpperCase()
        );

}


function gerarVideos() {

    if (!fs.existsSync(pastaVideos)) {

        console.error(
            "A pasta videos/ não foi encontrada."
        );

        return;
    }


    if (!fs.existsSync(pastaData)) {

        fs.mkdirSync(
            pastaData,
            {
                recursive: true
            }
        );

    }


    const categorias =
        fs.readdirSync(
            pastaVideos,
            {
                withFileTypes: true
            }
        );


    const videos = [];


    categorias.forEach(
        categoriaEntry => {

            if (
                !categoriaEntry.isDirectory()
            ) {

                return;

            }


            const categoria =
                categoriaEntry.name;


            const pastaCategoria =
                path.join(
                    pastaVideos,
                    categoria
                );


            const arquivos =
                fs.readdirSync(
                    pastaCategoria,
                    {
                        withFileTypes: true
                    }
                );


            arquivos.forEach(
                arquivoEntry => {

                    if (
                        !arquivoEntry.isFile()
                    ) {

                        return;

                    }


                    const extensao =
                        path.extname(
                            arquivoEntry.name
                        ).toLowerCase();


                    if (
                        !extensoesPermitidas.includes(
                            extensao
                        )
                    ) {

                        return;

                    }


                    const caminho =
                        `videos/${categoria}/${arquivoEntry.name}`;


                    videos.push({

                        arquivo: caminho,

                        categoria: categoria,

                        categoriaFormatada:
                            formatarCategoria(
                                categoria
                            ),

                        extensao:
                            extensao.replace(
                                ".",
                                ""
                            )

                    });

                }
            );

        }
    );


    videos.sort(
        (a, b) =>
            a.categoria.localeCompare(
                b.categoria,
                "pt-BR"
            )
    );


    fs.writeFileSync(

        arquivoJson,

        JSON.stringify(
            videos,
            null,
            4
        ),

        "utf8"

    );


    console.log(
        `✓ ${videos.length} vídeos encontrados.`
    );


    console.log(
        `✓ JSON criado em: ${arquivoJson}`
    );

}


gerarVideos();
