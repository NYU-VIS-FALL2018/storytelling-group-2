function getConfig() {
  // set the dimensions and margins of the graph
  let margin = { top: 20, right: 20, bottom: 30, left: 50 };
  let height = 500 - margin.top - margin.bottom;
  let width = 1110 - margin.left - margin.right;
  // set the ranges
  let x = d3.scaleTime().range([0, width]);
  let y = d3.scaleLinear().range([height, 0]);
  return { margin, width, height, x, y };
}

function drawProgagationSpeedChart(tagId, data, clusters) {
  const { width, height, margin, x, y } = getConfig();

  // append the svg object to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  let svg = d3
    .select(tagId)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Scale the range of the data
  x.domain(d3.extent(data, d => d.date));
  y.domain([0, d3.max(clusters, d => d.length)]);

  // defines how to draw the line
  let valueline = d3
    .line()
    .curve(d3.curveMonotoneX)
    // .curve(d3.curveNatural)
    .x(d => x(d.date))
    .y((d, i) => y(i) /* y(d.close) */);

  // Add the valueline path to the svg
  svg
    .selectAll('.line')
    .data(clusters)
    .enter()
    .append('path')
    .attr('class', 'line')
    .style('stroke-opacity', 0.5)
    .attr('d', valueline);

  // Add the X Axis
  svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x));

  // Add the Y Axis
  svg.append('g').call(d3.axisLeft(y));
}
