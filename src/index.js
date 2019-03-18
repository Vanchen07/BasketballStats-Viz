

import data from '../player_data'

let dataset = []
let seasonsSet = new Set()
let activeSeason = null
let activeTeam = null
Object.keys(data).forEach(key => {
  data[key]['season'].forEach((d, idx) => {
    seasonsSet.add(d)
    const season = d
    const fg3_per_g = data[key]['fg3_per_g'][idx]
    const pts_per_g = data[key]['pts_per_g'][idx]
    const fg3_perc = data[key]['fg3_pct'][idx]
    const fg3a = data[key]['fg3a_per_g'][idx]
    const team = data[key]['team_id'][idx]
  
    const point_perc_from_three = (parseFloat(fg3_per_g * 3) / parseFloat(pts_per_g))
    const uniqueId = `${key}${season}`
    
    dataset.push([
      key,
      season,
      parseFloat(fg3_perc),
      point_perc_from_three,
      parseFloat(fg3a),
      team,
      uniqueId
    ])
  })
 
})

const seasons = [...seasonsSet].sort()

const currentSeason = seasons[seasons.length -1]


const w = 1000;
const h = 800;
const padding = 60;
const marginTop = 120;
const legendRectSize = 18;
const legendSpacing = 8;


const maxMade = d3.max(dataset, (d) => d[2]);
const minMade = d3.min(dataset, (d) => d[2]);
const yScale = d3.scaleLinear()
                 .domain([minMade, maxMade])
                 .range([h - padding, marginTop]);
const maxAttempt = d3.max(dataset, (d) => d[4]);
const minAttempt = d3.min(dataset, (d) => d[4]);
const xScale = d3.scaleLinear()
                 .domain([minAttempt, maxAttempt])
                 .range([padding, w - padding]);
const maxPoints = d3.max(dataset, (d) => d[3]);
const minPoints = d3.min(dataset, (d) => d[3]);
const rScale = d3.scaleLinear() 
                 .domain([minPoints, maxPoints])
                 .range([5, 25]);
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

const tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html((d) => {
    return "<div class='tip-name'>" + d[0] + "</div><div class='tip-gdp'>% of total pts from 3s:<br>" + d[3] + "<br><div class='tip-gdp'>3P% : " + d[2] + "</div><div class='tip-gdp'>3P Atmpts Per Game: " + d[4] + "</div>";
  });

const svg = d3.select("body")
  .append("svg")
  .attr("width", w)
  .attr("height", h)
  .attr("class", "chart")
  .attr("id", "chart");

svg.call(tip);

const color = d3.scaleOrdinal(d3.schemeCategory10);

const showSeason = (e) => {
  const allCircles = Array.from(document.getElementsByClassName('season'));
  const dataSeason = e.target.dataset.season
  
  if(activeSeason !== null) {
    allCircles.filter(el => !el.classList.contains(activeSeason)).forEach((el) => {
      el.classList.remove('hidden');
      el.classList.add('visible');
    });
  }
 
  activeSeason = dataSeason
 
  const otherSeasons = allCircles.filter(el => !el.classList.contains(dataSeason));
  const seasonMatches = Array.from(document.getElementsByClassName(dataSeason)).filter(el => el.classList.contains('visible'));
  
    otherSeasons.forEach((el) => {
      el.classList.remove('visible');
      el.classList.add('hidden');
    });
    seasonMatches.forEach((el) => {
      el.classList.remove('hidden');
      el.classList.add('visible');
    });
    document.getElementById('btn').classList.add('btn-show');
    document.getElementById('btn').classList.remove('btn-hide');

}

Array.from(document.getElementsByClassName('btn-season')).forEach(d => d.addEventListener("click", showSeason));



svg.selectAll("circle")
  .data(dataset)
  .enter()
  .append("circle")
  .attr("cx", (d) => xScale(d[4]))
  .attr("cy", (d) => yScale(d[2]))
  .attr("r", (d) => rScale(d[3]))
  .attr("fill", (d) => color(d[5]))
  .attr("id", (d) => d[6])
  .attr("class", (d) => `circle ${d[5]} season ${d[1]}`)
  .on('mouseover', (d) => {
    if (!document.getElementById(d[6]).classList.contains('hidden')) {
       tip.show(d);
      }
  })
  .on('mouseout', tip.hide)

svg.append("g")
   .attr("transform", `translate(0, ${h - padding})`)
   .call(xAxis);


svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate("+ (padding/2) +","+(h/2)+")rotate(-90)")
    .text("3P Percentage");

svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate("+ (w/2) +","+(h-(padding/3))+")")
    .text("3P Attempts Per Game");

svg.append("g")
   .attr("transform", `translate(${padding}, 0)`)
   .call(yAxis);


const legend = svg.selectAll('.legend')
                  .data(color.domain())
                  .enter()
                  .append('g')
                  .attr('class', 'legend')
                  .attr('id', (d) => d)
                  .attr('transform', function(d, i) {
                    var height = legendRectSize + legendSpacing;
                    var offset =  height * color.domain().length / 2;
                    
                    let row = i <= 5 ? 1 : 2;
                    let horz = i <= 5 ?
                      30 + (i * w / 6) :
                      30 + ((i - 6) * w / 6);
                    const vert = height * row;
                    return 'translate(' + horz + ',' + vert + ')';
                  })
                  .on('click', (d) => {
                    const allCircles = Array.from(document.getElementsByClassName('circle'));

                    if(activeTeam !== null) {
                      allCircles.filter(el => !el.classList.contains(activeTeam)).forEach((el) => {
                        el.classList.remove('hidden');
                        el.classList.add('visible');
                      });
                    }

                    activeTeam = d

                    const otherTeams = allCircles.filter(el => !el.classList.contains(d));
                    const teamMatches = Array.from(document.getElementsByClassName(d)).filter(el => el.classList.contains('visible'));
                    otherTeams.forEach((el) => {
                      el.classList.remove('visible');
                      el.classList.add('hidden');
                    });
                    teamMatches.forEach((el) => {
                      el.classList.remove('hidden');
                      el.classList.add('visible');
                    });
                    document.getElementById('btn').classList.add('btn-show');
                    document.getElementById('btn').classList.remove('btn-hide');
                  });
                  
                  

legend.append('circle')
  .attr('r', legendRectSize / 2)
  .style('fill', color)
  .style('stroke', color);

legend.append('text')
  .attr('x', legendRectSize )
  .attr('y', legendRectSize - (legendSpacing * 1.5))
  .text(function(d) { return d; });

const showAll = () => {
  const allCircles = Array.from(document.getElementsByClassName('circle season'));
  allCircles.forEach((el) => {
    el.classList.remove('hidden');
    el.classList.add('visible');
  });
  document.getElementById('btn').classList.add('btn-hide');
  document.getElementById('btn').classList.remove('btn-show');
}

document.getElementById('btn').addEventListener("click", showAll);



