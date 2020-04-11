const margins = { top: 20, right: 20, bottom: 110, left: 75 };
const smallChartWidth = 500;
const smallChartHeight = 400;
const bigChartWidth = 1315;
const bigChartHeight = 400;

const innerWidth = smallChartWidth - margins.left - margins.right;
const innerHeight = smallChartHeight - margins.top - margins.bottom;

const bigInnerWidth = bigChartWidth - margins.left - margins.right;
const bigInnerHeight = bigChartHeight - margins.top - margins.bottom;

function makechart(vis_type) {
    let small_graph;
    small_graph = vis_type === "legend" || vis_type === "scatterplotPaid";
    // Make inner area for chart, depending on parameter, it will choose which ID to select
    let chart_area = "#" + vis_type;
    let chart = d3.select(chart_area);
    if (small_graph) {
        makeInnerArea(chart, true);
    } else {
        makeInnerArea(chart, false);
    }

    // Load the dataset
    let subsetData;
    let data = d3
        .csv("googleplaystoreexcel.csv", function (d, i, names) {
            // Accessor function
            let parsed_price = d["Price"];
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
                content: d["Content Rating"],
            };
        })
        .then(function (data) {
            // data cleaning
            data = group_genres(clean_genre(data));

            subsetData = specificGenre(data, "Games");
            let subsetDataPaid = specificGenre(data, "Games");
            //console.log(data[0]);
            // Run when data is loaded
            //console.log(data);

            // Make y axis (with categories)
            let app = data.map((d) => d.app);
            let reviews = data.map((d) => d.reviews);
            let installs = data.map((d) => d.installs);
            let content = data.map((d) => d.content);
            let genre = data.map((d) => d.genres);
            let rating = data.map((d) => d.rating);
            let prices = data.map((d) => d.price);
            //let max = Math.max.apply(Math, reviews);
            //let game = d3.entries(groupDataByGenre(data));
            let appName = d3.select("#appName");
            let xscale;
            let yscale;
            //if (small_graph) {
            //    xscale = d3.scaleBand(genre, [0, innerWidth]).paddingInner(0.1).paddingOuter(0.25);

            //    yscale = d3.scaleLog([0.5, max], [innerHeight, 0]).base(2).nice();
            //} else {
            xscale = d3.scaleBand(genre, [0, bigInnerWidth]).paddingInner(0.1).paddingOuter(0.25);

            yscale = d3.scaleLinear([0, 5], [bigInnerHeight, 0]).nice();
            //}

            let xaxis = d3.axisBottom(xscale).ticks(5);
            let yaxis = d3.axisLeft(yscale).ticks(10);
            let axes = [xaxis, yaxis];
            // if (small_graph) {
            //     makeAxes(chart, axes, true);

            //     // Add axis labels
            //     chart
            //         .append('text')
            //         .attr('text-anchor', 'middle') // this makes it easy to centre the text as the transform is applied to the anchor
            //         .style('stroke', 'white')
            //         .attr('transform', 'translate(' + margins.left / 2 + ',' + bigChartHeight / 2 + ')rotate(-90)') // text is drawn off the screen top left, move down and out and rotate
            //         .text('Reviews');

            //     chart
            //         .append('text')
            //         .attr('text-anchor', 'middle') // this makes it easy to centre the text as the transform is applied to the anchor
            //         .attr('transform', 'translate(' + smallChartWidth / 2 + ',' + (smallChartHeight + 70) + ')') // centre below axis
            //         .text('Genre');
            // } else
            if (vis_type === "scatterplot") {
                makeAxes(chart, axes, false);

                // Add axis labels
                chart
                    .append("text")
                    .attr("text-anchor", "middle") // this makes it easy to centre the text as the transform is applied to the anchor
                    .style("fill", "white")
                    .attr(
                        "transform",
                        "translate(" + margins.left / 4 + "," + bigChartHeight / 2 + ")rotate(-90)"
                    ) // text is drawn off the screen top left, move down and out and rotate
                    .text("Rating");

                chart
                    .append("text")
                    .attr("text-anchor", "middle") // this makes it easy to centre the text as the transform is applied to the anchor
                    .style("fill", "white")
                    .attr(
                        "transform",
                        "translate(" + bigChartWidth / 2 + "," + (bigChartHeight - 20) + ")"
                    ) // centre below axis
                    .text("Genre");
            }

            // price Vals is for our two final charts, heated scatter chart and heated segment chart
            let freepriceVals = d3.entries(groupValuesByPrice(data, "Free"));
            let paidpriceVals = d3.entries(groupValuesByPrice(data, "Paid"));
            let priceVals = d3.entries(groupValues(data, "Free", "rating"));
            //console.log(priceVals[i].value[2]);
            // if (priceVals[i].value[2].reviews < totalmin) {
            //     totalmin = priceVals[i].value[2].reviews;
            // } else if (priceVals[i].value[2].reviews > totalmax) {
            //     totalmax = priceVals[i].value[2].reviews;
            // }
            let maxGroup = 0;
            for (i in priceVals) {
                if (priceVals[i].value[2].length > maxGroup) {
                    maxGroup = priceVals[i].value[2].length;
                }
            }
            console.log(maxGroup);
            console.log(priceVals[1].value[2].length);
            let myColor = d3
                .scaleLog()
                .domain([1, 2, 4, 8, 16, 32, 64, 128, 256])
                .range(d3.schemeBlues[9]);

            // if (vis_type === 'scatterplotFree') {
            //     makeHeatedScatter(chart, freepriceVals, xscale, yscale);
            // } else if (vis_type === 'scatterplotPaid') {
            //     makeHeatedScatter(chart, paidpriceVals, xscale, yscale);
            // } else
            if (vis_type === "scatterplot") {
                makeHeatedScatter(chart, priceVals, xscale, yscale, myColor);
            } else if (vis_type === "legend") {
                makeLegend(chart, myColor);
            }
            //} //else if (vis_type === "bubblepaid") {
            //bubbleChart(chart, subsetDataPaid, xscale, yscale);
        });
}

function makeLegend(chart, myColor) {
    let scatterDomain = [1, 2, 4, 8, 16, 32, 64, 128, 256];
    let bubbleTypeDomain = ["Free", "Paid"];
    let bubbleSizeDomain = [1, 100, 10000, 1000000, 100000000];
    let scatterLegend = chart.selectAll(".legend").data(scatterDomain);
    let bubbleTypeLegend = chart.selectAll(".legend").data(bubbleTypeDomain);
    let bubbleSizeLegend = chart.selectAll(".legend").data(bubbleSizeDomain);
    let bubbleFreeColor = d3
        .scaleLog()
        .domain([1, 100, 10000, 1000000, 100000000])
        .range(d3.schemePurples[5]);
    let bubblePaidColor = d3
        .scaleLog()
        .domain([1, 100, 10000, 1000000, 100000000])
        .range(d3.schemeGreens[5]);
    // .attr('transform', function (d, i) {
    //     return 'translate(-100,' + (i + 1) * 20 + ')';
    // });
    scatterLegend
        .enter()
        .append("rect")
        .attr("x", 10)
        .attr("y", function (d, i) {
            return 360 + i * -40;
        })
        .attr("width", 25)
        .attr("height", 25)
        .style("fill", (d, i) => myColor(d));

    scatterLegend
        .enter()
        .append("text")
        .attr("x", 10 + 25 * 1.5)
        .attr("y", function (d, i) {
            return 365 + i * -40 + 25 / 2;
        })
        .style("fill", "white")
        .text(function (d) {
            return "\u2264 " + d;
        })
        .attr("font-size", 18)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");

    scatterLegend
        .enter()
        .append("text")
        .attr("x", 10)
        .attr("y", 20)
        .style("fill", "white")
        .text("# of Apps")
        .attr("font-size", 25)
        .attr("text-anchor", "right")
        .style("alignment-baseline", "middle");

    bubbleTypeLegend
        .enter()
        .append("circle")
        .attr("cx", function (d, i) {
            return 200;
        })
        .attr("cy", function (d, i) {
            return smallChartHeight / 4 + 50 + i * 100;
        })
        .attr("r", 10)
        .style("fill", function (d) {
            if (d === "Paid") {
                return bubblePaidColor(1000000);
            } else {
                return bubbleFreeColor(1000000);
            }
        });
    bubbleTypeLegend
        .enter()
        .append("text")
        .attr("x", function (d, i) {
            return 200 * 1.1;
        })
        .attr("y", function (d, i) {
            return smallChartHeight / 4 + 50 + i * 100;
        })
        .style("fill", "white")
        .text(function (d) {
            return d;
        })
        .attr("font-size", 20)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");

    bubbleTypeLegend
        .enter()
        .append("text")
        .attr("x", 200)
        .attr("y", 20)
        .style("fill", "white")
        .text("Type")
        .attr("font-size", 25)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");

    bubbleSizeLegend
        .enter()
        .append("circle")
        .attr("cx", 340)
        .attr("cy", function (d, i) {
            if (d === 1) {
                return 60;
            } else if (d === 100) {
                return 60 + i * 20 + 20;
            } else if (d === 10000) {
                return 60 + i * 30 + 40;
            } else if (d === 1000000) {
                return 60 + i * 40 + 60;
            } else if (d === 100000000) {
                return 60 + i * 50 + 80;
            }
        })
        .attr("r", function (d, i) {
            if (d === 1) {
                return 5;
            } else if (d === 100) {
                return 8;
            } else if (d === 10000) {
                return 12;
            } else if (d === 1000000) {
                return 16;
            } else if (d === 100000000) {
                return 20;
            }
        })
        .style("fill", function (d) {
            if (d === "Paid") {
                return bubblePaidColor(d);
            } else {
                return bubbleFreeColor(d);
            }
        });
    bubbleSizeLegend
        .enter()
        .append("text")
        .attr("x", 375)
        .attr("y", function (d, i) {
            if (d === 1) {
                return 60;
            } else if (d === 100) {
                return 60 + i * 20 + 20;
            } else if (d === 10000) {
                return 60 + i * 30 + 40;
            } else if (d === 1000000) {
                return 60 + i * 40 + 60;
            } else if (d === 100000000) {
                return 60 + i * 50 + 80;
            }
        })
        .style("fill", "white")
        .text(function (d) {
            return "< " + d;
        })
        .attr("font-size", 16)
        .attr("text-anchor", "right")
        .style("alignment-baseline", "middle");
    bubbleSizeLegend
        .enter()
        .append("text")
        .attr("x", 325)
        .attr("y", 20)
        .style("fill", "white")
        .text("# of Reviews")
        .attr("font-size", 25)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");
    /*    console.log('min:' + min);
    console.log('max:' + max);*/
}

// creates the heated scatter map
function makeHeatedScatter(chart, data, xscale, yscale, myColor) {
    // Make bars with colour scaling based on the # of apps
    // in a certain price range

    // Scale circle radius based on # of apps
    let radScale = d3.scaleLog().domain([1, 1700]).range([2, 20]);

    // Go through price array
    let dots = chart.selectAll(".dots").data(data);

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
            return margins.left + xscale.bandwidth() / 2 + xscale(d.value[0]);
        })
        .attr("cy", (d, i) => logCondition(yscale(d.value[1]))) // Map rating
        //.attr('r', (d) => radScale(d.value[2].length)) // Map # of apps for each price to radius and color
        .attr("r", 10)
        .attr("fill", (d) => myColor(d.value[2].length))
        .attr("opacity", 0.75)
        .on("click", function (d) {
            clickScatter.call(this, d, myColor);
            // no parameters to signify no data, so revert back to headers
            handleAppWindow();
        });
    dots.exit().remove();
}

// Called when dots on the scatterplot are clicked. the onClick function
function clickScatter(d, myColor) {
    console.log("clicked scatter point", d);
    //let myColor = d3.scaleLinear().domain([1, 15]).range(['white', 'blue']); // Color scale for scatterplot
    let subsetdata = d.value[2]; // Get list of apps for this point

    // Clear bubble chart
    let circles = d3
        .selectAll(".bubbles")
        .transition()
        .duration(500)
        .attr("fill", "#101010")
        .remove();

    let dot = d3.select(this);
    var highlighted = dot.classed("highlighted");

    if (highlighted) {
        // If dot already selected, deselect
        dot.style("fill", (d) => {
            return myColor(d.value[2].length);
        }) // Color scatter based on # of apps
            .classed("highlighted", false);
    } else {
        // Unhighlight all other dots
        let highlighted = d3.selectAll(".highlighted");
        highlighted.classed("highlighted", false).style("fill", (d) => {
            return myColor(d.value[2].length);
        });

        // Highlight the dot
        dot.style("fill", "red").classed("highlighted", true);

        // Update bubble chart
        bubbleChart(d3.select("#bubblefree"), subsetdata);
    }
}

// creates a bubblechart provided the data
function bubbleChart(chart, data) {
    let bubbleFreeColor = d3
        .scaleLog()
        .domain([1, 100, 10000, 1000000, 100000000])
        .range(d3.schemePurples[5]);
    let bubblePaidColor = d3
        .scaleLog()
        .domain([1, 100, 10000, 1000000, 100000000])
        .range(d3.schemeGreens[5]);
    let min = 0;
    let max = 0;
    for (i in data) {
        if (i.reviews < min) {
            min = data[i].reviews;
        } else if (data[i].reviews > max) {
            max = data[i].reviews;
        }
    }
    console.log(min);
    console.log(max);
    let radiusScale = d3.scaleLog().domain([1, 100000000]).range([5, 20]);
    let forceXSeparate = d3
        .forceX(function (d) {
            if (d.type !== "Paid") {
                return bigChartWidth / 4;
            } else {
                return bigChartWidth / 2 + bigChartWidth / 4;
            }
        })
        .strength(0.05);

    let forceXCombine = d3.forceX(bigChartWidth / 2).strength(0.05);

    let forceY = d3
        .forceY(function (d) {
            return bigChartHeight / 2;
        })
        .strength(0.2);

    let forceCollide = d3.forceCollide(function (d) {
        return radiusScale(d.reviews) + 1;
    });
    let simulation = d3
        .forceSimulation()
        .nodes(data)
        .force("x", forceXSeparate)
        .force("y", forceY)
        .force("collide", forceCollide);

    d3.select("#decade").on("click", function () {
        simulation.force("x", forceXSeparate).alphaTarget(0.25).restart();
    });

    d3.select("#combine").on("click", function () {
        console.log("combination");
        simulation.force("x", forceXCombine).alphaTarget(0.1).restart();
    });

    //var circles = chart.selectAll(".artist").data(data);
    //console.log("bubble data", data);

    let circles = chart.append("g");
    let node = circles
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "bubbles")
        .attr("r", (d) => {
            if (d.reviews === 0) {
                console.log("zero: " + d);
                return 1;
            } else {
                return radiusScale(d.reviews);
            }
        })
        .attr("fill", (d) => {
            if (d.reviews === 0) {
                return "grey";
            }
            if (d.type === "Paid") {
                return bubblePaidColor(d.reviews);
            } else {
                return bubbleFreeColor(d.reviews);
            }
        })
        .on("mouseover", function (d) {
            d3.select(this).transition().style("fill", "#FFB951");
            console.log(d);
        })
        .on("click", function (d) {
            console.log("on click, received", d);
            d3.select(this).transition().attr("r", 50).style("fill", "#cc8899");
            handleAppWindow(d);
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .transition()
                .style("fill", function () {
                    if (d.type === "Paid") {
                        return bubblePaidColor(d.reviews);
                    } else {
                        return bubbleFreeColor(d.reviews);
                    }
                })
                .attr("r", function (d) {
                    if (d.reviews === 0) {
                        console.log("zero: " + d);
                        return 1;
                    } else {
                        return radiusScale(d.reviews);
                    }
                });
        });

    circles.exit().remove();

    simulation.nodes(data).on("tick", function (d) {
        circles
            .selectAll(".bubbles")
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            });
    });
}

// function that handles the app information window, whether its changing it to d, or reverting it back to normal
function handleAppWindow(d) {
    const appName = document.getElementById("appName");
    const appGenre = document.getElementById("appGenre");
    const appRating = document.getElementById("appRating");
    const appPrice = document.getElementById("appPrice");
    const appReviews = document.getElementById("appReviews");
    const appInstalls = document.getElementById("appInstalls");

    if (!d) {
        d3.select(appName).text("App Name");
        d3.select(appGenre).text("Genre");
        d3.select(appRating).text("Rating");
        d3.select(appPrice).text("Price");
        d3.select(appReviews).text("# of Reviews");
        d3.select(appInstalls).text("# of Installs");
    } else {
        // app name
        d3.select(appName).text(d.app);
        // app genre
        d3.select(appGenre).text("Genre: " + d.genres);
        // app rating
        d3.select(appRating).text("Rating: " + d.rating);
        // app price
        d3.select(appPrice).text("Price: " + d.price + " dollars");
        // app reviews
        d3.select(appReviews).text(d.reviews + " Reviews");
        // app installs
        d3.select(appInstalls).text(d.installs + " Installs");
    }
}
function groupValues(data, priceType, metricName = "rating") {
    // Dictionary where each genre is a key
    // Value of each key is another dictionary of each unique price
    // linked to the # of apps with that price
    let genrePrices = {};

    // Loop over data
    for (i in data) {
        let metric;
        if (metricName === "rating") {
            metric = data[i].rating;
        } else if (metricName === "reviews") {
            metric = data[i].reviews;
        }

        // NaN handling?
        /*if (isNaN(metric)) {
            metric = 0;
        } */

        let genre = data[i].genres;

        // If an app in this genre has already been added
        if (genre in genrePrices) {
            // Check if an app with this rating value has already been added
            // If an app with the same price has already been added
            if (metric in genrePrices[genre]) {
                //genrePrices[genre][metric]["numApps"]++;
                genrePrices[genre][metric]["apps"].push(data[i]); // Add the app info

                // Check if this value is a new min or max for this rating range
                /*min = genrePrices[genre][metric]["minReviews"];
                max = genrePrices[genre][metric]["maxReviews"];

                if (metric < min) {
                    genrePrices[genre][metric]["minReviews"] = metric;
                } else if (metric > max) {
                    genrePrices[genre][metric]["maxReviews"] = metric;
                } */
            } else {
                // Add new entry for this value
                genrePrices[genre][metric] = {};
                genrePrices[genre][metric]["apps"] = [];
                genrePrices[genre][metric]["apps"].push(data[i]);
                //genrePrices[genre][metric]["maxReviews"] = data[i].reviews;  // Maximum review value for this metric
                //genrePrices[genre][metric]["minReviews"] = data[i].reviews;
            }
        } else {
            // Make new entry for genre
            genrePrices[genre] = {};
            genrePrices[genre][metric] = {};
            genrePrices[genre][metric]["apps"] = [];
            //genrePrices[genre][metric]["maxReviews"] = data[i].reviews;  // Maximum review value for this metric
            //genrePrices[genre][metric]["minReviews"] = data[i].reviews;
            genrePrices[genre][metric]["apps"].push(data[i]); // Add the app info
        }
    }
    console.log("values", genrePrices);

    // Use the dictionary to make a 3-length array
    // like [genre][rating][number of apps][minimum reviews][maximum reviews]
    let scatterArray = [];

    for (var genre in genrePrices) {
        //metricArray[genre]["apps"] = genrePrices[genre]["apps"];   // Add list of apps to each genre
        for (var metric in genrePrices[genre]) {
            var subarray = [];
            subarray[0] = genre;
            subarray[1] = +metric; // price
            subarray[2] = genrePrices[genre][metric]["apps"];
            //subarray[3] = genrePrices[genre][metric]["minReviews"];
            //subarray[3] = genrePrices[genre][metric]["maxReviews"];
            scatterArray.push(subarray);
        }
    }
    //metricArray = d3.entries(genrePrices);
    console.log("scatterdata", scatterArray);
    return scatterArray;
}

function groupValuesByPrice(data, priceType) {
    // Dictionary where each genre is a key
    // Value of each key is another dictionary of each unique price
    // linked to the # of apps with that price
    let genrePrices = {};

    // Loop over data
    for (i in data) {
        let price;
        let genre = data[i].genres;
        if (priceType === "Paid") {
            if (data[i].type === "Paid") {
                price = data[i].reviews;
            }
        } else if (priceType === "Free") {
            if (data[i].type === "Free") {
                price = data[i].reviews;
            } else if (data[i].price === 0) {
                price = data[i].reviews;
            } else if (typeof data[i].price !== "undefined") {
                price = data[i].reviews;
            }
        } else {
            price = data[i].reviews;
        }
        // Handle undefined prices

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
            genrePrices[genre][price] = 1; // Initialize the # of apps with this price
        }
    }
    //console.log(genrePrices);

    // Use the dictionary to make a 3-length array
    // like [genre][price][number of apps]
    let priceArray = [];
    for (genre in genrePrices) {
        for (price in genrePrices[genre]) {
            //if price

            subarray = [];
            subarray[0] = genre;
            subarray[1] = +price; // price
            subarray[2] = genrePrices[genre][price]; // # of apps
            priceArray.push(subarray);
        }
    }
    //console.log(priceArray);
    return priceArray;
}

function logCondition(v) {
    if (isNaN(v)) {
        return margins.top + 750;
    } else {
        return margins.top + v;
    }
}

function makeAxes(chart, axes, smallChart) {
    let selection = chart.selectAll(".axis").data(axes);
    let res;
    if (smallChart) {
        res = selection
            .enter()
            .append("g")
            .attr("class", "axis")
            .attr(
                "transform",
                (d, i) =>
                    `translate(${margins.left}, ${margins.top + (i % 2 === 0 ? innerHeight : 0)})`
            )
            .merge(selection)
            //this is much more complicated than necessary.
            .each(function (d, i, nodes) {
                d(d3.select(nodes[i]));
            })
            .selectAll("text")
            .attr("transform", "translate(-10,5)rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", 13);
    } else {
        res = selection
            .enter()
            .append("g")
            .attr("class", "axis")
            .attr(
                "transform",
                (d, i) =>
                    `translate(${margins.left}, ${
                        margins.top + (i % 2 === 0 ? bigInnerHeight : 0)
                    })`
            )
            .merge(selection)
            //this is much more complicated than necessary.
            .each(function (d, i, nodes) {
                d(d3.select(nodes[i]));
            })
            .selectAll("text")
            .attr("transform", "translate(-15,0)rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", 11);
    }

    return res;
}

function makeInnerArea(chart, smallChart) {
    if (smallChart) {
        chart
            .append("rect")
            .attr("class", "inner")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", smallChartWidth)
            .attr("height", smallChartHeight)
            .attr("fill", "black");
    } else {
        chart
            .append("rect")
            .attr("class", "inner")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", bigChartWidth)
            .attr("height", bigChartHeight)
            .attr("fill", "black");
    }
}
