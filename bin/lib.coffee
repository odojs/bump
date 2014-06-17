require('colors')
exists = require('fs').existsSync
resolve = require('path').resolve
increment = require('semver').inc
write = require('fs').writeFileSync

fatal = (msg) ->
  console.error """
  
     #{msg}
  
  """
  process.exit 1

log = (msg) ->
  console.log """
  
     #{msg}
  
  """

if process.argv.length isnt 3
  console.error """
  
     Usage: #{'bump'.blue} type
  
     Bump types:
     
       major         #{'1.2.3'.blue} -> #{'2.0.0'.green}
       minor         #{'1.2.3'.blue} -> #{'1.3.0'.green}
       patch         #{'1.2.3'.blue} -> #{'1.2.4'.green}
       prerelease    #{'1.2.3'.blue} -> #{'1.2.3-0'.green}
     
  """
  process.exit 1

# Bump the version based on semver
bumptype = process.argv[2]
bumptypes = ['major', 'minor', 'patch', 'prerelease']
if bumptypes.indexOf(bumptype) is -1
  fatal "Expecting major, minor, patch or prerelease"

packagemanagerfiles = [
  'package.json'
  'component.json'
  'bower.json'
]

sources = packagemanagerfiles
  # Lookup paths
  .map (name) ->
    name: name
    path: resolve process.cwd(), name

  # Check to see if each file exists
  .filter (source) ->
    exists source.path

sources = sources
  # Load file as json and ignore private libraries with no version
  .filter (source) ->
    source.file = require source.path
    !source.file.private or source.file.version?

currentVersion = null
sources.forEach (source) ->
  fatal "No version found in #{source.name.red}." if !source.file.version?
  fatal "Version #{source.file.version.red} in #{source.name.red} does not match #{currentVersion.blue}." if currentVersion? and source.file.version isnt currentVersion
  currentVersion = source.file.version

if !currentVersion?
  console.error """
  
     Expecting
     #{packagemanagerfiles.map((s) -> s.blue).join(' or\n   ')} in the current directory
     
  """
  process.exit 1

version = increment currentVersion, bumptype

for source in sources
  path = resolve(process.cwd(), source.name)
  source.file.version = version if source.file.version
  write path, JSON.stringify source.file, null, 2

console.log """
  
     #{bumptype}'d
     #{currentVersion.blue} -> #{version.green}
   
     files updated
"""
sources.forEach (source) -> console.log "   #{source.name.blue}"
console.log()
