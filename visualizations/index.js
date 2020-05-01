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

            // Make y axis (with categories)
            let app = data.map((d) => d.app);
            let reviews = data.map((d) => d.reviews);
            let installs = data.map((d) => d.installs);
            let content = data.map((d) => d.content);
            let genre = data.map((d) => d.genres);
            let rating = data.map((d) => d.rating);
            let prices = data.map((d) => d.price);

            let xscale = d3
                .scaleBand(genre, [0, bigInnerWidth])
                .paddingInner(0.1)
                .paddingOuter(0.25);
            let yscale = d3.scaleLinear([0, 5], [bigInnerHeight, 0]).nice();

            let xaxis = d3.axisBottom(xscale).ticks(5);
            let yaxis = d3.axisLeft(yscale).ticks(10);

            let axes = [xaxis, yaxis];

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
            let priceVals = d3.entries(groupValues(data, "Free", "rating"));

            let maxGroup = 0;
            for (i in priceVals) {
                if (priceVals[i].value[2].length > maxGroup) {
                    maxGroup = priceVals[i].value[2].length;
                }
            }

            let myColor = d3
                .scaleLog()
                .domain([1, 2, 4, 8, 16, 32, 64, 128, 256])
                .range(d3.schemeBlues[9]);

            if (vis_type === "scatterplot") {
                makeHeatedScatter(chart, priceVals, xscale, yscale, myColor);
            } else if (vis_type === "legend") {
                makeLegend(chart, myColor);
            }
        });
}

function makeLegend(chart, myColor) {
    let scatterDomain = [1, 2, 4, 8, 16, 32, 64, 128, 256];
    let bubbleTypeDomain = ["Free", "Paid"];
    let bubbleSizeDomain = [1, 100, 10000, 1000000, 100000000];
    let scatterLegend = chart.selectAll(".legend").data(scatterDomain);
    let bubbleTypeLegend = chart.selectAll(".legend").data(bubbleTypeDomain);
    let bubbleSizeLegend = chart.selectAll(".legend").data(bubbleSizeDomain);

    //uses a purple color scheme for the free apps
    let bubbleFreeColor = d3
        .scaleLog()
        .domain([1, 100, 10000, 1000000, 100000000])
        .range(d3.schemePurples[5]);

    //uses a green color scheme for the paid apps
    let bubblePaidColor = d3
        .scaleLog()
        .domain([1, 100, 10000, 1000000, 100000000])
        .range(d3.schemeGreens[5]);

    //Create a legend for the scatterplot
    //appending rectangles for each of the app groupings
    scatterLegend
        .enter()
        .append("rect")
        .attr("x", 10)
        .attr("y", function (d, i) {
            return 38 + i * 40;
        })
        .attr("width", 25)
        .attr("height", 25)
        .style("fill", (d, i) => myColor(d));

    //Add the text beside the rectangles to indicate the size of the group
    scatterLegend
        .enter()
        .append("text")
        .attr("x", 10 + 25 * 1.5)
        .attr("y", function (d, i) {
            return 40 + i * 40 + 25 / 2;
        })
        .style("fill", "white")
        .text(function (d) {
            return "\u2264 " + d;
        })
        .attr("font-size", 18)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");

    //Add the header for this legend
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

    //Adding circles for the 2 different types of apps; Free & Paid
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

    //Adding texts to describe the two types
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

    //Adding the header for this legend
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

    //Creating circles for the varying radiuses used in the bubble chart
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

    //Add text beside the circle depending on the number of reviews
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

    //Adding header to this legend
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
}

// creates the heated scatter map
function makeHeatedScatter(chart, data, xscale, yscale, myColor) {
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
    // Remove any existing tooltip
    d3.selectAll(".tool").remove();

    //Set the domain and range for the free bubbles
    let bubbleFreeColor = d3
        .scaleLog()
        .domain([1, 100, 10000, 1000000, 100000000])
        .range(d3.schemePurples[5]);
    //Set the domain and range for the paid bubbles
    let bubblePaidColor = d3
        .scaleLog()
        .domain([1, 100, 10000, 1000000, 100000000])
        .range(d3.schemeGreens[5]);

    //set the radius scale for the circles within the bubble chart
    let radiusScale = d3.scaleLog().domain([1, 100000000]).range([5, 20]);

    //set the forceX when the free and paid apps are supposed to be separated
    let forceXSeparate = d3
        .forceX(function (d) {
            if (d.type !== "Paid") {
                return bigChartWidth / 4;
            } else {
                return bigChartWidth / 2 + bigChartWidth / 4;
            }
        })
        .strength(0.05);

    //set the forceX when the apps are supposed to be combined
    let forceXCombine = d3.forceX(bigChartWidth / 2).strength(0.05);

    //set the forceY to be the center of the viewBox
    let forceY = d3
        .forceY(function (d) {
            return bigChartHeight / 2;
        })
        .strength(0.2);

    //set the space between the circles to be based on the reviews
    let forceCollide = d3.forceCollide(function (d) {
        return radiusScale(d.reviews) + 1;
    });

    //create the simulation
    let simulation = d3
        .forceSimulation()
        .nodes(data)
        .force("x", forceXSeparate)
        .force("y", forceY)
        .force("collide", forceCollide);

    //on click of the split button, set the forceX to be the forceXSeparate
    d3.select("#decade").on("click", function () {
        simulation.force("x", forceXSeparate).alphaTarget(0.25).restart();
    });

    //on click of the combine button, set the forceX to be the forceXCombine
    d3.select("#combine").on("click", function () {
        simulation.force("x", forceXCombine).alphaTarget(0.1).restart();
    });

    let circles = chart.append("g");

    // Add tooltip for app info
    var tooltip = d3.select("body")
        .append("div")
        .classed("tool", true)
        .style("position", "absolute")
        .style("z-index", "10")
        .style("fill", "white")
        .style("background", "MEDIUMSLATEBLUE")
        .style("visibility", "hidden");

    //set the radius of each of the cricles
    let node = circles
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "bubbles")
        .attr("r", (d) => {
            if (d.reviews === 0) {
                return 1;
            } else {
                return radiusScale(d.reviews);
            }
        })
        //fill the circles based on their free or paid type
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
        //on hovering over a circle, set the circle fill to be an orange colour
        .on("mouseover", function (d) {
            d3.select(this).transition().style("fill", "#FFB951");

            // Define div for the bubble chart tooltip
            tooltip
                .style("visibility", "visible")
                .text(d.app);

        })
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
        //on clicking on the circle, it will set the radius of the circle to 30
        .on("click", function (d) {
            d3.select(this).transition().attr("r", 30);
            handleAppWindow(d);
        })
        //if you move your mouse away from the bubble, it will set the radius and fill back to what it was previously
        .on("mouseout", function (d) {
            // Hide app tooltip
            tooltip.style("visibility", "hidden");

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

        let genre = data[i].genres;

        // If an app in this genre has already been added
        if (genre in genrePrices) {
            // Check if an app with this rating value has already been added
            // If an app with the same price has already been added
            if (metric in genrePrices[genre]) {
                //genrePrices[genre][metric]["numApps"]++;
                genrePrices[genre][metric]["apps"].push(data[i]); // Add the app info
            } else {
                // Add new entry for this value
                genrePrices[genre][metric] = {};
                genrePrices[genre][metric]["apps"] = [];
                genrePrices[genre][metric]["apps"].push(data[i]);
            }
        } else {
            // Make new entry for genre
            genrePrices[genre] = {};
            genrePrices[genre][metric] = {};
            genrePrices[genre][metric]["apps"] = [];
            genrePrices[genre][metric]["apps"].push(data[i]); // Add the app info
        }
    }

    // Use the dictionary to make a 3-length array
    // like [genre][rating][number of apps][minimum reviews][maximum reviews]
    let scatterArray = [];

    for (var genre in genrePrices) {
        for (var metric in genrePrices[genre]) {
            var subarray = [];
            subarray[0] = genre;
            subarray[1] = +metric; // price
            subarray[2] = genrePrices[genre][metric]["apps"];
            scatterArray.push(subarray);
        }
    }
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
