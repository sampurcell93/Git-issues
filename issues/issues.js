$(document).ready(function() {
	var starting = false;
	/* module for linking users to their github accounts and formatting label objects */
	var parse = {
		formatLabel: function(array) { 
			var str = "<div class='labels'>Tags: ";
			var linkObj;
			for (var i = 0; i <  array.length; i++){
				str += "<a href='" + array[i].url + "'>" +
				/* I removed this line because the colors looked really ugly.*/
				//"' style='color: #" + array[i].color +";'>" + 
				array[i].name + "</a>, ";
			}
			return (str != "<div class='labels'>Tags: ") ? 
			str.substring(0,str.length - 2) + "</div>" : "";
		},
		/* loop through each word, and every time a username is encountered, link it.
		/* Admittedly flawed, because it doesn't check for validity... AJAX calls take too long */
		linkUsers: function(text) {
			text = text.split(" ");
			var word;
			for (var i = 0; i < text.length; i++) {
				word = text[i];
				if (text[i].charAt(0) != "@")
					continue;
				else {
					for (var j = 0; j < text[i].length; j++){
						if (text[i].charAt(j) == "," || text[i].charAt(j) == "." || 
							text[i].charAt(j) == "!" || text[i].charAt(j) == "?" || 
							text[i].charAt(j) == "\n"){
								text[i] = text[i].slice(0,j);
								break;
						}
					}
					text[i] = "<a href='http://github.com/" + text[i].substring(1,text[i].length) + "'>" + word + "</a>";
				}
			}
			return text.join(" ");
		}
	}


	Issue = Backbone.Model.extend({
		url: 'https://api.github.com/repos/rails/rails/issues/',
		initialize: function(json) {
			this.url += json.number;
			/* if we're looking at this model, render a full view */
			if (window.location.hash == "#" + json.number){
				if (json.external == 1){
					var that = this;
					try {
						this.fetch({
							success:function() {
								$(".display-box").remove();
								new IssueFull({model: that});
							},
							error: function(){
								alert("Bad Issue Id");
							}
						});
					}
					catch(ex) {
						alert("bad issue id");
					}
				}
				else
					new IssueFull({model: this});

				starting = true;
			}
		}
	});

	Issues = Backbone.Collection.extend({
		url: "https://api.github.com/repos/rails/rails/issues",
		model: Issue
	});
	/* The view for each comment, which is then appended to the full view. */
	Comment = Backbone.View.extend({
		template: $("#single-comment").html(),
		tagName: 'div',
		initialize: function(json) {
			this.parent = json.parent;
			this.model = json.model;
			_.bindAll(this,"render");
			this.render();	
		},
		render: function() {
			var comment = this.model;
			var user = comment.user;
			var that = this;
			var data = {
				name: user.login,
				html_url: user.html_url,
				timestamp: comment.created_at,
				body: parse.linkUsers(comment.body)
			};
			if ($(that.parent).find(".labels").length != 0){
				$(this.el).addClass("comment-body").
				append(_.template(this.template, data)).
				insertBefore($(that.parent).find(".labels"));
			}
			else{
				$(this.el).addClass("comment-body").
				append(_.template(this.template, data)).
				appendTo($(that.parent));
			}
		}
	});
	/* The view overlay... supports all valid ids */
	IssueFull = Backbone.View.extend({
		template: $("#issue-full").html(),
		tagName: 'div',
		initialize: function() {
			_.bindAll(this,"render");
			window.location.hash = this.model.get("number");
			this.render();	
		},
		render: function() {
			var that = this;
			var issue = this.model;
			var comments, that = this;
			/* caches the comments, so they're only ajaxed the first time */
			if(typeof this.model.get("comment_struct") == "undefined"){
				comments = this.getComments();
				this.model.set("comment_struct", comments);
			}
			else 
				comments = this.model.get("comment_struct");

			var user= this.model.get("user");
			if (issue.get("state") == "open")
				stateIcon = "&#xe000;"
			else stateIcon = "&#xe001;"
			var item = {
				title: issue.get("title"),
				labels: parse.formatLabel(issue.get("labels")),
				username: user.login,
				html_url: user.html_url,
				avatar: user.avatar_url,
				body: issue.get("body"),
				stateIcon: stateIcon,
				state: issue.get("state"),
				name: user.login,
				timestamp: issue.get("created_at"),
				commentNum:  issue.get("comments"),
			}

			$("body").addClass("active-issue");
			$(this.el).addClass("display-box").
				prepend(_.template(this.template, item)).
				appendTo(document.body);
			/* for recent-first */
			for (var i = comments.length - 1; i >= 0; i--)
				new Comment({model: comments[i], parent: that.el});
			return this;
		},
		events: {
			"click .close": function() {
				this.remove();
				$("body").removeClass("active-issue")
			},
			'click .comment-control': function(e) {
				if (!$(e.currentTarget).hasClass("hiding"))
					$(e.currentTarget).text("Show all " + this.model.get("comments") + " comments").addClass("hiding");
				else 
					$(e.currentTarget).text("Hide all " + this.model.get("comments") + " comments").removeClass("hiding");
				$(".comment-body").slideToggle(200);
			}
		},
		/* pull comments from the github comments api */
		getComments: function() {
			var that = this;
			var comments;
			$.ajax({
				//sorry...
				async: false,
				dataType: 'json',
				url: that.model.get("comments_url"),
				success: function(json) {
					comments = json;
				}
			});
			return comments;
		}
	});
	/* View for a list item in the main viewer */
	IssueItem = Backbone.View.extend({
		template: $("#issue-item").html(),
		tagName: 'li',
		initialize: function() {
		},
		render: function() {
			var issue = this.model;
			issue.set("body", parse.linkUsers(issue.get("body")));
			var labels = parse.formatLabel(issue.get("labels"));
			var body = issue.get("body");
			/* truncate to 140 */
			body = body.substr(0, 140);
			/* if it was greater than 140, truncate to a space */
			if (body != issue.get("body"))
				body = body.substr(0, Math.min(body.length, body.lastIndexOf(" ")))
			var user = issue.get("user");
			if (body != issue.get("body"))
				body += "... <span class='more'>More</span>";
			var item = {
				title: issue.get("title"),
				labels: labels,
				truncated_body:  body,
				username: user.login,
				user_url: user.html_url,
				avatar: user.avatar_url,
			}
			$(this.el).attr("data-id", issue.get("number")).prepend(_.template(this.template, item));
			return this;
		},
		events: {
			"click .more": function(e) {
				$(e.currentTarget).closest("p.body").html(this.model.get("body"));
			},
			"click .title": function() {
				new IssueFull({model: this.model});
			}
		}
	});
	/* view for list of 30 most recent issues */
	IssueList = Backbone.View.extend({
		el: '.issue-list',
		tagName: 'ul',
		/* number of issues per page */
		issueLimit: 25,
		initialize: function() { 
			_.bindAll(this,"render");
			this.collection.bind("add",this.render);
			this.l_index = 0;
			/* if bad input, default to 25 */
			if (this.issueLimit < 1 || isNaN(this.issueLimit))
				this.issueLimit = 25;
			this.h_index = this.issueLimit;
			if (this.h_index > this.collection.length)
				this.h_index = this.collection.length;
			this.numPages = Math.ceil(this.collection.length / this.issueLimit);
			this.setControls();
			this.render();
		},
		render: function () {
			var $el = $(this.el);
			$el.children(":not(.controls)").remove();
			for (var i = this.h_index - 1; i >= this.l_index; i--){
				var curr = this.collection.at(i);
				$el.prepend(new IssueItem({model: curr, collection: this}).render().el);
				$el.find("li").first().hide().show(2);
			}
			return this;
		},
    	events: {
    		"click .next": "nextPage",
    		"click .prev": "prevPage",
    		"click [data-page]:not(.selected)": "gotoPage"
    	},
    	nextPage: function() {
    		var curr = $(this.el).find(".selected");
    		if (curr.data("page") < this.numPages - 1)
	    		curr.removeClass("selected").next().addClass("selected");
    		var l_index = this.l_index;
			var h_index = this.h_index;
			var c_size = this.collection.length;
			if (h_index == c_size) return;
			l_index += this.issueLimit;
			h_index += this.issueLimit;
			if (h_index > c_size) h_index = c_size;
			this.l_index = l_index;
			this.h_index = h_index;
			this.render();
	    },
	    prevPage: function() {
	    	var curr = $(this.el).find(".selected");
    		if (curr.data("page") > 0)
	    		curr.removeClass("selected").prev().addClass("selected");
	    	var l_index = this.l_index;
			var h_index = this.h_index;
			if (!l_index) return;
			l_index -= this.issueLimit;
			h_index = l_index + this.issueLimit;
			this.l_index = l_index;
			this.h_index = h_index;
			this.render();
	    },
	 	/* go to a specific slice of the collection */
	    gotoPage: function(e) {
	    	var page = $(e.currentTarget).data("page");
	    	$("[data-page=" + page + "]")
	    		.addClass("selected").siblings().removeClass("selected");
	    	this.l_index = this.issueLimit * page;
	    	this.h_index = this.issueLimit * (parseInt(page) + 1);
	    	if (this.h_index > this.collection.length)
	    		this.h_index = this.collection.length;
	    	this.render();
	    },
	    /* get the number of pages and append the controls */
	    setControls: function() {
	    	for (var j = 0; j < this.numPages; j++) 
				$(this.el).find(".controls").append(
					"<span data-page='" + j + 
					"'>" + (j + 1) + "</span>"
				);
			$(this.el).find("[data-page]:first-of-type").addClass("selected");
			var $el = $(this.el);
			$el.find(".next").html("Next " + this.issueLimit + " &nbsp;<span class='icon'>&#xe009;</span>");
			$el.find(".prev").html("<span class='icon'>&#xe00b;</span>&nbsp;Prev " + this.issueLimit);
	    }
	});

	var issuesCollection = new Issues();
	/* on page load, fetch all issues */
	issuesCollection.fetch({
		success: function() {
			issueList = new IssueList({collection: issuesCollection});
			//if there's nothing else being displayed, take the hash and make a new view */
			if (!starting) {
				new Issue({
					number: window.location.hash.substring(1,window.location.hash.length),
					external: 1
				});
			}
		}
	});
	/* when the hash changes, load a new full view based on id */
	$(window).on("hashchange", function(){ 
		for (var i = 0; i < issuesCollection.length; i++){
			if (window.location.hash == "#" + issuesCollection.at(i).get("number") && !$("body").hasClass("active")){
				$(".display-box").remove();
				new IssueFull({model: issuesCollection.at(i)});
				return;
			}
		}
		new Issue({
			number: window.location.hash.substring(1,window.location.hash.length), 
			external: 1
		});
	});
}).keydown(function(e){
	/* left right navigation */
    if (e.keyCode == 37) { 
    	/* if a full view is up, disable keys */
    	if ($("body").hasClass("active-issue"))
			return false;
       issueList.prevPage();
       return false;
    }
    else if (e.keyCode == 39) { 
    	if ($("body").hasClass("active-issue"))
			return false;
        issueList.nextPage();
    	return false;
    }
});