function getPropagationChartConfig() {
  // set the dimensions and margins of the graph
  const svgHeight = 500;
  const svgWidth = 690;
  const margin = { top: 20, right: 20, bottom: 90, left: 50 };
  const margin2 = {top: 440, right: 20, bottom: 30, left: 50};
  const height  = svgHeight - margin.top - margin.bottom;
  const height2 = svgHeight - margin2.top - margin2.bottom;
  const width = svgWidth - margin.left - margin.right;
  // set the ranges
  const x = d3.scaleTime().range([0, width]),
       x2 = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]),
       y2 = d3.scaleLinear().range([height, 0]);

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

  return { margin, margin2, width, height, height2, x, y, x2, y2, valueline, opacityScale };
}

function lineColor(d) {
  let bolsonaro = 0, haddad = 0;
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


function filterClusters(clusters, filters) {
  let minDate = filters.minDate || new Date(DEFAULT_MIN_DATE);
  let maxDate = filters.maxDate || new Date(DEFAULT_MAX_DATE);
  let minSize = typeof filters.minSize === "undefined" ? 0 : filters.minSize;
  let maxSize = typeof filters.maxSize === "undefined" ? Number.MAX_SAFE_INTEGER : filters.maxSize;
  return clusters.filter(c => 
    c.length <= maxSize && c.length >= minSize &&
    c[c.length-1].date <= maxDate && c[0].date >= minDate
  );
}

function renderChart(parent, data, clusters, filters, updateTable) {

  let filtered = filterClusters(clusters, filters);

  const { margin, margin2, width, height, height2, x, y, x2, y2, valueline, opacityScale } = getPropagationChartConfig();
  
  // Scale the range of the data
  x.domain(d3.extent(data, d => d.date));
  y.domain([0, d3.max(filtered, d => d.length)]);
  x2.domain(x.domain());
  y2.domain(y.domain());

  let svg = parent
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  
  let focus = svg
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  let tooltip = parent.append('div').attr('class', 'toolTip');
  var formatTime = d3.timeFormat("%B %d, %Y - %I:%M %p");

  let xAxis = d3.axisBottom(x)//.ticks(6),
      xAxis2 = d3.axisBottom(x);//.ticks(6);

  // Add the X Axis
  focus
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

  // Add the Y Axis
  focus
    .append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(y));

  // Add the valueline path to the svg
  focus
    .selectAll('.line')
    .data(filtered)
    .enter()
    .append('path')
    .attr('class', lineColor)
    .style('stroke-opacity', d => opacityScale(d.length))
    .attr('d', valueline)
    .on('mousemove', function(d) {
      tooltip
        .style('left', 50 + 'px')
        .style('top', 21 + 'px')
        .html(
          '<b>Headline:</b> ' + d[0].headline + '<br>' +
          '<b># of Publications:</b> ' + d.length + '<br>' +
          '<b>First-Published Date:</b> ' + formatTime(d[0].date)
        );
    })
    .on('mouseover', function(d) {
      tooltip.style('display', 'inline-block');
    })
    .on('mouseout', function(d) {
      tooltip.style('display', 'none');
    });

  // Time brushing

  var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);
  
  var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
  
  context.append("g")
    .attr("class", "axis brush-axis-x")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis2);

  context.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, x.range());

  function updateChart(clusters, filters) {
    let filtered = filterClusters(clusters, filters);
    let join = focus.selectAll('.line').data(filtered);

    let newElements = join
      .enter()
      .append('path')
      .attr('class', lineColor)
      .style('stroke-opacity', d => opacityScale(d.length))
      .attr('d', valueline)
      .on('mousemove', function(d) {
        tooltip
          .style('left', 50 + 'px')
          .style('top', 21 + 'px')
          .html(
            '<b>Headline:</b> ' + d[0].headline + '<br>' +
            '<b># of Publications:</b> ' + d.length + '<br>' +
            '<b>First-Published Date:</b> ' + formatTime(d[0].date)
          );
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

    join.exit().remove();

    return filtered;
  }

  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    // if (d3.event.type !== 'end') return; // ignore intermediate changes

    var s = d3.event.selection || x2.range();
    let timeRange = s.map(x2.invert, x2);
    filters.minDate = timeRange[0]
    filters.maxDate = timeRange[1]
    x.domain([filters.minDate, filters.maxDate]);
    focus.select(".x").call(xAxis);
    let filtered = updateChart(clusters, filters);
    updateTable(filtered);
  }

  return updateChart;
}

function drawProgagationSpeedChart(config) {
  let { tagId, data, clusters } = config;
  let slider = typeof config.slider === 'undefined' ? true : config.slider;
  let table = typeof config.slider === 'undefined' ? true : config.table;

  let [minSize, maxSize] = d3.extent(clusters, d => d.length);
  let [minDate, maxDate] = d3.extent(data, d => d.date);
  let initialMin = typeof config.min === 'undefined' ? minSize : config.min;
  let initialMax = typeof config.max === 'undefined' ? maxSize : config.max;
  let initialMinDate = typeof config.minDate === 'undefined' ? minDate : config.minDate;
  let initialMaxDate = typeof config.maxDate === 'undefined' ? maxDate : config.maxDate;

  let filters = {
    minSize: initialMin,
    maxSize: initialMax,
    minTime: initialMinDate,
    maxTime: initialMaxDate,
  };
  
  let updateTable = null;
  if (table) {
    updateTable = renderTopClustersTable('#top-clusters-table', clusters);
  }

  let parent = d3.select(tagId);
  let updateChart = renderChart(parent, data, clusters, filters, updateTable);

  let onChangeFn = function(values) {
    filters.minSize = Number.parseInt(values[0]);
    filters.maxSize = Number.parseInt(values[1]);
    let filtered = updateChart(clusters, filters);
    updateTable(filtered);
  };

  if (slider) {
    setupSlider(parent.node(), onChangeFn, minSize, maxSize, initialMin, initialMax);
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
    // create a row for top-100 objects in the data
    clusters = clusters.slice(0, Math.min(100, clusters.length));
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