var parameter = 'matchesWon', radius = 35, padding = 2, cols = 17;
var Year_Range = 2004;
var Year_initialstart = 2014;
var player_profile = new Map();
var matchdata_json = [];
var year_data = new Map();
var menu = [
  {id: 'matchesWon', name: 'Matches won'},
  {id: 'aces', name: 'Aces'},
  {id: 'doubles', name: 'Double Fautls'},
  {id: 'winners', name: 'Winner Pts'},
  {id: 'errors', name: 'Error Pts'},
  {id: 'totals', name: 'Total Pts'}
];
function nameId(d) {
  return d.name.replace(/[\., ]/g, '');
}

function fullname(d) {
  var s = d.name.split(' ');
  return s.length === 3 ? s[2] + ' ' + s[0] + ' ' + s[1] : s[1] + ' ' + s[0];
}

function surname(d) {
  return d.name.split(' ')[1];
}

function translateSVG(x, y) {
  return 'translate('+x+','+y+')';
}

function playerSelect(d) {
  if(parameter === d.id)
    return;

  d3.select('#menu').selectAll('div').classed('selected', false);
  d3.select(this).classed('selected', true);

  parameter = d.id;

  visualize();
}

function selectThis(d) {
  d3.select(this).classed('selected', function() {return !d3.select(this).classed('selected');})
}

function changeYear() {
  loadData(); 
}

function visualize() {
  
  var players = d3.select('#chart')
    .selectAll('div.player')
    .sort(function(a, b) {return parameter === 'doubles' ? d3.ascending(a[parameter], b[parameter]) : d3.descending(a[parameter], b[parameter]);})
    .transition()
    .duration(1000)
    .style('left', function(d, i) {
      var col = i % cols;
      var x = 2 * col * (radius + padding);
      return x + 'px';
    })
    .style('top', function(d, i) {
      var row = Math.floor(i / cols);
      var y = 2 * row * (radius + padding);
      return y + 'px';
    });

  d3.select('#chart')
    .selectAll('div.player .value')
    .transition()
    .duration(1000)
    .tween("text", function(d) {
      
      var i = d3.interpolate(this.textContent, d[parameter]);
      return function(t) {
          this.textContent = Math.round(i(t));
      };
    });
}

function addPlayerInfo (row, number) {
  let name = row['player'+ number];
  let val = {};
  if (player_profile.has(name)) {
    val = player_profile.get(name);
    val.matchesPlayed++;
    val.doubles += Number(row['double' + number]);
    val.aces+= Number(row['ace' + number]);
    val.winner+= Number(row['winner' + number]);
    val.error+= Number(row['error' + number]);
    val.total+= Number(row['total' + number]);
    if (row.winner == name) { // if player1 is the winner
      val.matchesWon++;
    }
  }
  else {
    val['matchesWon'] = row.winner == name ? 1 : 0;
    val['matchesPlayed'] = 1;
    val['doubles'] = Number(row['double' + number]);
    val['aces'] = Number(row['ace' + number]);
    val['winners']= Number(row['winner' + number]);
    val['errors']= Number(row['error' + number]);
    val['totals']= Number(row['total' + number]);
    val['name'] = name;
  }
  player_profile.set(name, val);
}

function loadData() {
  
  player_profile.clear();
  matchdata_json = [];
  Year_initialstart = document.getElementById('select-year').value;

  for (row of year_data.get(Year_initialstart)) {
    addPlayerInfo(row, 1);
    addPlayerInfo(row, 2);
  }

  for (player of player_profile.values()) {
    console.log(player);
    matchdata_json.push(player);
  }
  
  
  d3.select('#chart').selectAll('div').remove();
  
  var players = d3.select('#chart')
    .selectAll('div')
    .data(matchdata_json)
    .enter()
    .append('div')
    .attr('id', function(d) {return 'player-'+nameId(d);})
    .classed('player', true)
    .style('width', 2 * radius + 'px')
    .style('height', 2 * radius + 'px')
    .on('click', selectThis);

  players
    .append('div')
    .classed('name', true)
    .text(function(d) {return surname(d).slice(0, 20);})
    .style('width', 2 * radius);

  players
    .append('div')
    .classed('value', true)
    .text(function(d) {return d[parameter];})
    .style('width', 2 * radius);

  visualize();
}

function initChart() {
  d3.csv('data.csv', function(err, data) {
  
    for (row of data) {
      if (year_data.has(row.year)) {
        let val = year_data.get(row.year);
        val.push(row);
        year_data.set(row.year, val);
      } else {
        year_data.set(row.year, [row]);
      }
    }
    
    loadData();
  });
}
  
window.onload = function(){
  initChart();
  d3.select('#menu')
      .selectAll('div')
      .data(menu)
      .enter()
      .append('div')
      .text(function(d) {return d.name;})
      .classed('selected', function(d, i) {return i==0;})
      .on('click', playerSelect);
};
    
