import { log } from '../../lib/dom';
const SELETOR_LINK_PARTIDAS = 'a:contains("Ver partida")';

const buscaLinksDasPartidas = () => {
  const partidas = [];
  $( SELETOR_LINK_PARTIDAS ).each( function () {
    partidas.push( this.href );
  } );
  return partidas;
};

const verificarBans = async ( partida, statsColumns, retries = 0 ) => {
  if ( retries > 3 ) {
    return;
  }
  try {
    const resposta = await fetch( partida + '/1' );
    const dadosPartida = await resposta.json();

    const pontos = dadosPartida.jogos.xpChange;
    const pontosSpan = $( `<span>${pontos}</span>` )
      .css( { 'color': pontos > 0 ? 'green' : 'red', 'font-size': '20px', display: 'block' } )
      .attr( 'title', 'Seus pontos nessa partida' );
    $( statsColumns ).prev().find( '.versus' ).css( { 'line-height': '0' } );
    $( statsColumns ).prev().find( '.versus' ).parent().prepend( pontosSpan );

    const temBanidos =
      dadosPartida.jogos.players.team_a.some( jogador => jogador.player.banned ) ||
      dadosPartida.jogos.players.team_b.some( jogador => jogador.player.banned );
    if ( temBanidos ) {
      $( statsColumns ).children( '.medium-offset-1' ).removeClass( 'medium-offset-1' );
      $( statsColumns ).prepend(
        $( '<div></div>' )
          .addClass( 'columns medium-1' )
          .attr( 'title', 'Esta partida possui jogador banido' )
          .append(
            $( '<i></i>' )
              .addClass( 'fa fa-exclamation-triangle' )
              .attr( 'aria-hidden', true )
              .css( { 'color': 'red', 'font-size': '35px', 'margin-top': '5px' } )
          )
      );
    } else {
      $( statsColumns ).children( '.medium-offset-1' ).removeClass( 'medium-offset-1' );
      $( statsColumns ).prepend(
        $( '<div></div>' )
          .addClass( 'columns medium-1' )
          .attr( 'title', 'Não há jogadores banidos nesta partida' )
          .append(
            $( '<i></i>' )
              .addClass( 'fa fa-check-circle' )
              .attr( 'aria-hidden', true )
              .css( { 'color': 'green', 'font-size': '35px', 'margin-top': '5px' } )
          )
      );
    }
  } catch ( e ) {
    log( 'Fetch errored, trying again.' );
    return setTimeout( async () => {
      verificarBans( partida, statsColumns, retries + 1 );
    }, 1000 );
  }
};

// content.js
const initVerificarBans = async () => {
  const partidas = buscaLinksDasPartidas();
  const statsColumns = $( SELETOR_LINK_PARTIDAS ).parent().parent();
  let waitTime = 0;
  const promises = partidas.map( ( partida, index ) => {
    waitTime += 100;
    return setTimeout( async () => {
      return verificarBans( partida, statsColumns[index] );
    }, waitTime );
  } );
  await Promise.all( promises );
};
const colorirPartidas = () => {
  const matches = $( '.match.columns' );
  matches.each( function () {
    let placarMeuTime;
    let placarAdversario;
    let cor;
    if ( this.children[2].children.length > 1 ) {
      placarMeuTime = +this.children[3].textContent || +this.children[4].textContent;
      placarAdversario = +this.children[5].textContent || +this.children[6].textContent;
    } else {
      placarMeuTime = +this.children[5].textContent || +this.children[6].textContent;
      placarAdversario = +this.children[3].textContent || +this.children[4].textContent;
    }
    if ( placarMeuTime > placarAdversario ) {
      cor = 'rgba(22,229,180,.25) 0';
    } else if ( placarMeuTime < placarAdversario ) {
      cor = 'rgba(220,20,0,.25) 0';
    } else {
      cor = '#cdcf57';
    }
    this.style = `background-image: linear-gradient(90deg, ${cor},transparent 40%);`;
  } );
};
( async () => {
  $( 'body' ).on( 'change', '#dateFilterMatches, #myMatchesPagination .block-mobile', async function () {
    await new Promise( r => setTimeout( r, 3000 ) );
    initVerificarBans();
    colorirPartidas();
  } );
  $( 'body' ).on( 'click', '#myMatchesPagination', async function () {
    await new Promise( r => setTimeout( r, 3000 ) );
    initVerificarBans();
    colorirPartidas();
  } );
  await new Promise( r => setTimeout( r, 3000 ) );
  colorirPartidas();
  await initVerificarBans();

} )();
