window.onload = function() { load() };

var ocua_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1dxxBgpZ_T5QdLxb6OvY9pH2xuUyNpM8yr5ncUjiGHqQ/pubhtml'
var spreadsheetData; // global var where the spreadsheet data will be stored after it is fetched
var playerNames; // global var containing all the player names for autocomplete

/**
 * Global Chart Config
 */
var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 1080 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var x1 = d3.scale.ordinal();

var y = d3.scale.linear()
    .range([height, 0]);

var klass = d3.scale.ordinal()
    .range(["playerA", "playerB"]);

var xAxis = d3.svg.axis()
    .scale(x0)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function load(){
  Tabletop.init({ key: ocua_spreadsheet_url,
                  callback: init,
                  simpleSheet: false })
}


function init(data, tabletop){
  spreadsheetData = data;

  setName = getURLParameter('set') || _.last(_.keys(spreadsheetData));

  playerNames = _.pluck(spreadsheetData[setName].elements, 'playersname');

  // toggle loading state
  $("div#app > div#loading").hide();
  $("div#app > div#loaded").show();

  initDataDropdown();
  $('#dataDropdown #btn-text').text(setName);

  reRender();
}


function initDataDropdown(){
  dataSetNames = _.keys(spreadsheetData)

  var node = $('#dataDropdown > ul.dropdown-menu ');
  dataSetNames.forEach(function(name){
    li = "\
      <li>\
        <a href='#'>\
        " + name + "\
        </a>\
      </li>\
    ";
    node.append(li);
  });

  /*
   * Data Set Changed Handler
   */
  $("#dataDropdown li a").click(function(event){
    setName = $(event.target).text().trim();
    $('#dataDropdown #btn-text').text(setName);
    reRender();
    event.preventDefault();
  });
}

function reRender(){
  setName = $('#dataDropdown #btn-text').text();

  // get url params if any
  playerAName = getURLParameter('playerA') || 'Male Average';
  playerBName = getURLParameter('playerB') || 'Female Average';

  // get the players
  var playerAData = _.find(spreadsheetData[setName].elements, function(player){ return player.playersname == playerAName});
  var playerBData = _.find(spreadsheetData[setName].elements, function(player){ return player.playersname == playerBName});

  var playerA = {
    name: playerAData.playersname,
    stats: transformPlayerData(playerAData)
  };

  var playerB = {
    name: playerBData.playersname,
    stats: transformPlayerData(playerBData)
  };

  // graph and set the input state
  graphPlayers(playerA, playerB);
  appPushState(setName, playerA, playerB);
  $('input#playerA').typeahead('val', playerA.name);
  $('input#playerB').typeahead('val', playerB.name);
}

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

/*
 * typeahead.js matcher
 */
var playerNameMatcher = function(){
  return function findMatches(q, cb) {
    var matches, substrRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(playerNames, function(i, str) {
      if (substrRegex.test(str)) {
        // the typeahead jQuery plugin expects suggestions to a
        // JavaScript object, refer to typeahead docs for more info
        matches.push({ value: str });
      }
    });

    cb(matches);
  };
};


$("input.typeahead").on("focus", function(event){
  $(event.target).val('');
});


$('input.typeahead').typeahead({
  hint: true,
  highlight: true,
  minLength: 1
},
{
  name: 'players',
  displayKey: 'value',
  source: playerNameMatcher()
});


$("input.typeahead").on("typeahead:closed", function(event){
  updatePlayerEvent(event);
});


$("input.typeahead").on("blur", function(event){
  updatePlayerEvent(event);
});


function updatePlayerEvent(event) {
  var setName = $('#dataDropdown #btn-text').text();

  var playerAName = $("input#playerA").val();
  var playerAData = _.find(spreadsheetData[setName].elements, function(player){ return player.playersname == playerAName});


  var playerBName = $("input#playerB").val();
  var playerBData = _.find(spreadsheetData[setName].elements, function(player){ return player.playersname == playerBName});

  if(playerAData && playerBData){
    playerA = {
      name: playerAName,
      stats: transformPlayerData(playerAData)
    }

    playerB = {
      name: playerBName,
      stats: transformPlayerData(playerBData)
    }

    appPushState(setName, playerA, playerB);
    graphPlayers(playerA, playerB);
  }
}


function appPushState(setName, playerA, playerB){
  url = window.location.protocol
      + "//"
      + window.location.host
      + window.location.pathname
      + "?set=" + setName + "&playerA=" + playerA.name + "&playerB=" + playerB.name;

  history.pushState(null, '', url);
}


/*
 * Transforms the data from a spreadsheet row into
 * a useable JS object for plotting
 */
function transformPlayerData(data){
  function transformPercent(str){
    return str.substring(0, str.length - 1) / 10.0;
  }

  function transformSalary(str){
    return str.replace(/\D/g,'') / 50000.0;
  }

  return [
    {name: "G", value: +data.g},
    {name: "A", value: +data.a},
    {name: "2A", value: +data.a_2},
    {name: "3A", value: +data.a_3},
    {name: "4A", value: +data.a_4},
    {name: "5A", value: +data.a_5},
    {name: "D", value: +data.d},
    {name: "Comp.", value: +data['comp.']},
    {name: "TA", value: +data.ta},
    {name: "TD", value: +data.threwdrop},
    {name: "Throwing %", value: transformPercent(data.throwing)},
    {name: "Catch", value: +data.catch},
    {name: "Drop", value: +data.drop},
    {name: "Catching %", value: transformPercent(data.catching)},
    {name: "PF", value: +data.pointsfor},
    {name: "PA", value: +data.pointsagainst},
    {name: "Salary", value: transformSalary(data.previoussalary)},
    {name: "New Salary", value: transformSalary(data.nextweekssalary)},
  ];
}


/*
 * Transforms the data the plotted JS object
 * into a readable form for the rect tooltip
 */
function untransformPlayerData(d){
  var name = {
    "G": "Goals",
    "A": "Assists",
    "2A": "2nd Assists",
    "3A": "3rd Assists",
    "4A": "4th Assists",
    "5A": "5th Assists",
    "D": "Defenses",
    "Comp.": "Completions",
    "TA": "Throw Aways",
    "TD": "Threw Drops",
    "Throwing %": "Throwing",
    "Catch": "Catches",
    "Drop": "Drops",
    "Catching %": "Catching",
    "PF": "Points for",
    "PA": "Points against",
    "Salary": "Salary",
    "New Salary": "New Salary"
  }[d.name];

  var value = d.value
  if(d.name == "Throwing %" || d.name == "Catching %") { value = (value*10) + '%'; }
  if(d.name == "Salary" || d.name == "New Salary") { value =  '$' + (value*50000.0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

  return {name: name, value: value}
}


function graphPlayers(playerA, playerB){
  if(chart.selectAll('*') == 0) {
    _initGraphPlayers(playerA, playerB)
  } else {
    _updateGraphPlayers(playerA, playerB)
  }
}

function _initGraphPlayers(playerA, playerB){
  // assemble data
  data = []
  for (i = 0; i < playerA.stats.length; i++) {
    var stat = playerA.stats[i].name;
    var playerAStat = playerA.stats[i].value;
    var playerBStat = playerB.stats[i].value;

    data.push({name: stat, playerA: playerAStat, playerB: playerBStat });
  }

  // scale
  y.domain([0, d3.max(data, function(d) { return Math.max(d.playerA, d.playerB); })]);
  x0.domain(data.map(function(d) { return d.name; }));
  x1.domain(['playerA', 'playerB']).rangeRoundBands([0, x0.rangeBand()]);

  // create the x axis
  chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // create the y axis
  chart.append("g")
      .attr("class", "y axis")
      .call(yAxis)

  // tooltip
  var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
         ud = untransformPlayerData(d);
         return "<span class=" + d.player +">" + ud.name + ": " + ud.value + "</span>";
       });

  chart.call(tip);

  // create the rectangles for each stat
  var stats = chart.selectAll(".stat")
    .data(data)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x0(d.name) + ",0)"; });

  // create the rectangles for each player in each stat
  stats.selectAll("rect")
      .data(function(d) { return [{player: 'playerA', name: d.name, value: d.playerA}, {player: 'playerB', name: d.name, value: d.playerB}] })
    .enter().append("rect")
      .attr("class", function(d) { return klass(d.player); })
      .attr("width", x1.rangeBand())
      .attr("x", function(d) { return x1(d.player); })
      .attr("y", height)
      .attr("height", 0)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
    .transition()
      .duration(200)
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); });
}


function _updateGraphPlayers(playerA, playerB){
  // assemble data
  data = []
  for (i = 0; i < playerA.stats.length; i++) {
    var stat = playerA.stats[i].name;
    var playerAStat = playerA.stats[i].value;
    var playerBStat = playerB.stats[i].value;

    data.push({name: stat, player: 'playerA', value: playerAStat});
    data.push({name: stat, player: 'playerB', value: playerBStat});
  }

  // re-scale
  y.domain([0, d3.max(data, function(d) { return (d.value); })]);

  // animate update
  chart.selectAll("rect")
    .data(data)
    .transition()
      .duration(200)
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); });
}
