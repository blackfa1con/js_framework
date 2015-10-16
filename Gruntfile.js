module.exports = function(grunt) {
	var banner = "/*\n<%=pkg.name%> - v<%= pkg.version%>\nrelease date : <%= grunt.template.today('yyyy-mm-dd') %> \n\n<%= pkg.license %>*/\n ";

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		uglify: {
			options: {
				banner: banner 
			},
			build: {
				src: "dist/<%= pkg.name %>.js", 
				dest: "dist/<%= pkg.name %>.min.js" 
			}
		},
		concat:{
			options:{
				banner : banner
			},
			dist: {
				src: ["public/js/util/*.js", "public/js/core/ctrl/*.js", "public/js/core/*.js", "public/js/na/*.js", "public/js/app.js"], 
				dest: "dist/<%= pkg.name %>.js" 
			}
		}
	});

	// Load the plugin that provides the "uglify", "concat" tasks.
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-concat");

	// Default task(s).
	grunt.registerTask("default", ["concat", "uglify"]); //grunt 명령어로 실행할 작업

};
