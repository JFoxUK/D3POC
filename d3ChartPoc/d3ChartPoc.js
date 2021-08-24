/**
 * @description       : 
 * @author            : Jonathan Fox
 * @group             : 
 * @last modified on  : 24-08-2021
 * @last modified by  : Jonathan Fox
**/
import { LightningElement, api, track } from 'lwc';
import d3js from '@salesforce/resourceUrl/d3jsv7';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class D3ChartPoc extends LightningElement {
    svgWidth = 300;
    svgHeight = 600;

    error;
    chart;
    d3Initialized = false;
    chartData;
    

    renderedCallback() {
        if (this.d3Initialized) {
            return;
        }
        this.d3Initialized = true;
        loadScript(this, d3js)
        .then((response) => {
            this.chartData = [{"name": "Test Data 1","close": 7322,"open": 13882},{"name": "Test Data 2","close": 34856,"open": 29777},{"name": "Test Data 3","close": 24048,"open": 4009},{"name": "Test Data 4","close": 25625,"open": 31630},{"name": "Test Data 5","close": 15411,"open": 233},{"name": "Test Data 6","close": 4519,"open": 28609},{"name": "Test Data 7","close": 26418,"open": 38724},{"name": "Test Data 8","close": 32134,"open": 27787},{"name": "Test Data 9","close": 7158,"open": 17876},{"name": "Test Data 10","close": 11011,"open": 28178},{"name": "Test Data 11","close": 32028,"open": 33793},{"name": "Test Data 12","close": 37662,"open": 38627}];
            this.renderScatterPlot(this.chartData);
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({  
                    title: 'Error loading D3',
                    message: error.message,
                    variant: 'error'
                })
            );
        });
    }

    renderScatterPlot(data) {
        //console.log(data);

        // set the dimensions and margins of the graph
        const margin = {top: 10, right: 30, bottom: 30, left: 40},
        width = 350 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        const svg = d3.select(this.template.querySelector('.scatterplot'))
            .append('svg')
            .attr('width', width + margin.left + margin.right )
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform','translate(' + margin.left + ',' + margin.top + ')');


        // Add X axis
        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.open))
            .range([0, width]);

        var xAXis= svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .attr("class", "axisBlue")
            .call(d3.axisBottom(x));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain(d3.extent(data, d => d.close))
            .range([height, 0]);

        svg.append('g')
            .attr("class", "axisRed")
            .call(d3.axisLeft(y));

        // create a tooltip
        const tooltip = d3.select(this.template.querySelector('.scatterplot'))     
            .append('div')
            .style('opacity', 0)
            .attr('class', 'tooltip')
            .style('font-size', '16px');

        // Three function that change the tooltip when user hover / move / leave a point
        const mouseover = (e, d) => {
            tooltip
                .transition()
                .duration(200)
                .style('opacity', 1);
                tooltip.text(`text here`)
                .style('left', (d3.pointer(e)[0] + 30) + 'px')
                .style('top', (d3.pointer(e)[1] + 30) + 'px');
        }

        const mousemove = (e) => {  
            tooltip
                .style('left', (d3.pointer(e)[0] + 30) + 'px')
                .style('top', (d3.pointer(e)[1] + 30) + 'px')
            }

        const mouseleave = (e) => {
            tooltip
                .transition()
                .duration(200)
                .style('opacity', 0)
        }

        const color = ["red", "blue", "green"];
        
        var i=0;

        var get_button;

        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width+20)
            .attr("height", height+20)
            .attr("x", -5)
            .attr("y", -5);

        // Add the brush feature using the d3.brush function
        var brush = d3.brushX()                
            .extent( [ [0,0], [width,height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area         
            .on("end", updateChart),idleTimeout,idleDelay = 350;

        var scatter = svg.append("g")
            .attr("id", "scatterplot")
            .attr("clip-path", "url(#clip)");

        scatter.append("g")
            .attr("class", "brush")
            .call(brush);

        scatter.append('g')
            .selectAll(this.template.querySelector('dot'))
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', d => x(d.open))
            .attr('cy', d => y(d.close))
            .attr('title', d => d.name)
            .attr('r', 4)
            .attr("fill",  (d) => {
                if(i==3)
                    i=0;
                return color[i++];
                })
            .on('mouseover', d => {
                tooltip.transition()
                    .duration(100)
                    .style('opacity', .9);
                tooltip.text(`text here`)
                    .style('left', `${d3.pointer(d)[0] + 2}px`)
                    .style('top', `${d3.pointer(d)[1] - 18}px`); //(d3.pointer(e)[0] + 30)
            })
            .on('mouseout', () => {
                tooltip.transition()
                    .duration(400)
                    .style('opacity', 0);
            });

        function idled() { idleTimeout = null; }

        // A function that update the chart for given boundaries
        function updateChart(event) {
            var extent = event.selection;   

            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if(!extent){
                if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay); // This allows to wait a little bit
                x.domain(d3.extent(data, d => d.open));
            }else{
                x.domain([ x.invert(extent[0]), x.invert(extent[1]) ]);
                svg.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
            }

            //   Update axis and circle position
            xAXis.transition().duration(1000).call(d3.axisBottom(x))
            svg
                .selectAll('circle')
                .transition().duration(1000)
                .attr("cx", function (d) { return x(d.open); } )
                .attr("cy", function (d) { return y(d.close); } )
        }

    }

}
