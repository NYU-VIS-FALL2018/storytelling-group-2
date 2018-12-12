function getConfig() {
    // set the dimensions and margins of the graph
    let margin = { top: 20, right: 20, bottom: 30, left: 50 };
    let height = 500 - margin.top - margin.bottom;
    let width = 750 - margin.left - margin.right;
    // set the ranges
    let x = d3.scaleTime().range([0, width]);
    let y = d3.scaleLinear().range([height, 0]);
    return { margin, width, height, x, y };
}

function wordFreq(string) {
    return string.replace(/[.]/g, '')
        .split(/\s/)
        .reduce((map, word) =>
                Object.assign(map, {
                    [word]: (map[word])
                        ? map[word] + 1
                        : 1,
                }),
            {}
        );
}

function renderWordCloud(tagId, text) {

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

    console.log('Computing word frequencies...');
    // var word_frequency = wordFreq(text);
    let word_frequency = text;

    // word_frequency = filterWordFrequencies(word_frequency);
    console.log(word_frequency);
    // download(JSON.stringify(word_frequency), 'word-frequency.json');
    // console.log('done');



    var word_entries = d3.entries(word_frequency);

    var xScale = d3.scaleLinear()
        .domain([0, d3.max(word_entries, function(d) {
            return d.value;
        })
        ])
        .range([10,100]);

    var frequency_list = [];
    // Object.keys(word_frequency).sort().forEach(function(word) {
    //     if(word_frequency[word] > 0)  {
    //         frequency_list.push({'text': word, 'size': word_frequency[word] });
    //     }
    //     console.log("count of " + word + " is " + xScale(word_frequency[word]));
    // });

    const {width, height, margin, x, y} = getConfig();

    let parent = d3.select(tagId);
    let svg = parent
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //d3.csv("NumArticlesByDay.csv",function(data){
    // var color = d3.scaleOrdinal(d3.schemeCategory20);
    var color = d3.scaleLinear()
        .domain([0, 1, 2, 3, 4, 5, 6, 10, 15, 20, 100])
        .range(["#222", "#333", "#444", "#555", "#666", "#777", "#888", "#999", "#aaa", "#bbb", "#ccc", "#ddd"]);

    // var frequency_list = [{"text":"study","size":40},{"text":"motion","size":15},{"text":"forces","size":10},{"text":"electricity","size":15},{"text":"movement","size":10},{"text":"relation","size":5},{"text":"things","size":10},{"text":"force","size":5},{"text":"ad","size":5},{"text":"energy","size":85},{"text":"living","size":5},{"text":"nonliving","size":5},{"text":"laws","size":15},{"text":"speed","size":45},{"text":"velocity","size":30},{"text":"define","size":5},{"text":"constraints","size":5},{"text":"universe","size":10},{"text":"physics","size":120},{"text":"describing","size":5},{"text":"matter","size":90},{"text":"physics-the","size":5},{"text":"world","size":10},{"text":"works","size":10},{"text":"science","size":70},{"text":"interactions","size":30},{"text":"studies","size":5},{"text":"properties","size":45},{"text":"nature","size":40},{"text":"branch","size":30},{"text":"concerned","size":25},{"text":"source","size":40},{"text":"google","size":10},{"text":"defintions","size":5},{"text":"two","size":15},{"text":"grouped","size":15},{"text":"traditional","size":15},{"text":"fields","size":15},{"text":"acoustics","size":15},{"text":"optics","size":15},{"text":"mechanics","size":20},{"text":"thermodynamics","size":15},{"text":"electromagnetism","size":15},{"text":"modern","size":15},{"text":"extensions","size":15},{"text":"thefreedictionary","size":15},{"text":"interaction","size":15},{"text":"org","size":25},{"text":"answers","size":5},{"text":"natural","size":15},{"text":"objects","size":5},{"text":"treats","size":10},{"text":"acting","size":5},{"text":"department","size":5},{"text":"gravitation","size":5},{"text":"heat","size":10},{"text":"light","size":10},{"text":"magnetism","size":10},{"text":"modify","size":5},{"text":"general","size":10},{"text":"bodies","size":5},{"text":"philosophy","size":5},{"text":"brainyquote","size":5},{"text":"words","size":5},{"text":"ph","size":5},{"text":"html","size":5},{"text":"lrl","size":5},{"text":"zgzmeylfwuy","size":5},{"text":"subject","size":5},{"text":"distinguished","size":5},{"text":"chemistry","size":5},{"text":"biology","size":5},{"text":"includes","size":5},{"text":"radiation","size":5},{"text":"sound","size":5},{"text":"structure","size":5},{"text":"atoms","size":5},{"text":"including","size":10},{"text":"atomic","size":10},{"text":"nuclear","size":10},{"text":"cryogenics","size":10},{"text":"solid-state","size":10},{"text":"particle","size":10},{"text":"plasma","size":10},{"text":"deals","size":5},{"text":"merriam-webster","size":5},{"text":"dictionary","size":10},{"text":"analysis","size":5},{"text":"conducted","size":5},{"text":"order","size":5},{"text":"understand","size":5},{"text":"behaves","size":5},{"text":"en","size":5},{"text":"wikipedia","size":5},{"text":"wiki","size":5},{"text":"physics-","size":5},{"text":"physical","size":5},{"text":"behaviour","size":5},{"text":"collinsdictionary","size":5},{"text":"english","size":5},{"text":"time","size":35},{"text":"distance","size":35},{"text":"wheels","size":5},{"text":"revelations","size":5},{"text":"minute","size":5},{"text":"acceleration","size":20},{"text":"torque","size":5},{"text":"wheel","size":5},{"text":"rotations","size":5},{"text":"resistance","size":5},{"text":"momentum","size":5},{"text":"measure","size":10},{"text":"direction","size":10},{"text":"car","size":5},{"text":"add","size":5},{"text":"traveled","size":5},{"text":"weight","size":5},{"text":"electrical","size":5},{"text":"power","size":5}];
    data = word_entries; // frequency_list;

    var layout = d3.layout.cloud()
        .size([width, height])
        .timeInterval(20)
        .words(data)
        .rotate(function (d) {
            return 0;
        })
        .fontSize(function (d) {
            return xScale(+d.value); // return xScale(+d.size);
        })
        //.fontSize(function(d,i) { return fontSize(Math.random()); })
        //.fontStyle(function(d,i) { return fontSyle(Math.random()); })
        .fontWeight(["bold"])
        .text(function (d) {
            return d.key; //return d.text;
        })
        // .rotate(function() { return ~~(Math.random() * 2) * 90; })
        // .text(function(d) { return d.Team_CN; })
        //.spiral("rectangular") // "archimedean" or "rectangular"
        .on("end", draw)
        .start();

    var wordcloud = svg.append("g")
        .attr('class', 'wordcloud')
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .selectAll('text')
        .style('font-size', '20px')
        .style('fill', function (d) {
            return color(d);
        })
        .style('font', 'sans-serif');

    function draw(words) {
        wordcloud.selectAll("text")
            .data(words)
            .enter().append("text")
            .attr('class', 'word')
            .style("fill", function (d, i) {
                return color(i);
            })
            .style("font-size", function (d) {
                return d.size + "px";
            })
            .style("font-family", function (d) {
                return d.font;
            })
            //.style("fill", function(d) {
            //var paringObject = data.filter(function(obj) { return obj.Team_CN === d.text});
            // return color(paringObject[0].category);
            //})
            .attr("text-anchor", "middle")
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) {
                return d.key; // return d.text;
            });
    };

}