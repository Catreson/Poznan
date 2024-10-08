// to make a bookmarklet loading this script
// javascript: (() => { var s = document.createElement('script'); s.type = 'text/javascript'; s.src = 'https://cdn.jsdelivr.net/gh/Catreson/Poznan/js_only.js'; document.getElementsByTagName('head')[0].append(s);})();
//
// 'https://cdn.jsdelivr.net/gh/Catreson/Poznan/js.js' // from "https://raw.githubusercontent.com/Catreson/Poznan/main/js_only.js", but github is not a CDN so using cdn.jsdelivr.com
// 
// making it this way so 'updates' requires push to github instead of editing the bookmarklet


// let's load css for the additional table
var cssId = 'myCss';
if (!document.getElementById(cssId))
{
    var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    link.id   = cssId;
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    //link.href = 'https://raw.githubusercontent.com/Catreson/Poznan/main/style.css'; // as above, using cdn
    link.href =  'https://cdn.jsdelivr.net/gh/Catreson/Poznan/style.css'
    link.media = 'all';
    head.appendChild(link);
}

// adding the upper table
var wId = 'sHviveTableWrapper';
var results = {}
if (!document.getElementById(wId))
{
    var body  = document.getElementsByTagName('body')[0];
    var wrapper  = document.createElement('div');
    wrapper.id   = wId;
    wrapper.innerHTML = `<div class="speedhive_fields" style="width:100%;">
        <label for="riders" style="width:50%">Rider: </label>
        <select name="riders" id="riders"></select>
        <button style="width:33.3%" onclick="UpdateRiderOptions();">Reload riders</button>
        <button style="width:33.3%" onclick="update();">Set</button>
      </div> 
    <div class="speedhive_butts" style="width:100%">
        <button style="width:33.3%" onclick="listen();" id="listen_button">Listen</button>
        <button style="width:33.3%" onclick="update();">Update</button>
        <button style="width:33.3%" onclick="download(results, 'wyniki.json', 'text/plain');">Download</button>
      </div> 
    <div class="speedhive_table" style="width:100%" id="speedhive_table">
        <table style="width:100%" id="speedhive_table_content">
            <tr>
              <th>Lap</th>
              <th>Sector 1</th>
              <th>Sector 2</th>
              <th>Sector 3</th>
              <th>Laptime</th>
            </tr>
          </table> 
      </div>`;
    body.insertBefore(wrapper, body.firstChild);

}


function listen(){
    // inicjalizujemy tablice z wynikami


// okreslamy funkcje ktora nam aktualizuje te tablice wynikow, jak cos to tutaj mozesz grzebac co wyciagac z danych
  document.getElementById('listen_button').style.background = "#3e8e41";
    let parseData = (d) => {
        let individual = d.arguments[0].results // tak jest to trzymane w message'ach websocketa
        individual.forEach((result) => {
        // result to obecny wynik pojedynczego zawodnika
        let tmpres = results[result.no+result.nam] || {}; // albo wyciagamy do aktualizacji albo inicjalizujemy pusty obiekt
        tmpres.pos = result.pos;
        tmpres.nam = result.nam;
        tmpres.lsTm = result.lsTm;
        tmpres.llap = result.ls; // to chyba okresla aktualne okrazenie
        if (results[result.no+result.nam]){
          tmpres.laps = results[result.no+result.nam]['laps'];
        }
        else {
          tmpres.laps = {};
        }
        
        sresults = {
            ls: result.ls,
            lsTm: result.lsTm,
            s0: result.s0,
            s1: result.s1,
            s2: result.s2,
            s3: result.s3,
            s4: result.s4,
        };
        // powyzej sa wyniki sektorowe w obecnym momencie, ponizej linijka na wywalenie undefined
        Object.keys(sresults).forEach(key => sresults[key] === undefined ? delete sresults[key] : {});
        // to jest linijka na "wez stare i zaktualizuj o nowe (sresults)"
        tmpres["laps"][result.ls] = {...tmpres["laps"][result.ls], ...sresults};
        // dopisujemy do sresultsow *
        Object.keys(sresults).forEach(key => sresults[key] = `*${sresults[key]}`);
        // uzupelniamy wyniki poprzedniego okrazenia o to, co jest w sresults
        // ogolnie chodzi o to, ze jak jest czas w ostatnim sektorze to juz okrazenie sie zmienia i w efekcie
        // tracilibysmy info o ostatnim sektorze albo byloby w niewlasciwym miejscu
        // ale czasem widzialem braki w danych wiec ta * na innym niz ostatni sektor oznacza brak danych
        tmpres["laps"][result.ls - 1] = {...sresults, ...tmpres["laps"][result.ls - 1]};
        results[result.no+result.nam] = tmpres;
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
} 

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(content)], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function UpdateRiderOptions() {
    var riderList = document.getElementById("riders");

    while (riderList.options.length) {
        riderList.remove(0);
    }

    var riders = Object.keys(results);
    if (riders) {
      var i;
      for (i = 0; i < riders.length; i++) {
        var rider = new Option(riders[i], i);
        riderList.options.add(rider);
      }
    }
}

function update() {
  let container = document.getElementById("speedhive_table_content");

  let inner = '<tr><th>ls</th><th>s0</th><th>s1</th><th>s2</th><th>lsTm</th></tr>';
  var sel = document.getElementById("riders");
  let laps = results[sel.options[sel.selectedIndex].text]["laps"];
  console.log(results[sel.options[sel.selectedIndex].text])
  Object.keys(laps).forEach((key) => {
              vals = laps[key]
              inner += `<tr><td>${vals["ls"]}</td><td>${vals["s0"]}</td><td>${vals["s1"]}</td><td>${vals["s2"]}</td><td>${vals["lsTm"]}</td></tr>`;
           });
    container.innerHTML = inner;
}