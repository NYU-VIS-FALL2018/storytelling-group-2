function getConfigPopularity() {
    // set the dimensions and margins of the graph
    let margin = { top: 20, right: 50, bottom: 50, left: 50 };
    let height = 500 - margin.top - margin.bottom;
    let width = 850 - margin.left - margin.right;
    // set the ranges
    let x = d3.scaleTime().range([0, width]);
    let y = d3.scaleLinear().range([height, 0]);
    return { margin, width, height, x, y};
}

function renderPopularityPlot(dataPopu, minDate, maxDate){


    var updateData = [];
    var candidateData = [];
    console.log(dataPopu);
    for(var i = 1; i<dataPopu.columns.length; i++){
        var candidateName = dataPopu.columns[i];
        // var objectCandidate = {candidateName:[]}
        //candidateData[candidateName] = [];
        if(candidateName !== "lula"){
            var values = [];
            for(var j = 0; j<dataPopu.length; j++){
                values.push({datetemp: dataPopu[j].day, popularity: dataPopu[j][candidateName]})
            }
            var objectCandidate = {name:candidateName, values:values}
            updateData.push(objectCandidate);
        }

    }
    // console.log(JSON.stringify(updateData));
    console.log(d3.schemeCategory10);

    // for(var j = 0; j<dataPopu.length; j++){
    //     for(var i = 1; i<dataPopu.columns.length; i++){
    //         var candidateName = dataPopu.columns[i];
    //         candidateData[candidateName].push({date: dataPopu[j].day, popularity: dataPopu[j][candidateName]})
    //     }
    // }
    //
    // console.log(candidateData);

    // for(var i = 1; i<dataPopu.columns.length; i++){
    //     var candidateName = dataPopu.columns[i];
    //     var objectCandidate = {candidateName:[]}
    //
    //     for(var j = 0; j<dataPopu.length; j++){
    //         candidateData.push()
    //
    //     }
    //     var objectCandidate = {name:dataPopu.columns[i], values:[]}
    //     updateData.push(objectCandidate);
    // }
    // console.log("updatedata");
    // console.log(updateData);
    //
    // for(var i = 0; i<dataPopu.length; i++){
    //     for(var j = 0; j<dataPopu.columns.length; j++) {
    //         var candidateName = dataPopu.columns[j];
    //
    //
    //         console.log(updateData[candidateName].values);
    //         console.log(updateData[candidateName].values);
    //         updateData[candidateName].values.push({date: dataPopu[i].day, popularity: dataPopu[i][candidateName]});
    //     }
    // }
    // console.log(dataPopu[i].bolsonaro);
    // console.log(updateData);

    data =updateData;

    // var width = 800;
    // var height = 500;
    // var margin = 50;
    const {width, height, margin} = getConfigPopularity();

    console.log(getConfigPopularity());

    var duration = 250;

    var lineOpacity = "0.25";
    var lineOpacityHover = "0.85";
    var otherLinesOpacityHover = "0.1";
    var lineStroke = "1.5px";
    var lineStrokeHover = "2.5px";

    var circleOpacity = '0.85';
    var circleOpacityOnLineHover = "0.25"
    var circleRadius = 3;
    var circleRadiusHover = 6;

    // parse the date / time
    // var parseTime = d3.timeParse("%Y-%m-%d");

    /* Format Data */
    var parseDate = d3.timeParse("%Y-%m-%d");
    // var parseDate = d3.timeParse("%Y");
    data.forEach(function(d) {
        d.values.forEach(function(d) {
            d.date = parseDate(d.datetemp);
            d.popularity = +d.popularity;
        });
    });


    /* Scale */
    var xScale = d3.scaleTime()
        .domain([new Date(minDate), new Date(maxDate)])
        // .domain(d3.extent(data[0].values, d => d.date)).nice()
        .range([0, width-margin.right]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data[0].values, d => d.popularity)])
        .range([height-margin.bottom, 0]);

    // var color = d3.scaleOrdinal(d3.schemeCategory10);
    // var candidate = [bolsonaro=1,haddad=2,lula=3,gomes=4,amoedo=5,alckmin=6,daciolo=7,meirelles=8,marina=9]
    //var color = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
    // var candidate = [bolsonaro-1,haddad-4,lula,gomes-3,amoedo-8,alckmin-5,daciolo-7,meirelles-6,marina-2]
    var arrayColor = ["#1f77b4", "#d62728", "#2ca02c", "#7f7f7f", "#9467bd", "#e377c2", "#8c564b", "#ff7f0e"];
    var color = d3.scaleOrdinal(arrayColor);

    /* Add SVG */
    var svg = d3.select("#line-plot-popularity").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // .attr("width", (width+margin)+"px")
        // .attr("height", (height+margin)+"px")
        // .append('g')
        // .attr("transform", `translate(${margin}, ${margin})`);


    /* Add line into SVG */
    var line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.popularity));

    let lines = svg.append('g')
        .attr('class', 'lines');

    lines.selectAll('.line-group')
        .data(data).enter()
        .append('g')
        .attr('class', 'line-group')
        .on("mouseover", function(d, i) {
            svg.append("text")
                .attr("class", "title-text")
                .style("fill", color(i))
                .text(d.name)
                .attr("text-anchor", "middle")
                .attr("x", (width-margin.right)/2)
                .attr("y", 5);
        })
        .on("mouseout", function(d) {
            svg.select(".title-text").remove();
        })
        .append('path')
        .attr('class', 'line')
        .attr('d', d => line(d.values))
        .style('stroke', (d, i) => color(i))
        .style('opacity', lineOpacity)
        .on("mouseover", function(d) {
            d3.selectAll('.line')
                .style('opacity', otherLinesOpacityHover);
            d3.selectAll('.circle')
                .style('opacity', circleOpacityOnLineHover);
            d3.select(this)
                .style('opacity', lineOpacityHover)
                .style("stroke-width", lineStrokeHover)
                .style("cursor", "pointer");
        })
        .on("mouseout", function(d) {
            d3.selectAll(".line")
                .style('opacity', lineOpacity);
            d3.selectAll('.circle')
                .style('opacity', circleOpacity);
            d3.select(this)
                .style("stroke-width", lineStroke)
                .style("cursor", "none");
        });


    /* Add circles in the line */
    lines.selectAll("circle-group")
        .data(data).enter()
        .append("g")
        .style("fill", (d, i) => color(i))
        .selectAll("circle")
        .data(d => d.values).enter()
        .append("g")
        .attr("class", "circle")
        .on("mouseover", function(d) {
            d3.select(this)
                .style("cursor", "pointer")
                .append("text")
                .attr("class", "text")
                .text(`${d.popularity}`)
                .attr("x", d => xScale(d.date) + 5)
                .attr("y", d => yScale(d.popularity) - 10);
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .style("cursor", "none")
                .transition()
                .duration(duration)
                .selectAll(".text").remove();
        })
        .append("circle")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.popularity))
        .attr("r", circleRadius)
        .style('opacity', circleOpacity)
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .duration(duration)
                .attr("r", circleRadiusHover);
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .duration(duration)
                .attr("r", circleRadius);
        });


    /* Add Axis into SVG */
    var xAxis = d3.axisBottom(xScale).ticks(5);
    var yAxis = d3.axisLeft(yScale).ticks(5);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height-margin.bottom})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.append('text')
        .attr('x', 10)
        .attr('y', 10)
        .attr('class', 'label')
        .text('News Mentions');

    svg.append('text')
        .attr('x', width)
        .attr('y', height - 10)
        .attr('text-anchor', 'end')
        .attr('class', 'label')
        .text('Day of Date [2018]')
        .attr('transform', 'translate(-' + (width-margin.right)/2 + ', ' + 0 + ')');

}
