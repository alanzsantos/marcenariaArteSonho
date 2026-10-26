const fs = require("fs");
const path = require("path");
const crypto = require("crypto");


/* =========================================================
   CAMINHOS
========================================================= */

const pastaProjetos =
    path.join(__dirname, "images", "projetos");

const pastaData =
    path.join(__dirname, "data");

const arquivoJson =
    path.join(pastaData, "imagens.json");


/* =========================================================
   EXTENSÕES PERMITIDAS
========================================================= */

const extensoesPermitidas = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif"
];


/* =========================================================
   PREPARAÇÃO
========================================================= */

if (!fs.existsSync(pastaData)) {

    fs.mkdirSync(
        pastaData,
        {
            recursive: true
        }
    );

}


if (!fs.existsSync(pastaProjetos)) {

    console.error(
        "A pasta images/projetos não existe."
    );

    process.exit(1);

}


/* =========================================================
   GERAR HASH DO ARQUIVO
========================================================= */

function gerarHashArquivo(caminhoArquivo) {

    const conteudo =
        fs.readFileSync(caminhoArquivo);

    return crypto
        .createHash("sha256")
        .update(conteudo)
        .digest("hex");

}


/* =========================================================
   CATEGORIAS
========================================================= */

const categorias =
    fs.readdirSync(
        pastaProjetos,
        {
            withFileTypes: true
        }
    );


/* =========================================================
   ARRAYS
========================================================= */

const imagens = [];

/*
 * Guarda o hash das imagens já encontradas.
 *
 * Se duas imagens tiverem exatamente o mesmo
 * conteúdo, somente a primeira será adicionada.
 */

const hashesVerificacao = new Set();


/*
 * Apenas para mostrar no terminal
 * quantas duplicadas foram ignoradas.
 */

let duplicadasIgnoradas = 0;


/* =========================================================
   PROCESSAR CATEGORIAS
========================================================= */

categorias.forEach(
    categoriaEntry => {

        /*
         * Ignora arquivos que estejam diretamente
         * dentro de images/projetos.
         */

        if (!categoriaEntry.isDirectory()) {
            return;
        }


        const categoria =
            categoriaEntry.name;


        const pastaCategoria =
            path.join(
                pastaProjetos,
                categoria
            );


        const arquivos =
            fs.readdirSync(
                pastaCategoria,
                {
                    withFileTypes: true
                }
            );


        /* =================================================
           PROCESSAR ARQUIVOS
        ================================================= */

        arquivos.forEach(
            arquivoEntry => {

                /*
                 * Somente arquivos.
                 */

                if (!arquivoEntry.isFile()) {
                    return;
                }


                /*
                 * Ignora arquivos ocultos.
                 *
                 * Exemplo:
                 * ._WhatsApp Image...
                 */

                if (
                    arquivoEntry.name.startsWith(".")
                ) {
                    return;
                }


                const extensao =
                    path.extname(
                        arquivoEntry.name
                    ).toLowerCase();


                /*
                 * Verifica extensão.
                 */

                if (
                    !extensoesPermitidas.includes(
                        extensao
                    )
                ) {
                    return;
                }


                const nomeArquivo =
                    arquivoEntry.name;


                const caminhoArquivo =
                    path.join(
                        pastaCategoria,
                        nomeArquivo
                    );


                /* =========================================
                   HASH DA IMAGEM
                ========================================= */

                let hash;

                try {

                    hash =
                        gerarHashArquivo(
                            caminhoArquivo
                        );

                } catch (erro) {

                    console.error(
                        `Erro ao ler: ${nomeArquivo}`
                    );

                    console.error(erro);

                    return;

                }


                /* =========================================
                   DUPLICIDADE REAL
                ========================================= */

                if (
                    hashesVerificacao.has(hash)
                ) {

                    duplicadasIgnoradas++;

                    console.log(
                        `Duplicada ignorada: ${nomeArquivo}`
                    );

                    return;

                }


                hashesVerificacao.add(hash);


                /* =========================================
                   CAMINHO WEB
                ========================================= */

                const caminhoRelativo =
                    path.join(
                        "images",
                        "projetos",
                        categoria,
                        nomeArquivo
                    );


                const caminhoWeb =
                    caminhoRelativo
                        .split(path.sep)
                        .join("/");


                /* =========================================
                   ADICIONAR IMAGEM
                ========================================= */

                imagens.push({

                    arquivo:
                        caminhoWeb,

                    categoria:
                        categoria

                });

            }
        );

    }
);


/* =========================================================
   ORDENAR
========================================================= */

imagens.sort(
    (a, b) => {

        const categoria =
            a.categoria.localeCompare(
                b.categoria,
                "pt-BR"
            );


        if (categoria !== 0) {
            return categoria;
        }


        return a.arquivo.localeCompare(
            b.arquivo,
            "pt-BR",
            {
                numeric: true
            }
        );

    }
);


/* =========================================================
   GERAR JSON
========================================================= */

fs.writeFileSync(
    arquivoJson,
    JSON.stringify(
        imagens,
        null,
        4
    ),
    "utf8"
);


/* =========================================================
   RESULTADO
========================================================= */

console.log("");

console.log(
    "=========================================="
);

console.log(
    " GALERIA GERADA COM SUCESSO"
);

console.log(
    "=========================================="
);

console.log(
    `Total de imagens adicionadas: ${imagens.length}`
);

console.log(
    `Duplicadas reais ignoradas: ${duplicadasIgnoradas}`
);

console.log(
    `Arquivo gerado: ${arquivoJson}`
);

console.log(
    "=========================================="
);

console.log("");
