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

  // Scale for the opacity 
  let opacityScale =
    d3.scalePow()
    // d3.scaleLinear()
    .exponent(1)
    .range([.0, 1.0])
    .domain([0, d3.max(clusters, d => d.length)]);

  // Add the valueline path to the svg
  svg
    .selectAll('.line')
    .data(clusters)
    .enter()
    .append('path')
    .attr('class', (d) => {
      let bozo = 0, haddad = 0;
      d.forEach( story => {
        if (story.headline.includes('Bolsonaro')) {
          bozo++;
        } else if (story.headline.includes('Haddad')) {
          haddad++;
        }
      });
      let color;
      if (bozo > haddad) {
        color = 'stroke-blue';
      } else if(haddad > bozo) {
        color = 'stroke-red';
      } else {
        color = 'stroke-gray';
      }
      return 'line ' + color;
    })
    .style('stroke-opacity', (d) => opacityScale(d.length))
    .attr('d', valueline);

  // Add the X Axis
  svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x));

  // Add the Y Axis
  svg.append('g').call(d3.axisLeft(y));
}

function renderTopClustersTable(tagId, clusters) {
  const columns = ['Size', 'Headline'];

  let table = d3
    .select(tagId)
    .append('table')
    .attr('class', 'table');

  let thead = table.append('thead');
  var tbody = table.append('tbody');
  // append the header row
  thead
    .append('tr')
    .selectAll('th')
    .data(columns)
    .enter()
    .append('th')
    .text(function(column) {
      return column;
    });

  // create a row for each object in the data
  var rows = tbody
    .selectAll('tr')
    .data(clusters)
    .enter()
    .append('tr');

  // create a cell in each row for each column
  var cells = rows
    .selectAll('td')
    .data(function(row) {
      let text = row[0]['headline'];
      text = text.replace('Bolsonaro', '<span class="text-blue">Bolsonaro</span>');
      
      text = text.replace('Haddad', '<span class="text-red">Haddad</span>');
      text = text.replace('PT', '<span class="text-red">PT</span>');
      text = text.replace('Lula', '<span class="text-red">Lula</span>');

      text = text.replace('Gomes', '<span class="text-green">Gomes</span>');
      return [{ value: row.length }, { value: text }];
    })
    .enter()
    .append('td')
    
    .html(d => d.value);
}
