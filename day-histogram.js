var margin = {top: 30, right: 20, bottom: 90, left: 40},
    width = 2000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Parse the date / time
var	parseDate = d3.time.format("%Y-%m").parse;

var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format("%a, %d-%m-%Y"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

d3.csv("NumArticlesByDay.csv", function(error, data) {

    data.forEach(function(d) {
        if ("majorEvent" in d) {
          console.log("Major event: ", d.majorEvent)
        }
        //console.log("Date now: ", d.date)
        d.date = new Date(d.date);
        //console.log("Date now: ", d.date)
        //console.log("Value now: ", d.value)
        d.value = +d.value;
        //console.log("Value after change: ", d.value)
    });

  x.domain(data.map(function(d) { return d.date; }));
  y.domain([0, d3.max(data, function(d) { return d.value; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Value ($)");


  svg.selectAll("bar")
      .data(data)
    .enter().append("rect")
      .style("fill", function(d) { if (d.majorEvent != "") {bar_color =  "FireBrick";} else{ bar_color = "steelblue";}
    return bar_color})
      .attr("x", function(d) { return x(d.date); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })


      svg.selectAll("bar")
          .data(data)
        .enter().append("text")
        .text(function(d) { return d.majorEvent; })
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "white");
});
