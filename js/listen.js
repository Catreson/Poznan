// inicjalizujemy tablice z wynikami
let results = {}

// okreslamy funkcje ktora nam aktualizuje te tablice wynikow, jak cos to tutaj mozesz grzebac co wyciagac z danych
let parseData = (d) => {
  let individual = d.arguments[0].results // tak jest to trzymane w message'ach websocketa
  individual.forEach((result) => {
    // result to obecny wynik pojedynczego zawodnika
    let tmpres = results[result.no+result.nam] || {} // albo wyciagamy do aktualizacji albo inicjalizujemy pusty obiekt
    tmpres.pos = result.pos
    tmpres.nam = result.nam
    tmpres.lsTm = result.lsTm
    tmpres.llap = result.ls // to chyba okresla aktualne okrazenie
    sresults = {
      ls: result.ls,
      lsTm: result.lsTm,
      s0: result.s0,
      s1: result.s1,
      s2: result.s2,
      s3: result.s3,
      s4: result.s4,
    }
    // powyzej sa wyniki sektorowe w obecnym momencie, ponizej linijka na wywalenie undefined
    Object.keys(sresults).forEach(key => sresults[key] === undefined ? delete sresults[key] : {});
    // to jest linijka na "wez stare i zaktualizuj o nowe (sresults)"
    tmpres[result.ls] = {...tmpres[result.ls], ...sresults}
    // dopisujemy do sresultsow *
    Object.keys(sresults).forEach(key => sresults[key] = `*${sresults[key]}`);
    // uzupelniamy wyniki poprzedniego okrazenia o to, co jest w sresults
    // ogolnie chodzi o to, ze jak jest czas w ostatnim sektorze to juz okrazenie sie zmienia i w efekcie
    // tracilibysmy info o ostatnim sektorze albo byloby w niewlasciwym miejscu
    // ale czasem widzialem braki w danych wiec ta * na innym niz ostatni sektor oznacza brak danych
    tmpres[result.ls - 1] = {...sresults, ...tmpres[result.ls - 1]}
    results[result.no+result.nam] = tmpres
  })
}

// hack na podpiecie sie do istniejacego websocketa
const originalSend = WebSocket.prototype.send;
window.sockets = [];
WebSocket.prototype.send = function(...args) {
  if (window.sockets.indexOf(this) === -1) {
    window.sockets.push(this);
    ws = this;
    // tutaj zaczynamy wpinac sie w to, co ws ma robic z kazda nowa wiadomoscia
    let originalOM = ws.onmessage;
    ws.onmessage = function(...args) {
      let data = args[0].data;
      data = data.substring(0, data.length - 1); // kazdy mesasge mial jakis gownokontrolny znak
      data = JSON.parse(data)
      // 1 to aktualizacje danych, ale tez statsow wiec sprawdzamy target
      // 6 to healthcheck czy polaczenie jest aktywne
      // ogolnie mozesz wbic w network, odfiltrowac ws, zajrzec w messages i poczytac co tam lata
      if(data.type=='1' && data.target == 'resultsForSessionReceived') {
        parseData(data)
        // wyswietlanie obecnego stanu. jak chcesz to mozna to wywalic i po prostu na zakonczenie
        // w konsoli wpisac results i zobaczyc co nam odpowie
        console.log(results)
      }
      return originalOM.call(this, ...args)
    }
  }
  return originalSend.call(this, ...args);
};