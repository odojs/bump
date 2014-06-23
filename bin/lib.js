// Generated by CoffeeScript 1.7.1
(function() {
  var bumptype, bumptypes, currentVersion, exists, fatal, increment, log, packagemanagerfiles, path, resolve, source, sources, version, write, _i, _len;

  require('colors');

  exists = require('fs').existsSync;

  resolve = require('path').resolve;

  increment = require('semver').inc;

  write = require('fs').writeFileSync;

  fatal = function(msg) {
    console.error("\n   " + msg + "\n");
    return process.exit(1);
  };

  log = function(msg) {
    return console.log("\n   " + msg + "\n");
  };

  packagemanagerfiles = ['package.json', 'component.json', 'bower.json'];

  sources = packagemanagerfiles.map(function(name) {
    return {
      name: name,
      path: resolve(process.cwd(), name)
    };
  }).filter(function(source) {
    return exists(source.path);
  });

  sources = sources.filter(function(source) {
    source.file = require(source.path);
    return !source.file["private"] || (source.file.version != null);
  });

  if (process.argv.length !== 3) {
    console.error("\n   Usage: " + 'bump'.blue + " type\n\n   Bump types:\n   \n     major         " + '1.2.3'.blue + " -> " + '2.0.0'.green + "\n     minor         " + '1.2.3'.blue + " -> " + '1.3.0'.green + "\n     patch         " + '1.2.3'.blue + " -> " + '1.2.4'.green + "\n     prerelease    " + '1.2.3'.blue + " -> " + '1.2.3-0'.green + "\n   \n   Sources:\n   ");
    if (sources.length === 0) {
      console.error("Expecting\n" + (packagemanagerfiles.map(function(s) {
        return s.blue;
      }).join(' or\n   ')) + " in the current directory");
    }
    sources.forEach(function(source) {
      if (source.file.version == null) {
        return console.error("No version found in " + source.name.red);
      } else {
        return console.error("     " + source.name + " " + source.file.version.blue);
      }
    });
    console.error();
    process.exit(1);
  }

  bumptype = process.argv[2];

  bumptypes = ['major', 'minor', 'patch', 'prerelease'];

  if (bumptypes.indexOf(bumptype) === -1) {
    fatal("Expecting major, minor, patch or prerelease");
  }

  currentVersion = null;

  sources.forEach(function(source) {
    if (source.file.version == null) {
      fatal("No version found in " + source.name.red + ".");
    }
    if ((currentVersion != null) && source.file.version !== currentVersion) {
      fatal("Version " + source.file.version.red + " in " + source.name.red + " does not match " + currentVersion.blue + ".");
    }
    return currentVersion = source.file.version;
  });

  if (currentVersion == null) {
    console.error("\n   Expecting\n   " + (packagemanagerfiles.map(function(s) {
      return s.blue;
    }).join(' or\n   ')) + " in the current directory\n   ");
    process.exit(1);
  }

  version = increment(currentVersion, bumptype);

  for (_i = 0, _len = sources.length; _i < _len; _i++) {
    source = sources[_i];
    path = resolve(process.cwd(), source.name);
    if (source.file.version) {
      source.file.version = version;
    }
    write(path, JSON.stringify(source.file, null, 2));
  }

  console.log("\n   " + bumptype + "'d\n   " + currentVersion.blue + " -> " + version.green + "\n \n   files updated");

  sources.forEach(function(source) {
    return console.log("   " + source.name.blue);
  });

  console.log();

}).call(this);
