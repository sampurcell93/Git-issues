<?php 
	$issue = $_GET['issue'];
?>
<!DOCTYPE html>
<html>
	<head>
	  <title>Github Issue Viewer</title>
	  <link href="stylesheets/screen.css" media="screen, projection" rel="stylesheet" type="text/css" />
	  <link href="stylesheets/print.css" media="print" rel="stylesheet" type="text/css" />
	  <!--[if IE]>
	      <link href="/stylesheets/ie.css" media="screen, projection" rel="stylesheet" type="text/css" />
	  <![endif]-->
	  <script src="http://code.jquery.com/jquery-1.7.2.min.js"></script>
		<script src="http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.3/underscore-min.js" type="text/javascript"></script>
      <script src="http://ajax.cdnjs.com/ajax/libs/backbone.js/0.9.10/backbone-min.js"></script>
      <script type='text/javascript'>
     
      		Issue = Backbone.Model.extend({
      			url: "https://api.github.com/repos/rails/rails/issues/"
      		});

      		var issue = new Issue();
      		issue.fetch();

      </script>
	</head>
	<body>
		
	</body>
</html>