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
            var max = Math.max.apply(Math, prices);

            let xscale = d3
                .scaleBand(genre, [0, innerWidth])
                .paddingInner(0.1)
                .paddingOuter(0.25);

            // let yscale = d3
            //     .scaleLinear([d3.min(prices), d3.max(prices)], [innerHeight, 0])
            //     .nice();

            let yscale = d3
                .scaleLog([0.5, max], [innerHeight, 0])
                .base(2)
                .nice();

            let xaxis = d3.axisBottom(xscale).ticks(5);
            let yaxis = d3.axisLeft(yscale).ticks(10);
            let axes = [xaxis, yaxis];
            makeAxes(chart, axes);

            //comment/uncomment these lines to see different graphs
            //makeBars(chart, data, xscale, yscale);
            //makeColorBars(chart, data, xscale, yscale);
            makeColorScatter(chart, data, xscale, yscale);
            //makeScatter(chart, data, xscale, yscale);
        });
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

function makeScatter(chart, amount, xscale, yscale) {
    let dots = chart.selectAll(".dots").data(amount);
    dots.enter()
        .append("circle")
        .attr("class", "dots")
        .merge(dots)
        .attr("cx", d => margins.left + xscale(d.genres))
        .attr("cy", (d, i) => logCondition(yscale(d.price)))
        .attr("r", 2.5)
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
    console.log(amount);
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

function makeLines(chart, amount, xscale, yscale) {}

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
            .style("font-size", 14)
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
        .attr("fill", "white");
}
