/**
 * @description       : 
 * @author            : Jonathan Fox
 * @group             : 
 * @last modified on  : 19-08-2021
 * @last modified by  : Jonathan Fox
**/
import { LightningElement, api, track } from 'lwc';
import d3js from '@salesforce/resourceUrl/d3js';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
//import DATA from './DATA';

export default class D3ChartPoc extends LightningElement {
    svgWidth = 400;
    svgHeight = 400;

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
        console.log(data);

        // set the dimensions and margins of the graph
        const margin = {top: 10, right: 30, bottom: 30, left: 160},
            width = 760 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        const svg = d3.select(this.template.querySelector('.scatterplot'))
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform',
                'translate(' + margin.left + ',' + margin.top + ')');


        // Add X axis
        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.open))
            .range([0, width]);
        svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain(d3.extent(data, d => d.close))
            .range([height, 0]);
        svg.append('g')
            .call(d3.axisLeft(y));


        // create a tooltip
        const tooltip = d3.select(this.template.querySelector('.scatterplot'))
            .append('span')
            .style('opacity', 0)
            .attr('class', 'tooltip')
            .style('font-size', '16px');
        // Three function that change the tooltip when user hover / move / leave a point
        const mouseover = (e, d) => {
            tooltip
                .transition()
                .duration(200)
                .style('opacity', 1);
            tooltip
                .html(`<span style='color:grey'>${d.name}</span>`)
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


        // Add dots
        svg.append('g')
            .selectAll('dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', d => x(d.open))
            .attr('cy', d => y(d.close))
            .attr('title', d => d.name)
            .attr('r', 4)
            .style('fill', '#69b3a2')
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);


    }

}