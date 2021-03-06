/**
 * Created by bikramkawan on 7/16/17.
 */
import React, {Component} from 'react';
import * as d3 from 'd3';
import databak from './databak.csv';
class RadialHistogram extends Component {

    renderRadial() {

        var alldata = [];
        var allsum = 0;
        d3.csv(databak, function (csvdata) {
            csvdata.forEach(function (d, i) {


                alldata.push({
                    key: i,
                    distance: parseFloat(d.Distance),
                    id: parseFloat(d.ID),
                    value: parseFloat(d.Value)
                })
                allsum = allsum + parseFloat(d.Value);

            })

            var histogram = [];
            var sum = 0;

            alldata.forEach(function (d, i) {

                histogram.push({key: i, value: d.value, distance: d.distance, id: d.id});
                sum += d.value;
                // console.log(i, d.value, sum)

            })
            console.log(alldata)

            var width = 600,
                height = 500,
                maxBarHeight = 200,
                center = 100,
                cx = width / 2,
                cy = height / 2;

            var radialScale = d3.scale.linear()
                .domain([0, 360])
                .range([0, 2 * Math.PI]);

            var scale = d3.scale.linear()
                .domain([d3.min(histogram, function (d) {
                    return d.value
                }), d3.max(histogram, function (d) {
                    return d.value
                })])
                .range([center, maxBarHeight]);

            var vis = d3.select("#radialHistogram")
                .attr("width", width)
                .attr("height", height);


            var innerCircle = vis.append("circle")
                .attr("cx", cx)
                .attr("cy", cy)
                .attr("r", center)
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", "2px");

            var innerCircleOverlay = vis.append("circle")
                .attr("cx", cx)
                .attr("cy", cy)
                .attr("class", "overlay")
                .attr("r", center)
                .attr("fill", "white")
                .attr("style", "opacity:1")
                .attr("stroke", "black")
                .attr("stroke-width", "2px");

            var text = vis.append("text")
                .attr("x", cx)
                .attr("y", cy)
                .attr("font-size", "20px")
                .text(`[Min,Max] = [` + d3.min(histogram, function (d) {
                        return d.value
                    }) + "," + d3.max(histogram, function (d) {
                        return d.value
                    }) + "]");

            var text2 = vis.append("text")
                .attr("x", cx)
                .attr("y", cy + 20)
                .text("Total = " + sum + " %");
            var text3 = vis.append("text")
                .attr("x", cx)
                .attr("y", cy + 40)
                .text("Total Distance= " + d3.sum(histogram, function (d) {
                        return d.distance
                    }));

            var arc = d3.svg.arc()
                .innerRadius(center)
                .outerRadius(function (d) {
                    return scale(d.value);
                })
                .startAngle(function (d) {
                    return radialScale(d.key);
                })
                .endAngle(function (d) {
                    return radialScale(d.key + 1.4);
                });

            var arc2 = d3.svg.arc()
                .innerRadius(function (d) {
                    return scale(d.value);
                })
                .outerRadius(maxBarHeight)
                .startAngle(function (d) {
                    return radialScale(d.key);
                })
                .endAngle(function (d) {
                    return radialScale(d.key + 1.4);
                });

            var data = vis.selectAll("path")
                .data(histogram)
                .enter();

            // outer path
            data.append("path")
                .attr("d", arc2)
                .classed('pathRadialOut', true)
                .attr("transform", "translate(" + cx + "," + cy + ")")
                .call(interactions, false);

            // inner path
            data.append("path")
                .classed('pathRadial', true)
                .attr("d", arc)
                .attr("style", function (d) {

                    var hue = d.key / 360;
                    var rgb = hslToRgb(hue, 0.5, 0.5);
                    return "fill: " + rgbToFill(rgb, d.value);
                })

                .attr("transform", "translate(" + cx + "," + cy + ")")
                .call(interactions, true);

            function interactions(el, highlight) {
                el.on("mouseover", function (d) {
                    if (highlight) {
                        d3.select(this)
                            .attr("style", "fill:black");
                    } else {
                        d3.select(this)
                            .attr("style", "fill:#bbb");
                    }

                    innerCircleOverlay.attr("style", "opacity:0");

                    var hue = d.key / 360;
                    var rgb = hslToRgb(hue, 0.8, 0.5);
                    innerCircle.attr("fill", rgbToFill(rgb, d.value));

                    text.text("Distance = " + d.distance);
                    text2.text("Value = " + d.value + " %");
                    text3.text("ID =" + d.id);

                })
                    .on("mouseout", function (d) {
                        text.text(sum);
                        text2.text("Total %");

                        if (highlight) {
                            d3.select(this)
                                .attr("style", function (d) {
                                    var hue = d.key / 360;
                                    var rgb = hslToRgb(hue, 0.5, 0.5);
                                    return "fill: " + rgbToFill(rgb, d.value);
                                })
                        } else {
                            d3.select(this)
                                .attr("style", "fill:none")

                        }

                        innerCircleOverlay.attr("style", "opacity:1");
                    });
            }
        })


        function hslToRgb(h, s, l) {
            var r, g, b;

            if (s === 0) {
                r = g = b = l; // achromatic
            } else {
                function hue2rgb(p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                }

                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }

            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }

        function rgbToFill(rgb, value) {

            return (value > 0) ? "rgb(146,208,80)" : "rgb(255,51,153)"

        }

    }


    componentDidMount() {

        this.renderRadial();
    }

    render() {
        return (
            <div className="d3Container">
                <svg className="chart" id="radialHistogram">
                </svg>
            </div>
        );
    }
}

export default RadialHistogram;
