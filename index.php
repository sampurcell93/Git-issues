<!DOCTYPE html>
<html>
	<head>
	  <title>Github Issue Viewer</title>
	  <link href="stylesheets/screen.css" media="screen, projection" rel="stylesheet" type="text/css" />
	  <link href="stylesheets/print.css" media="print" rel="stylesheet" type="text/css" />
	  <!--[if IE]>
	      <link href="/stylesheets/ie.css" media="screen, projection" rel="stylesheet" type="text/css" />
	  <![endif]-->
	  <link href='http://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>
	  <script src="http://code.jquery.com/jquery-1.7.2.min.js"></script>
	  <script src="http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.3/underscore-min.js" type="text/javascript"></script>
      <script src="http://ajax.cdnjs.com/ajax/libs/backbone.js/0.9.10/backbone-min.js"></script>
      <script type="text/javascript" src='issues.js'></script>
	</head>
	<body>
		<h1><span class='icon'>&#xe002;</span>Issues</h1>
		<div class='wrap'>
			<script type='text/template' id='issue-full'>
				<div id='top-info'>
					<span data-open='<%= state %>' class='fl icon'><%= stateIcon %></span>
					<h2><%= title %></h2>
					<button class='close fr'>Close</button>
				</div>
				<p class='body fr' style='margin-right: 6px;' id='w80'>
					<span class='by-user'>By <a href='<%= html_url %>'><%= name %></a> at <%= timestamp %> <br /></span>
					<%= body %>
				</p>
				<div class='user' id='w20'>
					<a href='<%= html_url %>'>
						<img src='<%= avatar %>' />
						<span><%= username %></span>
					</a>
						<span><%= commentNum %> comments</span>
						<span>Created at <%= timestamp %></span>

				</div>
				<span class='comment-control'>Hide all <span class='num-comments'><%= commentNum %></span> Comments</span>
				<%= labels %>
			</script>
			<script type="text/template" id='single-comment'>
				<p class='body'>
					<span class='by-user'>By <a href='<%= html_url %>'><%= name %></a> at <%= timestamp %> <br /></span>
					<%= body %>
				</p>

			</script>
			<ul class='issue-list'>
				<li class='controls' id='top'>
					<button class='prev'></button>
					<button class='next'></button>
				</li>
				<li class='controls' id='bottom'>
					<button class='prev'></button>
					<button class='next'></button>
				</li>
				<script type='text/template' id='issue-item'>
						<a class='user' href='<%= user_url %>'>
							<img src='<%= avatar %>' />
						<span><%= username %></span></a>
					<div class='right-box rel'>
						<h2 data-icon='&#xe014;' class='title'><%= title %></h2>
						<p class='body'><%= truncated_body %></p>
						<%= labels %>
					</div>
				</script>

			</ul>
		</div>
	</body>
</html>