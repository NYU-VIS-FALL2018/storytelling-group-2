function getConfigPolls() {
    // set the dimensions and margins of the graph
    let margin = { top: 20, right: 100, bottom: 50, left: 50 };
    let height = 400 - margin.top - margin.bottom;
    let width = 850 - margin.left - margin.right;
    // set the ranges
    let x = d3.scaleTime().range([0, width]);
    let y = d3.scaleLinear().range([height, 0]);
    return { margin, width, height, x, y};
}

function renderPollScatterPlotChart(data, minDate, maxDate) {
    const {width, height, margin, x, y} = getConfigPolls();

    // parse the date / time
    var parseTime = d3.timeParse("%Y-%m-%d");

    var xAxis = d3.axisBottom()
        .scale(x);
    var yAxis = d3.axisLeft()
        .scale(y);

    var symbols = d3.scaleOrdinal(d3.symbols);
    // creates a generator for symbols
    var symbol = d3.symbol().size(50);
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    // or use
    // var color = d3.scaleOrdinal()
    //     .range(["red", "green", "blue", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var svg = d3.select("#scatter-plot-poll").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltip = d3.select("#scatter-plot-poll").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    x.domain([new Date(minDate), new Date(maxDate)])//.nice();
    y.domain([0, d3.max(data, d => +d.Poll)]);

    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'x axis')
        .call(xAxis);

    svg.append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'y axis')
        .call(yAxis);

    svg.append('text')
        .attr('x', 10)
        .attr('y', 10)
        .attr('class', 'label')
        .text('Poll');

    svg.append('text')
        .attr('x', width)
        .attr('y', height - 10)
        .attr('text-anchor', 'end')
        .attr('class', 'label')
        .text('Day of Date [2018]')
        .attr('transform', 'translate(-' + (width-margin.right)/2 + ', ' + 50 + ')');

    // we use the ordinal scale symbols to generate symbols
    // such as d3.symbolCross, etc..
    // -> symbol.type(d3.symbolCross)()
    svg.selectAll(".symbol")
        .data(data)
        .enter().append("path")
        .attr("class", "symbol")
        .attr("d", function (d, i) {
            return symbol.type(symbols(d.Candidate))();
        })
        .style("fill", function (d) {
            return color(d.Candidate);
        })
        .attr("transform", function (d) {
            return "translate(" + x(parseTime(d.Date)) + "," + y(d.Poll) + ")";
        });

    var clicked = ""

    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(100," + i * 20 + ")";
        });

    legend.append("path")
        .style("fill", function (d) {
            return color(d);
        })
        .attr("d", function (d, i) {
            return symbol.type(symbols(d))();
        })
        .attr("transform", function (d, i) {
            return "translate(" + (width - 10) + "," + 10 + ")";
        })
        .on("click", function (d) {
            d3.selectAll(".symbol").style("opacity", 1)

            if (clicked !== d) {
                d3.selectAll(".symbol")
                    .filter(function (e) {
                        return e.Candidate !== d;
                    })
                    .style("opacity", 0.1)
                clicked = d
            }
            else {
                clicked = ""
            }
        });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) {
            return d;
        });
}

