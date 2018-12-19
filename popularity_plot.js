function getConfigPopularity() {
  // set the dimensions and margins of the graph
  let margin = { top: 20, right: 50, bottom: 50, left: 50 };
  let height = 500 - margin.top - margin.bottom;
  let width = 850 - margin.left - margin.right;
  // set the ranges
  let x = d3.scaleTime().range([0, width]);
  let y = d3.scaleLinear().range([height, 0]);
  return { margin, width, height, x, y };
}

function renderPopularityPlot(tagId, dataPopu, minDate, maxDate) {
    
  var updateData = [];
  for (var i = 1; i < dataPopu.columns.length; i++) {
    var candidateName = dataPopu.columns[i];
    if (candidateName !== 'lula') {
      var values = [];
      for (var j = 0; j < dataPopu.length; j++) {
        values.push({ datetemp: dataPopu[j].day, popularity: dataPopu[j][candidateName] });
      }
      var objectCandidate = { name: candidateName, values: values };
      updateData.push(objectCandidate);
    }
  }
  
  data = updateData;

  const { width, height, margin } = getConfigPopularity();

  var duration = 250;

  var lineOpacity = '1';
  var lineOpacityHover = '0.85';
  var otherLinesOpacityHover = '0.1';
  var lineStroke = '1.5px';
  var lineStrokeHover = '2.5px';

  var circleOpacity = '0.85';
  var circleOpacityOnLineHover = '0.25';
  var circleRadius = 3;
  var circleRadiusHover = 6;

  /* Format Data */
  var parseDate = d3.timeParse('%Y-%m-%d');
  data.forEach(function(d) {
    d.values.forEach(function(d) {
      d.date = parseDate(d.datetemp);
      d.popularity = +d.popularity;
    });
  });

  /* Scale */
  var xScale = d3
    .scaleTime()
    .domain([new Date(minDate), new Date(maxDate)])
    .range([0, width - margin.right]);

  var yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data[0].values, d => d.popularity)])
    .range([height - margin.bottom, 0]);

  var names = ['Bolsonaro', 'Haddad', 'Gomez', 'Amoêdo', 'Alckmin', 'Daciolo', 'Meirelles', 'Marina'];
  var arrayColor = ['#1f77b4', '#d62728', '#2ca02c', '#7f7f7f', '#9467bd', '#e377c2', '#8c564b', '#ff7f0e'];
  var color = d3.scaleOrdinal(arrayColor);

  /* Add SVG */
  var svg = d3
    .select(tagId)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  /* Add line into SVG */
  var line = d3
    .line()
    .curve(d3.curveMonotoneX)
    .x(d => xScale(d.date))
    .y(d => yScale(d.popularity));

  let lines = svg.append('g').attr('class', 'lines');

  lines
    .selectAll('.line-group')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'line-group')
    .on('mouseover', function(d, i) {
      svg
        .append('text')
        .attr('class', 'title-text')
        .style('fill', color(i))
        .text(names[i])
        .attr('text-anchor', 'middle')
        .attr('x', (width - margin.right) / 2)
        .attr("y", (height-margin.top-margin.bottom-200)/2)
        .attr('font-size', 20);
    })
    .on('mouseout', function(d) {
      svg.select('.title-text').remove();
    })
    .append('path')
    .attr('class', 'line')
    .attr('d', d => line(d.values))
    .style('stroke', (d, i) => color(i))
    .style('opacity', lineOpacity)
    .on('mouseover', function(d) {
      d3.selectAll('.line').style('opacity', otherLinesOpacityHover);
      d3.selectAll('.circle').style('opacity', circleOpacityOnLineHover);
      d3.select(this)
        .style('opacity', lineOpacityHover)
        .style('stroke-width', lineStrokeHover)
        .style('cursor', 'pointer');
    })
    .on('mouseout', function(d) {
      d3.selectAll('.line').style('opacity', lineOpacity);
      d3.selectAll('.circle').style('opacity', circleOpacity);
      d3.select(this)
        .style('stroke-width', lineStroke)
        .style('cursor', 'none');
    });

  /* Add circles in the line */
  lines
    .selectAll('circle-group')
    .data(data)
    .enter()
    .append('g')
    .style('fill', (d, i) => color(i))
    .selectAll('circle')
    .data(d => d.values)
    .enter()
    .append('g')
    .attr('class', 'circle')
    .on('mouseover', function(d, i) {
      d3.select(this)
        .style('cursor', 'pointer')
        .append('text')
        .attr('class', 'text')
        .text(`${String(d.date).split('00')[0]} - ${d.popularity} mentions`)
        .attr('x', d => xScale(d.date) + 5)
        .attr('y', d => yScale(d.popularity) - 10);
    })
    .on('mouseout', function(d) {
      d3.select(this)
        .style('cursor', 'none')
        .transition()
        .duration(duration)
        .selectAll('.text')
        .remove();
    })
    .append('circle')
    .attr('cx', d => xScale(d.date))
    .attr('cy', d => yScale(d.popularity))
    .attr('r', circleRadius)
    .style('opacity', 0)
    .on('mouseover', function(d) {
      d3.select(this)
        .transition()
        .duration(duration)
        .attr('r', circleRadiusHover);
    })
    .on('mouseout', function(d) {
      d3.select(this)
        .transition()
        .duration(duration)
        .attr('r', circleRadius);
    });

  /* Add Axis into SVG */
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  svg
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(xAxis);

  svg
    .append('g')
    .attr('class', 'y axis')
    .call(yAxis);

  svg
    .append('text')
    .attr('x', 10)
    .attr('y', 10)
    .attr('class', 'label')
    // .attr("transform", "    rotate(-90)")
    // .attr('transform', 'translate(-' + (width - margin.right) / 2 + ', ' + 0 + ')')
    .text('Number of News Mentions');

  svg
    .append('text')
    .attr('x', width)
    .attr('y', height - 10)
    .attr('text-anchor', 'end')
    .attr('class', 'label')
    .text('Article Date')
    .attr('transform', 'translate(-' + (width - margin.right) / 2 + ', ' + 0 + ')');
}
