const features = [
    'autoAceitarPreReady',
    'autoCopiarIp',
    'autoAceitarReady',
    'autoFixarMenuLobby',
    'autoConcordarTermosRanked'
];
const paginas = [
    'geral',
    'contato',
    'sobre'
]
function iniciarPaginaOpcoes() {
    marcarCheckboxes();
    adicionarListenersFeatures();
    adicionarListenersPaginas();
}
function marcarCheckboxes() {
    chrome.storage.sync.get(null, (response) => {
        if (!response) return false;
        for (const feature of features) {
            document.getElementById(feature).checked = response[feature];
        }
    });
}
function adicionarListenersFeatures() {
    for (const feature of features) {
        document.getElementById(feature).addEventListener('change', function (e) {
            console.log(feature, 'changed');
            chrome.storage.sync.set({ [feature]: this.checked }, function () {});
        });
    }
}

function adicionarListenersPaginas() {
    for (const pagina of paginas) {
        document.getElementById(`link-${pagina}`).addEventListener('click', function (e) {
            abrirPagina(pagina);
        });
    }
}
function abrirPagina(pagina) {
    const link = document.getElementById(`link-${pagina}`);
    const paginaAtiva = document.getElementById(pagina);
    
    Array.from(document.getElementsByClassName('ativo')).forEach((el) => {
        el.classList.remove("ativo");
    });

    Array.from(document.getElementsByClassName('active')).forEach((el) => {
        el.classList.remove("active");
    });

    link.classList.add('active');
    paginaAtiva.classList.add('ativo');
}

iniciarPaginaOpcoes();