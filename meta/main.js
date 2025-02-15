let data = [];
let commits = [];
let brushSelection = null;
let xScale, yScale, rScale; // Declare scales globally

async function loadData() {
    console.log("📊 Loading CSV data...");

    try {
        data = await d3.csv('loc.csv', (row) => {
            const datetime = new Date(row.datetime);
            return {
                ...row,
                line: Number(row.line),
                depth: Number(row.depth),
                length: Number(row.length),
                file: row.file,
                commit: row.commit,
                datetime: datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                url: `https://github.com/YOUR_REPO/commit/${row.commit}`,
                author: row.author,
                totalLines: Number(row.lines_edited) || 0,
                language: row.language || "Other"
            };
        });

        console.log("✅ Data Loaded:", data.length, "rows");

        processCommits();
        displayStats();
        createScatterplot();

    } catch (error) {
        console.error("❌ Error loading data:", error);
    }
}

function processCommits() {
    console.log("🔄 Processing commits...");

    commits = d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
        let first = lines[0];
        return {
            id: commit,
            datetime: first.datetime,
            hourFrac: first.hourFrac,
            author: first.author,
            totalLines: d3.sum(lines, d => d.totalLines),
            url: first.url,
            language: first.language,
            lines: lines // Preserve for language breakdown
        };
    });

    console.log("✅ Commits Processed:", commits.length);
}

function displayStats() {
    console.log("📊 Displaying Stats...");

    const statsContainer = d3.select("#stats");
    statsContainer.html("");

    const totalCommits = commits.length;
    const totalFiles = d3.groups(data, d => d.file).length;
    const totalLOC = data.length;
    const maxDepth = d3.max(data, d => d.depth);
    const longestLine = d3.max(data, d => d.length);
    const maxLines = d3.max(commits, d => d.totalLines);

    const stats = [
        { label: "COMMITS", value: totalCommits },
        { label: "FILES", value: totalFiles },
        { label: "TOTAL LOC", value: totalLOC },
        { label: "MAX DEPTH", value: maxDepth },
        { label: "LONGEST LINE", value: longestLine },
        { label: "MAX LINES", value: maxLines }
    ];

    statsContainer.append("div")
        .attr("class", "stats-grid")
        .selectAll("div")
        .data(stats)
        .enter()
        .append("div")
        .attr("class", "stats-item")
        .html(d => `<label>${d.label}</label><span class="stat-value">${d.value}</span>`);

    console.log("✅ Stats successfully displayed.");
}

function createScatterplot() {
    console.log("📈 Creating scatterplot...");

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    if (!commits.length) {
        console.error("❌ No commits data available!");
        return;
    }

    // Define scales globally
    xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([0, width])
        .nice();

    yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([height, 0]);

    const [minLines, maxLines] = d3.extent(commits, d => d.totalLines);
    rScale = d3.scaleSqrt()
        .domain([minLines, maxLines])
        .range([3, 30]);

    // ✅ Color Scale for Time of Day
    const colorScale = d3.scaleLinear()
        .domain([0, 6, 12, 18, 24]) // Explicitly define day/night shifts
        .range(["#1E3A8A", "#2563EB", "#F59E0B", "#D97706", "#1E3A8A"]) // Deep blue → bright orange
        .interpolate(d3.interpolateRgb);

    const sortedCommits = [...commits].sort((a, b) => b.totalLines - a.totalLines);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(d3.timeDay.every(2)).tickFormat(d3.timeFormat("%b %d")));

    svg.append("g")
        .call(d3.axisLeft(yScale).tickFormat(d => `${String(d).padStart(2, '0')}:00`));

    // ✅ Add Brushing
    const brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("start brush end", brushed);

    svg.append("g")
        .attr("class", "brush")
        .call(brush);

    // ✅ Create Dots for Each Commit
    const dots = svg.append("g")
        .selectAll("circle")
        .data(sortedCommits)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.hourFrac))
        .attr("r", d => rScale(d.totalLines))
        .attr("fill", d => colorScale(d.hourFrac))
        .attr("opacity", 0.7)
        .on("mouseenter", function (event, d) {
            d3.select(event.currentTarget).style("fill-opacity", 1);
            updateTooltipContent(d);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        .on("mousemove", updateTooltipPosition)
        .on("mouseleave", function () {
            d3.select(this).style("fill-opacity", 0.7);
            updateTooltipContent({});
            updateTooltipVisibility(false);
        });

    function brushed(event) {
        brushSelection = event.selection;
        updateSelection();
    }

    function isCommitSelected(commit) {
        if (!brushSelection) return false;
        const [[x0, y0], [x1, y1]] = brushSelection;
        const cx = xScale(commit.datetime);
        const cy = yScale(commit.hourFrac);
        return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
    }

    function updateSelection() {
        d3.selectAll("circle").classed("selected", d => isCommitSelected(d));
        updateSelectionCount();
        updateLanguageBreakdown();
    }
}

// ✅ Tooltip Functions
function updateTooltipContent(commit) {
    document.getElementById('commit-link').href = commit.url;
    document.getElementById('commit-link').textContent = commit.id;
    document.getElementById('commit-date').textContent = commit.datetime.toLocaleDateString();
}

function updateTooltipVisibility(isVisible) {
    document.getElementById('commit-tooltip').hidden = !isVisible;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX + 15}px`;
    tooltip.style.top = `${event.clientY + 15}px`;
}

// ✅ Update Selection Count
function updateSelectionCount() {
    const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    document.getElementById('selection-count').textContent = `${selectedCommits.length || 'No'} commits selected`;
}

// ✅ Update Language Breakdown
function updateLanguageBreakdown() {
    const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    const container = document.getElementById('language-breakdown');

    if (selectedCommits.length === 0) {
        container.innerHTML = '';
        return;
    }

    const breakdown = d3.rollup(
        selectedCommits.flatMap(d => d.lines),
        v => v.length,
        d => d.language
    );

    container.innerHTML = '';
    for (const [language, count] of breakdown) {
        container.innerHTML += `<dt>${language}</dt><dd>${count} lines</dd>`;
    }
}

// 📌 Load Data on Page Load
document.addEventListener("DOMContentLoaded", loadData);

















