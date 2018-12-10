function getPropagationChartConfig() {
  // set the dimensions and margins of the graph
  let margin = { top: 20, right: 20, bottom: 30, left: 50 };
  let height = 500 - margin.top - margin.bottom;
  let width = 690 - margin.left - margin.right;
  // set the ranges
  let x = d3.scaleTime().range([0, width]);
  let y = d3.scaleLinear().range([height, 0]);

  // defines how to draw the line
  let valueline = d3
    .line()
    .curve(d3.curveMonotoneX)
    // .curve(d3.curveNatural)
    .x(d => x(d.date))
    .y((d, i) => y(i));

  // Scale for the opacity
  let opacityScale = d3
    .scalePow()
    // d3.scaleLinear()
    .exponent(1)
    .range([0.0, 1.0])
    .domain([0, d3.max(clusters, d => d.length)]);

  return { margin, width, height, x, y, valueline, opacityScale };
}

function lineColor(d) {
  let bolsonaro = 0,
    haddad = 0;
  d.forEach(story => {
    if (story.headline.includes('Bolsonaro')) {
      bolsonaro++;
    } else if (story.headline.includes('Haddad')) {
      haddad++;
    }
  });
  let color;
  if (bolsonaro > haddad) {
    color = 'stroke-blue';
  } else if (haddad > bolsonaro) {
    color = 'stroke-red';
  } else {
    color = 'stroke-gray';
  }
  return 'line ' + color;
}

function setupSlider(parentNode, onChangeCb, min, max, initialMin, initialMax) {
  let sliderContainer = document.createElement('div');
  sliderContainer.className = 'cluster-size-slider';

  let minMaxSlider = document.createElement('div');
  sliderContainer.appendChild(minMaxSlider);

  parentNode.parentNode.insertBefore(sliderContainer, parentNode.parentNode.childNodes[0]);

  noUiSlider.create(minMaxSlider, {
    orientation: 'vertical',
    direction: 'rtl',
    tooltips: true,
    format: wNumb({
      decimals: 0
    }),
    start: [initialMin, initialMax],
    connect: true,
    step: 1,
    range: {
      min: min,
      max: max
    }
  });
  minMaxSlider.noUiSlider.on('change', values => {
    onChangeCb(values);
  });
}

function renderChart(parent, data, clusters) {
  const { width, height, margin, x, y, valueline, opacityScale } = getPropagationChartConfig();
  // Scale the range of the data
  x.domain(d3.extent(data, d => d.date));
  y.domain([0, d3.max(clusters, d => d.length)]);

  let svg = parent
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  let tooltip = parent.append('div').attr('class', 'toolTip');

  // Add the X Axis
  svg
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(
      d3.axisBottom(x) // .ticks(6)
    );

  // Add the Y Axis
  svg
    .append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(y));

  // Add the valueline path to the svg
  svg
    .selectAll('.line')
    .data(clusters)
    .enter()
    .append('path')
    .attr('class', lineColor)
    .style('stroke-opacity', d => opacityScale(d.length))
    .attr('d', valueline)
    .on('mousemove', function(d) {
      let mousePosition = d3.mouse(parent.node());
      tooltip
        .style('left', 60 + 'px')
        .style('top', 21 + 'px')
        .html('<b>Headline:</b> ' + d[0].headline + '<br><b># Duplicates:</b> ' + d.length);
    })
    .on('mouseover', function(d) {
      tooltip.style('display', 'inline-block');
    })
    .on('mouseout', function(d) {
      tooltip.style('display', 'none');
    });

  function updateChart(clusters) {
    let join = svg.selectAll('.line').data(clusters);

    let newElements = join
      .enter()
      .append('path')
      .attr('class', lineColor)
      .style('stroke-opacity', d => opacityScale(d.length))
      .attr('d', valueline)
      .on('mousemove', function(d) {
        let mousePosition = d3.mouse(parent.node());
        tooltip
          .style('left', 60 + 'px')
          .style('top', 21 + 'px')
          .html('<b>Headline:</b> ' + d[0].headline + '<br><b># Duplicates:</b> ' + d.length);
      })
      .on('mouseover', function(d) {
        tooltip.style('display', 'inline-block');
      })
      .on('mouseout', function(d) {
        tooltip.style('display', 'none');
      });

    join
      .merge(newElements)
      .attr('class', lineColor)
      .style('stroke-opacity', d => opacityScale(d.length))
      .attr('d', valueline);

    join
      .exit()
      .transition()
      .remove();
  }
  return updateChart;
}

function drawProgagationSpeedChart(config) {
  let { tagId, data, clusters } = config;
  let slider = typeof config.slider === 'undefined' ? true : config.slider;
  let table = typeof config.slider === 'undefined' ? true : config.table;

  let [min, max] = d3.extent(clusters, d => d.length);
  let initialMin = typeof config.min === 'undefined' ? min : config.min;
  let initialMax = typeof config.max === 'undefined' ? max : config.max;

  let filtered = filterStoriesByClusterSize(clusters, min, max);
  let parent = d3.select(tagId);
  let updateChart = renderChart(parent, data, filtered);
  let updateTable = null;
  if (table) {
    updateTable = renderTopClustersTable('#top-clusters-table', filtered);
  }
  onChangeFn = function(values) {
    let min = Number.parseInt(values[0]);
    let max = Number.parseInt(values[1]);
    filtered = filterStoriesByClusterSize(clusters, min, max);
    updateChart(filtered);
    updateTable(filtered);
  };
  if (slider) {
    setupSlider(parent.node(), onChangeFn, min, max, initialMin, initialMax);
  }
}

function highlightText(text) {
  text = text.replace('Bolsonaro', '<span class="text-blue">Bolsonaro</span>');
  text = text.replace('Haddad', '<span class="text-red">Haddad</span>');
  text = text.replace('PT', '<span class="text-red">PT</span>');
  text = text.replace('Lula', '<span class="text-red">Lula</span>');
  text = text.replace('Gomes', '<span class="text-green">Gomes</span>');
  return text;
}

function renderTopClustersTable(tagId, clusters) {
  const columns = [{ header: 'Size', style: 'width: 60px' }, { header: 'First Headline' }];

  let table = d3
    .select(tagId)
    .append('table')
    .attr('class', 'table table-fixed');

  let thead = table.append('thead').append('tr');
  var tbody = table.append('tbody');
  // append the header row
  thead
    .selectAll('th')
    .data(columns)
    .enter()
    .append('th')
    .text(function(d) {
      return d.header;
    })
    .attr('style', d => {
      if (d.style) return d.style;
    });

  function updateTable(clusters) {
    // create a row for each object in the data
    var rowsJoin = tbody.selectAll('tr').data(clusters);

    let newRows = rowsJoin.enter().append('tr');
    rowsJoin.exit().remove();

    var cellsJoin = rowsJoin
      .merge(newRows)
      .selectAll('td')
      .data(function(cluster) {
        return [{ value: cluster.length }, { value: highlightText(cluster[0]['headline']) }];
      });

    let newCells = cellsJoin
      .enter()
      .append('td')
      .html(d => d.value);

    cellsJoin.merge(newCells).html(d => d.value);

    cellsJoin.exit().remove();
  }
  updateTable(clusters);
  return updateTable;
}
