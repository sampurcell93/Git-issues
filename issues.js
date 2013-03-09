$(document).ready(function() {
	var starting = false;
	Issue = Backbone.Model.extend({
		url: 'https://api.github.com/repos/rails/rails/issues/',
		initialize: function(json) {
			console.log(json);
			this.url = this.url + json.number;
			if (window.location.hash == "#" + json.number){
				if (json.external == 1){
					console.log(this.url);
					var that = this;
					try {
						this.fetch({
							success:function() {
								$(".display-box").remove();
								new IssueFull({model: that});
							},
							error: function(){
								$("body").removeClass("active-issue");
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
	IssueFull = Backbone.View.extend({
		template: $("#issue-full").html(),
		tagName: 'div',
		initialize: function() {
			_.bindAll(this,"render");
			window.location.hash = this.model.get("number");
			this.render();	
		},
		render: function() {
			var issue = this.model;
			var comments = this.getComments();
			console.log(comments);
			var user= this.model.get("user");
			if (issue.get("state") == "open")
				stateIcon = "&#xe000;"
			else stateIcon = "&#xe001;"
			var item = {
				title: issue.get("title"),
				labels: this.formatLabel(issue.get("labels")),
				username: user.login,
				html_url: user.html_url,
				avatar: user.avatar_url,
				body: issue.get("body"),
				stateIcon: stateIcon,
				state: issue.get("state"),
				labels: this.formatLabel(issue.get("labels")),
				name: user.login,
				timestamp: issue.get("created_at"),
				commentNum:  issue.get("comments")
			}
			$("body").addClass("active-issue");
			$(this.el).addClass("display-box").
				prepend(_.template(this.template, item)).
				appendTo(document.body);
			return this;
		},
		events: {
			"click .close": function(e) {
				this.remove();
				$("body").removeClass("active-issue")
			}
		},
		formatLabel: function(array) { 
			var str = "<div class='labels'>";
			var linkObj;
			for (var i = 0; i <  array.length; i++){
				str += "<a href='" + array[i].url + "'>" +
				/* I removed this line because the colors looked really ugly.*/
				//"' style='color: #" + array[i].color +";'>" + 
				array[i].name + "</a>, ";
			}
			return (str != "<div class='labels'>") ? 
			str.substring(0,str.length - 2) + "</div>" : "";
		},
		commentUrl: "https://api.github.com/repos/rails/rails/issues/",
		getComments: function() {
			var that = this;
			var comments;
			$.ajax({
				//sorry
				async: false,
				dataType: 'json',
				url: that.commentUrl + that.model.get("number") + "/comments",
				success: function(json) {
					comments = json;
					console.log(json);
				}
			});
			return comments;
		}
	});

	IssueItem = Backbone.View.extend({
		template: $("#issue-item").html(),
		tagName: 'li',
		formattedLabels: 0,
		initialize: function() {
		},
		render: function() {
			var issue = this.model;
			issue.set("body", this.linkUsers(issue.get("body")));
			var labels = this.formatLabel(issue.get("labels"));
			var body = issue.get("body");
			body = body.substr(0, 140);
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
		},
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
								text[i] = text[i].slice(1,j);
								break;
						}
					}
					text[i] = "<a href='http://github.com/" + text[i].substring(1,text[i].length) + "'>" + word + "</a>";
				}
			}
			return text.join(" ");
		}
	});
	IssueList = Backbone.View.extend({
		el: '.issue-list',
		tagName: 'ul',
		issueLimit: 4,
		initialize: function() { 
			_.bindAll(this,"render");
			this.collection.bind("add",this.render);
			this.l_index = 0;
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

	issuesCollection.fetch({
		success: function() {
			issueList = new IssueList({collection: issuesCollection});
			if (!starting) {
				console.log("ds");
				new Issue({
					number: window.location.hash.substring(1,window.location.hash.length),
					external: 1
				});
			}
		}
	});
	$(window).on("hashchange", function(){ 
		for (var i = 0; i < issuesCollection.length; i++){
			if (window.location.hash == "#" + issuesCollection.at(i).get("number")){
				$(".display-box").remove();
				new IssueFull({model: issuesCollection.at(i)});
				return;
			}
		}
		new Issue({
			number: window.location.hash.substring(1,window.location.hash.length), 
			external: 1
		});
		console.log("from ext");
	});
}).keydown(function(e){
    if (e.keyCode == 37) { 
       issueList.prevPage();
       return false;
    }
    else if (e.keyCode == 39) { 
        issueList.nextPage();
    	return false;
    }
});