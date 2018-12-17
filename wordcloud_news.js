function getConfig() {
  // set the dimensions and margins of the graph
  let margin = { top: 35, right: 5, bottom: 5, left: 5 };
  let height = 500 - margin.top - margin.bottom;
  let width = 750 - margin.left - margin.right;
  // set the ranges
  let x = d3.scaleTime().range([0, width]);
  let y = d3.scaleLinear().range([height, 0]);
  return { margin, width, height, x, y };
}

function wordFreq(string) {
  return string
    .replace(/[.]/g, "")
    .split(/\s/)
    .reduce(
      (map, word) =>
        Object.assign(map, {
          [word]: map[word] ? map[word] + 1 : 1
        }),
      {}
    );
}

function renderWordCloud(tagId, word_frequency) {
  // function download(dataToSave, filename) {
  //     var hiddenElement = document.createElement('a');
  //     hiddenElement.href = 'data:attachment/text,' + encodeURI(dataToSave);
  //     hiddenElement.target = '_blank';
  //     hiddenElement.download = filename;
  //     hiddenElement.click();
  // }
  // function filterWordFrequencies(word_frequency) {
  //     var frequency_list = [];
  //     Object.keys(word_frequency).forEach(function(word) {
  //         frequency_list.push({'text': word, 'size': word_frequency[word] });
  //     });
  //     frequency_list.sort((a,b) => (b.size - a.size))
  //     frequency_list = frequency_list.slice(0, 250);

  //     let result = {};
  //     for (let i in frequency_list) {
  //         let obj = frequency_list[i]
  //         result[obj.text] = obj.size;
  //     }
  //     return result;
  // }

  var word_entries = d3.entries(word_frequency);
  var maxFreq = d3.max(word_entries, function(d) {
    return d.value;
  });
  var xScale = d3
    .scaleLinear()
    .domain([0, maxFreq])
    .range([10, 100]);

  var paddingScale = d3
    .scaleLinear()
    .domain([0, maxFreq])
    .range([1, 18]);

  const { width, height, margin, x, y } = getConfig();

  let parent = d3.select(tagId);
  let svg = parent
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var color = d3
    .scaleLinear()
    .domain([0, 1, 2, 3, 4, 5, 6, 10, 15, 20, 100])
    .range(["#222", "#333", "#444", "#555", "#666", "#777", "#888", "#999", "#aaa", "#bbb", "#ccc", "#ddd"]);

  var layout = d3.layout
    .cloud()
    .size([width, height])
    .timeInterval(20)
    .words(word_entries)
    .rotate(function(d) {
      return 0;
    })
    .fontSize(function(d) {
      return xScale(+d.value);
    })
    .fontWeight(["bold"])
    .text(function(d) {
      return d.key;
    })
    .padding(function(d) {
      return paddingScale(+d.value);
    })
    .on("end", draw)
    .start();

  var wordcloud = svg
    .append("g")
    .attr("class", "wordcloud")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .selectAll("text")
    .style("font-size", "20px")
    .style("fill", function(d) {
      return color(d);
    });

  function draw(words) {
    wordcloud
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .attr("class", "word")
      .style("fill", function(d, i) {
        return color(i);
      })
      .style("font-size", function(d) {
        return d.size + "px";
      })
      .style("font-family", function(d) {
        return "Impact";
        // return "Lora";
      })
      .attr("text-anchor", "middle")
      .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(function(d) {
        return d.key;
      });
  }
}
