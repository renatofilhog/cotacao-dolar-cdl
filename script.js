(async function(window, document) {
'use strict';

var $usd = document.getElementById('usd');
var $brl = document.getElementById('brl');
var $cotcao = document.getElementById('cotacao');

function onReceiveData(response) {
    try {
        $cotcao.value = numToStr(response.conteudo[0].valorVenda);
    }
    catch(e) {
        $usd.value = 'Erro';
        $brl.value = 'Erro';
        return;
    }

    $usd.removeAttribute('disabled');
    $brl.removeAttribute('disabled');

    var hash = location.hash.slice(1);
    if (hash) {
        var query = queryStringParse(hash);
        if (query.dolar) {
            $usd.value = query.dolar;
            usdToBrl();
            $usd.focus();
        }
        else if (query.real) {
            $brl.value = query.real;
            brlToUsd();
            $brl.focus();
        }
    }
    else {
        $usd.value = '1,00';
        usdToBrl();
        $usd.focus();
    }
};

function strToNum(str) {
    return +str.replace(',', '.');
}

function numToStr(num) {
    return ('' + num).replace('.', ',');
}

function queryStringParse(q) {
    var vars = q.split('&'),
        result = {},
        part,
        key, value;

    for (var i = 0, len = vars.length; i < len; i++) {
        part = vars[i].split('=');

        key = (part[0] && decodeURIComponent(part[0])) || '';
        value = (part[1] && decodeURIComponent(part[1])) || '';

        if (key) {
            result[key] = value;
        }
    }

    return result;
}

function getDollar() {
    return strToNum($cotcao.value);
}

function usdToBrl() {
    var usd = strToNum($usd.value);
    var value = usd * getDollar();
    value = round(value);
    if (isNaN(value)) {
        return;
    }
    $brl.value = numToStr(value);

    location.replace('#dolar=' + $usd.value);
}

function brlToUsd() {
    var value = strToNum($brl.value);
    value /= getDollar();
    value = round(value);

    if (isNaN(value)) {
        return;
    }

    $usd.value = numToStr(value);

    location.replace('#real=' + $brl.value);
}

function round(value) {
    value = +(Math.round(value + "e+2")  + "e-2");
    return value.toFixed(2);
}

function zero(n) {
    return n < 10 ? '0' + n : n;
}

function onInput(obj, callback) {
    obj.addEventListener('input', function() {
        callback();
    });
}

onInput($usd, usdToBrl);
onInput($brl, brlToUsd);
onInput($cotcao, usdToBrl);

var d = new Date();
var nocache = '' + d.getFullYear() +
    zero(d.getMonth() + 1) +
    zero(d.getDate()) +
    zero(d.getHours());

let resp = await fetch('https://www.bcb.gov.br/api/conteudo/pt-br/PAINEL_INDICADORES/cambio?'+ nocache)
    .then(response => response.json())
    .catch(err => console.log(err));

onReceiveData(resp);
})(window, document);
