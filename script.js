document.addEventListener('DOMContentLoaded', function() {
    const dataUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

    fetch(dataUrl)
        .then(response => response.json())
        .then(data => {
            const baseTemperature = data.baseTemperature;
            const dataset = data.monthlyVariance;
            const width = 1200;
            const height = 600;
            const padding = 60;

            const svg = d3.select('#chart')
                .append('svg')
                .attr('width', width + 2 * padding)
                .attr('height', height + 2 * padding)
                .append('g')
                .attr('transform', `translate(${padding}, ${padding})`);

            const xScale = d3.scaleBand()
                .domain(dataset.map(d => d.year))
                .range([0, width])
                .padding(0.1);

            const yScale = d3.scaleBand()
                .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
                .range([0, height])
                .padding(0.1);

            const xAxis = d3.axisBottom(xScale)
                .tickValues(xScale.domain().filter(year => year % 10 === 0));

            const yAxis = d3.axisLeft(yScale)
                .tickFormat(month => {
                    const date = new Date(0);
                    date.setUTCMonth(month);
                    return d3.timeFormat("%B")(date);
                });

            svg.append('g')
                .attr('id', 'x-axis')
                .attr('transform', `translate(0, ${height})`)
                .call(xAxis);

            svg.append('g')
                .attr('id', 'y-axis')
                .call(yAxis);

            const colorScale = d3.scaleSequential(d3.interpolateCool)
                .domain(d3.extent(dataset, d => baseTemperature + d.variance));

            svg.selectAll('.cell')
                .data(dataset)
                .enter()
                .append('rect')
                .attr('class', 'cell')
                .attr('x', d => xScale(d.year))
                .attr('y', d => yScale(d.month - 1))
                .attr('width', xScale.bandwidth())
                .attr('height', yScale.bandwidth())
                .attr('data-month', d => d.month - 1)
                .attr('data-year', d => d.year)
                .attr('data-temp', d => baseTemperature + d.variance)
                .style('fill', d => colorScale(baseTemperature + d.variance));

            const tooltip = d3.select('body').append('div')
                .attr('id', 'tooltip')
                .style('opacity', 0);

            svg.selectAll('.cell')
                .on('mouseover', function(event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style('opacity', .9);
                    tooltip.html(`Year: ${d.year}<br>Month: ${d3.timeFormat("%B")(new Date(0).setUTCMonth(d.month - 1))}<br>Temp: ${(baseTemperature + d.variance).toFixed(2)}℃<br>Variance: ${d.variance.toFixed(2)}℃`)
                        .attr('data-year', d.year)
                        .style('left', (event.pageX + 5) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                })
                .on('mouseout', function() {
                    tooltip.transition()
                        .duration(500)
                        .style('opacity', 0);
                });

            const legendWidth = 400;
            const legendHeight = 20;
            const legendColors = colorScale.ticks(10).map(value => colorScale(value));

            const legend = svg.append('g')
                .attr('id', 'legend')
                .attr('transform', `translate(${(width - legendWidth) / 2}, ${height + padding})`);

            const legendScale = d3.scaleLinear()
                .domain(colorScale.domain())
                .range([0, legendWidth]);

            const legendAxis = d3.axisBottom(legendScale)
                .tickValues(colorScale.ticks(10))
                .tickFormat(d3.format(".1f"));

            legend.selectAll('rect')
                .data(colorScale.ticks(10).map(value => colorScale(value)))
                .enter()
                .append('rect')
                .attr('x', (d, i) => legendScale(legendScale.domain()[0] + i * (legendScale.domain()[1] - legendScale.domain()[0]) / legendColors.length))
                .attr('y', 0)
                .attr('width', legendWidth / legendColors.length)
                .attr('height', legendHeight)
                .style('fill', d => d);

            legend.append('g')
                .attr('transform', `translate(0, ${legendHeight})`)
                .call(legendAxis);
        });
});
