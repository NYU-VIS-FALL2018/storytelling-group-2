function renderMentionsBarChart(data) {

  console.log(data)
  var parent = d3.select("#mentions-bar-chart");
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

  x.domain([0, d3.max(data, function(d) { return +d.mentions; }) * 1.05]);
  y.domain(data.map(function(d) { return d.candidate; })).padding(0.4);

  g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(
        d3.axisBottom(x)
          .ticks(5)
          .tickFormat(function(d) { return parseInt(d); })
          .tickSizeInner([-height])
      );

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
      .attr("fill", function(d) {return d.color})
      .attr("opacity", "0.85")
      .on("mousemove", function(d) {
        let mousePosition = d3.mouse(parent.node());
        tooltip
          .style("left", mousePosition[0] + 10 + "px")
          .style("top",  mousePosition[1] + 20 + "px")
          .html("<b>Candidate:</b> " +d.full_name + "<br><b>Party:</b> " + d.party + "<br><b>Headline Mentions:</b> " + d.mentions
            + '<img class="img-candidate mt-3 mb-3" src="' + d.image + '"/>'
           )
      })
      .on("mouseover", function(d){ tooltip.style("display", "inline-block");})
      .on("mouseout", function(d){ tooltip.style("display", "none");});
}

d3.csv("Candidate_Mentions_Headlines.csv").then(renderMentionsBarChart);