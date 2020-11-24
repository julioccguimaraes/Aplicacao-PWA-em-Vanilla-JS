'use strict'

if('serviceWorker' in navigator) {
    const success = () => console.log('[Service Worker] registered');
    const failed = () => console.log('[Service Worker] registration failed');

    navigator.serviceWorker
        .register('sw.js')
        .then(success)
        .catch(failed);
}

var clearCache;

document.getElementById('ptax-btn').addEventListener('click', function(event) {
    event.preventDefault();

    document.getElementById('ptax-value').innerHTML = '';
    
    // obtém 7 dias de cotação do dólar
    let finalDate = new Date();

    let initialDate = new Date(finalDate); 
    initialDate.setDate(initialDate.getDate() - 8);  

    let initialDateStr = (initialDate.getMonth() + 1) + '-' + initialDate.getDate() + '-' + initialDate.getFullYear();
    let finalDateStr = (finalDate.getMonth() + 1)  + '-' + finalDate.getDate() + '-' + finalDate.getFullYear();

    const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@dataInicial='${initialDateStr}'&@dataFinalCotacao='${finalDateStr}'&$top=100&$format=json`;

    const timeout = 2000;

    fetch(url)
        .then(function(response) {
            if (response.status !== 200) {
                console.log('Status error:' + response.status);
                return;
            }

            response.json().then(function(data) {
                console.log(data.value);

                // filtrando e exibindo o valor atual do dólar
                let dollarValue = data.value[ Object.keys(data.value).sort().pop() ];

                let html = 
                    `<p>Cotação do dólar: ${dollarValue.cotacaoCompra} <br/>
                     Data da Cotação: ${dollarValue.dataHoraCotacao}</p>`
                
                document.getElementById('ptax-value').innerHTML = html;

                // armazena em cache
                const ptaxData = new Response(JSON.stringify(data), {
                    headers: {
                    'content-type': 'application/json'
                    }
                });            

                caches.open('app-shell-v2')
                    .then(cache => cache
                    .put(url, ptaxData));
            });
        })
        .catch(function(error) {
            console.log('Fetch Error:', error);
        });

    if(clearCache !== undefined) {
        clearTimeout(clearCache);
    }
    
    // apaga o cache após 2 segundos
    clearCache = setTimeout(() => {
        caches
        .open('app-shell-v2')
        .then(function(cache) {
            cache
            .delete(url)
            .then(() => {
                console.log('Cache da API do BCB removido');
            })            
        })
    }, timeout); 
});
