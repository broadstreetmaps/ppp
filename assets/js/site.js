$(document).ready(function(){

  // global elements
  var dockElem = document.getElementById('corporate-dock');
  var info = document.getElementById('info');
  var map = document.getElementById('map');

  //Main scope interaction
  $('.view').on('click', function(){
    if(!$(this).hasClass('current')){
      $('#bsm').attr('class', 'active');
      $('.view').removeClass('current');
      $(this).addClass('current');
      reset(); // THIS IS HOW IT HAPPENS ... ERRR DOESN'T HAPPEN
      if($(this).attr('id')==='partners') { // PARTNERS
        $('#map').addClass('partners');
        $('#data-notes-button, #reset, #bsm').addClass('partners');
        $('#dock-container, .dock-nav').css('bottom', '0px');
        partnersInfo();
        d3.selectAll('.country-labels').moveToFront();
        resetMapZoom();
      }
      if($(this).attr('id')==='trends') { // TRENDS
        $('#map').addClass('trends');
        $('#trends-switch').addClass('active');
        trendReset();
        trendsInfo();
        showNationalTrends();
        resetMapZoom();
      }
      if($(this).attr('id')==='stories') { // STORIES
        $('#map').addClass('stories');
        showStories(stories);
        zoom.scale(1.6);
        zoom.translate([-329.3719199725873,-286.364649413111]);
        g.transition().duration(1000)
          .attr("transform","translate(-329.3719199725873,-286.364649413111)scale(1.6)");
        g.selectAll("path")
          .attr("d", path.projection(projection));
      }
    } else {
      if($(this).attr('id')==='partners') {
        reset();
        partnersInfo();
        $('#map').addClass('partners');
        $('#dock-container, .dock-nav').css('bottom', '0px');
      }
    }
  });

  function resetMapZoom() {
    zoom.scale(1);
    zoom.translate([0,0]);
    g.transition().duration(1000)
      .attr("transform","translate(0,0)scale(1)");
    g.selectAll("path")
      .attr("d", path.projection(projection));
  }

  // data notes
  var notes =  '<p><span class="i r" id="data-notes-close">&#10060;</span><strong>Data Notes</strong></p>\
                <p>This map identifies all of the public private partnerships in health and water sanitation sectors that appear in the USAID Public-Private Partnerships Database. This database was sent to The GroundTruth Project by USAID on August 11, 2014. Since then, the data has been made publicly available on the <a href="http://www.usaid.gov/data" target="_blank">USAID data portal</a>. We chose to include the water sanitation projects in this map because of the direct link to public health issues; the <a href="http://www.who.int/water_sanitation_health/publications/Water_Safety_in_Distribution_System/en/" target="_blank">World Health Organization</a> links poor water quality to &ldquo;a significant proportion of the burden of waterborne and water-related illness.&ldquo; </p>\
                <p>We used USAID&rsquo;s definition of a public-private partnership: &ldquo;For the purposes of this dataset a Public-Private Partnership is defined as a USAID-supported development project or initiative which engages the private sector (including global and local businesses, foundations, industry associations, and others) as a core resource partner. This definition of PPPs differs from other ways of engaging the private sector such as contracting a for-profit implementer, in that this definition of PPPs requires private sector actors to be co-investing skills, technologies, other core business capabilities, or financial resources to the project or activity to achieve development outcomes.&ldquo;</p>\
                <p>In USAID&rsquo;s data notes, the agency also states: &ldquo;This dataset should be considered a broad-based and representative view of the PPPs USAID has developed from 2001-2013, but not a fully comprehensive or exhaustive compilation over this entire time period.&ldquo;</p>\
                <p>US Government Investment refers to the total value of resources invested in the partnership by the United States Government. Non-US Government Investment refers to the total value of resources (both cash and in-kind) invested in the partnership by all partners, both public and private, other than the United States Government.</p>\
                <p>Please note that this data does not identify the amount that each individual partner has given to each partnership.</p>\
                <p>Highlighted on this map are all of the private companies in USAID&rsquo;s database (in the health and water sanitation sectors) that are also identified by Fortune Magazine as US <a href="http://fortune.com/fortune500/wal-mart-stores-inc-1/" target="_blank">2014 Fortune 500 companies</a>. Thirty-eight of the 1,214 unique partners that engage in global health and water sanitation partnerships with USAID, according to the database shared with The GroundTruth Project, are also Fortune 500 companies.</p>\
                <p>For all corporations with associated foundations also participating in partnerships, their project totals have been included in the corporation&rsquo;s total project count. This includes: Abbott Laboratories (Abbott Fund), Bristol-Myers Squibb (Bristol-Myers Squibb Foundation), Citigroup (Citi Foundation), ExxonMobil (ExxonMobil Foundation), McDonald&rsquo;s (Ronald McDonald Foundation), Monsanto (Monsanto Fund), Nike (Nike Foundation), The Coca-Cola Company (Coca-Cola Foundation). Separate private and family foundations, including the Bill and Melinda Gates Foundation and the William and Flora Hewlett Foundation, were not included in this count.</p>\
                <p>The total number of partnerships in each country includes multi-country partnerships with that country specified. The total number of partnerships in each country does not include any global or regional partnerships where individual countries were not specified in the database.</p>\
                <p>&ldquo;Total Investment&ldquo; refers to USAID&rsquo;s term, &ldquo;Total Lifetime Investment.&ldquo; These budget totals for each region include the budgets of multi-country partnerships that work within one region, but do not include global or multi-regional projects. Global projects are highlighted separately in the sidebar. All regions shown are the official categories determined by USAID. </p>\
                <p>In order to calculate per capita investment for each country, we divided the total amount spent by <a href="http://data.worldbank.org/indicator/SP.POP.TOTL" target="_blank">national population</a>. Additionally, all regional totals shown in the sidebar have been rounded to the closest million. </p>\
                <p>Some of the partnership descriptions have been condensed for clarity and due to space constraints of the map.</p>';


  $("#data-notes").html(notes);
  $("#data-notes-button").on('click', function(){
    $("#data-notes").toggleClass('active');
  });
  $(document.body).on('click', '#data-notes-close' ,function(){
    $('#data-notes').removeClass('active');
  });


  /////////////////////////////////////////////
  //
  // VIEW CHANGE & RESETS
  //
  /////////////////////////////////////////////
  introReset();
  $('#reset').on('click', function(){
    reset();
    introReset();
  });

  $('#explore').on('click', function(){
    $('body').removeClass('intro');
    $('#info').css('left', '0');
    $('.view').css('top', '0');
    $('#intro').fadeOut(400);

    // start at partners
    $('#partners').addClass('current');
    $('#map').addClass('partners');
    $('#dock-container, .dock-nav').css('bottom', '0px');
    $('#data-notes-button, #reset').addClass('partners');
    partnersInfo();
    $('#bsm').attr('class', 'active partners');
  });

  function reset() {

    // clear info space
    info.innerHTML='';

    // remove class from #map
    $('#map').attr('class', '');

    // remove points and trend info
    d3.selectAll('.points').remove();
    d3.selectAll('.regional-points').remove();

    // reset trend switch state
    $('#trends-switch').removeClass('active');
    $('.onoffswitch-checkbox').prop('checked', false);
    $('.switch').removeClass('active');
    $('.switch.national').addClass('active');

    // labels
    $('.country-label').attr('class', 'country-label');
    d3.selectAll('.country-labels').moveToBack();

    // reset country fills to base grey
    // d3.selectAll('.country-story').moveToBack();
    $('.country').attr('class', 'country');
    $('.country').attr('style', '');

    // remove partner back button
    $('#partners-back').removeClass('active');

    // hide dock
    $('#dock-container, .dock-nav').css('bottom', '-60px');

    // remove world styles if set on
    $('.world').attr('class', 'world');

    // data notes remove .dock setting
    $('#data-notes-button, #reset').removeClass('partners');

  }

  function introReset() {
    info.innerHTML='';
    $('body').addClass('intro');
    $('#info').css('left', '-25%');
    $('.view').css('top', '-100px');
    $('#intro').fadeIn(400);
    $('.view').removeClass('current');
    $('#bsm').attr('class', '');
  }

  /////////////////////////////////////////////
  //
  // DOCK BUILD
  //
  /////////////////////////////////////////////

  // build the dock from var companies in jsonData.js
  for(d=0;d<companies.length;d++) {
    var li = document.createElement('li');
    li.className='corp';
    li.id=companies[d].corpid;
    // li.style['background-color'] = '#'+companies[d].hex;
    li.style.backgroundImage = 'url(assets/dock_logos/'+companies[d].dockLogo+')';
    dockElem.appendChild(li);
  }

  /////////////////////////////////////////////
  //
  // D3 SETUP
  //
  /////////////////////////////////////////////

  // radius for trends
  var radius = d3.scale.sqrt()
      .domain([0, 20])
      .range([0, 20]);

  var radiusTLI = d3.scale.sqrt()
    .domain([0, 1338590149])
    .range([0, 60]);

  var radiusUSG = d3.scale.sqrt()
    .domain([0, 422474413])
    .range([0, 60]);

  var radiusNonUSG = d3.scale.sqrt()
    .domain([0, 917473590])
    .range([0, 60]);

  var width = 1100,
      height = 550;

  projection = d3.geo.robinson()
    .scale(200)
    .translate([425, 370])
    .precision(.1);

  path = d3.geo.path()
    .projection(projection);

  svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

  var g = svg.append("g");

  queue()
    .defer(d3.json, "/ppp/data/countries.json")
    .defer(d3.json, "/ppp/data/land.json")
    .defer(d3.json, "/ppp/data/world.json")
    .await(drawMap);

  function drawMap(error, c, l, w) {
    // add world for selection in global projects
    g.selectAll("world")
      .data(topojson.feature(w, w.objects.world).features)
      .enter()
      .append("path")
      .attr("class", "world")
      .attr("d", path)

    // land topo
    g.selectAll("land")
      .data(topojson.feature(l, l.objects.land).features)
      .enter()
      .append("path")
      .attr("class", "land")
      .attr("d", path)

    // load and display the World
    var labelClassState;
    var countries = g.selectAll("country")
      .data(topojson.feature(c, c.objects.countries).features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("id", function(d){
        return d.properties.gu_a3;
      })
      .attr("d", path)
      .on("mouseover", function(d){
        if($("#map").hasClass('partners')) {
          var label = $("#"+d.properties.gu_a3+"-label");
          labelClassState = label.attr("class");
          label.attr('class', 'country-label active');
        }
      })
      .on("mouseout", function(d){
        var label = $("#"+d.properties.gu_a3+"-label");
        label.attr('class', labelClassState);
      });

    var labels = g.selectAll(".country-label")
      .data(topojson.feature(c, c.objects.countries).features)
    .enter().append("text")
      .attr("class", "country-label")
      .attr("id", function(d){
        return d.properties.gu_a3+"-label";
      })
      .attr("transform", function(d) {
        // set label origin for specific countries to prevent overlap
        if(d.properties.admin=="Nicaragua" || d.properties.admin=="Honduras") {
          var labelPoint = [path.centroid(d)[0]+32, path.centroid(d)[1]];
        } else if (d.properties.admin=="El Salvador") {
          var labelPoint = [path.centroid(d)[0]-35, path.centroid(d)[1]+4];
        } else if (d.properties.admin=="Ivory Coast") {
          var labelPoint = [path.centroid(d)[0], path.centroid(d)[1]+20];
        } else if (d.properties.admin=="Uganda") {
          var labelPoint = [path.centroid(d)[0], path.centroid(d)[1]-20];
        } else if (d.properties.admin=="Indonesia") {
          var labelPoint = [path.centroid(d)[0], path.centroid(d)[1]+16];
        } else if (d.properties.admin=="India") {
          var labelPoint = [path.centroid(d)[0], path.centroid(d)[1]+6];
        } else if (d.properties.admin=="Dominican Republic") {
          var labelPoint = [path.centroid(d)[0]+55, path.centroid(d)[1]];
        } else if (d.properties.admin=="Laos") {
          var labelPoint = [path.centroid(d)[0], path.centroid(d)[1]-20];
        } else if (d.properties.admin=="Vietnam") {
          var labelPoint = [path.centroid(d)[0]+20, path.centroid(d)[1]-10];
        } else if (d.properties.admin=="Nigeria") {
          var labelPoint = [path.centroid(d)[0]+14, path.centroid(d)[1]-5];
        } else if (d.properties.admin=="Burundi") {
          var labelPoint = [path.centroid(d)[0], path.centroid(d)[1]-7];
        } else {
          var labelPoint = [path.centroid(d)[0], path.centroid(d)[1]-10];
        }
        return "translate(" + labelPoint + ")";
      })
      .attr("dy", ".35em")
      .text(function(d) { return d.properties.admin; });



        //  defs = svg.append('svg:defs');
        //  defs
        //   .append('svg:pattern')
        //   .attr('id', 'tile-pills')
        //   .attr('patternUnits', 'userSpaceOnUse')
        //   .attr('width', '1000')
        //   .attr('height', '1000')
        //   .append('svg:image')
        //   .attr('xlink:href', 'http://nicholasdynan.com/GP-SR-Branding-Health/img/bg.jpg')
        //   .attr('x', 0)
        //   .attr('y', -200)
        //   .attr('width', 1000)
        //   .attr('height', 1000);

  }



  // zoom and pan
  var zoom = d3.behavior.zoom()
      .on("zoom",function() {
        if(zoom.scale()>=0.95) {
          g.attr("transform","translate("+
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");

          g.selectAll("path")
            .attr("d", path.projection(projection));
        } else {
          zoom.scale(0.95);
        }
      });

  // call zoom object
  svg.call(zoom);

  /////////////////////////////////////////////
  //
  // PARTNERS VIEW (COMPANIES)
  //
  /////////////////////////////////////////////

  function partnersInfo() {
    info.innerHTML='<div class="contain"><h2 class="info-title">Fortune 500 companies that partner with USAID on global health</h2>\
                  <p class="desc">Click on a logo at the bottom of the map to see which US Fortune 500 companies have global health partnerships with USAID.</p>\
                  <p class="desc">Or, explore the Top 5 companies with the most partnerships.</p>\
                  <h4 class="partners info-list-title"><span>Greatest Number of Partnerships</span></h4>\
                  <ol class="info-list partners-list">\
                    <li data-target="c35" id="c35"><span class="info-list-item">The Coca-Cola Company</span> <span class="national-trends-projects"><span class="i">&#128278;</span>28</span></li>\
                    <li data-target="c12" id="c12"><span class="info-list-item">ExxonMobil</span> <span class="national-trends-projects"><span class="i">&#128278;</span>13</span></li>\
                    <li data-target="c29" id="c29"><span class="info-list-item">Pfizer</span> <span class="national-trends-projects"><span class="i">&#128278;</span>12</span></li>\
                    <li data-target="c19" id="c19"><span class="info-list-item">Johnson & Johnson</span> <span class="national-trends-projects"><span class="i">&#128278;</span>10</span></li>\
                    <li data-target="c30" id="c30"><span class="info-list-item">Proctor & Gamble</span> <span class="national-trends-projects"><span class="i">&#128278;</span>9</span></li>\
                  </ol>\
                  </div>';
    info.innerHTML+="";
  }

  // COMPANY LIST HOVER
  $(document.body).on('mouseover', '.partners-list li', function(){
    $(this).addClass('highlight');
    var target = $(this).attr('data-target');
    for(c=0;c<companies.length;c++) {
      var matchID = companies[c]['corpid'];
      if(target===matchID) {
        $(this).css("background-color", companies[c].hex);
        // loop throughMatching countries & show onMap
        for(var co=0;co<companies[c]['countries'].length;co++) {
          var countryID = companies[c]['countries'][co];
          if(countryID != 'LAC (Continent)' && countryID != 'global'){ // temporary declaration for finding non-country related lists
            $('#'+countryID).attr('style', 'fill:'+companies[c]['hex']);
            $('#'+countryID+'-label').attr("class", "country-label active");
          }
        }
      }
    }
  });
  $(document.body).on('mouseout', '.partners-list li', function(){
    $(this).removeClass('highlight');
    $(this).css('background-color', 'transparent');
    companyReset();
    $('#partners-back').removeClass('active');
  });

  function companyReset() {
    $('.world').attr('class', 'world');
    $('.country').attr('style', '');
    $('.country').attr('class', 'country');
    $('.country-label').attr("class", "country-label");
  }

  // PARTNERS BACK BUTTON
  $('#partners-back').on('click', function(){
    $('#partners-back').removeClass('active');
    companyReset();
    partnersInfo();
  });

  // COMPANY CLICK
  function companyProjectLoad(c, corpID) {
    companyReset();
    $('#partners-back').addClass('active');

    //Match to json data
    for(c=0;c<companies.length;c++) {
      var matchID = companies[c]['corpid'];
      if(corpID===matchID) {

        // loop throughMatching countries & show onMap
        for(var co=0;co<companies[c]['countries'].length;co++) {
          var countryID = companies[c]['countries'][co];
          if(countryID != 'LAC (Continent)' && countryID != 'global'){ // temporary declaration for finding non-country related lists
            $('#'+countryID).attr('style', 'fill:'+companies[c]['hex']);
            $('#'+countryID+'-label').attr("class", "country-label active");
          }
        }

        // append project info
        info.innerHTML='';
        info.innerHTML='<img class="corp-logo contain" src="assets/logos/'+companies[c].logo+'">';
        info.innerHTML+='<h2 class="corp-name">'+companies[c].company+'</h2>';
        if(companies[c].foundation) {
          info.innerHTML+='<h3 class="corp-foundation">Includes '+companies[c].foundation+'</h3>';
        }
        info.innerHTML+='<p class="corp-project-count">Partnerships: <strong>'+companies[c].projects.length+'</strong></p>';
        projectList = document.createElement('ol');
        projectList.id="projects";
        info.appendChild(projectList);
        var global = false;
        for(var proj=0;proj<companies[c].projects.length;proj++){ // loop through projects
          // get project id toMatch projects json (loop through projects array of objects in jsonData.js)
          for(var y=0;y<projects.length;y++){
            if(projects[y].projID===companies[c].projects[proj]) {
              // if project idsMatch, append to project list
              var p = projects[y];
              projectItem = document.createElement('li');
              projectItem.className='project';
              projectItem.id=p.projID;

              var projTitle = document.createElement('div');
              projTitle.className='project-title';
              projTitle.innerHTML=p.projName;
              for(var x=0;x<projects[y].projCountries.length;x++) {
                if(projects[y].projCountries[x]=="Global" || projects[y].projCountries[x]=="global") {
                  global = !global;
                  projTitle.className="project-title global";
                }
              }

              projTitle.style.borderLeftColor = companies[c].hex;
              // projTitle.addEventListener('click', function(){ alert('waka'); });
              projectItem.appendChild(projTitle);

              // test for new description, else use original description
              var projectDescription = (p.projDescNew.length>0 ? p.projDescNew : p.projDesc );
              var projYear = ( p.yearEnd!='nodata' ? p.yearStart+'-'+p.yearEnd : 'Started in '+p.yearStart );
              var projCash = 'US Gov: <strong>'+p.usgI+'</strong>, Non-US Gov: <strong>'+p.nusgI+'</strong>';
              projectItem.innerHTML+='<div class="project-info"><p class="project-years">'+projYear+'</p><p class="project-capitol">'+projCash+'</p>'+projectDescription+'</div>';
              projectList.appendChild(projectItem);
            }
          }
        }
        if(global) {
          info.innerHTML+='<p class="info-note contain">Projects marked with <span class="i">&#127758;</span> are global, not attributed to a specific country or region.</p>';
        }


      }

    }
  }
  $(document.body).on('click', '.corp, .partners-list li', function(){
    var corpID = $(this).attr('id');
    companyProjectLoad($(this), corpID);
  });

  // PROJECT CLICK
  $(document.body).on('click', '.project-title' ,function(){
    if(!$(this).parent().hasClass('active')){
      // update to clicked
      $('.world').attr('class', 'world');
      $('.country-label.active.highlight').attr('class', 'country-label active');
      $('.project').removeClass('active');
      $(this).parent().addClass('active');

      // update related countries
      $('.country').attr('class', 'country');
      var projectID = $(this).parent().attr('id');
      for(var x=0;x<projects.length;x++) {
        if(projectID===projects[x].projID) {
          // select each country and add class for country projects
          for(c=0;c<projects[x].projCountries.length;c++){
            // highlight country
            $('#'+projects[x].projCountries[c]).attr('class', 'country project-country');
            $('#'+projects[x].projCountries[c]+'-label').attr('class', 'country-label active highlight');
          }
        }
      }

      // if listed as global project
      if($(this).hasClass('global')){
        showWorld();
      }
    } else {
      $('.country').attr('class', 'country');
      $(this).parent().removeClass('active');
      $('.country-label.active.highlight').attr('class', 'country-label active');
      resetWorld();
    }
  });

  function showWorld() {
    $('.world').attr('class', 'world active');
    d3.selectAll('.world').moveToFront();
  }
  function resetWorld() {
    $('.world').attr('class', 'world');
    d3.selectAll('.world').moveToBack();
  }

  // dock navigation
  $('#dock-left').on('click', function(){
    var width = $('#dock-container').width() / 2;
    $('#corporate-dock').animate( { scrollLeft: '-='+width }, 500 );
  });
  $('#dock-right').on('click', function(){
    var width = $('#dock-container').width() / 2;
    $('#corporate-dock').animate( { scrollLeft: '+='+width }, 500 );
  });


  /////////////////////////////////////////////
  //
  // TRENDS
  //
  /////////////////////////////////////////////
  function trendsInfo() {
    info.innerHTML='';
    info.innerHTML+='<div class="national-trends-info trend-info contain active">\
                    <h2 class="info-title">Partnership trends by country</h2>\
                    <p class="desc">USAID’s public-private partnerships in global health and water sanitation are distributed across 76 countries. Explore the map to learn which countries have the most partnerships and which countries have received the greatest amount of funding.<br><span class="info-note"><span class="i r">&#128100;</span>signifies "per capita" calculations.</span></p>\
                    <h4 class="national-trends-list-title">Top 5 Countries By<br><span>Total Investment</span></h4>\
                    <ol class="national-trends-list">\
                    <li data-country="india" data-projects="32" data-symbol="India" class="t-india"><span class="national-trends-country">India</span> <span class="national-trends-total">$257.9<small>M</small></span> <span class="national-trends-capita"><span class="i">&#128100;</span>$0.21</span></li>\
                    <li data-country="southafrica" data-projects="50" data-symbol="SouthAfrica" class="t-southafrica"><span class="national-trends-country">South Africa</span> <span class="national-trends-total">$146.1<small>M</small></span> <span class="national-trends-capita"><span class="i">&#128100;</span>$2.76</span></li>\
                    <li data-country="tanzania" data-projects="17" data-symbol="UnitedRepublicofTanzania" class="t-tanzania"><span class="national-trends-country">Tanzania</span> <span class="national-trends-total">$142.1<small>M</small></span> <span class="national-trends-capita"><span class="i">&#128100;</span>$2.89</span></li>\
                    <li data-country="guatemala" data-projects="8" data-symbol="Guatemala" class="t-guatemala"><span class="national-trends-country">Guatemala</span> <span class="national-trends-total">$142.1<small>M</small></span> <span class="national-trends-capita"><span class="i">&#128100;</span>$9.19</span></li>\
                    <li data-country="zimbabwe" data-projects="4" data-symbol="Zimbabwe" class="t-zimbabwe"><span class="national-trends-country">Zimbabwe</span> <span class="national-trends-total">$81.9<small>M</small></span> <span class="national-trends-capita"><span class="i">&#128100;</span>$5.79</span></li>\
                    </ol>\
                    <h4 class="national-trends-list-title">Top 5 Countries By<br><span>US Government Investment</span></h4>\
                    <ol class="national-trends-list">\
                    <li data-country="india" data-projects="32" data-symbol="India" class="t-india"><span class="national-trends-country">India</span> <span class="national-trends-total">$171.6<small>M</small></span> <span class="national-trends-capita"><span class="i">&#128100;</span>$0.14</span></li>\
                    <li data-country="tanzania" data-projects="17" data-symbol="UnitedRepublicofTanzania" class="t-tanzania"><span class="national-trends-country">Tanzania</span> <span class="national-trends-total">$68.6<small>M</small></span> <span class="national-trends-capita"><span class="i">&#128100;</span>$1.39</span></li>\
                    <li data-country="bangladesh" data-projects="9" data-symbol="Bangladesh" class="t-bangladesh"><span class="national-trends-country">Bangladesh</span> <span class="national-trends-total">$59<small>M</small></span> <span class="national-trends-capita"><span class="i">&#128100;</span>$0.38</span></li>\
                    <li data-country="angola" data-projects="7" data-symbol="Angola" class="t-angola"><span class="national-trends-country">Angola</span> <span class="national-trends-total">$50.4<small>M</small></span> <span class="national-trends-capita"><span class="i">&#128100;</span>$2.34</span></li>\
                    <li data-country="guatemala" data-projects="8" data-symbol="Guatemala" class="t-guatemala"><span class="national-trends-country">Guatemala</span> <span class="national-trends-total">$48<small>M</small></span> <span class="national-trends-capita"><span class="i">&#128100;</span>$3.10</span></li>\
                    </ol>\
                    <h4 class="national-trends-list-title">Top 5 Countries By<br><span>Non-US Government Investment</span></h4>\
                    <ol class="national-trends-list">\
                    <li data-country="southafrica" data-projects="50" data-symbol="SouthAfrica" class="t-southafrica"><span class="national-trends-country">South Africa</span> <span class="national-trends-total">$103<small>M</small></span> <span class="national-trends-capita"><span class="i">&#128100;</span>$1.94</span></li>\
                    <li data-country="guatemala" data-projects="8" data-symbol="Guatemala" class="t-guatemala"><span class="national-trends-country">Guatemala</span> <span class="national-trends-total">$85.7<small>M</small></span> <span class="national-trends-capita"><span class="i">&#128100;</span>$6.08</span></li>\
                    <li data-country="india" data-projects="32" data-symbol="India" class="t-india"><span class="national-trends-country">India</span> <span class="national-trends-total">$73.5<small>M</small></span> <span class="national-trends-capita"><span class="i">&#128100;</span>$0.07</span></li>\
                    <li data-country="tanzania" data-projects="17" data-symbol="UnitedRepublicofTanzania" class="t-tanzania"><span class="national-trends-country">Tanzania</span> <span class="national-trends-total">$25.7<small>M</small></span> <span class="national-trends-capita"><span class="i">&#128100;</span>$1.49</span></li>\
                    <li data-country="russia" data-projects="8" data-symbol="Russia" class="t-russia"><span class="national-trends-country">Russia</span> <span class="national-trends-total">$21.4<small>M</small></span> <span class="national-trends-capita"><span class="i">&#128100;</span>$0.41</span></li>\
                    </ol>\
                    </div>';

    info.innerHTML+='<div class="regional-trends-info trend-info contain">\
                    <h2 class="info-title">Partnership trends by region</h2>\
                    <p class="desc">Explore the map to see the regional breakdown of partnerships and funding across USAID’s public-private partnerships in the global health and water sanitation sectors. </p>\
                    <h4 class="info-list-title regional-trends">Total Investment Per Region</h4>\
                    <svg id="chart"></svg>\
                    <p class="info-note">* global refers to partnerships that operate across regions</p>\
                    </div>';
  }

  // list highlight rest of match countries
  $(document.body).on('mouseover', '.national-trends-list li', function(){
    // highlight other existences in list
    var liID=$(this).attr('data-country');
    $('.t-'+liID).addClass('highlight');

    // show popup
    var dataSymbol = $(this).attr('data-symbol');
    $("#"+dataSymbol).attr('class', 'points highlight');
    var countryName = $(this).children('.national-trends-country').text();
    var countryProjectCount = $(this).attr('data-projects');
    var rect = getBounds(dataSymbol);
    d3.select('#trend-tip')
      .style('left', rect.left + 'px')
      .style('bottom', rect.bottom + 'px')
      .classed('hidden', false)
      .select('#tip-inner').html('<p class="tip-title">'+countryName+'</p><p class="tip-notes">Partnerships: <strong>'+countryProjectCount+'</strong></p>')
  });
  $(document.body).on('mouseout', '.national-trends-list li', function(){
    $('.national-trends-list li').removeClass('highlight');
    $(".points").attr('class', 'points');
    d3.select("#trend-tip").classed("hidden", true);
  });

  $(document.body).on('click', '#myonoffswitch', function(){
    trendReset();
    var checked = $(this).prop('checked');
    $('.trend-info').removeClass('active');
    $('.switch').removeClass('active');
    if(!checked) {
      $('.switch.national').addClass('active');
      $('.national-trends-info').addClass('active');
      showNationalTrends();
    }else{
      $('.switch.regional').addClass('active');
      $('.regional-trends-info').addClass('active');
      showRegionalTrends('Partnerships');
      buildBars();
    }
  });

  $(document.body).on('click', '.regional-trends-button' ,function(){
    // update button states
    if(!$(this).hasClass('active')) {
      $('.regional-trends-button').removeClass('active');
      $(this).addClass('active');
      var trend = $(this).attr('id');

      // update d3 selections for appropriate data
      showRegionalTrends(trend);
      // make bar chart!
      buildBars();
    }
  });


  function showNationalTrends() {
    d3.json("/ppp/data/points_v2.json", function(error,p) {
      svg.select("g").selectAll(".points")
        .data(topojson.feature(p, p.objects.ppp_points).features)
        .enter().append("path")
        .attr("class", "points")
        .attr("d", path.pointRadius(function(d){
          var ra = +d.properties.numProj;
          return radius(ra);
        }))
        .attr('id', function(d){
          return d.properties.admin.replace(/ /g, '');
        })
        .on("mouseover", function(d) {
          var nationalID = d.properties.admin.replace(/ /g, '');


          // // test rectangle to make sure bounding box is accurate
          // d3.select("g").append("rect")
          //   .attr("x", coords.left-$('#info').outerWidth(true))
          //   .attr("y", coords.top)
          //   .attr("width", coords.width)
          //   .attr("height", coords.height)
          //   .style("stroke", "#000000");

          // check if highlight on sidebar list works
          var listID = 't-'+nationalID.toLowerCase();
          if(document.getElementsByClassName(listID).length>0) {
            $('.national-trends-list li.'+listID).addClass('highlight');
          }

          // show popup
          var rect = getBounds(nationalID); // gets bounds of translated svg objects (yay!)
          d3.select('#trend-tip')
            .style('left', rect.left + 'px')
            .style('bottom', rect.bottom + 'px')
            .classed('hidden', false)
            .select('#tip-inner').html('<p class="tip-title">'+d.properties.admin+'</p><p class="tip-notes">Partnerships: <strong>'+d.properties.numProj+'</strong></p>')
        })
        .on("mouseout", function(d) {
          $('.national-trends-list li').removeClass('highlight');
          d3.select('#trend-tip').classed('hidden', true);
        });
        d3.select('#Lesotho').moveToFront();
        d3.select('#Swaziland').moveToFront();
        d3.select('#Botswana').moveToFront();
    });


  }
  function showRegionalTrends(t) {

    d3.json("/ppp/data/regions_v3.json", function(error, regions) {
      svg.select("g").selectAll(".regional-points")
        .data(topojson.feature(regions, regions.objects["regional-points"]).features)
        .enter().append("path")
        .attr("class", "regional-points")
        .attr("id", function(d){
          return d.properties.Region.replace('\/', '');
        })
        .attr("d", path.pointRadius(function(d){
          switch(t){
            case "Partnerships":
              var ra = d.properties.Partnerships;
              return radius(ra);
              break;
            case "TLI":
              return radiusTLI(dollars2int(d.properties.TLI));
              break;
            case "USG":
              return radiusUSG(dollars2int(d.properties.USG));
              break;
            case "nonUSG":
              return radiusNonUSG(dollars2int(d.properties.nonUSG));
              break;
            default:
              console.log('broken!');
          }
        }))
        .on("mouseover", function(d) {
          // get translated svg info
          var name = d.properties.Region;
          var rect = getBounds(d.properties.Region.replace('\/', ''));
          var fullName = (d.properties.fullName ? d.properties.fullName : '');
          // set usg and nonUsg with dollars2int function
          var usg = parseInt(dollars2int(d.properties.USG));
          var nonUSG = parseInt(dollars2int(d.properties.nonUSG));
          var total = usg + nonUSG;
          var htmlBar = (d.properties.USG=='No Data' ? '' : '<p class="usgnusg-labels cf"><span class="usg-label">US GOV <span class="regional-percent">'+Math.round((usg/total)*100)+'%</span></span><span class="nusg-label"><span class="regional-percent">'+Math.round((nonUSG/total)*100)+'%</span> NON-US GOV</span></p><div class="region-popup-bar"><div class="bar-right" style="width:'+(nonUSG/total)*100+'%"><span>'+d.properties.nonUSG+'</span></div><div class="bar-left" style="width:'+(usg/total)*100+'%"><span>'+d.properties.USG+'</span></div></div>');
          d3.select('#trend-tip')
            .style('left', function(d){
              if(name=="Asia") {
                return (rect.left-200) + 'px';
              } else {
                return rect.left + 'px';
              }
            })
            .style('bottom', rect.bottom + 'px')
            .classed('hidden', false)
            .classed('right', function(d){
              if(name=="Asia") {
                return true;
              } else {
                return false;
              }
            })
            .select('#tip-inner').html('<p class="tip-title">'+d.properties.Region+'</p><p class="tip-regional-fullname">'+fullName+'</p><p class="tip-regional-data tip-projects">Partnerships: <strong>'+d.properties.Partnerships+'</strong></p><hr>'+htmlBar+'<p class="tip-regional-data tip-usg">US GOV: <strong>'+d.properties.USG+'</strong></p><p class="tip-regional-data tip-nusg">NON-US GOV: <strong>'+d.properties.nonUSG+'</strong></p>');

          // highlight barchart
          d3.select("#bar-"+d.properties.Region.replace('\/', ''))
            .classed("active", true);
        })
        .on("mouseout", function(d) {
          d3.select('#trend-tip').classed('hidden', true);
          d3.select("#bar-"+d.properties.Region.replace('\/', '')).classed('active', false);
        });
    });
  }
  function getBounds(id) {
    var r,
        coords = document.getElementById(id).getBoundingClientRect();
        left = coords.left+(coords.width/2 - 20);
        bottom = $(window).outerHeight()-(coords.top-15);
    r = {
      'left': left,
      'bottom': bottom
    };
    return r;
  }
  function trendReset() {
    if(document.getElementsByClassName('points').length>0) {
      svg.select("g").selectAll(".points")
        .transition().duration(500)
        .attr("style", "stroke-opacity:0")
        .remove();
      $('.regional-trends-button').removeClass('active');
      $('#Partnerships').addClass('active');
    } else {
      svg.select("g").selectAll(".regional-points")
        .transition().duration(500)
        .attr("style", "stroke-opacity:0")
        .remove();
    }
  }
  function dollars2int(cash){
    cash = cash+'';
    cash = cash.replace('$','').replace(/\,/g,'');
    return cash;
  }

  function buildBars() {

    var width = 300,
    barHeight = 20;

    var x = d3.scale.linear()
        .range([0, width]);

    var chart = d3.select("#chart")
        .attr("width", width);

    // var color = d3.scale.ordinal()
    //   .range(["#eed0db", "#e6b9c9", "#ce7393", "#b62e5d", "#ae174b", "#8b123c", "#570b25"]);

    chart.attr("height", barHeight * regionalData.length);

    var rmax = 0;
    for(var r=0; r<regionalData.length; r++) {
      rmax = rmax+(+dollars2int(regionalData[r].TLI));
    }


    var bar = chart.selectAll("g")
        .data(regionalData)
      .enter().append("g")
        .attr("id", function(d){
          return 'bar-'+d.Region.replace('\/', '');
        })
        .attr("class", "bar")
        .attr("transform", function(d, i) { return "translate(50," + i * barHeight + ")"; })
        .on("mouseover", function(d){
          var name = d.Region;
          var usg = parseInt(dollars2int(d.USG));
          var nonUSG = parseInt(dollars2int(d.nonUSG));
          var total = usg + nonUSG;
          var htmlBar = (d.USG=='No Data' ? '' : '<p class="usgnusg-labels cf"><span class="usg-label">US GOV <span class="regional-percent">'+Math.round((usg/total)*100)+'%</span></span><span class="nusg-label"><span class="regional-percent">'+Math.round((nonUSG/total)*100)+'%</span> NON-US GOV</span></p><div class="region-popup-bar"><div class="bar-right" style="width:'+(nonUSG/total)*100+'%"><span>'+d.nonUSG+'</span></div><div class="bar-left" style="width:'+(usg/total)*100+'%"><span>'+d.USG+'</span></div></div>');
          // highlight map symbol
          d3.select("#"+d.Region.replace('\/', ''))
            .classed("active", true);
          // show popup
          var rect = getBounds(d.Region.replace('\/', ''));
          var fullName = (d.fullName ? d.fullName : '');
          d3.select('#trend-tip')
            .style('left', function(d){
              if(name=="Asia") {
                return (rect.left-200) + 'px';
              } else {
                return rect.left + 'px';
              }
            })
            .style('bottom', rect.bottom + 'px')
            .classed('hidden', false)
            .classed('right', function(d){
              if(name=="Asia") {
                return true;
              } else {
                return false;
              }
            })
            .select('#tip-inner').html('<p class="tip-title">'+d.Region+'</p><p class="tip-regional-fullname">'+fullName+'</p><p class="tip-regional-data tip-projects">Partnerships: <strong>'+d.Partnerships+'</strong></p><hr>'+htmlBar+'<p class="tip-regional-data tip-usg">US GOV: <strong>'+d.USG+'</strong></p><p class="tip-regional-data tip-nusg">NON-US GOV: <strong>'+d.nonUSG+'</strong></p>');
        })
        .on("mouseout", function(d){
          d3.select("#"+d.Region.replace('\/', '')).classed("active", false);
          d3.select("#trend-tip").classed("hidden", true);
        });

    bar.append("rect")
        .attr("class", "chart-rect")
        .attr("width", function(d) { return ((+dollars2int(d.TLI)/rmax)*width)+1; })
        .attr("height", barHeight - 1);

    bar.append("text")
        .attr("x", function(d) {
          if(d.Region==='Global/Multilateral'){
            return ((+dollars2int(d.TLI)/rmax)*width)-55;
          } else {
            return ((+dollars2int(d.TLI)/rmax)*width)+5;
          }
        })
        .attr("y", barHeight / 3)
        .attr("class", function(d){
          if(d.Region==='Global/Multilateral'){
            return "chart-number white";
          } else {
            return "chart-number";
          }
        })
        .attr("dy", "8px")
        .text(function(d) { return d.TLIshort+' M'; });

    bar.append("text")
        .attr("text-anchor", "end")
        .attr("x", -3)
        .attr("y", barHeight / 3)
        .attr("class", "chart-region")
        .attr("dy", "8px")
        .text(function(d) {
          if(d.Region==='Global/Multilateral'){
            return "Global*";
          } else if(d.Region==="Europe/Eurasia") {
            return "Eurasia";
          } else {
            return d.Region;
          }

        });
  }

  /////////////////////////////////////////////
  //
  // STORIES
  //
  /////////////////////////////////////////////
  $(document.body).on('click', '.country-story' , function(){
    var storyID = $(this).attr('id');
    for(var y=0;y<stories.length;y++) {
      if(storyID==stories[y].country) {

        $('.story').removeClass('active');
        $('#story-'+storyID).addClass('active');

        $('.country-story').attr("class", "country country-story");
        $(this).attr("class", "country country-story active-country");
      }
    }
  });

  function showStories(stories) {

    // clear info
    info.innerHTML='';
    for(var s=0;s<stories.length;s++){

      // bring story countries to front
      d3.select('#'+stories[s].country).moveToFront();

      // create and append story information to info bar
      var story = document.createElement('div');
      story.id = 'story-'+stories[s].country;
      story.className = 'story';
      if(s==0) {
        story.className += ' active';
      }
      story.innerHTML = '<img src="'+stories[s].imagePath+'">';
      story.innerHTML += '<div class="contain"><h2 class="info-title">'+stories[s].title+'</h2>\
                          <p class="desc">'+stories[s].info+'</p>\
                          <a class="story-readmore" target="_blank" href="'+stories[s].link+'">Full Story</a></div>';
      info.appendChild(story);

      // set Tanzania as first
      d3.select("#TZA")
        .attr("class", "country country-story active-country");

      // addMarkers toMap via story's country param
      // $('#'+stories[s].country).attr('class', 'country country-story');
      d3.select('#'+stories[s].country)
        .attr('class', 'country country-story')

      d3.selectAll('.country-story')
        .append("text")
        .attr("text-anchor", "middle")
        .attr("font-family", "entypo")
        .attr("x", 50)
        .attr("y", 50)
        .attr("class", "country-story-icon")
        .attr("dy", "8px")
        .text("&#59172;");

    }

  }

  // d3 move to front call
  d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };
  d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
      var firstChild = this.parentNode.firstChild;
      if (firstChild) {
        parentNode.insertBefore(this, firstChild);
      }
    });
  };

});
