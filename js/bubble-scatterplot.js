function getBubbleChartConfig() {
  // set the dimensions and margins of the graph
  let margin = { top: 20, right: 20, bottom: 30, left: 50 };
  let height = 500 - margin.top - margin.bottom;
  let width = 800 - margin.left - margin.right;
  // set the ranges
  let x = d3.scaleTime().range([0, width]);
  let y = d3.scaleLinear().range([height, 0]);

  const maxRadius = 1;
  const minRadius = 0.2;
  const maxArea = maxRadius * maxRadius * Math.PI;
  const minArea = minRadius * minRadius * Math.PI;
  const bubbleAreaScale = d3.scalePow().exponent(1.6).range([minArea, maxArea])

  // Scale for the opacity
  let opacityScale = d3
    .scalePow()
    .exponent(1)
    .range([0.1, 1.0])
    .domain([0, d3.max(clusters, d => d.length)]);

  return { margin, width, height, x, y, bubbleAreaScale, opacityScale };
}


function bubbleColor(d) {
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
    color = '#012989';
  } else if (haddad > bolsonaro) {
    color = '#c20000';
  } else {
    color = '#999';
  }
  return color;
}

function renderBubbleChart(tagId, data, clusters) {
  const { width, height, margin, x, y, bubbleAreaScale, opacityScale } = getBubbleChartConfig();
  
  let [min, max] = d3.extent(clusters, d => d.length)

  // Scale the range of the data
  x.domain(d3.extent(data, d => d.date));
  y.domain([min-1, max]);
  
  let parent = d3.select(tagId)
  
  let svg = parent
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Add the X Axis
  svg
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(
      d3.axisBottom(x)//.ticks(6)
    );

  // Add the Y Axis
  svg
    .append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(y));


  function getRadiusForArea(area) {
      return Math.sqrt(area/Math.PI)
  }

  var formatTime = d3.timeFormat("%B %d, %Y - %I:%M %p");
  
  let tooltip = parent
    .append('div')
    .attr('class', 'toolTip');
  
  // Add the valueline path to the svg
  svg
    .selectAll('circle')
    .data(clusters)
    .enter()
    .append('circle')
    .attr("cx", function(d) {
      return x(d[0].date);
    })
    .attr("cy", (d) => y(d.length) )
    .attr("r", d => {
      return getRadiusForArea(bubbleAreaScale(d.length)) 
    })
    .attr("fill", (d) => bubbleColor(d)) //"#2a5599") // blue
    .attr("fill-opacity", d => opacityScale(d.length))
    .on('mousemove', function(d) {
      let mousePosition = d3.mouse(parent.node());
      let y = mousePosition[1];
      let top = y + 35;
      if ( y > height - 70) {
        top = y - 120;
      }
      tooltip
        .style('left', 50 + 'px')
        .style('top', top + 'px')
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
    })
}