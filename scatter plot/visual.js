var data = [];

var width = 2500;
var height = 1250;

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

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


//define row information
function row(d) {
  return {
    year: +d.year,
    doubles: +d.doubles,
    player: d.player,
    fastserve: +d.fastserve
  };
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


//load csv file
d3.csv("data.csv", row, function(error, csv_data){
    csv_data.forEach(function (d) {
        data.push({ year: d.year, doubles: d.doubles, player: d.player, fastserve: d.fastserve });
    });

    // Define the div for the tooltip
    var div = d3.select("body").append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);

    var scale_fastserve = d3.scale.linear()
                    .domain([235, 195])
                    .range([0, 1100]);
                                

    var scale_doubles = d3.scale.linear()
                    .domain([0, 35])
                    .range([0, 1600]);                

    var data_svg = d3.select(".chart")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform","translate(600,5)");

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

    //Showing the X-axis showing doubles and Y-axis showing fast serve speed                
    var xAxis = d3.svg.axis().scale(scale_doubles).outerTickSize(3).orient("bottom").tickFormat(d3.format("d"));
    var yAxis = d3.svg.axis().scale(scale_fastserve).orient("left").outerTickSize(3);

    data_svg.append("svg:g")
            .call(xAxis)
            .attr("transform", "translate(40,1150)")
            .style("font-size","20px")
            .style("font-family", "verdana")
            .style("fill","orange");
    data_svg.append("text")     //text label for y axis   
            .attr("transform", "rotate(-90)")
            .attr("dx", "-7em")
            .attr("dy", "2em")
            .text("Fastest Serve ")
            .style("text-anchor", "middle")
            .style("font-size","40px")
            .style("font-family", "verdana")
            .style("fill","orange");  
        data_svg.append("svg:g")
            .call(yAxis)
            .attr("transform", "translate(40,50)")
            .style("font-size","15px")
            .style("font-family", "verdana")
            .style("fill","orange");
        data_svg.append("text")      // text label for the x axis
            .attr("transform", "translate(1560,1130)")
            .style("text-anchor", "middle")
            .text("# Double Faults")
            .style("font-size","40px")
            .style("font-family", "verdana")
            .style("fill","orange");

                                          

    //var colorScale = d3.scale.category10(); 

    var colorScale = d3.scale.ordinal()
                                .domain(["Andy Roddick", "Andy Murray", "Roger Fedrer", 
                                        "Rafal Nadal", "Novak Djokovic", "Marat Safin", 
                                        "Juan Carlos Ferrero", "Lleyton Hewitt", "Marcos Baghdatis", 
                                        "Nicolas Kiefer"," Fernando Gonzalez"," Tommy Haas", 
                                        " Jo-Wilfried Tsonga", "Fernando Verdasco", "Stanislas Wawrinka"])
                                
                                .range(["#c0392b", " #9b59b6 " , "2980b9 ", "#3498db", "#48c9b0", " #28b463 ", 
                                    " #f1c40f ", " #d35400 ", "#7b7d7d ", " #2e4053"," #7B3F00", " #BCE937",
                                         " #2ACAFF", " #CC00FF", "#F8171B "]);

    var radiusScale = d3.scale.linear().domain([0, 20]).range([20, 100]);

    function color(d) {
        return d.player;
    }
    function radius(d) {
        return 0.5;
    }
    

    // Defines a sort order so that the smallest dots are drawn on top.
    function order(a, b) {
        return radius(b) - radius(a);
    }

    var data_g = data_svg.selectAll("circle")
        .data(data)
        .enter()
        .append("g");

    var hover_text = data_svg.append("text")      // Onhover diplaying player's name
                            .attr("transform", "translate(600,135)")
                            .attr("width", "200px")
                            .attr("height", "100px")
                            .style("text-anchor", "end")
                            .style("fill","#ff0000"); 

    // adding linear line
    //data_g.append("line")
    //    .attr("x1", scale_doubles(5))
      //  .attr("y1", scale_fastserve(200))
        //.attr("x2", scale_doubles(34))
        //.attr("y2", scale_fastserve(235))
        //.attr("stroke-width", 15)
        //.attr("stroke", "#f0f0f0")
        //.style("z-index",-100);                           

    var data_circles = data_g.append("circle")
        .attr("cx", function(d) {
            return 30 + scale_doubles(d.doubles);
        })
        .attr("opacity", 0.4)
        .attr("cy", function(d) {
            return scale_fastserve(d.fastserve) + 40;
        })
        .attr("r", function(d) {
            return radiusScale(radius(d));
        })
        .style("fill", function (d) {
            return colorScale(color(d));
        })
        .attr('class',function(d){
            return d.player.replace(' ','_');
        })
        .on("mouseover", function(d) {
            d3.selectAll("." +d.player.replace(' ','_'))
                .moveToFront()
                .style("opacity", 1); 

            d3.selectAll("circle:not(." +d.player.replace(' ','_') +")")
                .moveToFront()
                .style("opacity", 0.2); 

            div.transition()        
                .duration(1)      
                .style("opacity", 0.9); 

            div .html("Double Faults # : " + d.doubles + "<br/>Fastest Serve  "  + d.fastserve) 
                .style("left", (d3.event.pageX - 35) + "px")     
                .style("top", (d3.event.pageY + 28) + "px");

            hover_text.text(d.player)
                .style("text-anchor", "middle")
                .style("font-size","100px")
                .style("font-family", "verdana")
                .style("opacity", 0.2);              
        })
        .on("mouseout", function(d) {
            d3.selectAll("circle")
                .style("opacity", 0.2)
                .style("z-index",0);

            div.transition()        
                .duration(1000)      
                .style("opacity", 0);

            hover_text.text("");            
        })
        .sort(order);                                                
 
});



