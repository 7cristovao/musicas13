# Jingles Lula

Landing page simples (HTML + CSS + JavaScript) para ouvir e baixar os jingles da pasta `audios/`.

## Estrutura

```
jinglesLula/
├─ index.html
├─ styles.css
├─ script.js
└─ audios/
   ├─ boraLula.mp3
   ├─ botaPraVirar.mp3
   ├─ Eh13ComNomesDeEstados.mp3
   ├─ jingleEh13.mp3
   ├─ LulaEhOCara.mp3
   ├─ musicasPraCarreata.mp3
   ├─ trezeTodaVida.mp3
   └─ tropaDo13.mp3
```

## Como usar

Dê um duplo clique em `index.html`.

> Para que o botão **Baixar** funcione 100% (salvar o arquivo em vez de abrir no navegador),
> abra a pasta por um servidor local:
>
> ```bash
> python -m http.server 8000
> ```
>
> Depois acesse http://localhost:8000

## Adicionar novos áudios

1. Coloque o arquivo `.mp3` dentro de `audios/`.
2. Abra `script.js` e adicione uma linha no array `AUDIOS`:

```js
{ file: 'novoJingle.mp3', title: 'Novo Jingle' },
```

## Atalhos

- `/` — focar a busca
- `Espaço` — pausar / continuar
