function renderMentionsBarChart(data) {
  var svg = d3.select("#mentions-bar-chart svg"),
      margin = {top: 20, right: 20, bottom: 30, left: 100},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

  var tooltip = d3.select("#mentions-bar-chart")
    .append("div")
    .attr("class", "toolTip");

  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleBand().range([height, 0]);

  var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    data.sort(function(a, b) { return a.mentions - b.mentions; });
    console.log(data)

  x.domain([0, d3.max(data, function(d) { return +d.mentions; }) * 1.05]);
  y.domain(data.map(function(d) { return d.candidate; })).padding(0.4);

  g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(5).tickFormat(function(d) { return parseInt(d); }).tickSizeInner([-height]));

  g.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y));

  g.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("height", y.bandwidth())
      .attr("y", function(d) { return y(d.candidate); })
      .attr("width", function(d) { return x(d.mentions); })
      .attr("fill", "#012989")
      .attr("opacity", "0.85")
      .on("mousemove", function(d){
        tooltip
          .style("left", d3.event.pageX - 50 + "px")
          .style("top", d3.event.pageY - 70 + "px")
          .style("display", "inline-block")
          .html((d.candidate) + "<br>" + (d.mentions) + " headlines");
      })
      .on("mouseout", function(d){ tooltip.style("display", "none");});
}

d3.csv("Candidate_Mentions_Headlines.csv").then(renderMentionsBarChart);