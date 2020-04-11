const margins = { top: 20, right: 20, bottom: 30, left: 200 };
const totalWidth = 1600;
const totalHeight = 800;

const innerWidth = totalWidth - margins.left - margins.right;
const innerHeight = totalHeight - margins.top - margins.bottom;

function makechart(vis_num) {
    // Make inner area for chart, depending on parameter, it will choose which ID to select
    let chart_area = "#" + vis_num;
    let chart = d3.select(chart_area);
    makeInnerArea(chart);

    // Load the dataset
    let data = d3
        .csv("googleplaystoreexcel.csv", function(d, i, names) {
            // Accessor function
            parsed_price = d["Price"];
            if (parsed_price === "0") {
                parsed_price = 0;
            } else {
                parsed_price = parsed_price.substring(1); // Remove $
                parsed_price = +parsed_price;
            }
            return {
                app: d["App"],
                genres: d["Genres"],
                rating: +d["Rating"],
                reviews: +d["Reviews"],
                installs: d["Installs"],
                type: d["Type"],
                price: parsed_price, // Convert to number
                content: d["Content Rating"]
            };
        })
        .then(function(data) {
            //uncomment clean_genre if you want unique genres
            //uncomment both if you want "app store" genres
            data = clean_genre(data);
            // this is also a variation, grouping up all the genres
            if(vis_num !== "main"){
                data = group_genres(data);
            }

            // Run when data is loaded
            // console.log(data);

            // Make y axis (with categories)
            let genre = data.map(d => d.genres);
            //let rating = data.map(d => d.rating);
            let prices = data.map(d => d.price);
            let max = Math.max.apply(Math, prices);

            let xscale = d3
                .scaleBand(genre, [0, innerWidth])
                .paddingInner(0.1)
                .paddingOuter(0.25);

            let yscale;
            if(vis_num === "main" || vis_num === "visual1" || vis_num === "visual6"){
                yscale = d3
                    .scaleLinear([d3.min(prices), d3.max(prices)], [innerHeight, 0])
                    .nice();
            }else{
                yscale = d3
                    .scaleLog([0.5, max], [innerHeight, 0])
                    .base(2)
                    .nice();
            }

            let xaxis = d3.axisBottom(xscale).ticks(5);
            let yaxis = d3.axisLeft(yscale).ticks(10);
            let axes = [xaxis, yaxis];
            makeAxes(chart, axes);

            // Add axis labels
            chart.append("text")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate("+ (margins.left/2) +","+(outerHeight/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
                .text("Price ($)");

            chart.append("text")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate("+ (totalWidth/2) +","+(totalHeight + 70)+")")  // centre below axis
                .text("Genre");

            // price Vals is for our two final charts, heated scatter chart and heated segment chart
            let priceVals = d3.entries(groupValuesByPrice(data));


            if(vis_num === "main" || vis_num === "visual1" || vis_num === "visual2"){
                makeBars(chart, data, xscale, yscale);
            }else if(vis_num === "visual3"){
                makeScatter(chart, data, xscale, yscale);
            }else if(vis_num === "visual4"){
                makeColorBars(chart, data, xscale, yscale);
            }else if(vis_num === "visual5"){
                makeColorScatter(chart, data, xscale, yscale);
            }else if(vis_num === "visual6"){
                makeLines(chart, data, xscale, yscale);
            }else if(vis_num === "visual7"){
                makeSegments(chart, data, xscale, yscale);
            }else if(vis_num === "visual8"){
                makeHeatedScatter(chart, priceVals, xscale, yscale);
            }else if(vis_num === "visual9"){
                makeHeatedSegments(chart, priceVals, xscale, yscale);
            }
        });
}

function makeHeatedSegments(chart, data, xscale, yscale) {
    var colorScale = d3.scaleLinear().domain([1,15])
        .range(["white", "red"]);

    // Scale rectangle width based on # of apps
    var sizeScale = d3.scaleLog().domain([1, 1700])
        .range([2, xscale.bandwidth()]);

    let segs = chart.selectAll(".segs").data(data);
    segs.enter()
        .append("rect")
        .attr("class", "segs")
        .merge(segs)
        .attr("x", d => {
            // Check for NaN
            if (isNaN(xscale(d.value[0]))) {
                d.value[0] = "Other";
            }
            return margins.left + xscale(d.value[0]);
        })
        .attr("width", xscale.bandwidth())
        .attr("y", (d, i) => logCondition(yscale(d.value[1])))

        // Alt x and width to have width scaling to prices
        //.attr("x", d => margins.left + xscale(d.value[0]) + (xscale.bandwidth() - sizeScale(d.value[2]))/2)
        //.attr("width", d => sizeScale(d.value[2]))
        .attr("height", 5)
        .attr("fill", (d) => colorScale(d.value[2]));
    segs.exit().remove();
}

function makeHeatedScatter(chart, data, xscale, yscale) {
    // Make bars with colour scaling based on the # of apps
    // in a certain price range
    var myColor = d3.scaleLinear().domain([1,15])
        .range(["white", "blue"]);

    // Scale circle radius based on # of apps
    var radScale = d3.scaleLog().domain([1, 1700])
        .range([2,20]);

    // Go through price array
    let dots = chart.selectAll(".dots").data(data);
    console.log(data[0].value[0]);
    dots.enter()
        .append("circle")
        .attr("class", "dots")
        .merge(dots)
        .attr("cx", (d, i) => {
            // Check for NaN
            if (isNaN(xscale(d.value[0]))) {
                d.value[0] = "Other";
            }
            // Map genre
            return margins.left + xscale.bandwidth()/2 + xscale(d.value[0]);
        })
        .attr("cy", (d, i) => logCondition(yscale(d.value[1])))   // Map price
        .attr("r", (d) => radScale(d.value[2]))     // Map # of apps for each price to radius and color
        .attr("fill", (d) => myColor(d.value[2]))
        .attr("opacity", 0.75);
    dots.exit().remove();
}

function groupValuesByPrice(data) {
    // Dictionary where each genre is a key
    // Value of each key is another dictionary of each unique price
    // linked to the # of apps with that price
    var genrePrices = {};

    // Loop over data
    for (i in data) {
        let genre = data[i].genres;

        // Handle undefined prices
        if (typeof data[i].price !== 'undefined') {
            var price = data[i].price;
        } else {
            var price = "0";
        }

        // If an app in this genre has already been added
        if (genre in genrePrices) {
            // If an app with the same price has already been added
            if (price in genrePrices[genre]) {
                genrePrices[genre][price]++;
            } else {
                // Add new entry for this price
                genrePrices[genre][price] = 1;
            }
        } else {
            // Make new entry for genre
            genrePrices[genre] = {};
            genrePrices[genre][price] = 1;   // Initialize the # of apps with this price
        }
    }
    //console.log(genrePrices);

    // Use the dictionary to make a 3-length array
    // like [genre][price][number of apps]
    priceArray = [];
    for (genre in genrePrices) {
        for (price in genrePrices[genre]) {
            //if price

            subarray = [];
            subarray[0] = genre;
            subarray[1] = +price;   // price
            subarray[2] = genrePrices[genre][price];  // # of apps
            priceArray.push(subarray);
        }
    }
    //console.log(priceArray);
    return priceArray;
}



function colorPicker(v) {
    if (v <= 10) {
        return "#5499C7";
    } else if (v <= 50) {
        return "#48C9B0";
    } else if (v <= 100) {
        return "#F4D03F";
    } else if (v <= 100) {
        return "#DC7633";
    } else if (v <= 200) {
        return "#EC7063";
    } else if (v <= 300) {
        return "#A569BD";
    } else {
        return "#566573";
    }
}

function logCondition(v) {
    if (isNaN(v)) {
        return margins.top + 750;
    } else {
        return margins.top + v;
    }
}

function makeSegments(chart, data, xscale, yscale) {
    let segs = chart.selectAll(".segs").data(data);
    segs.enter()
        .append("rect")
        .attr("class", "segs")
        .merge(segs)
        .attr("x", d => margins.left + xscale(d.genres))
        .attr("y", (d, i) => logCondition(yscale(d.price)) - 5)
        .attr("width", xscale.bandwidth())
        .attr("height", 5)
        .attr("fill", "darkred");

    segs.exit().remove();
}

function makeScatter(chart, amount, xscale, yscale) {
    let dots = chart.selectAll(".dots").data(amount);
    dots.enter()
        .append("circle")
        .attr("class", "dots")
        .merge(dots)
        .attr("cx", d => margins.left + xscale(d.genres))
        .attr("cy", (d, i) => logCondition(yscale(d.price)))
        .attr("r", 5)
        .attr("fill", "darkred");

    dots.exit().remove();
}

function makeColorScatter(chart, amount, xscale, yscale) {
    let dots = chart.selectAll(".dots").data(amount);
    dots.enter()
        .append("circle")
        .attr("class", "dots")
        .merge(dots)
        .attr("cx", d => margins.left + xscale(d.genres))
        .attr("cy", (d, i) => logCondition(yscale(d.price)))
        .attr("r", 3.5)
        .attr("fill", d => colorPicker(d.price));

    dots.exit().remove();
}

function makeColorBars(chart, amount, xscale, yscale) {
    let colorscale = d3.scaleSequential([0, 9], d3.interpolateBlues);
    let bars = chart.selectAll(".bars").data(amount);
    bars.enter()
        .append("rect")
        .attr("class", "bars")
        .merge(bars)
        .attr("x", d => margins.left + xscale(d.genres))
        .attr("y", (d, i) => margins.top + yscale(d.price))
        .attr("height", d => innerHeight - yscale(d.price))
        .attr("width", xscale.bandwidth())
        .attr("fill", d => colorPicker(d.price));

    bars.exit().remove();
}

function makeBars(chart, amount, xscale, yscale) {
    let bars = chart.selectAll(".bars").data(amount);
    //console.log(amount);
    bars.enter()
        .append("rect")
        .attr("class", "bars")
        .merge(bars)
        .attr("x", d => margins.left + xscale(d.genres))
        .attr("y", (d, i) => margins.top + yscale(d.price))
        .attr("height", d => innerHeight - yscale(d.price))
        .attr("width", xscale.bandwidth())
        .attr("fill", "darkred");

    bars.exit().remove();
}

function makeLines(chart, data, xscale, yscale) {
    // Add vertical lines
    let lines = chart.selectAll(".lines").data(data);
    lines.enter()
        .append("line")
        .attr("class", "lines")
        .merge(lines)
        .attr("x1", d => xscale(d.genres) + (xscale.bandwidth()/2))
        .attr("x2", d => xscale(d.genres) + (xscale.bandwidth()/2))
        .attr("y1", (d, i) => innerHeight)
        .attr("y2", (d, i) => yscale(d.price))
        .attr("style", "stroke:rgb(255,0,0);stroke-width:2")
        .attr("transform", `translate(${margins.left},${margins.top})`);

    // Add tick marks
    //makeTicks(chart, y1, y2, x);
}

function makeTicks(chart, y1, y2, midpoint) {
    let tickLength = 20;
    chart.append("line")
        .attr("x1", midpoint - (tickLength/2))    // Left side tick
        .attr("x2", midpoint + (tickLength/2))
        .attr("y1", y1)    // Extend ticks by tickLength/2
        .attr("y2", y1)
        .attr("style", "stroke:rgb(255,0,0);stroke-width:2")
        .attr("transform", `translate(${margins.left},${margins.top})`);

    chart.append("line")
        .attr("x1", midpoint - (tickLength/2))    // Right side tick
        .attr("x2", midpoint + (tickLength/2))
        .attr("y1", y2)    // Extend ticks by tickLength/2
        .attr("y2", y2)
        .attr("style", "stroke:rgb(255,0,0);stroke-width:2")
        .attr("transform", `translate(${margins.left},${margins.top})`);
}

function makeAxes(chart, axes) {
    let selection = chart.selectAll(".axis").data(axes);
    return (
        selection
            .enter()
            .append("g")
            .attr("class", "axis")
            .attr(
                "transform",
                (d, i) =>
                    `translate(${margins.left}, ${margins.top +
                    (i % 2 === 0 ? innerHeight : 0)})`
            )
            .merge(selection)
            //this is much more complicated than necessary.
            .each(function(d, i, nodes) {
                d(d3.select(nodes[i]));
            })
            .selectAll("text")
            .attr("transform", "translate(-10,5)rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", 13)
    );
}

function makeInnerArea(chart) {
    chart
        .append("rect")
        .attr("class", "inner")
        .attr("x", margins.left)
        .attr("y", margins.top)
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("fill", "black");
}