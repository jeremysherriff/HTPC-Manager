/*jshint esversion: 6 */

$(document).ready(function () {
  // moment().format();
  $(window).trigger('hashchange');

  // Todo: convert to use deferred() so that we only request an auth token once.
  loadFunctionMenu();

  switch (decodeURIComponent(location.hash.substr(0))) {
    // Using hash values from URI strings is Bad(tm). It's a potential security
    // flaw and a wide-open vector for attempts.  We can't stop people trying to
    // inject things via the hash but we shouldn't act on them.  Never take the
    // raw value and do something with it, always use some sort of substr, case,
    // if-then that will break the javascript or requires specific values only.
    case "#mrequests_tab":
      loadMRequests();
      break;
    case "#msearch_tab":
      loadMSearch('popular', 'suggest');
      break;
    case "#tvrequests_tab":
      loadTVRequests();
      break;
    case "#tvsearch_tab":
      loadTVSearch('popular', 'suggest');
      break;
    case "": // don't use case/default; see security disclaimer above.
      loadMRequests(); // load content for default tab
      break;
  }

// Action triggers for buttons etc
  
  // Tab contents to load when clicked rather than on page load
  $('a[href="#mrequests_tab"]').on('show.bs.tab', function (e) { loadMRequests(); });
  $('a[href="#msearch_tab"]').on('show.bs.tab', function (e) { loadMSearch('popular', 'suggest'); });
  $('a[href="#tvrequests_tab"]').on('show.bs.tab', function (e) { loadTVRequests(); });
  $('a[href="#tvsearch_tab"]').on('show.bs.tab', function (e) { loadTVSearch('popular', 'suggest'); });

  $( document ).on( 'keydown', function ( e ) {
      if ( e.keyCode === 27 ) { // ESC
          close_menu();
      }
  });

  var searchMovieAction = function () {
    var query = $('#search_movie_name').val();
    if (query) {
      loadMSearch(query, 'search');
    }
  };
  $('#search_movie_button').click(searchMovieAction);
  $('#search_movie_name').keyup(function (event) {
    if (event.keyCode == 13) {
      searchMovieAction();
    }
  });

  $('#search_popular_button').click(function () {
    loadMSearch('popular', 'suggest');
  });

  $('#search_upcoming_button').click(function () {
    loadMSearch('upcoming', 'suggest');
  });

  $('#search_toprated_button').click(function () {
    loadMSearch('toprated', 'suggest');
  });

  $('#search_nowplaying_button').click(function () {
    loadMSearch('nowplaying', 'suggest');
  });

  var searchTVAction = function () {
    var query = $('#search_tvshow_name').val();
    if (query) {
      loadTVSearch(query, 'search');
    }
  };
  $('#search_tvshow_button').click(searchTVAction);
  $('#search_tvshow_name').keyup(function (event) {
    if (event.keyCode == 13) {
      searchTVAction();
    }
  });

  $('#search_tvpopular_button').click(function () {
    loadTVSearch('popular', 'suggest');
  });

  $('#search_trending_button').click(function () {
    loadTVSearch('trending', 'suggest');
  });

  $('#search_mostwatched_button').click(function () {
    loadTVSearch('mostwatched', 'suggest');
  });

  $('#search_anticipated_button').click(function () {
    loadTVSearch('anticipated', 'suggest');
  });
});

function loadMRequests(mreq_col=1, mreq_ord=1 ) {
  $('.spinner').show();
  $.ajax({
    url: WEBDIR + 'ombi/movie_requests',
    type: 'get',
    dataType: 'json',
    success: function (result) {
      $('#mrequests_table_body').empty();
      if (result == 'False') {
        var row = $('<tr>');
        row.append($('<td>').attr('colspan', '4').html('No movies found'));
        $('#mrequests_table_body').append(row);
        $('.spinner').hide();
        return false;
      }
      var i = 0;
      $.each(result, function (showname, movie) {
        var row = $('<tr>');
        var summaryicon = makeIcon('fa fa-info-circle fa-fw', movie.overview);
          var name = $('<a>').attr('href', 'https://www.themoviedb.org/movie/'+movie.theMovieDbId)
            .text(movie.title+' ('+movie.releaseDate.substr(0,4)+')').attr('target','_blank');
          row.append($('<td>').append(summaryicon).append('&nbsp;').append(name));
          row.append($('<td nowrap>').append( (movie.digitalRelease ? movie.digitalReleaseDate : movie.releaseDate).substr(0,10))
            .append('<br />').append( movie.digitalRelease ? 'Digital' : movie.status.replace('Post Production','Post Prod'))
            );
        var div_$i = ($('<div id="#mreq_menu_'+movie.theMovieDbId+'" class="span2 ombi-actions">'));
        if (movie.available) {
          div_$i.append( ( $('<button class="btn btn-ombi btn-danger" type="button">)').attr('title','Remove request')
            .append($('<i>').addClass('fa fa-minus fa-fw fa-slightlybigger')).append(' Remove &nbsp;')
            .click( function(){ombi_remove("movie",movie.id,loadMRequests,mreq_col,mreq_ord);} ) ) )
            .append('<br />')
            .append( ( $('<button class="btn btn-ombi btn-blue btn-ombiblue" type="button">)').attr('title','Mark Unavailable')
            .append($('<i>').addClass('fa fa-minus fa-fw fa-slightlybigger')).append(' Mark Unavailable &nbsp;')
            .click( function(){ombi_mark_unavailable("movie",movie.id,loadMRequests,mreq_col,mreq_ord);} ) ) );
          row.append( $('<td nowrap>').append($('<button class="btn btn-ombi btn-success" type="button">)').attr('title','Request actions menu')
              .click( function(){toggle_menu(div_$i);})
            .append(' Available ').append($('<i>').addClass('fa fa-chevron-down'))).append( div_$i.attr('hidden',true) )
          );
        }
        else if (movie.approved) {
          div_$i.append( ( $('<button class="btn btn-ombi btn-danger" type="button">)').attr('title','Remove request')
            .append($('<i>').addClass('fa fa-minus fa-fw fa-slightlybigger')).append(' Remove &nbsp;')
            .click( function(){ombi_remove("movie",movie.id,loadMRequests,mreq_col,mreq_ord);} ) ) )
            .append('<br />')
            .append( ( $('<button class="btn btn-ombi btn-success" type="button">)').attr('title','Mark Available')
            .append($('<i>').addClass('fa fa-plus-square fa-fw fa-slightlybigger')).append(' Mark Available &nbsp;')
            .click( function(){ombi_mark_available("movie",movie.id,loadMRequests,mreq_col,mreq_ord);} ) ) );
          row.append( $('<td nowrap>').append($('<button class="btn btn-ombi btn-ombiblue" type="button">)').attr('title','Request actions menu')
              .click(function(){toggle_menu(div_$i);})
            .append(' Processing ').append($('<i>').addClass('fa fa-chevron-down'))).append( div_$i.attr('hidden',true) )
          );
        }
        else if (movie.denied) {
          div_$i.append( ( $('<button class="btn btn-ombi btn-success" type="button">)').attr('title','Appprove request')
            .append($('<i>').addClass('fa fa-plus-square fa-fw fa-slightlybigger')).append(' Approve &nbsp;')
            .click( function(){ombi_approve("movie",movie.id,loadMRequests,mreq_col,mreq_ord);} ) ) )
            .append('<br />')
            .append( ( $('<button class="btn btn-ombi btn-danger" type="button">)').attr('title','Remove request')
            .append($('<i>').addClass('fa fa-minus fa-fw fa-slightlybigger')).append(' Remove &nbsp;')
            .click( function(){ombi_remove("movie",movie.id,loadMRequests,mreq_col,mreq_ord);} ) ) )
            .append('<br />')
            .append( ( $('<button class="btn btn-ombi btn-success" type="button">)').attr('title','Mark Available')
            .append($('<i>').addClass('fa fa-plus-square fa-fw fa-slightlybigger')).append(' Mark Available &nbsp;')
            .click( function(){ombi_mark_available("movie",movie.id,loadMRequests,mreq_col,mreq_ord);} ) ) );
          row.append( $('<td>').append($('<button class="btn btn-ombi btn-danger" type="button">)').attr('title','Request actions menu')
              .click(function(){toggle_menu(div_$i);})
            .append(' Denied ').append($('<i>').addClass('fa fa-chevron-down'))).append( div_$i.attr('hidden',true) )
          );
        }
        else { // "Requested"
          div_$i.append( ( $('<button class="btn btn-ombi btn-success" type="button">)').attr('title','Appprove request')
            .append($('<i>').addClass('fa fa-plus-square fa-fw fa-slightlybigger')).append(' Approve &nbsp;')
            .click( function(){ombi_approve("movie",movie.id,loadMRequests,mreq_col,mreq_ord);} ) ) )
            .append('<br />')
            .append( ( $('<button class="btn btn-ombi btn-danger" type="button">)').attr('title','Deny request')
            .append($('<i>').addClass('fa fa-times fa-fw fa-slightlybigger')).append(' Deny &nbsp;')
            .click( function(){ombi_deny("movie",movie.id,loadMRequests,mreq_col,mreq_ord);} ) ) )
            .append('<br />')
            .append( ( $('<button class="btn btn-ombi btn-danger" type="button">)').attr('title','Remove request')
            .append($('<i>').addClass('fa fa-minus fa-fw fa-slightlybigger')).append(' Remove &nbsp;')
            .click( function(){ombi_remove("movie",movie.id,loadMRequests,mreq_col,mreq_ord);} ) ) )
            .append('<br />')
            .append( ( $('<button class="btn btn-ombi btn-success" type="button">)').attr('title','Mark Available')
            .append($('<i>').addClass('fa fa-plus-square fa-fw fa-slightlybigger')).append(' Mark Available &nbsp;')
            .click( function(){ombi_mark_available("movie",movie.id,loadMRequests,mreq_col,mreq_ord);} ) ) );
          row.append( $('<td nowrap>').append($('<button class="btn btn-ombi btn-warning" type="button">)').attr('title','Request actions menu')
              .click(function(){toggle_menu(div_$i);})
            .append(' Pending ').append($('<i>').addClass('fa fa-chevron-down'))).append( div_$i.attr('hidden',true) )
          );
        }
        row.append(
          $('<td>').append( '<nobr>'+movie.requestedDate.substr(0,10)+'</nobr>' )
          .append('<br />').append(movie.requestedUser.alias)
        );
        $('#mrequests_table_body').append(row);
        i+=1;
      });
      $('#mrequests_table_body').parent().trigger('update');
      $('#mrequests_table_body').parent().on('sortEnd', function(event) {
          var s = '' + event.target.config.sortList + ''; // Had trouble typecasting this!
          var sp = s.split(",");
          mreq_col = sp[0];
          mreq_ord = sp[1];
      });
      $('#mrequests_table_body').parent().trigger("sorton", [
        [
          [mreq_col, mreq_ord]
        ]
      ]);
      $('.spinner').hide();
    },
    error: function (result) {
      notify('Ombi', 'Could not connect to Ombi, check your settings' + result, 'error');
    }
  });
}

function loadTVRequests(viewReq="0", viewChild="0") {
  $('.spinner').show();
  $.ajax({
    url: WEBDIR + 'ombi/tv_requests',
    type: 'get',
    dataType: 'json',
    success: function (result) {
      $('#tvrequests_table_body').empty();
      if (result == 'False') {
        var row = $('<tr>');
        row.append($('<td>').attr('colspan', '4').html('No TV shows found'));
        $('#tvrequests_table_body').append(row);
        $('.spinner').hide();
        return false;
      }
      $.each(result, function (showix, show) {
        var row = $('<tr>');
        var tvDbId = show.tvDbId;
        var viewScroll;
        var title = show.title+' ('+show.releaseDate.substr(0,4)+')';
        var name = $('<a>').attr('href', 'https://www.imdb.com/title/'+show.imdbId)
          .text(title).attr('target','_blank');
        var tvreq_detail_$tvDbId = $('<div id="#tvreq_detail_'+tvDbId+'" class="span6 ombi-tvrequest-detail">');
        var closebtn_$tvDbId = $('<button class="btn btn-danger btn-small btn-ombi-close" name="close">');
        closebtn_$tvDbId.attr('title','Esc to close').append( $('<li class="fa fa-times fa-fw">') );
        tvreq_detail_$tvDbId.append( closebtn_$tvDbId );
        var detail_tbody = $('<tbody>');
        var detail_row = $('<tr>');
        detail_row.append( $('<td colspan=4 width="100%">').append( $('<h3>').html('<b>'+title+'</b>') )
          .append('<b>Status</b>: '+show.status).append(' &nbsp; <b>Release Date</b>: '+show.releaseDate.substr(0,10)) );
        detail_tbody.append(detail_row);
        var summaryicon = makeIcon('fa fa-info-circle fa-fw', show.overview);
        row.append($('<td>').append(summaryicon).append('&nbsp;').append(name));
        row.append($('<td nowrap>').append(show.status));
        row.append($('<td nowrap>').append(show.releaseDate.substr(0,10)));
        $.ajax({
          url: WEBDIR + 'ombi/tv_request_details/'+show.id,
          type: 'get',
          dataType: 'json',
          success: function (detail) {
            $.each(detail.childRequests, function (childix, childreq) {
              var linktxt = $('<span>').append('<b>Seasons in Request</b>:');
              var cReqIx = 'c_'+childreq.id;
              var linkId = 'linktxt_'+childreq.id;
              var linkTd = $('<td colspan=3>');
              closebtn_$tvDbId.click( function(){ $('.'+cReqIx).hide(); toggle_req_div(tvreq_detail_$tvDbId); })
              linkTd.attr('id',linkId);
              if (viewChild == cReqIx) { viewScroll = '#'+cReqIx; }
              var avBtnLabel = 'Available';
              var avBtnIcon = 'check';
              var avBtnType = 'success';
              if (childreq.available) {
                avBtnLabel = 'Unavailable';
                avBtnIcon = 'minus';
                avBtnType = 'ombiblue';
              }
              detail_row = $('<tr id="'+cReqIx+'">');
              detail_row.append(
                $('<td class="span2" width="100%" colspan=2>').css('border-top','solid 1px')
                  .append('Requested By:<h2> &nbsp; '+childreq.requestedUser.alias+'</h>') )
              detail_row.append(
                $('<td class="span2" width="100%" colspan=2>').css('white-space','nowrap')
                  .css('border-top','solid 1px')//.css('float','right')
                .append( $('<div style="display: inline-block; float: right;">')
                  .append( $('<button class="btn btn-success btn-small btn-ombi">')
                    .addClass(function(){if(childreq.approved){return 'disabled';}})
                    .click( function(){ if(!childreq.approved){ombi_approve('tv', childreq.id, loadTVRequests, tvDbId, cReqIx);}})
                    .append( $('<li class="fa fa-plus">') ).append(' Approve')
                  )
                  .append( $('<button class="btn btn-'+avBtnType+' btn-small btn-ombi">')
                    .click( function(){ if (childreq.available) { ombi_mark_unavailable('tv', childreq.id, loadTVRequests, tvDbId, cReqIx); }
                      else { ombi_mark_available('tv', childreq.id, loadTVRequests, tvDbId, cReqIx); }})
                    .append( $('<li class="fa fa-'+avBtnIcon+'">') ).append(' Mark '+avBtnLabel)
                  )
                ).append('<br /><br />')
                .append( $('<div style="display: inline-block; float: right;">')
                  .append( $('<button class="btn btn-danger btn-small btn-ombi">')
                    .addClass(function(){if(childreq.denied){return 'disabled';}})
                    .click( function(){if(!childreq.denied){ombi_deny('tv', childreq.id, loadTVRequests, tvDbId, cReqIx);}})
                    .append( $('<li class="fa fa-times">') ).append(' Deny')
                  )
                  .append( $('<button class="btn btn-danger btn-small btn-ombi">')
                    .click( function(){ ombi_remove('tv', childreq.id, loadTVRequests, tvDbId, "0"); })
                    .append( $('<li class="fa fa-times">') ).append(' Remove')
                  )
                )
              );
              // detail_row.append(req_cell).append(btn_cell);
              detail_tbody.append(detail_row);
              detail_row = $('<tr>');
              detail_row.append( linkTd );
              detail_tbody.append(detail_row);
              detail_row.append( $('<td class="span1">').css('white-space','nowrap').css('text-align','right')
                .append( $('<a>').css('cursor','pointer')
                .click( function(){ $('.'+cReqIx).toggle(); })
                .append( $('<li class="fa fa-chevron-down">') ).append(' Details') ) );
              $.each(childreq.seasonRequests, function(seasonix, seasonreq) {
                var seasonNum = 'S'+(('0'+seasonreq.seasonNumber).slice(-2));
                var seasonId = 'c'+childreq.id+seasonNum;
                linktxt.append('&nbsp;').append( $('<a style="cursor:pointer;">').append(seasonNum)
                  .click( function() { doShowScroll(cReqIx,seasonId);} ) );
                var season_row = $('<tr>').attr('id',seasonId).addClass(cReqIx).addClass('tvChildReqRows').css('display','none');
                season_row.append( $('<td colspan=3>').append('<b>Season: '+seasonreq.seasonNumber+'</b>') )
                  .append( $('<td class="span1">')
                  .css('text-align','right')
                  .append( $('<a>').append('Back to Top ').append( $('<li class="fa fa-arrow-up"></li>') ) )
                  .css('cursor','pointer').click( function() { $('#'+cReqIx).get(0).scrollIntoView(); } )
                );
                detail_tbody.append(season_row);
                $.each(seasonreq.episodes, function(episodeix, episode) {
                  var ep_row = $('<tr>').addClass(cReqIx).addClass('tvChildReqRows').css('display','none');
                  var episodeStatus = 'PendingApproval';
                  if (episode.approved) { episodeStatus = 'Processing'; }
                  if (episode.available) { episodeStatus = 'Available'; }
                  if (childreq.denied) { episodeStatus = 'Denied'; }
                  ep_row.append( 
                    $('<td class="span1">').css('text-align','right').append(episode.episodeNumber+' '),
                    $('<td class="span2">').append(episode.title),
                    $('<td class="span1">').append('<nobr>'+episode.airDate.substr(0,10)+'</nobr>'),
                    $('<td class="span1">').append(episodeStatus)
                  );
                  detail_tbody.append(ep_row);
                }); // each episode
                // i += 1;
              }); // each seasonreq
              linkTd.append(linktxt);
            }); // each childreq
            row.append( $('<td>').css('white-space','nowrap').append(
              $('<button id="#view_req'+tvDbId+'" class="btn btn-ombi btn-success" type="button">)')
              .attr('title','View Show request')
              .click( function(){ toggle_req_div(tvreq_detail_$tvDbId); })
              .append($('<i>').addClass('fa fa-chevron-down fa-slightlybigger')).append(' View ')
            ) );
            tvreq_detail_$tvDbId.append( $('<table width="100%">')
              .addClass('table','table-striped')
              .append(detail_tbody)
            );
            $('#tvrequests_table_body').append(tvreq_detail_$tvDbId);
            $('#tvrequests_table_body').append(row);
            // alert('viewReq = '+viewReq+'\ntvDbId = '+tvDbId);
            if (viewReq == tvDbId) {
              toggle_req_div(tvreq_detail_$tvDbId);
              if (viewScroll) { $(viewScroll).get(0).scrollIntoView(); }
            }
          } // ajax success of tv_request_details
        }); // ajax call for tv_request_details
      }); // each show in tv_requests
      $('.spinner').hide();
    }, // ajax success of tv_requests
    error: function (result) {
      notify('Ombi', 'Could not connect to Ombi, check your settings' + result, 'error');
    }
  }); // ajax call for tv_requests
}

function doShowScroll(childReq, id) {
  $('.'+childReq).show();
  $('#'+id).get(0).scrollIntoView();
}

function loadMSearch(hint='popular', lookup='suggest') {
  var url = WEBDIR + 'ombi/get_searchresult?t=movie&q='+hint+'&l='+lookup;
  // alert(url)
  $('.spinner').show();
  $.ajax({
    url: url,
    type: 'get',
    dataType: 'json',
    success: function (result) {
      $('#msearch_table_body').empty();
      if (result == 'False' || result.length == 0) {
        var row = $('<tr>');
        row.append($('<td>').attr('colspan', '4').html('No movies found'));
        $('#msearch_table_body').append(row);
        $('.spinner').hide();
        return false;
      }
      var i = 0;
      $.each(result, function (showname, movie) {
        // $.getJSON(WEBDIR + 'ombi/get_extrainfo?t=movie&q='+movie.theMovieDbId+'&k=digitalReleaseDate', function(digitalReleaseDate) {
        var row = $('<tr>');
        var summaryicon = makeIcon('fa fa-info-circle fa-fw', movie.overview);
        if (movie.releaseDate == null) {
          var name = $('<a>').attr('href', 'https://www.themoviedb.org/movie/'+movie.theMovieDbId)
            .text(movie.title).attr('target','_blank');
          row.append($('<td>').append(summaryicon).append('&nbsp;').append(name));
          row.append($('<td>'));
        } else {
          var name = $('<a>').attr('href', 'https://www.themoviedb.org/movie/'+movie.theMovieDbId)
            .text(movie.title+' ('+movie.releaseDate.substr(0,4)+')').attr('target','_blank');
          row.append($('<td>').append(summaryicon).append('&nbsp;').append(name));
          row.append($('<td nowrap>').append(movie.releaseDate.substr(0,10)));
        }
        if (movie.available && movie.quality) {
          row.append( $('<td>').append('Available ').append( $('<span>')
            .html(movie.quality).addClass('label label-success label-ombi-quality')));
        }
        else if (movie.available) { row.append( $('<td nowrap>').append('Available') ); }
        else if (movie.approved) { row.append($('<td>').append('Processing Request')); }
        else if (movie.requested && !(movie.approved)) { row.append($('<td>').append('Pending Approval')); }
        else { 
          row.append($('<td nowrap>').append( ( $('<button class="btn btn-ombi btn-warning" type="button">)')
            .append($('<i>').addClass('fa fa-plus-square fa-fw fa-slightlybigger"')).append(' Request &nbsp;')
            .attr('title','Request '+movie.title).click( function(){ombi_mrequest(movie.theMovieDbId, hint, lookup);} ) ) ) );
        }
        row.append($('<td nowrap>').append( ( $('<button class="btn btn-ombi btn-blue btn-ombiblue" type="button">)')
          .append($('<i>').addClass('fa fa-eye fa-slightlybigger')).append(' Similar')
          .attr('title','Look for movies similar to '+movie.title).click( function(){loadMSearch(movie.theMovieDbId);} ) ) ) );
        $('#msearch_table_body').append(row);
        i+=1;
      });
      $('#msearch_table_body').parent().trigger('update');
      $('#msearch_table_body').parent().trigger("sorton", [
        [
          [1, 1]
        ]
      ]);
      $('.spinner').hide();
    },
    error: function (result) {
      $('.spinner').hide();
      notify('Ombi', 'Could not connect to Ombi, check your settings' + result, 'error');
    }
  });
}

function loadTVSearch(hint='popular', lookup='suggest') {
  var url = WEBDIR + 'ombi/get_searchresult?t=tv&q='+hint+'&l='+lookup;
  // alert(url)
  $('.spinner').show();
  $.ajax({
    url: url,
    type: 'get',
    dataType: 'json',
    success: function (result) {
      $('#tvsearch_table_body').empty();
      if (result == 'False' || result.length == 0) {
        var row = $('<tr>');
        row.append($('<td>').attr('colspan', '3').html('No TV shows found'));
        $('#tvsearch_table_body').append(row);
        $('.spinner').hide();
        return false;
      }
      var i = 0;
      $.each(result, function (showname, show) {
        var row = $('<tr>');
        var summaryicon = makeIcon('fa fa-info-circle fa-fw', show.overview);
        if (show.firstAired == null || show.firstAired == "") {
          var name = $('<a>').attr('href', 'https://www.imdb.com/title/'+show.imdbId)
            .text(show.title).attr('target','_blank');
          row.append($('<td>').append(summaryicon).append('&nbsp;').append(name));
        } else {
          var name = $('<a>').attr('href', 'https://www.imdb.com/title/'+show.imdbId)
            .text(show.title+' ('+show.firstAired.substr(0,4)+')').attr('target','_blank');
          row.append($('<td>').append(summaryicon).append('&nbsp;').append(name));
        }
        row.append( $('<td nowrap>').append(show.status) );
        if (show.firstAired == null || show.firstAired == "") {
          row.append($('<td>').append('<!-- No date -->'));
        } else {
          row.append($('<td nowrap>').append(show.firstAired.substr(0,10)));
        }
        if (show.available && show.quality) {
          row.append( $('<td>').append('Available ').append( $('<span>')
            .html(show.quality).addClass('label label-success label-ombi-quality')));
        }
        else if (show.available) { row.append( $('<td nowrap>').append('Available') ); }
        else if (show.approved) { row.append($('<td>').append('Processing Request')); }
        else if (show.requested && !(show.approved)) { row.append($('<td>').append('Pending Approval')); }
        else { 
          row.append($('<td nowrap>').append( ( $('<button class="btn btn-ombi btn-warning" type="button">)')
            .append($('<i>').addClass('fa fa-plus-square fa-fw fa-slightlybigger"')).append(' Request &nbsp;')
            .attr('title','Request '+show.title).click( function(){alert('Sorry, TV requests not working yet!');} ) ) ) );
        }
        $('#tvsearch_table_body').append(row);
        i+=1;
      });
      $('#tvsearch_table_body').parent().trigger('update');
      $('#tvsearch_table_body').parent().trigger("sorton", [
        [
          [1, 1]
        ]
      ]);
      $('.spinner').hide();
    },
    error: function (result) {
      $('.spinner').hide();
      notify('Ombi', 'Could not connect to Ombi, check your settings' + result, 'error');
    }
  });
}

function get_extrainfo_key(ctype,cid,key) {
  $.getJSON(WEBDIR + 'ombi/get_extrainfo?t='+ctype+'&q='+cid+'&k='+key, function(result) {
    // alert(key + ' is ' + result);
    return result;
  });
}

function loadFunctionMenu() {
  // $('.fmenu_plex').hide();
  // $('.fmenu_emby').hide();
  $.ajax({
    url: WEBDIR + 'ombi/get_plex_enabled',
    type: 'get',
    dataType: 'text',
    success: function(result) {
      if (result == 'True') {
        // $('.fmenu_plex').show();
        $('#sync_plex_part').click(function () {
          syncContent('plex', 'part');
        });
        $('#sync_plex_full').click(function () {
          syncContent('plex', 'full');
        });
      } else {
        $('.fmenu_plex').addClass('ombi-menu-disabled');
      }
    }
  });
  $.ajax({
    url: WEBDIR + 'ombi/get_emby_enabled',
    type: 'get',
    dataType: 'text',
    success: function(result) {
      if (result == 'True') {
        // $('.fmenu_emby').show();
        $('#sync_emby_full').click(function () {
          syncContent('emby', 'full');
        });
      } else {
        $('.fmenu_emby').addClass('ombi-menu-disabled');
      }
    }
  });
}

function toggle_menu(div_id) {
  // Collapses any open menus when opening another
  if (div_id.is(":hidden")) {
    $('.ombi-actions').hide();
    $('.ombi-tvrequest-detail').css('visibility','hidden');
    // $('.ombi-tvrequest-detail').hide();
    div_id.slideDown("fast");
  } else {
    div_id.slideUp("fast");
  }
}

function toggle_req_div(div_id) {
  // Using :visibility instead of :display to minimise
  // reflow of page when adding scroll bar after opening div.
  if (div_id.css('visibility') == 'hidden') {
    close_menu();
    div_id.css('visibility','visible');
  } else {
    // ('.ombi-tvrequest-detail').css('visibility','hidden');
    close_menu();
  }
}

function close_menu() {
  // Collapses any open menus
  $('.tvChildReqRows').hide();
  $('.ombi-actions').hide();
  $('.ombi-tvrequest-detail').css('visibility','hidden');
}

function ombi_approve(ctype, id, fn, col=0, ord=0) {
  // Actions the menu action, and then reloads the tab while
  // retaining existing table sort order (movies) or
  // opening and scrolling to the right div (tv shows).
  if (ctype == 'movie') {
    ombi_maction(id, 'approve').done(function(res) {
      notify('Ombi', 'Approved', 'success'); // Approve action doesn't return a message.
      fn(col,ord);
      return;
    });
  } else if (ctype == 'tv') {
    ombi_tvaction(id, 'approve').done(function(res) {
      // Using params col & ord to return to the correct
      // div & season span on TV requests.
      notify('Ombi', 'Approved', 'success');
      fn(col,ord);
      return;
    });
  } else {
    notify('Ombi', 'Content type "'+ctype+'" not handled', 'error');
  }
}

function ombi_mark_available(ctype, id, fn, col=0, ord=0) {
  if (ctype == 'movie') {
    ombi_maction(id, 'available').done(function(res) {
      notify('Ombi', res, 'success');
      fn(col,ord);
      return;
    });
  } else if (ctype == 'tv') {
    ombi_tvaction(id, 'available').done(function(res) {
      notify('Ombi', res, 'success');
      fn(col,ord);
      return;
    });
  } else {
    notify('Ombi', 'Content type "'+ctype+'" not handled', 'error');
  }
}

function ombi_mark_unavailable(ctype, id, fn, col=0, ord=0) {
  if (ctype == 'movie') {
    ombi_maction(id, 'unavailable').done(function(res) {
      notify('Ombi', res, 'success');
      fn(col,ord);
      return;
    });
  } else if (ctype == 'tv') {
    ombi_tvaction(id, 'unavailable').done(function(res) {
      notify('Ombi', res, 'success');
      fn(col,ord);
      return;
    });
  } else {
    notify('Ombi', 'Content type "'+ctype+'" not handled', 'error');
  }
}

function ombi_deny(ctype, id, fn, col=0, ord=0) {
  if (ctype == 'movie') {
    ombi_maction(id, 'deny').done(function(res) {
      notify('Ombi', res, 'info');
      fn(col,ord);
      return;
    });
  } else if (ctype == 'tv') {
    ombi_tvaction(id, 'deny').done(function(res) {
      notify('Ombi', 'Request has been marked as denied', 'info');
      fn(col,ord);
      return;
    });
  } else {
    notify('Ombi', 'Content type "'+ctype+'" not handled', 'error');
  }
}

function ombi_remove(ctype, id, fn, col=0, ord=0) {
  if (ctype == 'movie' || ctype == 'tv') {
    ombi_delete(ctype, id, 'remove').done(function(res) {
      notify('Ombi', res, 'info');
      fn(col,ord);
      return;
    });
  } else {
    notify('Ombi', 'Content type "'+ctype+'" not handled', 'error');
  }
}

function ombi_mrequest(id, h, l) {
  var u = WEBDIR + 'ombi/request_movie?id='+id;
  $.ajax({
    url: u,
    data: id,
    type: 'get',
    dataType: 'json',
    success: function(result) {
      if (!result.isError) {
        notify('Request success ', result.message, 'success');
        loadMRequests(h,l);
      } else {
        notify('Failed to request movie ', 'Check logs for details', 'error');
      }
      return true;
    },
    error: function(data){
      notify('Failed to request movie ', 'Bad web engine call: ' + data.status + ' ' + data.statusText, 'error');
      return false;
    }
  });
}

function syncContent(source, mode) {
  $.ajax({
    url: WEBDIR + 'ombi/content_sync?source=' + source + '&mode=' + mode,
    type: 'post',
    dataType: 'text',
    success: function(result) {
      if (result != 'True') {
        notify('Ombi', 'Sync for ' + source + ' returned ' + result, 'error');
      } else {
        notify('Ombi', 'Sync for ' + source + ' initiated', 'success');
      }
    }
  });
}

function ombi_maction(id, action) {
  var u = WEBDIR + 'ombi/do_maction?id=' + id + '&action=' + action;
  // alert(u)
  var dfrd = $.Deferred();
  $.ajax({
    url: u,
    type: 'post',
    dataType: 'json',
    success: function(result) {
      if (result.isError) {
        dfrd.reject(false);
        notify('Ombi', 'API call failed for "' + id + ':' + action + '" returned: ' + result.errorMessage, 'error');
      } else {
        dfrd.resolve(result.message);
      }
    },
    error: function(data){
      notify('Failed to do ' + action , 'Bad web engine call: ' + data.status + ' ' + data.statusText, 'error');
      dfrd.reject(false);
    }
  });
  return dfrd.promise();
}

function ombi_tvaction(id, action) {
  var u = WEBDIR + 'ombi/do_tvaction?id=' + id + '&action=' + action;
  // alert(u)
  var dfrd = $.Deferred();
  $.ajax({
    url: u,
    type: 'post',
    dataType: 'json',
    success: function(result) {
      if (result.isError) {
        dfrd.reject(false);
        notify('Ombi', 'API call failed for "' + id + ':' + action + '" returned: ' + result.errorMessage, 'error');
      } else {
        dfrd.resolve(result.message);
      }
    },
    error: function(data){
      notify('Failed to do "'+action+'"' , 'Bad web engine call: ' + data.status + ' ' + data.statusText, 'error');
      dfrd.reject(false);
    }
  });
  return dfrd.promise();
}

function ombi_delete(ctype, id, action) {
  // Delete is handled differently by the Ombi API, as there's no response message
  // and it seems to be text not json due to DELETE verb. Not 100% sure on that last point :) .
  if (ctype == 'movie') { var u = WEBDIR + 'ombi/do_maction?id=' + id + '&action=' + action; }
  if (ctype == 'tv') { var u = WEBDIR + 'ombi/do_tvaction?id=' + id + '&action=' + action; }
  var dfrd = $.Deferred();
  $.ajax({
    url: u,
    type: 'post',
    dataType: 'text',
    success: function(result) {
      dfrd.resolve('Removed request successfully');
    },
    error: function(result){
      notify('Failed to remove request ', 'Bad web engine call: ' + result.status + ' ' + result.statusText, 'error');
      dfrd.reject('An error occured, check the logs');
    }
  });
  return dfrd.promise();
}

