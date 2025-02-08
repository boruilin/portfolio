import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');

let selectedIndex = -1; // ✅ Track which wedge is selected
let labels = []; // ✅ Store years for filtering

// ✅ Render Initial Project List
renderProjects(projects, projectsContainer, 'h2');

// ✅ Update Project Title Count
const projectsTitle = document.querySelector('.projects-title');
if (projectsTitle) {
  projectsTitle.textContent = `${projects.length} Projects`;
}

// ✅ Function to Get Yearly Project Data
function getProjectData(projectsList) {
    let rolledData = d3.rollups(
        projectsList,
        (v) => v.length,
        (d) => d.year
    );

    labels = rolledData.map(([year]) => year); // ✅ Save years for selection tracking

    return rolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));
}

// ✅ Function to Render Pie Chart
function renderPieChart(projectsList) {
    let data = getProjectData(projectsList);

    let svg = d3.select("#projects-plot");
    svg.selectAll("*").remove(); // ✅ Clear previous chart

    const pie = d3.pie().value(d => d.value);
    const arcData = pie(data);

    const arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(50);

    const colors = d3.scaleOrdinal(d3.schemeTableau10);

    let g = svg.append("g").attr("transform", "translate(0,0)");

    // ✅ Append Pie Chart Slices with Click Events
    g.selectAll("path")
        .data(arcData)
        .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", (d, i) => colors(i))
        .on("click", function (_, d) {
            selectedIndex = selectedIndex === labels.indexOf(d.data.label) ? -1 : labels.indexOf(d.data.label);
            updateProjects(); // ✅ Update projects when selecting a slice
            updateLegend(data, colors);
        });

    updateLegend(data, colors);
}

// ✅ Function to Update Legend with Click Events
function updateLegend(data, colors) {
    let legend = d3.select('.legend');
    legend.selectAll("*").remove(); // ✅ Clear previous legend

    data.forEach((d, i) => {
        legend.append('li')
            .attr('style', `--color: ${colors(i)}`)
            .attr('class', selectedIndex === labels.indexOf(d.label) ? "selected" : "")
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
            .on("click", function () {
                selectedIndex = selectedIndex === labels.indexOf(d.label) ? -1 : labels.indexOf(d.label);
                updateProjects(); // ✅ Update projects when selecting a legend item
                updateLegend(data, colors);
            });
    });
}

// ✅ Function to Update Projects Based on Selected Year
function updateProjects() {
    if (selectedIndex === -1) {
        renderProjects(projects, projectsContainer, 'h2'); // Show all projects
    } else {
        const selectedYear = labels[selectedIndex]; // ✅ Get selected year from labels
        const filteredProjects = projects.filter(p => p.year === selectedYear); // ✅ Filter projects by year
        renderProjects(filteredProjects, projectsContainer, 'h2'); // ✅ Render filtered projects
    }
}

// ✅ Render the Pie Chart Initially
renderPieChart(projects);

// ✅ Implement Search Filtering (Sync with Pie Selection)
searchInput.addEventListener('input', (event) => {
    let query = event.target.value.toLowerCase();

    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });

    renderProjects(filteredProjects, projectsContainer, 'h2');

    let filteredData = getProjectData(filteredProjects);
    renderPieChart(filteredProjects);

    if (selectedIndex !== -1) {
        updateProjects();
    }
});


