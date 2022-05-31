// @TODO: YOUR CODE HERE!
// Nest the code for the chart inside a function to automatically resizes the chart
function makeResponsive() {

    // If the SVG area isn't empty when the browser loads, remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");
    if (!svgArea.empty()) {
      svgArea.remove();
    }
  
    // SVG wrapper dimensions are determined by the current width and height of the browser window.
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    // Set up borders in svg
    var margin = {
      top: 50,
      right: 50,
      bottom: 200,
      left: 100
    };
 
    // Calculate chart height and width
    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;

    // Append div class to the scatter element
    var chart = d3.select('#scatter')
    .append('div')
    .classed('chart', true);

    // Append a svg element to the chart
    var svg = chart.append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

    // Append a svg group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Initialise parameters of x and y axis
    var selectedXAxis = 'poverty';
    var selectedYAxis = 'healthcare';

    // Crete a function to update x scale variable when label is clicked
    function xScale(censusData, selectedXAxis) {
        //scales
        var xLinearScale = d3.scaleLinear()
          .domain([d3.min(censusData, d => d[selectedXAxis]) * 1,
            d3.max(censusData, d => d[selectedXAxis]) * 1.5])
          .range([0, width]);
    
        return xLinearScale;
    }

    // Crete a function to update y scale variable when label is clicked
    function yScale(censusData, selectedYAxis) {
        //scales
        let yLinearScale = d3.scaleLinear()
          .domain([d3.min(censusData, d => d[selectedYAxis]) * 1,
            d3.max(censusData, d => d[selectedYAxis]) * 1.5])
          .range([height, 0]);
      
        return yLinearScale;
    }

    // Create a function to update the xAxis when clicked
    function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(2000)
      .call(bottomAxis);
  
    return xAxis;
    }

    // Create a function to update the xAxis when clicked
    function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(2000)
      .call(leftAxis);
  
    return yAxis;
    }

    // Create a function to update the circle markers whilst implementing a transition to new circles marker
    function renderCircles(circlesGroup, newXScale, selectedXAxis, newYScale, selectedYAxis) {

    circlesGroup.transition()
      .duration(2000)
      .attr('cx', data => newXScale(data[selectedXAxis]))
      .attr('cy', data => newYScale(data[selectedYAxis]))

    return circlesGroup;
    }

    //function for updating STATE labels
    function renderText(textGroup, newXScale, selectedXAxis, newYScale, selectedYAxis) {

    textGroup.transition()
      .duration(2000)
      .attr('x', d => newXScale(d[selectedXAxis]))
      .attr('y', d => newYScale(d[selectedYAxis]));

    return textGroup
    }

    // Create function to set x axis values for tooltips
    function styleX(value, selectedXAxis) {

        // Set values based on variable
        // Poverty:
        if (selectedXAxis === 'poverty') {
            return `${value}%`;
        }
        // Household income:
        else if (selectedXAxis === 'income') {
            return `${value}`;
        }
        else {
        return `${value}`;
        }
    }

    // Create function to update circle groups
    function updateToolTip(selectedXAxis, selectedYAxis, circlesGroup) {

        // Set up x axis labels
        // Set for "poverty":
        if (selectedXAxis === 'poverty') {
            var xLabel = 'Poverty:';
        }

        // Set for "income":
        else if (selectedXAxis === 'income'){
            var xLabel = 'Median Income:';
        }

        // Set (default) for "age":
        else {
            var xLabel = 'Age:';
        }

        // Set up Y axiss labels
        // Set for "healthcare":
        if (selectedYAxis ==='healthcare') {
            var yLabel = "No Healthcare:"
        }

        // Set for "obesity":
        else if(selectedYAxis === 'obesity') {
            var yLabel = 'Obesity:';
        }

        // Set (default) for "smoking":
        else{
            var yLabel = 'Smokers:';
        }

        // Create tooltip and assign it a class
        var toolTip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-8, 0])
            .html(function(d) {
                return (`${d.state}<br>${xLabel} ${styleX(d[selectedXAxis], selectedXAxis)}<br>${yLabel} ${d[selectedYAxis]}%`);
        });

        circlesGroup.call(toolTip);

        // Create mousover and mouseout events
        circlesGroup.on('mouseover', toolTip.show)
            .on('mouseout', toolTip.hide);

            return circlesGroup;
    }

    // Retrieve csv data for the graph
    d3.csv('./assets/data/data.csv').then(function(censusData) {

        // Console log the data retrieved
        console.log(censusData);
        
        //Parse and define the data
        censusData.forEach(function(data){
            data.obesity = +data.obesity;
            data.income = +data.income;
            data.smokes = +data.smokes;
            data.age = +data.age;
            data.healthcare = +data.healthcare;
            data.poverty = +data.poverty;
        });

        // Create x and y linear scales
        var xLinearScale = xScale(censusData, selectedXAxis);
        var yLinearScale = yScale(censusData, selectedYAxis);

        // Create x axis
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Append x axis
        var xAxis = chartGroup.append('g')
            .classed('x-axis', true)
            .attr('transform', `translate(0, ${height})`)
            .call(bottomAxis);

        // Append y axis
        var yAxis = chartGroup.append('g')
            .classed('y-axis', true)
            .call(leftAxis);

        // Append Circles Markers
        var circlesGroup = chartGroup.selectAll('circle')
            .data(censusData)
            .enter()
            .append('circle')
            .classed('stateCircle', true)
            .attr('cx', d => xLinearScale(d[selectedXAxis]))
            .attr('cy', d => yLinearScale(d[selectedYAxis]))
            .attr('r', 15)
            .attr('opacity', '.5');

        //append Initial Text
        var textGroup = chartGroup.selectAll('.stateText')
            .data(censusData)
            .enter()
            .append('text')
            .classed('stateText', true)
            .attr('x', d => xLinearScale(d[selectedXAxis]))
            .attr('y', d => yLinearScale(d[selectedYAxis]))
            .attr('dy', 3)
            .attr('font-size', '10px')
            .text(function(d){return d.abbr});

            // Create a group for x axis labels
            var xLabelsGroup = chartGroup.append('g')
                .attr('transform', `translate(${width / 3}, ${height + 10 + margin.top})`);

            var povertyLabel = xLabelsGroup.append('text')
                .classed('aText', true)
                .classed('active', true)
                .attr('x', 0)
                .attr('y', 20)
                .attr('value', 'poverty')
                .text('In Poverty (%)');
            
            var ageLabel = xLabelsGroup.append('text')
                .classed('aText', true)
                .classed('inactive', true)
                .attr('x', 0)
                .attr('y', 40)
                .attr('value', 'age')
                .text('Age (Median)');  

            var incomeLabel = xLabelsGroup.append('text')
                .classed('aText', true)
                .classed('inactive', true)
                .attr('x', 0)
                .attr('y', 60)
                .attr('value', 'income')
                .text('Household Income (Median)');

            // Create a group for Y labels
            var yLabelsGroup = chartGroup.append('g')
                .attr('transform', `translate(${0 - margin.left/4}, ${height/2})`);

            var healthcareLabel = yLabelsGroup.append('text')
                .classed('aText', true)
                .classed('active', true)
                .attr('x', 0)
                .attr('y', 0 - 20)
                .attr('dy', '1em')
                .attr('transform', 'rotate(-90)')
                .attr('value', 'healthcare')
                .text('Without Healthcare (%)');
  
            var smokesLabel = yLabelsGroup.append('text')
                .classed('aText', true)
                .classed('inactive', true)
                .attr('x', 0)
                .attr('y', 0 - 40)
                .attr('dy', '1em')
                .attr('transform', 'rotate(-90)')
                .attr('value', 'smokes')
                .text('Smoker (%)');
  
            var obesityLabel = yLabelsGroup.append('text')
                .classed('aText', true)
                .classed('inactive', true)
                .attr('x', 0)
                .attr('y', 0 - 60)
                .attr('dy', '1em')
                .attr('transform', 'rotate(-90)')
                .attr('value', 'obesity')
                .text('Obese (%)');
    
            // Update toolTip
            var circlesGroup = updateToolTip(selectedXAxis, selectedYAxis, circlesGroup);

            // Create x axis event listener
            xLabelsGroup.selectAll('text')
                .on('click', function() {
                var value = d3.select(this).attr('value');

                if (value != selectedXAxis) {

                    // Replace selected x with a value
                    selectedXAxis = value; 

                    // Update x axis with new data
                    xLinearScale = xScale(censusData, selectedXAxis);

                    // Update x axis
                    xAxis = renderXAxis(xLinearScale, xAxis);

                    // Upate circle markers with a new x value
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, selectedXAxis, yLinearScale, selectedYAxis);

                    // Update text labels
                    textGroup = renderText(textGroup, xLinearScale, selectedXAxis, yLinearScale, selectedYAxis);

                    // Update tooltips
                    circlesGroup = updateToolTip(selectedXAxis, selectedYAxis, circlesGroup);

                    // Change of classes active/inactive status
                    // If poverty is selected:
                    if (selectedXAxis === 'poverty') {
                        povertyLabel.classed('active', true).classed('inactive', false);
                        ageLabel.classed('active', false).classed('inactive', true);
                        incomeLabel.classed('active', false).classed('inactive', true);
                    }

                    // If age is selected:
                    else if (selectedXAxis === 'age') {
                        povertyLabel.classed('active', false).classed('inactive', true);
                        ageLabel.classed('active', true).classed('inactive', false);
                        incomeLabel.classed('active', false).classed('inactive', true);
                    }

                    // Default for income:
                    else {
                        povertyLabel.classed('active', false).classed('inactive', true);
                        ageLabel.classed('active', false).classed('inactive', true);
                        incomeLabel.classed('active', true).classed('inactive', false);
                    }
                }
            });

            // Create a y axis label event listener
            yLabelsGroup.selectAll('text')
                .on('click', function() {
                var value = d3.select(this).attr('value');

            if(value != selectedYAxis) {

                // Replace selected y with value  
                selectedYAxis = value;

                // Update Y scale
                yLinearScale = yScale(censusData, selectedYAxis);

                // Update Y axis 
                yAxis = renderYAxis(yLinearScale, yAxis);

                // Update circle marker with new y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, selectedXAxis, yLinearScale, selectedYAxis);

                // Update text labels
                textGroup = renderText(textGroup, xLinearScale, selectedXAxis, yLinearScale, selectedYAxis);

                // Update tooltips
                circlesGroup = updateToolTip(selectedXAxis, selectedYAxis, circlesGroup);

                // Change of classes active/inactive status
                // If obesity is selected:
                if (selectedYAxis === 'obesity') {
                    obesityLabel.classed('active', true).classed('inactive', false);
                    smokesLabel.classed('active', false).classed('inactive', true);
                    healthcareLabel.classed('active', false).classed('inactive', true);
                }

                // If smokes is selected:
                else if (selectedYAxis === 'smokes') {
                    obesityLabel.classed('active', false).classed('inactive', true);
                    smokesLabel.classed('active', true).classed('inactive', false);
                    healthcareLabel.classed('active', false).classed('inactive', true);
                }

                // Default for healthcare:
                else {
                    obesityLabel.classed('active', false).classed('inactive', true);
                    smokesLabel.classed('active', false).classed('inactive', true);
                    healthcareLabel.classed('active', true).classed('inactive', false);
                }
            }
        });
    });
}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, responsify() is called.
d3.select(window).on("resize", makeResponsive);

