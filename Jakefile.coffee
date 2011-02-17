fs = require 'fs'
spawn = require( 'child_process' ).spawn
cf = require( 'coffee-script' ) # this it to throw an error if not installed
UGLY = require 'uglify-js'
compressJs = ( code )->
  jsp = require "uglify-js/parse-js"
  pro = require "uglify-js/process"
  orig = String code 
  ast = jsp.parse orig
  ast = pro.ast_mangle ast
  ast = pro.ast_squeeze ast
  pro.gen_code ast
# watch 
desc 'Watches files in src and compiles them in lib'
task 'watch', [], ()-> 
    spawn 'coffee', ['-w', '-b', '-o', './lib', '-c', './src'], customFds: [0..5]

# build task
desc 'Compiles Coffeescript'
task 'compile', [], ()->
    spawn 'coffee', [ '-b', '-o', './lib', '-c', './src'], customFds: [0..4]
    
desc 'Builds Marelle.js'
task 'build', ['compile'], ( ) ->
  HEAD = fs.readFileSync 'LICENSE.md', 'utf8'
  CODE = []
  ['api','xhr','core'].forEach (file)->
      CODE.push fs.readFileSync "lib/#{file}.js", 'utf8'
  CODE = CODE.join("\n")
  fs.writeFileSync 'build/marelle.js', "/*\n\n#{HEAD}\n\n*/\n\n#{CODE}", 'utf8'
  console.log 'Wrote: build/marelle.js'
  fs.writeFileSync 'build/marelle.min.js', "/*\n\n#{HEAD}\n\n\*/;#{compressJs(CODE)}", 'utf8'
  console.log 'Wrote: build/marelle.min.js'  
  
  
  